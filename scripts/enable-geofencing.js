const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function enableGeofencing() {
  try {
    console.log('🔧 Geofencing Configuration Tool\n');
    
    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length < 4) {
      console.log('Usage: node enable-geofencing.js <sessionId> <latitude> <longitude> <radiusMeters>');
      console.log('Example: node enable-geofencing.js ABC123 -17.8216 31.0492 100');
      return;
    }
    
    const [sessionId, lat, lng, radius] = args;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);
    
    // Validate inputs
    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      console.log('❌ Invalid coordinates or radius. Please provide valid numbers.');
      return;
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.log('❌ Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
      return;
    }
    
    if (radiusMeters < 10 || radiusMeters > 10000) {
      console.log('❌ Invalid radius. Must be between 10 and 10000 meters.');
      return;
    }
    
    // Find the session
    const session = await prisma.attendancesession.findUnique({
      where: { id: sessionId },
      include: { course: true }
    });
    
    if (!session) {
      console.log(`❌ Session ${sessionId} not found.`);
      return;
    }
    
    // Update session with geofencing
    const updatedSession = await prisma.attendancesession.update({
      where: { id: sessionId },
      data: {
        requireLocation: true,
        latitude: latitude,
        longitude: longitude,
        radiusMeters: radiusMeters
      }
    });
    
    console.log('✅ Geofencing enabled successfully!');
    console.log(`📚 Course: ${session.course.name}`);
    console.log(`🆔 Session: ${sessionId}`);
    console.log(`📍 Location: ${latitude}, ${longitude}`);
    console.log(`📏 Radius: ${radiusMeters} meters`);
    console.log(`🔒 Location Required: ${updatedSession.requireLocation}`);
    console.log('\n🔗 Test URL:');
    console.log(`http://localhost:9002/attendance/${sessionId}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

enableGeofencing();
