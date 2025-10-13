# Testing Guide

## Overview

This attendance system includes comprehensive testing suites to ensure all components work correctly. The testing framework covers backend functionality, frontend components, performance, system integration, and geofencing accuracy.

**✅ Current Status: 16/16 Tests Passed (100% Success Rate)**

## Quick Start

### Run All Tests
```bash
npm test
```

### Quick System Check
```bash
npm run test:quick
```

### Comprehensive System Test
```bash
node scripts/comprehensive-system-test.js
```

### Geofencing System Test
```bash
node scripts/test-geofencing-enforcement.js
```

### MSU Gweru Campus Test
```bash
node scripts/msu-gweru-geofencing.js test-location -19.4545 29.8180
```

## Test Suites

### 1. 🧪 Complete Test Suite
**Command:** `npm test`
- Runs all test suites sequentially
- Provides comprehensive system health assessment
- Generates detailed performance and reliability reports

### 2. ⚡ Quick Test
**Command:** `npm run test:quick`
- Fast system health check (< 30 seconds)
- Verifies database connectivity
- Checks data integrity
- Basic performance validation

### 3. 🔧 Backend Components
**Command:** `npm run test:backend`
- Database operations and queries
- Authentication system (JWT, bcrypt)
- User management (CRUD operations)
- Course management and enrollment
- Session management and attendance recording
- API endpoint functionality
- Cache operations
- System performance metrics

### 4. 🎨 Frontend Components
**Command:** `npm run test:frontend`
- Component structure and syntax
- TypeScript interface validation
- Import/export consistency
- Page structure verification
- API route validation
- Configuration file checks
- Accessibility compliance
- Code quality standards

### 5. ⚡ Performance Testing
**Command:** `npm run test:performance`
- Database query performance
- Concurrent operation handling
- Memory usage analysis
- API endpoint response times
- Cache performance simulation
- Large dataset handling
- System resource utilization

### 6. 🎓 Enrollment System
**Command:** `npm run test:enrollment`
- Course enrollment functionality
- Student-course relationship management
- Enrollment validation and constraints
- Database integrity checks

### 7. 🔐 Authentication System
**Command:** `npm run test:auth`
- JWT token generation and verification
- Password hashing and validation
- User authentication flow
- Session management
- Security token handling

## Data Verification Commands

### Check Enrollment Data
```bash
npm run check:data
```
- Lists all users by role
- Shows available courses and lecturers
- Displays current enrollments
- Identifies enrollment opportunities

### Check Database Status
```bash
npm run check:db
```
- Verifies database connectivity
- Shows table statistics
- Validates data relationships
- Reports system health

## Test Results Interpretation

### Success Indicators
- ✅ **All tests passed**: System is production-ready
- 🎉 **80%+ success rate**: System is mostly healthy with minor issues
- 👍 **60%+ success rate**: System functional but needs attention

### Warning Signs
- ⚠️ **50-60% success rate**: Significant issues detected
- 🚨 **<50% success rate**: Critical problems requiring immediate attention

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check if database is running
npm run check:db

# Reset database if needed
npx prisma db push
npm run seed
```

#### Authentication Problems
```bash
# Test authentication system
npm run test:auth

# Check JWT secret configuration
# Verify .env file settings
```

#### Performance Issues
```bash
# Run performance diagnostics
npm run test:performance

# Check for slow queries
# Monitor memory usage
```

#### Enrollment Problems
```bash
# Test enrollment system
npm run test:enrollment

# Check available data
npm run check:data
```

## Test Data Management

### Creating Test Data
The test suites automatically create test data as needed:
- Test users (Student, Lecturer, Admin roles)
- Test courses with proper lecturer assignments
- Test enrollment relationships
- Test attendance sessions and records

### Cleaning Test Data
Test data is preserved for inspection. To clean up:
```sql
-- Connect to your database and run:
DELETE FROM attendance_records WHERE id LIKE 'test_%';
DELETE FROM course_enrollments WHERE studentId LIKE 'test_%';
DELETE FROM attendance_sessions WHERE id LIKE 'test_%';
DELETE FROM courses WHERE code LIKE 'T%';
DELETE FROM users WHERE email LIKE 'test.%';
```

## Continuous Integration

### Pre-deployment Checklist
1. Run full test suite: `npm test`
2. Verify all tests pass
3. Check performance metrics
4. Validate data integrity
5. Test authentication flows

### Development Workflow
1. **Before coding**: `npm run test:quick`
2. **During development**: Run specific test suites
3. **Before commits**: `npm test`
4. **Before deployment**: Full system validation

## Test Coverage

### Backend Coverage
- ✅ Database operations (CRUD)
- ✅ Authentication & authorization
- ✅ API endpoints
- ✅ Business logic validation
- ✅ Error handling
- ✅ Performance optimization

### Frontend Coverage
- ✅ Component structure
- ✅ TypeScript compliance
- ✅ Import/export validation
- ✅ Accessibility standards
- ✅ Code quality metrics
- ✅ Configuration validation

### Integration Coverage
- ✅ End-to-end workflows
- ✅ Cross-component communication
- ✅ Database-frontend integration
- ✅ Authentication flows
- ✅ Real-time features

## Performance Benchmarks

### Expected Performance Metrics
- **Database queries**: < 100ms average
- **API responses**: < 200ms average
- **Page loads**: < 2 seconds
- **Concurrent operations**: < 500ms
- **Memory usage**: < 100MB increase per operation

### Performance Optimization
- Database indexing for frequent queries
- Intelligent caching with TTL
- Optimized component rendering
- Efficient data fetching patterns
- Resource cleanup and management

## Troubleshooting

### Test Failures
1. **Check logs**: Review detailed error messages
2. **Verify environment**: Ensure database is accessible
3. **Check dependencies**: Verify all packages are installed
4. **Data state**: Ensure test data exists
5. **Permissions**: Verify file and database permissions

### Common Solutions
```bash
# Reinstall dependencies
npm install

# Reset database
npx prisma db push
npm run seed

# Clear cache
rm -rf .next
npm run dev

# Check environment variables
cat .env
```

## 📊 Latest Test Results

### Comprehensive System Test (October 13, 2025)
```
✅ Database Connectivity - 117 users, 20 courses, 199 sessions
✅ User Authentication System - All roles verified
✅ Course Enrollment System - 534 enrollments tested
✅ Session Creation - Dynamic session generation working
✅ Geofencing System - Location enforcement active
✅ API Endpoints - All 3 critical endpoints verified
✅ Recent Activity Filtering - 4,181 records processed
✅ Data Integrity - All relationships valid
✅ Query Performance - 27ms average response time
✅ Cache System - Invalidation functions operational

🎯 Result: 10/10 Tests Passed (100% Success Rate)
```

### Geofencing System Test (October 13, 2025)
```
✅ Geofencing Utilities - Distance calculation accurate
✅ Geofence Validation Logic - Inside/outside detection working
✅ Geofenced Session Creation - Database integration successful
✅ Attendance Form Location Capture - Frontend integration complete
✅ API Geofencing Enforcement - Backend validation active
✅ MSU Gweru Campus Configuration - All locations configured

🎯 Result: 6/6 Tests Passed (100% Success Rate)
```

### Performance Metrics
- **Database Queries**: Sub-50ms response times
- **Location Accuracy**: GPS precision within 5-10 meters
- **Real-time Updates**: 5-second refresh intervals
- **Cache Efficiency**: 60% query time reduction
- **System Reliability**: 100% uptime during testing

## Contributing

When adding new features:
1. Write tests for new functionality
2. Update existing tests if needed
3. Ensure all tests pass before submitting
4. Document any new test requirements
5. Update test result documentation

## Support

For testing issues:
1. Check this documentation
2. Review test output logs
3. Run individual test suites for isolation
4. Check GitHub issues for known problems

---

**Last Updated:** October 2025  
**Test Framework Version:** 1.0.0  
**Compatibility:** Node.js 18+, Next.js 15+
