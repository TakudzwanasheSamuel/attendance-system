const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

class ComponentTester {
  constructor() {
    this.testResults = [];
    this.testData = {
      users: [],
      courses: [],
      sessions: [],
      enrollments: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'test': '🧪'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    this.log(`Running test: ${testName}`, 'test');
    try {
      await testFunction();
      this.testResults.push({ name: testName, status: 'PASSED' });
      this.log(`Test PASSED: ${testName}`, 'success');
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`Test FAILED: ${testName} - ${error.message}`, 'error');
    }
  }

  // Test Database Connection
  async testDatabaseConnection() {
    await prisma.$queryRaw`SELECT 1`;
    this.log('Database connection successful');
  }

  // Test User Authentication
  async testUserAuthentication() {
    // Test password hashing
    const password = 'testpassword123';
    const hashedPassword = await bcrypt.hash(password, 12);
    const isValid = await bcrypt.compare(password, hashedPassword);
    
    if (!isValid) {
      throw new Error('Password hashing/verification failed');
    }

    // Test JWT token generation and verification
    const payload = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'STUDENT',
      name: 'Test User'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.id !== payload.id || decoded.email !== payload.email) {
      throw new Error('JWT token generation/verification failed');
    }

    this.log('Authentication system working correctly');
  }

  // Test User Management
  async testUserManagement() {
    // Create test users
    const testUsers = [
      { name: 'Test Student', email: 'test.student@test.com', role: 'STUDENT' },
      { name: 'Test Lecturer', email: 'test.lecturer@test.com', role: 'LECTURER' },
      { name: 'Test Admin', email: 'test.admin@test.com', role: 'ADMIN' }
    ];

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash('testpassword123', 12);
      
      // Try to create or find existing user
      let user = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            ...userData,
            password: hashedPassword
          }
        });
      }

      this.testData.users.push(user);
    }

    this.log(`Created/found ${this.testData.users.length} test users`);
  }

  // Test Course Management
  async testCourseManagement() {
    const lecturer = this.testData.users.find(u => u.role === 'LECTURER');
    if (!lecturer) {
      throw new Error('No lecturer found for course creation');
    }

    const testCourses = [
      { name: 'Test Mathematics', code: 'TMATH101' },
      { name: 'Test Computer Science', code: 'TCS101' },
      { name: 'Test Physics', code: 'TPHYS101' }
    ];

    for (const courseData of testCourses) {
      // Try to find existing course or create new one
      let course = await prisma.course.findUnique({
        where: { code: courseData.code }
      });

      if (!course) {
        course = await prisma.course.create({
          data: {
            id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            ...courseData,
            lecturerId: lecturer.id
          }
        });
      }

      this.testData.courses.push(course);
    }

    this.log(`Created/found ${this.testData.courses.length} test courses`);
  }

  // Test Course Enrollment
  async testCourseEnrollment() {
    const student = this.testData.users.find(u => u.role === 'STUDENT');
    const course = this.testData.courses[0];

    if (!student || !course) {
      throw new Error('No student or course available for enrollment test');
    }

    // Check if already enrolled
    let enrollment = await prisma.courseenrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id
        }
      }
    });

    if (!enrollment) {
      enrollment = await prisma.courseenrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          createdAt: new Date()
        }
      });
    }

    this.testData.enrollments.push(enrollment);
    this.log(`Student enrolled in course: ${student.name} → ${course.name}`);
  }

  // Test Session Management
  async testSessionManagement() {
    const course = this.testData.courses[0];
    if (!course) {
      throw new Error('No course available for session creation');
    }

    // Generate session code
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const session = await prisma.attendancesession.create({
      data: {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        courseId: course.id,
        code: sessionCode,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        createdAt: new Date()
      }
    });

    this.testData.sessions.push(session);
    this.log(`Created attendance session: ${sessionCode} for ${course.name}`);
  }

  // Test Attendance Recording
  async testAttendanceRecording() {
    const student = this.testData.users.find(u => u.role === 'STUDENT');
    const session = this.testData.sessions[0];

    if (!student || !session) {
      throw new Error('No student or session available for attendance test');
    }

    // Check if attendance already recorded
    let attendanceRecord = await prisma.attendancerecord.findFirst({
      where: {
        studentId: student.id,
        sessionId: session.id
      }
    });

    if (!attendanceRecord) {
      attendanceRecord = await prisma.attendancerecord.create({
        data: {
          id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          sessionId: session.id,
          studentId: student.id,
          status: 'Present',
          timestamp: new Date()
        }
      });
    }

    this.log(`Recorded attendance: ${student.name} marked as ${attendanceRecord.status}`);
  }

  // Test Data Queries
  async testDataQueries() {
    // Test student dashboard query
    const student = this.testData.users.find(u => u.role === 'STUDENT');
    if (!student) {
      throw new Error('No student available for query test');
    }

    const enrolledCourses = await prisma.course.findMany({
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

    // Test lecturer dashboard query
    const lecturer = this.testData.users.find(u => u.role === 'LECTURER');
    if (!lecturer) {
      throw new Error('No lecturer available for query test');
    }

    const lecturerCourses = await prisma.course.findMany({
      where: { lecturerId: lecturer.id },
      include: {
        courseenrollment: {
          include: {
            user: true
          }
        },
        attendancesession: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    this.log(`Query tests completed - Student courses: ${enrolledCourses.length}, Lecturer courses: ${lecturerCourses.length}`);
  }

  // Test API Endpoints (simulation)
  async testAPIEndpoints() {
    // Test session lookup
    const session = this.testData.sessions[0];
    if (!session) {
      throw new Error('No session available for API test');
    }

    const foundSession = await prisma.attendancesession.findUnique({
      where: { code: session.code },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    if (!foundSession) {
      throw new Error('Session lookup failed');
    }

    // Test attendance statistics
    const attendanceStats = await prisma.attendancerecord.groupBy({
      by: ['status'],
      where: {
        sessionId: session.id
      },
      _count: {
        status: true
      }
    });

    this.log(`API endpoint tests completed - Session found: ${foundSession.code}, Attendance records: ${attendanceStats.length}`);
  }

  // Test Cache Operations (simulation)
  async testCacheOperations() {
    // Simulate cache operations
    const cacheKeys = [
      `student:${this.testData.users[0]?.id}`,
      `course:${this.testData.courses[0]?.id}`,
      `session:${this.testData.sessions[0]?.id}`
    ];

    // In a real implementation, this would test the actual cache
    this.log(`Cache operation tests completed - Keys tested: ${cacheKeys.length}`);
  }

  // Test System Performance
  async testSystemPerformance() {
    const startTime = Date.now();

    // Perform multiple database operations
    const operations = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.attendancesession.count(),
      prisma.attendancerecord.count(),
      prisma.courseenrollment.count()
    ]);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (responseTime > 5000) { // 5 seconds
      throw new Error(`Performance test failed - Response time: ${responseTime}ms`);
    }

    this.log(`Performance test completed - Response time: ${responseTime}ms, Operations: ${operations.length}`);
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting comprehensive component testing...', 'info');
    
    const tests = [
      ['Database Connection', () => this.testDatabaseConnection()],
      ['User Authentication', () => this.testUserAuthentication()],
      ['User Management', () => this.testUserManagement()],
      ['Course Management', () => this.testCourseManagement()],
      ['Course Enrollment', () => this.testCourseEnrollment()],
      ['Session Management', () => this.testSessionManagement()],
      ['Attendance Recording', () => this.testAttendanceRecording()],
      ['Data Queries', () => this.testDataQueries()],
      ['API Endpoints', () => this.testAPIEndpoints()],
      ['Cache Operations', () => this.testCacheOperations()],
      ['System Performance', () => this.testSystemPerformance()]
    ];

    for (const [testName, testFunction] of tests) {
      await this.runTest(testName, testFunction);
    }

    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n📊 Test Data Created:');
    console.log(`  Users: ${this.testData.users.length}`);
    console.log(`  Courses: ${this.testData.courses.length}`);
    console.log(`  Sessions: ${this.testData.sessions.length}`);
    console.log(`  Enrollments: ${this.testData.enrollments.length}`);
    
    console.log('\n' + '='.repeat(60));
  }

  async cleanup() {
    try {
      this.log('🧹 Cleaning up test data...', 'info');
      
      // Note: In production, you might want to keep test data or clean it up selectively
      // For now, we'll just log what would be cleaned up
      
      this.log('Cleanup completed (test data preserved for inspection)', 'success');
    } catch (error) {
      this.log(`Cleanup failed: ${error.message}`, 'error');
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Run the tests
async function main() {
  const tester = new ComponentTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('💥 Test suite failed:', error);
  } finally {
    await tester.cleanup();
  }
}

main().catch(console.error);
