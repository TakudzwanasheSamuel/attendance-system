const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure...\n');
    
    const lecturers = await prisma.user.findMany({
      where: { role: 'LECTURER' }
    });
    console.log(`👨‍🏫 Lecturers: ${lecturers.length}`);
    
    const courses = await prisma.course.findMany({
      include: { user: true }
    });
    console.log(`📚 Courses: ${courses.length}`);
    
    if (courses.length > 0) {
      console.log(`First course: ${courses[0].name} by ${courses[0].user.name}`);
    }
    
    const sessions = await prisma.attendancesession.findMany({
      include: {
        course: { include: { user: true } },
        attendancerecord: true
      }
    });
    console.log(`📅 Sessions: ${sessions.length}`);
    
    if (sessions.length > 0) {
      const session = sessions[0];
      console.log(`First session: ${session.code} for ${session.course.name}`);
      console.log(`  Records: ${session.attendancerecord.length}`);
      console.log(`  Expires: ${session.expiresAt}`);
      console.log(`  Active: ${session.expiresAt > new Date()}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
