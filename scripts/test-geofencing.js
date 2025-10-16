/**
 * Geofencing Test Script
 * This script helps test the geofencing functionality
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test coordinates (Harare, Zimbabwe area)
const TEST_LOCATIONS = {
  // Main Lecture Hall (center)
  LECTURE_HALL: {
    latitude: -17.8252,
    longitude: 31.0335,
    name: "Main Lecture Hall"
  },
  
  // Computer Lab (nearby)
  COMPUTER_LAB: {
    latitude: -17.8260,
    longitude: 31.0340,
    name: "Computer Lab"
  },
  
  // Far away location (should fail)
  FAR_AWAY: {
    latitude: -17.8000,
    longitude: 31.0000,
    name: "Far Away Location"
  },
  
  // Just outside geofence (should fail)
  JUST_OUTSIDE: {
    latitude: -17.8252,
    longitude: 31.0360, // ~300m away
    name: "Just Outside Geofence"
  }
};

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

async function createTestGeofences() {
  console.log('🏗️ Creating test geofences...');
  
  try {
    // Create Main Lecture Hall geofence
    const lectureHall = await prisma.geofence.create({
      data: {
        id: 'geofence-lecture-hall',
        name: 'Main Lecture Hall',
        description: 'Primary lecture hall for computer science courses',
        latitude: TEST_LOCATIONS.LECTURE_HALL.latitude,
        longitude: TEST_LOCATIONS.LECTURE_HALL.longitude,
        radius: 50, // 50 meters
        isActive: true
      }
    });
    
    // Create Computer Lab geofence
    const computerLab = await prisma.geofence.create({
      data: {
        id: 'geofence-computer-lab',
        name: 'Computer Lab',
        description: 'Computer laboratory for programming courses',
        latitude: TEST_LOCATIONS.COMPUTER_LAB.latitude,
        longitude: TEST_LOCATIONS.COMPUTER_LAB.longitude,
        radius: 100, // 100 meters
        isActive: true
      }
    });
    
    console.log('✅ Test geofences created successfully!');
    console.log(`📍 Main Lecture Hall: ${lectureHall.latitude}, ${lectureHall.longitude} (${lectureHall.radius}m radius)`);
    console.log(`📍 Computer Lab: ${computerLab.latitude}, ${computerLab.longitude} (${computerLab.radius}m radius)`);
    
    return { lectureHall, computerLab };
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Test geofences already exist, skipping creation...');
      return null;
    }
    throw error;
  }
}

async function testGeofencing() {
  console.log('🧪 Testing geofencing calculations...\n');
  
  const geofences = await prisma.geofence.findMany({
    where: { isActive: true }
  });
  
  if (geofences.length === 0) {
    console.log('❌ No active geofences found. Please create some geofences first.');
    return;
  }
  
  const lectureHall = geofences.find(g => g.name === 'Main Lecture Hall');
  
  if (!lectureHall) {
    console.log('❌ Main Lecture Hall geofence not found.');
    return;
  }
  
  console.log(`🎯 Testing against: ${lectureHall.name}`);
  console.log(`📍 Center: ${lectureHall.latitude}, ${lectureHall.longitude}`);
  console.log(`📏 Radius: ${lectureHall.radius}m\n`);
  
  // Test each location
  for (const [key, location] of Object.entries(TEST_LOCATIONS)) {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      lectureHall.latitude,
      lectureHall.longitude
    );
    
    const isValid = distance <= lectureHall.radius;
    const status = isValid ? '✅ VALID' : '❌ INVALID';
    
    console.log(`${status} ${location.name}`);
    console.log(`   📍 Coordinates: ${location.latitude}, ${location.longitude}`);
    console.log(`   📏 Distance: ${Math.round(distance)}m`);
    console.log(`   🎯 Within radius: ${isValid ? 'Yes' : 'No'} (${lectureHall.radius}m)\n`);
  }
}

async function showGeofencingStats() {
  console.log('📊 Geofencing Statistics:\n');
  
  try {
    // Get all geofences
    const geofences = await prisma.geofence.findMany();
    console.log(`🏗️ Total Geofences: ${geofences.length}`);
    console.log(`✅ Active Geofences: ${geofences.filter(g => g.isActive).length}`);
    
    // Get attendance records with location data
    const locationRecords = await prisma.attendancerecord.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      include: {
        geofence: true
      }
    });
    
    console.log(`📍 Attendance Records with Location: ${locationRecords.length}`);
    
    const validLocations = locationRecords.filter(r => r.isLocationValid);
    console.log(`✅ Valid Locations: ${validLocations.length}`);
    console.log(`❌ Invalid Locations: ${locationRecords.length - validLocations.length}`);
    
    if (locationRecords.length > 0) {
      const avgAccuracy = locationRecords.reduce((sum, r) => sum + (r.accuracy || 0), 0) / locationRecords.length;
      console.log(`🎯 Average GPS Accuracy: ${Math.round(avgAccuracy)}m`);
    }
    
    // Show recent attendance records
    console.log('\n📋 Recent Attendance Records with Location:');
    const recentRecords = await prisma.attendancerecord.findMany({
      where: {
        latitude: { not: null }
      },
      include: {
        user: true,
        geofence: true
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });
    
    recentRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.user.name}`);
      console.log(`   📍 Location: ${record.latitude}, ${record.longitude}`);
      console.log(`   🎯 Geofence: ${record.geofence?.name || 'None'}`);
      console.log(`   ✅ Valid: ${record.isLocationValid ? 'Yes' : 'No'}`);
      console.log(`   📅 Time: ${record.timestamp.toLocaleString()}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
  }
}

async function main() {
  console.log('🗺️ Geofencing Test Suite\n');
  console.log('=' .repeat(50));
  
  try {
    // Create test geofences
    await createTestGeofences();
    
    // Test geofencing calculations
    await testGeofencing();
    
    // Show statistics
    await showGeofencingStats();
    
    console.log('🎉 Geofencing test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = {
  createTestGeofences,
  testGeofencing,
  showGeofencingStats,
  calculateDistance,
  TEST_LOCATIONS
};
