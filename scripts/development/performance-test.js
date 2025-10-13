const { performance } = require('perf_hooks');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQueryPerformance() {
  console.log('🚀 Testing database query performance...\n');

  // Test 1: Student dashboard query (optimized)
  const studentId = '04lc9xekowrtmgp02kra'; // Use a real student ID
  
  console.log('📊 Student Dashboard Query:');
  const start1 = performance.now();
  
  const [student, totalSessionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        courseenrollment: {
          select: {
            courseId: true,
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        attendancerecord: {
          select: {
            id: true,
            timestamp: true,
            status: true,
            attendancesession: {
              select: {
                course: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 5
        }
      }
    }),
    prisma.attendancesession.count({
      where: {
        course: {
          courseenrollment: {
            some: {
              studentId: studentId
            }
          }
        }
      }
    })
  ]);
  
  const end1 = performance.now();
  console.log(`✅ Completed in ${(end1 - start1).toFixed(2)}ms`);
  console.log(`   Found ${student?.courseenrollment?.length || 0} enrolled courses`);
  console.log(`   Found ${student?.attendancerecord?.length || 0} recent attendance records`);
  console.log(`   Total sessions: ${totalSessionCount}\n`);

  // Test 2: Course enrollment query (optimized)
  console.log('📚 Course Enrollment Query:');
  const start2 = performance.now();
  
  const enrollments = await prisma.courseenrollment.findMany({
    where: { studentId },
    select: { courseId: true }
  });

  const enrolledCourseIds = enrollments.map(e => e.courseId);

  const [enrolledCourses, availableCourses] = await Promise.all([
    prisma.course.findMany({
      where: {
        id: { in: enrolledCourseIds }
      },
      select: {
        id: true,
        name: true,
        code: true,
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
      },
      orderBy: { name: 'asc' }
    }),
    prisma.course.findMany({
      where: {
        id: { notIn: enrolledCourseIds.length > 0 ? enrolledCourseIds : [''] }
      },
      select: {
        id: true,
        name: true,
        code: true,
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
      },
      orderBy: { name: 'asc' }
    })
  ]);
  
  const end2 = performance.now();
  console.log(`✅ Completed in ${(end2 - start2).toFixed(2)}ms`);
  console.log(`   Found ${enrolledCourses.length} enrolled courses`);
  console.log(`   Found ${availableCourses.length} available courses\n`);

  // Test 3: Session attendance query
  console.log('📅 Session Attendance Query:');
  const start3 = performance.now();
  
  const sessions = await prisma.attendancesession.findMany({
    where: {
      course: {
        courseenrollment: {
          some: {
            studentId: studentId
          }
        }
      }
    },
    select: {
      id: true,
      code: true,
      createdAt: true,
      expiresAt: true,
      course: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          attendancerecord: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });
  
  const end3 = performance.now();
  console.log(`✅ Completed in ${(end3 - start3).toFixed(2)}ms`);
  console.log(`   Found ${sessions.length} recent sessions\n`);

  console.log('🎯 Performance Summary:');
  console.log(`   Dashboard query: ${(end1 - start1).toFixed(2)}ms`);
  console.log(`   Course query: ${(end2 - start2).toFixed(2)}ms`);
  console.log(`   Session query: ${(end3 - start3).toFixed(2)}ms`);
  console.log(`   Total time: ${(end3 - start1).toFixed(2)}ms`);
  
  await prisma.$disconnect();
}

testQueryPerformance().catch(console.error);
