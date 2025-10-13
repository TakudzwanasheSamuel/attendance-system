const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createTestSession() {
  try {
    console.log('🔍 Creating test session...\n');
    
    // Get a course with a specific lecturer
    const course = await prisma.course.findFirst({
      where: {
        lecturerId: '04lc9xekowrtmgp02kra' // The lecturer we can log in as
      },
      include: {
        user: true // lecturer
      }
    });
    
    if (!course) {
      console.log('❌ No courses found');
      return;
    }
    
    const lecturer = course.user;
    console.log(`👨‍🏫 Using lecturer: ${lecturer.name}`);
    console.log(`📚 Using course: ${course.name} (${course.code})\n`);
    
    // Create a new active session (expires in 2 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);
    
    const session = await prisma.attendancesession.create({
      data: {
        id: generateId(),
        courseId: course.id,
        code: generateSessionCode(),
        expiresAt: expiresAt,
        createdAt: new Date()
      }
    });
    
    console.log('✅ Test session created:');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Session Code: ${session.code}`);
    console.log(`   Course: ${course.name}`);
    console.log(`   Expires: ${session.expiresAt}`);
    console.log(`   URL: http://localhost:9002/lecturer/courses/${course.id}/session/${session.id}`);
    
    // Get some students enrolled in this course
    const enrollments = await prisma.courseenrollment.findMany({
      where: { courseId: course.id },
      include: { user: true },
      take: 3
    });
    
    if (enrollments.length > 0) {
      console.log('\n📝 Creating test attendance records...');
      
      for (const enrollment of enrollments) {
        const attendanceRecord = await prisma.attendancerecord.create({
          data: {
            id: generateId(),
            sessionId: session.id,
            studentId: enrollment.studentId,
            status: 'Present',
            timestamp: new Date()
          }
        });
        
        console.log(`   ✅ ${enrollment.user.name} marked present`);
      }
    }
    
    console.log('\n🎉 Test session ready! Visit the URL above to see the attendance statistics.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSession();
