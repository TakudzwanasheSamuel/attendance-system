const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentActivity() {
  try {
    console.log('Checking recent attendance records...\n');
    
    const records = await prisma.attendanceRecord.findMany({
      include: {
        user: true,
        attendancesession: {
          include: {
            course: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    });
    
    console.log(`Found ${records.length} recent attendance records:`);
    records.forEach((record, index) => {
      console.log(`${index + 1}. ${record.user.name} marked ${record.status} for ${record.attendancesession.course.name}`);
      console.log(`   Timestamp: ${record.timestamp}`);
      console.log(`   Session ID: ${record.attendancesession.id}`);
      console.log('');
    });
    
    // Check active sessions
    const activeSessions = await prisma.attendanceSession.findMany({
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        course: true
      }
    });
    
    console.log(`Active sessions: ${activeSessions.length}`);
    activeSessions.forEach(session => {
      console.log(`- ${session.course.name} (expires: ${session.expiresAt})`);
    });
    
    // Check recent sessions (last 24 hours)
    const recentSessions = await prisma.attendanceSession.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        course: true,
        _count: {
          select: {
            attendancerecord: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\nSessions created in last 24 hours: ${recentSessions.length}`);
    recentSessions.forEach(session => {
      console.log(`- ${session.course.name}: ${session._count.attendancerecord} attendance records`);
      console.log(`  Created: ${session.createdAt}, Expires: ${session.expiresAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentActivity();
