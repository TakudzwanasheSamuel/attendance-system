const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();

class PerformanceTester {
  constructor() {
    this.testResults = [];
    this.baseUrl = 'http://localhost:9002';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'test': '🧪',
      'perf': '⚡'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    this.log(`Running performance test: ${testName}`, 'test');
    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, status: 'PASSED', ...result });
      this.log(`Test PASSED: ${testName} - ${result.duration}ms`, 'success');
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`Test FAILED: ${testName} - ${error.message}`, 'error');
    }
  }

  // Test database query performance
  async testDatabasePerformance() {
    const tests = [
      {
        name: 'Simple User Count',
        query: () => prisma.user.count()
      },
      {
        name: 'Complex Course Query',
        query: () => prisma.course.findMany({
          include: {
            user: true,
            courseenrollment: {
              include: {
                user: true
              }
            },
            attendancesession: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        })
      },
      {
        name: 'Attendance Statistics',
        query: () => prisma.attendancerecord.groupBy({
          by: ['status'],
          _count: {
            status: true
          }
        })
      },
      {
        name: 'Student Dashboard Query',
        query: async () => {
          const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
          if (!student) return [];
          
          return prisma.course.findMany({
            where: {
              courseenrollment: {
                some: {
                  studentId: student.id
                }
              }
            },
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              },
              _count: {
                select: {
                  courseenrollment: true
                }
              }
            }
          });
        }
      }
    ];

    let totalDuration = 0;
    const results = [];

    for (const test of tests) {
      const startTime = Date.now();
      await test.query();
      const duration = Date.now() - startTime;
      totalDuration += duration;
      
      results.push({ name: test.name, duration });
      
      if (duration > 1000) {
        this.log(`Slow query detected: ${test.name} took ${duration}ms`, 'warning');
      }
    }

    return {
      duration: totalDuration,
      averageDuration: Math.round(totalDuration / tests.length),
      queryCount: tests.length,
      results
    };
  }

  // Test concurrent database operations
  async testConcurrentOperations() {
    const startTime = Date.now();
    
    const operations = [
      prisma.user.count(),
      prisma.course.count(),
      prisma.attendancesession.count(),
      prisma.attendancerecord.count(),
      prisma.courseenrollment.count()
    ];

    await Promise.all(operations);
    const duration = Date.now() - startTime;

    if (duration > 2000) {
      throw new Error(`Concurrent operations too slow: ${duration}ms`);
    }

    return {
      duration,
      operationCount: operations.length,
      averagePerOperation: Math.round(duration / operations.length)
    };
  }

  // Test memory usage simulation
  async testMemoryUsage() {
    const startMemory = process.memoryUsage();
    
    // Simulate memory-intensive operations
    const largeDataSets = [];
    
    for (let i = 0; i < 5; i++) {
      const courses = await prisma.course.findMany({
        include: {
          courseenrollment: {
            include: {
              user: true
            }
          },
          attendancesession: true
        }
      });
      largeDataSets.push(courses);
    }

    const endMemory = process.memoryUsage();
    const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed;
    
    // Clean up
    largeDataSets.length = 0;

    return {
      duration: 0, // Not time-based
      memoryIncrease: Math.round(memoryIncrease / 1024 / 1024), // MB
      startMemory: Math.round(startMemory.heapUsed / 1024 / 1024),
      endMemory: Math.round(endMemory.heapUsed / 1024 / 1024)
    };
  }

  // Test API endpoint performance (if server is running)
  async testAPIPerformance() {
    const endpoints = [
      '/api/health',
      '/login',
      '/signup'
    ];

    const results = [];
    let totalDuration = 0;

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        
        await new Promise((resolve, reject) => {
          const url = `${this.baseUrl}${endpoint}`;
          const request = http.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve(data));
          });
          
          request.on('error', reject);
          request.setTimeout(5000, () => {
            request.destroy();
            reject(new Error('Request timeout'));
          });
        });
        
        const duration = Date.now() - startTime;
        totalDuration += duration;
        results.push({ endpoint, duration, status: 'success' });
        
      } catch (error) {
        results.push({ endpoint, duration: 0, status: 'failed', error: error.message });
      }
    }

    return {
      duration: totalDuration,
      averageDuration: results.length > 0 ? Math.round(totalDuration / results.length) : 0,
      endpointCount: endpoints.length,
      results
    };
  }

  // Test cache performance simulation
  async testCachePerformance() {
    // Simulate cache operations
    const cache = new Map();
    const operations = 1000;
    
    const startTime = Date.now();
    
    // Write operations
    for (let i = 0; i < operations; i++) {
      cache.set(`key_${i}`, { data: `value_${i}`, timestamp: Date.now() });
    }
    
    // Read operations
    for (let i = 0; i < operations; i++) {
      cache.get(`key_${i}`);
    }
    
    // Delete operations
    for (let i = 0; i < operations / 2; i++) {
      cache.delete(`key_${i}`);
    }
    
    const duration = Date.now() - startTime;
    
    return {
      duration,
      operationsPerSecond: Math.round((operations * 2.5) / (duration / 1000)),
      cacheSize: cache.size
    };
  }

  // Test large dataset handling
  async testLargeDatasetHandling() {
    const startTime = Date.now();
    
    // Test with pagination simulation
    const pageSize = 50;
    const maxPages = 10;
    let totalRecords = 0;
    
    for (let page = 0; page < maxPages; page++) {
      const records = await prisma.user.findMany({
        skip: page * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      totalRecords += records.length;
      
      if (records.length < pageSize) {
        break; // No more records
      }
    }
    
    const duration = Date.now() - startTime;
    
    return {
      duration,
      recordsProcessed: totalRecords,
      recordsPerSecond: Math.round(totalRecords / (duration / 1000))
    };
  }

  // Run all performance tests
  async runAllTests() {
    this.log('🚀 Starting performance testing...', 'perf');
    
    const tests = [
      ['Database Performance', () => this.testDatabasePerformance()],
      ['Concurrent Operations', () => this.testConcurrentOperations()],
      ['Memory Usage', () => this.testMemoryUsage()],
      ['API Performance', () => this.testAPIPerformance()],
      ['Cache Performance', () => this.testCachePerformance()],
      ['Large Dataset Handling', () => this.testLargeDatasetHandling()]
    ];

    for (const [testName, testFunction] of tests) {
      await this.runTest(testName, testFunction);
    }

    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('⚡ PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(70));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    console.log('\n📊 Performance Metrics:');
    this.testResults
      .filter(r => r.status === 'PASSED')
      .forEach(test => {
        console.log(`  ${test.name}:`);
        console.log(`    Duration: ${test.duration}ms`);
        
        if (test.averageDuration) {
          console.log(`    Average: ${test.averageDuration}ms`);
        }
        
        if (test.operationsPerSecond) {
          console.log(`    Ops/sec: ${test.operationsPerSecond}`);
        }
        
        if (test.memoryIncrease) {
          console.log(`    Memory: +${test.memoryIncrease}MB`);
        }
        
        console.log('');
      });
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    const slowTests = this.testResults.filter(r => r.duration > 1000);
    if (slowTests.length > 0) {
      console.log('  - Consider optimizing slow operations:');
      slowTests.forEach(test => {
        console.log(`    • ${test.name}: ${test.duration}ms`);
      });
    } else {
      console.log('  - All operations are performing well! 🎉');
    }
    
    console.log('\n' + '='.repeat(70));
  }

  async cleanup() {
    await prisma.$disconnect();
  }
}

// Run the tests
async function main() {
  const tester = new PerformanceTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('💥 Performance test suite failed:', error);
  } finally {
    await tester.cleanup();
  }
}

main().catch(console.error);
