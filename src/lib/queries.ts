import { prisma } from './prisma';
import { getCachedData, cacheKeys, invalidateCache } from './cache';

// Optimized student dashboard data
export async function getStudentDashboardData(studentId: string) {
  return getCachedData(
    cacheKeys.studentDashboard(studentId),
    async () => {
      // Single optimized query with parallel execution
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
        // Optimized count query
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

      return {
        student,
        totalSessionCount,
        enrolledCourses: student?.courseenrollment || [],
        totalAttendance: student?.attendancerecord?.length || 0,
        attendanceRate: totalSessionCount > 0 
          ? (((student?.attendancerecord?.length || 0) / totalSessionCount) * 100).toFixed(1) 
          : '0'
      };
    },
    2 * 60 * 1000 // 2 minutes cache
  );
}

// Optimized course enrollment data for students
export async function getStudentCoursesData(studentId: string) {
  return getCachedData(
    cacheKeys.studentCourses(studentId),
    async () => {
      // Get enrolled course IDs first
      const enrollments = await prisma.courseenrollment.findMany({
        where: { studentId },
        select: { courseId: true }
      });

      const enrolledCourseIds = enrollments.map(e => e.courseId);

      // Get all courses with enrollment counts in parallel
      const [enrolledCourses, availableCourses] = await Promise.all([
        // Enrolled courses
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
        // Available courses (not enrolled)
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

      return {
        enrolledCourses,
        availableCourses
      };
    },
    3 * 60 * 1000 // 3 minutes cache
  );
}

// Optimized session attendance data
export async function getSessionAttendanceData(sessionId: string, lecturerId: string) {
  return getCachedData(
    cacheKeys.sessionAttendance(sessionId),
    async () => {
      return prisma.attendancesession.findFirst({
        where: { 
          id: sessionId,
          course: {
            lecturerId: lecturerId
          }
        },
        select: {
          id: true,
          code: true,
          createdAt: true,
          expiresAt: true,
          course: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          attendancerecord: {
            select: {
              id: true,
              timestamp: true,
              status: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      });
    },
    30 * 1000 // 30 seconds cache for real-time data
  );
}

// Optimized lecturer courses data
export async function getLecturerCoursesData(lecturerId: string) {
  return getCachedData(
    cacheKeys.lecturerCourses(lecturerId),
    async () => {
      return prisma.course.findMany({
        where: { lecturerId },
        select: {
          id: true,
          name: true,
          code: true,
          _count: {
            select: {
              courseenrollment: true,
              attendancesession: true
            }
          },
          attendancesession: {
            select: {
              id: true,
              code: true,
              createdAt: true,
              expiresAt: true,
              _count: {
                select: {
                  attendancerecord: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 3 // Recent sessions
          }
        },
        orderBy: { name: 'asc' }
      });
    },
    5 * 60 * 1000 // 5 minutes cache
  );
}

// Cache invalidation helpers
export function invalidateStudentCache(studentId: string) {
  invalidateCache(`student:${studentId}`);
}

export function invalidateSessionCache(sessionId: string) {
  invalidateCache(`session:${sessionId}`);
}

export function invalidateCourseCache(courseId: string) {
  invalidateCache(`course:${courseId}`);
}
