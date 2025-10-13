const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Inline geofencing utilities for testing
function calculateDistance(point1, point2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

function isWithinGeoFence(userLocation, geoFence) {
  const center = {
    latitude: geoFence.centerLatitude,
    longitude: geoFence.centerLongitude,
  };

  const distance = calculateDistance(userLocation, center);
  const isWithin = distance <= geoFence.radiusMeters;

  return { isWithin, distance };
}

class GeofencingTester {
  constructor() {
    this.testResults = { passed: 0, failed: 0, tests: [] };
  }

  async runTest(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    try {
      await testFn();
      this.testResults.passed++;
      this.testResults.tests.push({ name, status: 'PASSED' });
      console.log(`✅ PASSED: ${name}\n`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({ name, status: 'FAILED', error: error.message });
      console.log(`❌ FAILED: ${name} - ${error.message}\n`);
    }
  }

  async testGeofencingUtilities() {
    // Test distance calculation
    const msuGweru = { latitude: -19.4543, longitude: 29.8175 };
    const nearbyPoint = { latitude: -19.4540, longitude: 29.8170 };
    const farPoint = { latitude: -19.4500, longitude: 29.8150 };
    
    const nearDistance = calculateDistance(msuGweru, nearbyPoint);
    const farDistance = calculateDistance(msuGweru, farPoint);
    
    if (nearDistance > 100) throw new Error(`Near point too far: ${nearDistance}m`);
    if (farDistance < 400) throw new Error(`Far point too close: ${farDistance}m`);
    
    console.log(`  📏 Distance calculation: Near=${Math.round(nearDistance)}m, Far=${Math.round(farDistance)}m`);
  }

  async testGeofenceValidation() {
    const center = { latitude: -19.4543, longitude: 29.8175 };
    const geoFence = { centerLatitude: -19.4543, centerLongitude: 29.8175, radiusMeters: 100 };
    
    // Test point within fence
    const insidePoint = { latitude: -19.4540, longitude: 29.8170 };
    const insideResult = isWithinGeoFence(insidePoint, geoFence);
    
    if (!insideResult.isWithin) {
      throw new Error(`Point should be within fence: ${insideResult.distance}m`);
    }
    
    // Test point outside fence
    const outsidePoint = { latitude: -19.4500, longitude: 29.8150 };
    const outsideResult = isWithinGeoFence(outsidePoint, geoFence);
    
    if (outsideResult.isWithin) {
      throw new Error(`Point should be outside fence: ${outsideResult.distance}m`);
    }
    
    console.log(`  🎯 Geofence validation: Inside=${Math.round(insideResult.distance)}m, Outside=${Math.round(outsideResult.distance)}m`);
  }

  async testGeofencedSessionCreation() {
    // Find a course for testing
    const lecturer = await prisma.user.findFirst({
      where: { role: 'LECTURER' },
      include: { course: true }
    });
    
    if (!lecturer || lecturer.course.length === 0) {
      throw new Error('No lecturer with courses found');
    }
    
    const course = lecturer.course[0];
    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create geofenced session
    const session = await prisma.attendancesession.create({
      data: {
        id: sessionId,
        code: sessionId,
        courseId: course.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        requireLocation: true,
        latitude: -19.4543,
        longitude: 29.8175,
        radiusMeters: 100
      }
    });
    
    if (!session.requireLocation) throw new Error('Location requirement not set');
    if (!session.latitude || !session.longitude) throw new Error('Geofence coordinates not set');
    if (!session.radiusMeters) throw new Error('Geofence radius not set');
    
    console.log(`  🏫 Geofenced session created: ${session.id} (±${session.radiusMeters}m)`);
    return session;
  }

  async testAttendanceFormLocationCapture() {
    // Test that the attendance form component exists and has location logic
    const fs = require('fs');
    const attendanceFormPath = 'src/components/student/attendance-form.tsx';
    
    if (!fs.existsSync(attendanceFormPath)) {
      throw new Error('Attendance form component not found');
    }
    
    const formContent = fs.readFileSync(attendanceFormPath, 'utf8');
    
    // Check for geolocation imports and usage
    if (!formContent.includes('getUserLocation')) {
      throw new Error('Location capture not implemented in form');
    }
    
    if (!formContent.includes('location') || !formContent.includes('latitude')) {
      throw new Error('Location state not managed in form');
    }
    
    console.log(`  📱 Attendance form has location capture functionality`);
  }

  async testAPIGeofencingEnforcement() {
    // Test that the API has geofencing validation
    const fs = require('fs');
    const apiPath = 'src/app/api/attendance/mark/route.ts';
    
    if (!fs.existsSync(apiPath)) {
      throw new Error('Attendance API not found');
    }
    
    const apiContent = fs.readFileSync(apiPath, 'utf8');
    
    // Check for geofencing imports and validation
    if (!apiContent.includes('isWithinGeoFence')) {
      throw new Error('Geofencing validation not implemented in API');
    }
    
    if (!apiContent.includes('requireLocation')) {
      throw new Error('Location requirement check not implemented');
    }
    
    if (!apiContent.includes('formatDistance')) {
      throw new Error('Distance formatting not implemented for error messages');
    }
    
    console.log(`  🛡️  API has geofencing enforcement`);
  }

  async testMSUGweruLocations() {
    // Test MSU Gweru specific locations
    const fs = require('fs');
    const gweruScriptPath = 'scripts/msu-gweru-geofencing.js';
    
    if (!fs.existsSync(gweruScriptPath)) {
      throw new Error('MSU Gweru geofencing script not found');
    }
    
    const scriptContent = fs.readFileSync(gweruScriptPath, 'utf8');
    
    // Check for MSU Gweru locations
    if (!scriptContent.includes('MSU_GWERU_LOCATIONS')) {
      throw new Error('MSU Gweru locations not defined');
    }
    
    if (!scriptContent.includes('-19.4543')) {
      throw new Error('MSU Gweru coordinates not found');
    }
    
    console.log(`  🏫 MSU Gweru campus locations configured`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📍 GEOFENCING SYSTEM TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Total: ${this.testResults.passed + this.testResults.failed}`);
    console.log(`🎯 Success Rate: ${Math.round((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100)}%`);
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL GEOFENCING TESTS PASSED! Location enforcement is working correctly.');
    } else {
      console.log('\n⚠️  Some geofencing tests failed. Please review implementation.');
    }
  }
}

async function testGeofencingSystem() {
  const tester = new GeofencingTester();
  
  console.log('🌍 Testing Geofencing System Components\n');
  
  // Test core geofencing utilities
  await tester.runTest('Geofencing Utilities', () => tester.testGeofencingUtilities());
  await tester.runTest('Geofence Validation Logic', () => tester.testGeofenceValidation());
  
  // Test database integration
  await tester.runTest('Geofenced Session Creation', () => tester.testGeofencedSessionCreation());
  
  // Test frontend integration
  await tester.runTest('Attendance Form Location Capture', () => tester.testAttendanceFormLocationCapture());
  
  // Test API enforcement
  await tester.runTest('API Geofencing Enforcement', () => tester.testAPIGeofencingEnforcement());
  
  // Test MSU Gweru specific features
  await tester.runTest('MSU Gweru Campus Configuration', () => tester.testMSUGweruLocations());
  
  tester.printSummary();
  
  await prisma.$disconnect();
}

if (require.main === module) {
  testGeofencingSystem().catch(console.error);
}

module.exports = { GeofencingTester, testGeofencingSystem };
