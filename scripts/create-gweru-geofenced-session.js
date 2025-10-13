const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createGweruGeofencedSession() {
  try {
    console.log('🏫 Creating Geofenced Session for MSU Gweru (Telone Campus)\n');
    
    // Find a lecturer and course
    const lecturer = await prisma.user.findFirst({
      where: { role: 'LECTURER' },
      include: { course: true }
    });
    
    if (!lecturer || lecturer.course.length === 0) {
      console.log('❌ No lecturer with courses found');
      return;
    }
    
    const course = lecturer.course[0];
    console.log(`👨‍🏫 Lecturer: ${lecturer.name}`);
    console.log(`📚 Course: ${course.name} (${course.code})`);
    console.log(`🏫 Campus: MSU Gweru (Telone Campus)\n`);
    
    // Create a geofenced session for MSU Gweru campus
    // MSU Gweru (Telone Campus) coordinates
    const sessionId = generateSessionCode();
    const gweruLatitude = -19.4543;  // MSU Gweru campus latitude
    const gweruLongitude = 29.8175;  // MSU Gweru campus longitude
    const radiusMeters = 150; // 150 meter radius to cover campus buildings
    
    const session = await prisma.attendancesession.create({
      data: {
        id: sessionId,
        code: sessionId,
        courseId: course.id,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        createdAt: new Date(),
        // Geofencing configuration for MSU Gweru
        requireLocation: true,
        latitude: gweruLatitude,
        longitude: gweruLongitude,
        radiusMeters: radiusMeters
      }
    });
    
    console.log(`✅ Created MSU Gweru geofenced session: ${session.id}`);
    console.log(`🏫 Campus: MSU Gweru (Telone Campus)`);
    console.log(`📍 Location: ${session.latitude}, ${session.longitude}`);
    console.log(`📏 Radius: ${session.radiusMeters} meters`);
    console.log(`🔒 Location Required: ${session.requireLocation}`);
    console.log(`⏰ Expires: ${session.expiresAt}\n`);
    
    console.log('🔗 Test URLs:');
    console.log(`Student Attendance: http://localhost:9002/attendance/${session.id}`);
    console.log(`Lecturer Session: http://localhost:9002/lecturer/courses/${course.id}/session/${session.id}\n`);
    
    console.log('🧪 Test Scenarios for MSU Gweru:');
    console.log('1. Try marking attendance from outside campus - should fail');
    console.log('2. Try marking attendance from within campus - should succeed');
    console.log('3. Try marking attendance without location - should fail');
    
    console.log('\n📍 MSU Gweru Campus Geofence:');
    console.log(`Center: ${gweruLatitude}, ${gweruLongitude}`);
    console.log(`Radius: ±${radiusMeters}m`);
    console.log('\n✅ Test coordinates (within campus):');
    console.log(`  Main Building: -19.4540, 29.8170`);
    console.log(`  Library: -19.4545, 29.8180`);
    console.log(`  Lecture Halls: -19.4548, 29.8172`);
    console.log('\n❌ Test coordinates (outside campus):');
    console.log(`  Gweru City Center: -19.4500, 29.8150`);
    console.log(`  Too far north: -19.4400, 29.8175`);
    console.log(`  Too far south: -19.4650, 29.8175`);
    
    console.log('\n📱 QR Code will enforce this geofence automatically!');
    console.log('🎯 Students must be physically present on MSU Gweru campus to mark attendance.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGweruGeofencedSession();
