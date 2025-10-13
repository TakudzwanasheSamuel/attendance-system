const fs = require('fs');
const path = require('path');

class FrontendComponentTester {
  constructor() {
    this.testResults = [];
    this.componentsDir = path.join(__dirname, '..', 'src', 'components');
    this.pagesDir = path.join(__dirname, '..', 'src', 'app');
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

  // Get all component files
  getAllComponents(dir, components = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.getAllComponents(filePath, components);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        components.push(filePath);
      }
    }
    
    return components;
  }

  // Test component file structure
  async testComponentStructure() {
    const components = this.getAllComponents(this.componentsDir);
    
    if (components.length === 0) {
      throw new Error('No components found');
    }

    const requiredComponents = [
      'auth/login-form.tsx',
      'auth/signup-form.tsx',
      'student/enroll-button.tsx',
      'lecturer/course-card.tsx',
      'admin/user-form.tsx',
      'shared/app-sidebar.tsx'
    ];

    for (const required of requiredComponents) {
      const found = components.some(comp => comp.includes(required));
      if (!found) {
        throw new Error(`Required component not found: ${required}`);
      }
    }

    this.log(`Component structure test passed - Found ${components.length} components`);
  }

  // Test component syntax
  async testComponentSyntax() {
    const components = this.getAllComponents(this.componentsDir);
    let syntaxErrors = [];

    for (const componentPath of components) {
      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        
        // Basic syntax checks
        const checks = [
          { name: 'React import', pattern: /import.*React/i },
          { name: 'Export statement', pattern: /export\s+(default\s+)?function|export\s+const/ },
          { name: 'JSX return', pattern: /return\s*\(|return\s*</ }
        ];

        for (const check of checks) {
          if (!check.pattern.test(content)) {
            syntaxErrors.push(`${componentPath}: Missing ${check.name}`);
          }
        }

        // Check for common issues
        if (content.includes('console.log') && !componentPath.includes('test')) {
          this.log(`Warning: console.log found in ${componentPath}`, 'warning');
        }

      } catch (error) {
        syntaxErrors.push(`${componentPath}: ${error.message}`);
      }
    }

    if (syntaxErrors.length > 0) {
      throw new Error(`Syntax errors found:\n${syntaxErrors.join('\n')}`);
    }

    this.log(`Component syntax test passed - Checked ${components.length} files`);
  }

  // Test component imports
  async testComponentImports() {
    const components = this.getAllComponents(this.componentsDir);
    let importErrors = [];

    for (const componentPath of components) {
      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        
        // Check for relative imports
        const imports = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
        
        for (const importLine of imports) {
          const importPath = importLine.match(/from\s+['"]([^'"]+)['"]/)[1];
          
          // Check for proper alias usage
          if (importPath.startsWith('../') && importPath.includes('components')) {
            importErrors.push(`${componentPath}: Use @/components alias instead of relative path: ${importPath}`);
          }
          
          if (importPath.startsWith('../') && importPath.includes('lib')) {
            importErrors.push(`${componentPath}: Use @/lib alias instead of relative path: ${importPath}`);
          }
        }

      } catch (error) {
        importErrors.push(`${componentPath}: ${error.message}`);
      }
    }

    if (importErrors.length > 0) {
      this.log(`Import warnings found:\n${importErrors.join('\n')}`, 'warning');
    }

    this.log(`Component imports test completed - Checked ${components.length} files`);
  }

  // Test TypeScript interfaces
  async testTypeScriptInterfaces() {
    const components = this.getAllComponents(this.componentsDir);
    let interfaceIssues = [];

    for (const componentPath of components) {
      if (!componentPath.endsWith('.tsx')) continue;

      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        
        // Check for prop interfaces
        const hasProps = /function\s+\w+\s*\(\s*\{\s*[^}]+\s*\}/.test(content);
        const hasInterface = /interface\s+\w+Props/.test(content);
        
        if (hasProps && !hasInterface) {
          interfaceIssues.push(`${componentPath}: Component with props should have TypeScript interface`);
        }

      } catch (error) {
        interfaceIssues.push(`${componentPath}: ${error.message}`);
      }
    }

    if (interfaceIssues.length > 0) {
      this.log(`TypeScript interface suggestions:\n${interfaceIssues.join('\n')}`, 'warning');
    }

    this.log(`TypeScript interfaces test completed`);
  }

  // Test page structure
  async testPageStructure() {
    const pages = this.getAllComponents(this.pagesDir);
    
    const requiredPages = [
      'login/page.tsx',
      'signup/page.tsx',
      'student/dashboard/page.tsx',
      'lecturer/dashboard/page.tsx',
      'admin/dashboard/page.tsx'
    ];

    for (const required of requiredPages) {
      const found = pages.some(page => page.includes(required));
      if (!found) {
        throw new Error(`Required page not found: ${required}`);
      }
    }

    this.log(`Page structure test passed - Found required pages`);
  }

  // Test API routes
  async testAPIRoutes() {
    const apiDir = path.join(this.pagesDir, 'api');
    if (!fs.existsSync(apiDir)) {
      throw new Error('API directory not found');
    }

    const apiRoutes = this.getAllComponents(apiDir);
    
    const requiredRoutes = [
      'auth/login',
      'courses/enroll',
      'attendance/mark',
      'sessions'
    ];

    for (const required of requiredRoutes) {
      const found = apiRoutes.some(route => route.includes(required));
      if (!found) {
        throw new Error(`Required API route not found: ${required}`);
      }
    }

    this.log(`API routes test passed - Found ${apiRoutes.length} API files`);
  }

  // Test configuration files
  async testConfigurationFiles() {
    const rootDir = path.join(__dirname, '..');
    const requiredConfigs = [
      'package.json',
      'next.config.js',
      'tailwind.config.ts',
      'tsconfig.json',
      'prisma/schema.prisma'
    ];

    for (const config of requiredConfigs) {
      const configPath = path.join(rootDir, config);
      if (!fs.existsSync(configPath)) {
        throw new Error(`Required configuration file not found: ${config}`);
      }
    }

    // Test package.json
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const requiredDeps = ['next', 'react', 'typescript', '@prisma/client', 'tailwindcss'];
    
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        throw new Error(`Required dependency not found: ${dep}`);
      }
    }

    this.log(`Configuration files test passed`);
  }

  // Test component accessibility
  async testComponentAccessibility() {
    const components = this.getAllComponents(this.componentsDir);
    let a11yIssues = [];

    for (const componentPath of components) {
      if (!componentPath.endsWith('.tsx')) continue;

      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        
        // Check for accessibility attributes
        const hasButtons = /<Button|<button/.test(content);
        const hasInputs = /<Input|<input/.test(content);
        const hasLabels = /<Label|<label/.test(content);
        
        if (hasButtons && !content.includes('aria-') && !content.includes('sr-only')) {
          a11yIssues.push(`${componentPath}: Buttons should have accessibility attributes`);
        }
        
        if (hasInputs && !hasLabels) {
          a11yIssues.push(`${componentPath}: Inputs should have associated labels`);
        }

      } catch (error) {
        a11yIssues.push(`${componentPath}: ${error.message}`);
      }
    }

    if (a11yIssues.length > 0) {
      this.log(`Accessibility suggestions:\n${a11yIssues.join('\n')}`, 'warning');
    }

    this.log(`Accessibility test completed`);
  }

  // Run all frontend tests
  async runAllTests() {
    this.log('🚀 Starting frontend component testing...', 'info');
    
    const tests = [
      ['Component Structure', () => this.testComponentStructure()],
      ['Component Syntax', () => this.testComponentSyntax()],
      ['Component Imports', () => this.testComponentImports()],
      ['TypeScript Interfaces', () => this.testTypeScriptInterfaces()],
      ['Page Structure', () => this.testPageStructure()],
      ['API Routes', () => this.testAPIRoutes()],
      ['Configuration Files', () => this.testConfigurationFiles()],
      ['Component Accessibility', () => this.testComponentAccessibility()]
    ];

    for (const [testName, testFunction] of tests) {
      await this.runTest(testName, testFunction);
    }

    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 FRONTEND TEST SUMMARY');
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
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run the tests
async function main() {
  const tester = new FrontendComponentTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('💥 Frontend test suite failed:', error);
  }
}

main().catch(console.error);
