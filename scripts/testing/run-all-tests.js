const { spawn } = require('child_process');
const path = require('path');

class MasterTestRunner {
  constructor() {
    this.testSuites = [
      {
        name: 'Backend Components & Database',
        script: 'test-all-components.js',
        description: 'Tests database operations, authentication, and backend logic'
      },
      {
        name: 'Frontend Components & Structure',
        script: 'test-frontend-components.js',
        description: 'Tests component structure, syntax, and configuration'
      },
      {
        name: 'Performance & Load Testing',
        script: 'test-performance.js',
        description: 'Tests system performance and resource usage'
      },
      {
        name: 'Enrollment System',
        script: 'test-enrollment.js',
        description: 'Tests course enrollment functionality'
      },
      {
        name: 'Authentication System',
        script: 'test-auth.js',
        description: 'Tests JWT authentication and token verification'
      }
    ];
    
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'test': '🧪',
      'master': '🎯'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  async runTestSuite(testSuite) {
    return new Promise((resolve) => {
      this.log(`Starting: ${testSuite.name}`, 'test');
      this.log(`Description: ${testSuite.description}`, 'info');
      
      const scriptPath = path.join(__dirname, testSuite.script);
      const startTime = Date.now();
      
      const child = spawn('node', [scriptPath], {
        stdio: 'pipe',
        cwd: path.dirname(scriptPath)
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        // Forward output in real-time
        process.stdout.write(text);
      });
      
      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        process.stderr.write(text);
      });
      
      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        const result = {
          name: testSuite.name,
          script: testSuite.script,
          exitCode: code,
          duration,
          success: code === 0,
          output,
          errorOutput
        };
        
        this.results.push(result);
        
        if (code === 0) {
          this.log(`COMPLETED: ${testSuite.name} (${duration}ms)`, 'success');
        } else {
          this.log(`FAILED: ${testSuite.name} (Exit code: ${code})`, 'error');
        }
        
        resolve(result);
      });
      
      child.on('error', (error) => {
        this.log(`ERROR running ${testSuite.name}: ${error.message}`, 'error');
        this.results.push({
          name: testSuite.name,
          script: testSuite.script,
          exitCode: -1,
          duration: Date.now() - startTime,
          success: false,
          error: error.message
        });
        resolve();
      });
    });
  }

  async runAllTests() {
    this.log('🎯 Starting Master Test Suite', 'master');
    this.log(`Running ${this.testSuites.length} test suites...`, 'info');
    
    const overallStartTime = Date.now();
    
    // Run tests sequentially to avoid resource conflicts
    for (const testSuite of this.testSuites) {
      await this.runTestSuite(testSuite);
      
      // Add separator between test suites
      console.log('\n' + '─'.repeat(80) + '\n');
    }
    
    const overallDuration = Date.now() - overallStartTime;
    
    // Print comprehensive summary
    this.printMasterSummary(overallDuration);
  }

  printMasterSummary(overallDuration) {
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 MASTER TEST SUITE SUMMARY');
    console.log('═'.repeat(80));
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`📊 Overall Statistics:`);
    console.log(`  Total Test Suites: ${this.results.length}`);
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  🕐 Total Runtime: ${Math.round(overallDuration / 1000)}s`);
    console.log(`  📈 Success Rate: ${((successful / this.results.length) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Test Suite Results:');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const duration = `${Math.round(result.duration / 1000)}s`;
      
      console.log(`  ${index + 1}. ${status} ${result.name} (${duration})`);
      
      if (!result.success) {
        console.log(`     Exit Code: ${result.exitCode}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      }
    });
    
    // System health assessment
    console.log('\n🏥 System Health Assessment:');
    
    if (successful === this.results.length) {
      console.log('  🎉 EXCELLENT: All test suites passed!');
      console.log('  🚀 Your attendance system is production-ready!');
    } else if (successful >= this.results.length * 0.8) {
      console.log('  👍 GOOD: Most test suites passed');
      console.log('  🔧 Minor issues detected - review failed tests');
    } else if (successful >= this.results.length * 0.5) {
      console.log('  ⚠️  FAIR: Some test suites failed');
      console.log('  🛠️  Significant issues detected - requires attention');
    } else {
      console.log('  🚨 POOR: Multiple test suites failed');
      console.log('  🔥 Critical issues detected - system needs major fixes');
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (failed > 0) {
      console.log('  🔍 Failed Test Suites:');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`    • Review ${result.script} for detailed error information`);
        });
    }
    
    console.log('  📚 Next Steps:');
    console.log('    1. Review any failed test outputs above');
    console.log('    2. Fix identified issues');
    console.log('    3. Re-run specific test suites: node scripts/[test-name].js');
    console.log('    4. Run full test suite again to verify fixes');
    
    // Performance insights
    const performanceResult = this.results.find(r => r.script === 'test-performance.js');
    if (performanceResult && performanceResult.success) {
      console.log('\n⚡ Performance Status: TESTED ✅');
    } else {
      console.log('\n⚡ Performance Status: NOT TESTED ⚠️');
    }
    
    // Security insights
    const authResult = this.results.find(r => r.script === 'test-auth.js');
    if (authResult && authResult.success) {
      console.log('🔒 Security Status: VERIFIED ✅');
    } else {
      console.log('🔒 Security Status: NEEDS ATTENTION ⚠️');
    }
    
    console.log('\n' + '═'.repeat(80));
    
    // Exit with appropriate code
    if (failed > 0) {
      console.log('❌ Some tests failed. Review the output above.');
      process.exit(1);
    } else {
      console.log('✅ All tests passed! System is healthy.');
      process.exit(0);
    }
  }
}

// Add help text
function showHelp() {
  console.log(`
🎯 Master Test Runner for Attendance System

Usage:
  node run-all-tests.js [options]

Options:
  --help, -h     Show this help message
  --list, -l     List available test suites
  --suite <name> Run specific test suite only

Available Test Suites:
  1. Backend Components & Database
  2. Frontend Components & Structure  
  3. Performance & Load Testing
  4. Enrollment System
  5. Authentication System

Examples:
  node run-all-tests.js                    # Run all tests
  node run-all-tests.js --list             # List test suites
  node run-all-tests.js --suite backend    # Run backend tests only

For more information, visit: https://github.com/TakudzwanasheSamuel/attendance-system
`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
  console.log('📋 Available Test Suites:');
  const runner = new MasterTestRunner();
  runner.testSuites.forEach((suite, index) => {
    console.log(`  ${index + 1}. ${suite.name}`);
    console.log(`     Script: ${suite.script}`);
    console.log(`     Description: ${suite.description}`);
    console.log('');
  });
  process.exit(0);
}

// Run the master test suite
async function main() {
  const runner = new MasterTestRunner();
  
  try {
    await runner.runAllTests();
  } catch (error) {
    console.error('💥 Master test runner failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
