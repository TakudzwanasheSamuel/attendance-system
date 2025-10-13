const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSession() {
  try {
    const sessionId = 'lzwe89uumrjmgp1ew9c'; // From the test session we just created
    const courseId = '07uyyypbovkmgp02lau';
    
    console.log(`🔍 Debugging session: ${sessionId}\n`);
    
    // This is the exact query from the session page
    const session = await prisma.attendancesession.findFirst({
      where: { 
        id: sessionId,
        courseId: courseId,
        course: {
          lecturerId: 'blessing.moyo.12@msu.com' // We'll need to get the actual lecturer ID
        }
      },
      include: {
        course: true,
        attendancerecord: {
          include: {
            user: true // student info
          }
        }
      }
    });
    
    if (!session) {
      console.log('❌ Session not found with lecturer filter');
      
      // Try without lecturer filter
      const sessionWithoutFilter = await prisma.attendancesession.findFirst({
        where: { 
          id: sessionId,
          courseId: courseId
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
      
      if (sessionWithoutFilter) {
        console.log('✅ Session found without lecturer filter');
        console.log(`Course lecturer ID: ${sessionWithoutFilter.course.lecturerId}`);
        console.log(`Attendance records: ${sessionWithoutFilter.attendancerecord.length}`);
      }
    } else {
      console.log('✅ Session found with lecturer filter');
      console.log(`Attendance records: ${session.attendancerecord.length}`);
      session.attendancerecord.forEach(record => {
        console.log(`  - ${record.user.name} (${record.status}) at ${record.timestamp}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSession();
