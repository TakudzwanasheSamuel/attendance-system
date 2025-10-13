const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createRecentActivityTest() {
  try {
    console.log('Creating test activity for Recent Activity section...\n');
    
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
    console.log(`📚 Using course: ${course.name} (${course.code})`);
    console.log(`👨‍🏫 Lecturer: ${lecturer.name}\n`);
    
    // Create a new session (this will show in recent activity)
    const sessionId = generateSessionCode();
    const session = await prisma.attendancesession.create({
      data: {
        id: sessionId,
        code: sessionId,
        courseId: course.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        createdAt: new Date() // Current time
      }
    });
    
    console.log(`✅ Created session: ${session.id}`);
    console.log(`⏰ Expires: ${session.expiresAt}\n`);
    
    // Find a few students to mark attendance
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      take: 3
    });
    
    if (students.length === 0) {
      console.log('❌ No students found');
      return;
    }
    
    console.log('👥 Marking attendance for students:');
    
    // Create attendance records (these will show in recent activity)
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const status = i === 0 ? 'Present' : i === 1 ? 'Present' : 'Late';
      
      await prisma.attendancerecord.create({
        data: {
          id: generateId(),
          studentId: student.id,
          sessionId: session.id,
          status: status,
          timestamp: new Date() // Current time
        }
      });
      
      console.log(`  ✓ ${student.name}: ${status}`);
    }
    
    console.log('\n🎉 Test activity created successfully!');
    console.log('📊 Check the admin dashboard Recent Activity section to see the new entries.');
    console.log(`🔗 Session URL: http://localhost:9002/lecturer/courses/${course.id}/session/${session.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRecentActivityTest();
