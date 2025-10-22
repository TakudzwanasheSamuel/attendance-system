const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActiveSessions() {
  try {
    console.log('🔍 Checking active attendance sessions...\n');
    
    const activeSessions = await prisma.attendancesession.findMany({
      where: {
        expiresAt: { gt: new Date() }
      },
      include: {
        course: true,
        geofence: true
      }
    });

    console.log(`📊 Found ${activeSessions.length} active sessions:\n`);

    if (activeSessions.length === 0) {
      console.log('❌ No active sessions found. Create a session first.');
      return;
    }

    activeSessions.forEach((session, index) => {
      console.log(`${index + 1}. Session Code: ${session.code}`);
      console.log(`   Course: ${session.course.name} (${session.course.code})`);
      console.log(`   Expires: ${session.expiresAt.toLocaleString()}`);
      console.log(`   Location Required: ${session.requireLocation ? 'Yes' : 'No'}`);
      if (session.geofence) {
        console.log(`   Geofence: ${session.geofence.name} (${session.geofence.radiusMeters}m radius)`);
      }
      console.log('');
    });

    // Check if there are any students enrolled in these courses
    const courseIds = activeSessions.map(s => s.courseId);
    const enrollments = await prisma.courseenrollment.findMany({
      where: {
        courseId: { in: courseIds }
      },
      include: {
        user: true,
        course: true
      }
    });

    console.log(`👨‍🎓 Students enrolled in active courses: ${enrollments.length}`);
    
    if (enrollments.length > 0) {
      console.log('\nSample enrolled students:');
      enrollments.slice(0, 5).forEach(enrollment => {
        console.log(`- ${enrollment.user.name} (${enrollment.user.email}) - ${enrollment.course.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveSessions();
