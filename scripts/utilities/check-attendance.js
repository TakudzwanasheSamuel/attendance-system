const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAttendance() {
  try {
    console.log('🔍 Checking attendance records...\n');
    
    // Get all attendance records
    const records = await prisma.attendancerecord.findMany({
      include: {
        attendancesession: {
          include: {
            course: true
          }
        },
        user: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    console.log(`📊 Total Attendance Records: ${records.length}\n`);
    
    if (records.length > 0) {
      console.log('Recent attendance records:');
      records.slice(0, 10).forEach((record, index) => {
        console.log(`${index + 1}. ${record.user.name} (${record.user.email})`);
        console.log(`   Course: ${record.attendancesession.course.name}`);
        console.log(`   Session: ${record.attendancesession.code}`);
        console.log(`   Status: ${record.status}`);
        console.log(`   Time: ${record.timestamp}`);
        console.log('');
      });
    }
    
    // Get active sessions
    const activeSessions = await prisma.attendancesession.findMany({
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        course: true,
        attendancerecord: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log(`🟢 Active Sessions: ${activeSessions.length}\n`);
    
    activeSessions.forEach(session => {
      console.log(`Session: ${session.code} (${session.course.name})`);
      console.log(`  Attendance Count: ${session.attendancerecord.length}`);
      console.log(`  Expires: ${session.expiresAt}`);
      session.attendancerecord.forEach(record => {
        console.log(`    - ${record.user.name} (${record.status})`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAttendance();
