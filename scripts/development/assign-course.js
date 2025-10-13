const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function assignCourse() {
  try {
    const lecturerId = '04lc9xekowrtmgp02kra';
    
    // Get the first course
    const course = await prisma.course.findFirst();
    
    if (!course) {
      console.log('No courses found');
      return;
    }
    
    // Update the course to be assigned to our lecturer
    const updatedCourse = await prisma.course.update({
      where: { id: course.id },
      data: { lecturerId: lecturerId },
      include: { user: true }
    });
    
    console.log('✅ Course assigned:');
    console.log('Course:', updatedCourse.name);
    console.log('Lecturer:', updatedCourse.user.name);
    console.log('Course ID:', updatedCourse.id);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignCourse();
