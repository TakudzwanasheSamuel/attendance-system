const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// MSU Gweru Campus Locations
const MSU_GWERU_LOCATIONS = {
  'main-campus': {
    name: 'MSU Gweru Main Campus',
    latitude: -19.4543,
    longitude: 29.8175,
    radius: 150
  },
  'main-building': {
    name: 'Main Administrative Building',
    latitude: -19.4540,
    longitude: 29.8170,
    radius: 50
  },
  'library': {
    name: 'University Library',
    latitude: -19.4545,
    longitude: 29.8180,
    radius: 75
  },
  'lecture-halls': {
    name: 'Lecture Hall Complex',
    latitude: -19.4548,
    longitude: 29.8172,
    radius: 100
  },
  'engineering': {
    name: 'Engineering Faculty',
    latitude: -19.4541,
    longitude: 29.8178,
    radius: 80
  },
  'science': {
    name: 'Science Faculty',
    latitude: -19.4546,
    longitude: 29.8173,
    radius: 80
  }
};

async function setupGweruGeofencing() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('🏫 MSU Gweru Campus Geofencing Setup\n');
      console.log('Usage: node msu-gweru-geofencing.js <command> [options]\n');
      console.log('Commands:');
      console.log('  list-locations                    - Show available campus locations');
      console.log('  enable <sessionId> <location>     - Enable geofencing for a session');
      console.log('  create-session <location>         - Create new geofenced session');
      console.log('  test-location <lat> <lng>         - Test if coordinates are within any campus area');
      console.log('\nAvailable locations:');
      Object.keys(MSU_GWERU_LOCATIONS).forEach(key => {
        const loc = MSU_GWERU_LOCATIONS[key];
        console.log(`  ${key.padEnd(15)} - ${loc.name} (${loc.radius}m radius)`);
      });
      return;
    }

    const command = args[0];

    switch (command) {
      case 'list-locations':
        console.log('🏫 MSU Gweru Campus Locations:\n');
        Object.entries(MSU_GWERU_LOCATIONS).forEach(([key, loc]) => {
          console.log(`📍 ${loc.name}`);
          console.log(`   ID: ${key}`);
          console.log(`   Coordinates: ${loc.latitude}, ${loc.longitude}`);
          console.log(`   Radius: ${loc.radius}m\n`);
        });
        break;

      case 'enable':
        if (args.length < 3) {
          console.log('Usage: node msu-gweru-geofencing.js enable <sessionId> <location>');
          return;
        }
        await enableSessionGeofencing(args[1], args[2]);
        break;

      case 'create-session':
        if (args.length < 2) {
          console.log('Usage: node msu-gweru-geofencing.js create-session <location>');
          return;
        }
        await createGeofencedSession(args[1]);
        break;

      case 'test-location':
        if (args.length < 3) {
          console.log('Usage: node msu-gweru-geofencing.js test-location <latitude> <longitude>');
          return;
        }
        testLocation(parseFloat(args[1]), parseFloat(args[2]));
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function enableSessionGeofencing(sessionId, locationKey) {
  const location = MSU_GWERU_LOCATIONS[locationKey];
  if (!location) {
    console.log(`❌ Unknown location: ${locationKey}`);
    console.log('Available locations:', Object.keys(MSU_GWERU_LOCATIONS).join(', '));
    return;
  }

  const session = await prisma.attendancesession.findUnique({
    where: { id: sessionId },
    include: { course: true }
  });

  if (!session) {
    console.log(`❌ Session ${sessionId} not found.`);
    return;
  }

  await prisma.attendancesession.update({
    where: { id: sessionId },
    data: {
      requireLocation: true,
      latitude: location.latitude,
      longitude: location.longitude,
      radiusMeters: location.radius
    }
  });

  console.log('✅ Geofencing enabled for MSU Gweru!');
  console.log(`📚 Course: ${session.course.name}`);
  console.log(`🆔 Session: ${sessionId}`);
  console.log(`🏫 Location: ${location.name}`);
  console.log(`📍 Coordinates: ${location.latitude}, ${location.longitude}`);
  console.log(`📏 Radius: ${location.radius}m`);
}

async function createGeofencedSession(locationKey) {
  const location = MSU_GWERU_LOCATIONS[locationKey];
  if (!location) {
    console.log(`❌ Unknown location: ${locationKey}`);
    return;
  }

  const lecturer = await prisma.user.findFirst({
    where: { role: 'LECTURER' },
    include: { course: true }
  });

  if (!lecturer || lecturer.course.length === 0) {
    console.log('❌ No lecturer with courses found');
    return;
  }

  const course = lecturer.course[0];
  const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();

  const session = await prisma.attendancesession.create({
    data: {
      id: sessionId,
      code: sessionId,
      courseId: course.id,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      requireLocation: true,
      latitude: location.latitude,
      longitude: location.longitude,
      radiusMeters: location.radius
    }
  });

  console.log('✅ MSU Gweru geofenced session created!');
  console.log(`🆔 Session: ${sessionId}`);
  console.log(`📚 Course: ${course.name}`);
  console.log(`🏫 Location: ${location.name}`);
  console.log(`📍 Coordinates: ${location.latitude}, ${location.longitude}`);
  console.log(`📏 Radius: ${location.radius}m`);
  console.log(`\n🔗 URLs:`);
  console.log(`Student: http://localhost:9002/attendance/${sessionId}`);
  console.log(`Lecturer: http://localhost:9002/lecturer/courses/${course.id}/session/${sessionId}`);
}

function testLocation(lat, lng) {
  console.log(`🧪 Testing location: ${lat}, ${lng}\n`);
  
  Object.entries(MSU_GWERU_LOCATIONS).forEach(([key, location]) => {
    const distance = calculateDistance(lat, lng, location.latitude, location.longitude);
    const isWithin = distance <= location.radius;
    
    console.log(`${isWithin ? '✅' : '❌'} ${location.name}`);
    console.log(`   Distance: ${Math.round(distance)}m (limit: ${location.radius}m)`);
    console.log(`   Status: ${isWithin ? 'ALLOWED' : 'BLOCKED'}\n`);
  });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

setupGweruGeofencing();
