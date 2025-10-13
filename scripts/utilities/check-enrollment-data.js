const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEnrollmentData() {
  try {
    console.log('🔍 Checking enrollment system data...\n');

    // Count users by role
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    console.log('👥 User counts by role:');
    userCounts.forEach(count => {
      console.log(`  ${count.role}: ${count._count.role}`);
    });

    // Get all courses
    const courses = await prisma.course.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            courseenrollment: true
          }
        }
      }
    });

    console.log(`\n📚 Available courses (${courses.length}):`);
    courses.forEach(course => {
      console.log(`  ${course.name} (${course.code})`);
      console.log(`    Lecturer: ${course.user.name}`);
      console.log(`    Enrolled students: ${course._count.courseenrollment}`);
      console.log(`    Course ID: ${course.id}`);
      console.log('');
    });

    // Get students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`👨‍🎓 Available students (${students.length}):`);
    students.forEach(student => {
      console.log(`  ${student.name} (${student.email})`);
      console.log(`    Student ID: ${student.id}`);
    });

    // Check enrollments
    const enrollments = await prisma.courseenrollment.findMany({
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`\n📝 Current enrollments (${enrollments.length}):`);
    enrollments.forEach(enrollment => {
      console.log(`  ${enrollment.user.name} → ${enrollment.course.name} (${enrollment.course.code})`);
      console.log(`    Enrolled: ${enrollment.createdAt}`);
    });

    // Find potential enrollments (students not enrolled in courses)
    console.log('\n🎯 Enrollment opportunities:');
    for (const student of students) {
      const studentEnrollments = await prisma.courseenrollment.findMany({
        where: { studentId: student.id },
        select: { courseId: true }
      });
      
      const enrolledCourseIds = studentEnrollments.map(e => e.courseId);
      const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
      
      if (availableCourses.length > 0) {
        console.log(`  ${student.name} can enroll in:`);
        availableCourses.forEach(course => {
          console.log(`    - ${course.name} (${course.code}) [ID: ${course.id}]`);
        });
      } else {
        console.log(`  ${student.name} is enrolled in all available courses`);
      }
    }

  } catch (error) {
    console.error('💥 Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnrollmentData();
