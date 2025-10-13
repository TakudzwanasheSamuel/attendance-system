# Scripts Directory

This directory contains utility scripts organized by purpose.

## 📁 Directory Structure

```
scripts/
├── README.md                 # This file
├── seed-database.js         # Database seeding script
├── testing/                 # Testing and validation scripts
├── utilities/               # Data checking and utility scripts
└── development/             # Development helper scripts
```

## 🧪 Testing Scripts (`testing/`)

### Main Test Runners
- **`run-all-tests.js`** - Master test runner for all test suites
- **`quick-test.js`** - Fast system health check

### Specific Test Suites
- **`test-all-components.js`** - Backend components and database tests
- **`test-frontend-components.js`** - Frontend component validation
- **`test-performance.js`** - Performance and load testing
- **`test-enrollment.js`** - Course enrollment functionality tests
- **`test-auth.js`** - Authentication system tests

### Usage
```bash
# Run all tests
npm test

# Quick health check
npm run test:quick

# Specific test suites
npm run test:backend
npm run test:frontend
npm run test:performance
```

## 🔧 Utility Scripts (`utilities/`)

### Data Verification
- **`check-enrollment-data.js`** - Verify enrollment system data
- **`check-database.js`** - Database connectivity and status
- **`check-attendance.js`** - Attendance records validation

### Data Retrieval
- **`get-users.js`** - List all users in the system
- **`get-lecturer.js`** - Get lecturer information
- **`get-lecturer-id.js`** - Find lecturer by ID

### Usage
```bash
# Check enrollment data
npm run check:data

# Check database status
npm run check:db

# Manual script execution
node scripts/utilities/get-users.js
```

## 🛠️ Development Scripts (`development/`)

### Setup and Configuration
- **`assign-course.js`** - Assign courses to lecturers
- **`create-test-session.js`** - Create test attendance sessions
- **`debug-session.js`** - Debug session-related issues
- **`performance-test.js`** - Performance testing utilities

### Usage
```bash
# Create test session
node scripts/development/create-test-session.js

# Assign course to lecturer
node scripts/development/assign-course.js

# Debug session issues
node scripts/development/debug-session.js
```

## 📊 Main Scripts (Root Level)

### Database Management
- **`seed-database.js`** - Populate database with initial data

### Usage
```bash
# Seed database
npm run seed
```

## 🚀 Quick Commands

### Essential Commands
```bash
# Setup database
npm run seed

# Quick system check
npm run test:quick

# Full test suite
npm test

# Check system data
npm run check:data
```

### Development Commands
```bash
# Check database status
npm run check:db

# Test specific components
npm run test:backend
npm run test:frontend

# Performance testing
npm run test:performance
```

## 📝 Script Development Guidelines

### Adding New Scripts
1. Place in appropriate subdirectory
2. Follow naming convention: `action-target.js`
3. Include proper error handling
4. Add logging for debugging
5. Update this README

### Script Categories
- **Testing:** Validation and testing scripts → `testing/`
- **Utilities:** Data checking and retrieval → `utilities/`
- **Development:** Setup and debugging helpers → `development/`
- **Core:** Essential scripts → root level

### Best Practices
- Use consistent logging format
- Include error handling
- Add progress indicators for long operations
- Clean up resources (database connections)
- Document script purpose and usage

## 🔍 Troubleshooting

### Common Issues
- **Permission errors:** Ensure proper file permissions
- **Database connection:** Check `.env` configuration
- **Missing dependencies:** Run `npm install`
- **Path issues:** Use absolute paths in scripts

### Getting Help
1. Check script output for error messages
2. Verify environment configuration
3. Test database connectivity
4. Review script documentation

---

**Last Updated:** October 2025
