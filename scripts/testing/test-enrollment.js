const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEnrollment() {
  try {
    console.log('🎓 Testing course enrollment system...\n');

    // Find a student
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' }
    });

    if (!student) {
      console.log('❌ No student found in database');
      return;
    }

    console.log('👨‍🎓 Found student:', {
      id: student.id,
      name: student.name,
      email: student.email
    });

    // Find a course
    const course = await prisma.course.findFirst();

    if (!course) {
      console.log('❌ No course found in database');
      return;
    }

    console.log('\n📚 Found course:', {
      id: course.id,
      name: course.name,
      code: course.code
    });

    // Check if already enrolled
    const existingEnrollment = await prisma.courseenrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id
        }
      }
    });

    if (existingEnrollment) {
      console.log('\n✅ Student is already enrolled in this course');
      console.log('Enrollment date:', existingEnrollment.createdAt);
      return;
    }

    // Try to enroll
    console.log('\n🔄 Attempting to enroll student in course...');
    
    const enrollment = await prisma.courseenrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        createdAt: new Date()
      }
    });

    console.log('✅ Enrollment successful!');
    console.log('Enrollment ID:', enrollment.studentId + '-' + enrollment.courseId);
    console.log('Created at:', enrollment.createdAt);

    // Verify enrollment
    const verifyEnrollment = await prisma.courseenrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: course.id
        }
      },
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

    if (verifyEnrollment) {
      console.log('\n🎉 Enrollment verification successful!');
      console.log(`${verifyEnrollment.user.name} is enrolled in ${verifyEnrollment.course.name} (${verifyEnrollment.course.code})`);
    } else {
      console.log('\n❌ Enrollment verification failed');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
    
    if (error.code === 'P2002') {
      console.log('Note: This might be a duplicate enrollment error');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testEnrollment();
