const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createGeofencedSession() {
  try {
    console.log('🧪 Creating Geofenced Session for Testing\n');
    
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
    console.log(`📚 Course: ${course.name} (${course.code})\n`);
    
    // Create a geofenced session
    // Using MSU coordinates (example location in Harare, Zimbabwe)
    const sessionId = generateSessionCode();
    const session = await prisma.attendancesession.create({
      data: {
        id: sessionId,
        code: sessionId,
        courseId: course.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        createdAt: new Date(),
        // Geofencing configuration
        requireLocation: true,
        latitude: -17.8216, // MSU Harare campus coordinates (example)
        longitude: 31.0492,
        radiusMeters: 100 // 100 meter radius
      }
    });
    
    console.log(`✅ Created geofenced session: ${session.id}`);
    console.log(`📍 Location: ${session.latitude}, ${session.longitude}`);
    console.log(`📏 Radius: ${session.radiusMeters} meters`);
    console.log(`🔒 Location Required: ${session.requireLocation}`);
    console.log(`⏰ Expires: ${session.expiresAt}\n`);
    
    console.log('🔗 Test URLs:');
    console.log(`Student Attendance: http://localhost:9002/attendance/${session.id}`);
    console.log(`Lecturer Session: http://localhost:9002/lecturer/courses/${course.id}/session/${session.id}\n`);
    
    console.log('🧪 Test Scenarios:');
    console.log('1. Try marking attendance without location - should fail');
    console.log('2. Try marking attendance with wrong location - should fail');
    console.log('3. Try marking attendance with correct location - should succeed');
    console.log('\n📍 Session Center: -17.8216, 31.0492 (±100m radius)');
    console.log('✅ Test coordinates within range: -17.8215, 31.0491');
    console.log('❌ Test coordinates outside range: -17.8300, 31.0600');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGeofencedSession();
