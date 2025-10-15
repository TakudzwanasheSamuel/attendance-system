import { prisma } from './prisma';
import { emailService } from './email-service';

interface AttendanceStats {
  studentId: string;
  studentName: string;
  parentEmail?: string;
  parentName?: string;
  overallAttendance: number;
  courses: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    attendancePercentage: number;
    presentCount: number;
    totalSessions: number;
  }>;
}

export class AttendanceChecker {
  private attendanceThreshold: number;

  constructor(threshold: number = 50) {
    this.attendanceThreshold = threshold;
  }

  /**
   * Check attendance for a specific student
   */
  async checkStudentAttendance(studentId: string): Promise<AttendanceStats | null> {
    try {
      // Get student information
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          name: true,
          parentEmail: true,
          parentName: true,
          role: true
        }
      });

      if (!student || student.role !== 'STUDENT') {
        console.log(`❌ Student not found or not a student: ${studentId}`);
        return null;
      }

      // Get student's course enrollments
      const enrollments = await prisma.courseenrollment.findMany({
        where: { studentId },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      if (enrollments.length === 0) {
        console.log(`❌ Student ${student.name} is not enrolled in any courses`);
        return null;
      }

      // Calculate attendance for each course
      const courseStats = [];
      let totalPresent = 0;
      let totalSessions = 0;

      for (const enrollment of enrollments) {
        const courseId = enrollment.courseId;
        
        // Get all attendance sessions for this course
        const sessions = await prisma.attendancesession.findMany({
          where: { courseId },
          select: { id: true }
        });

        // Get student's attendance records for this course
        const attendanceRecords = await prisma.attendancerecord.findMany({
          where: {
            studentId,
            sessionId: { in: sessions.map(s => s.id) }
          },
          select: { status: true }
        });

        const presentCount = attendanceRecords.filter(record => 
          record.status === 'Present' || record.status === 'Late'
        ).length;

        const totalCourseSessions = sessions.length;
        const attendancePercentage = totalCourseSessions > 0 
          ? Math.round((presentCount / totalCourseSessions) * 100)
          : 0;

        courseStats.push({
          courseId,
          courseName: enrollment.course.name,
          courseCode: enrollment.course.code,
          attendancePercentage,
          presentCount,
          totalSessions: totalCourseSessions
        });

        totalPresent += presentCount;
        totalSessions += totalCourseSessions;
      }

      const overallAttendance = totalSessions > 0 
        ? Math.round((totalPresent / totalSessions) * 100)
        : 0;

      return {
        studentId: student.id,
        studentName: student.name,
        parentEmail: student.parentEmail || undefined,
        parentName: student.parentName || undefined,
        overallAttendance,
        courses: courseStats
      };

    } catch (error) {
      console.error('❌ Error checking student attendance:', error);
      return null;
    }
  }

  /**
   * Check attendance for all students and send alerts
   */
  async checkAllStudentsAttendance(): Promise<void> {
    try {
      console.log('🔍 Starting attendance check for all students...');

      // Get all students with parent emails
      const students = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          parentEmail: { not: null }
        },
        select: { id: true }
      });

      console.log(`📊 Found ${students.length} students with parent emails`);

      let alertsSent = 0;
      let lowAttendanceCount = 0;

      for (const student of students) {
        const attendanceStats = await this.checkStudentAttendance(student.id);
        
        if (attendanceStats && attendanceStats.overallAttendance < this.attendanceThreshold) {
          lowAttendanceCount++;
          
          if (attendanceStats.parentEmail) {
            const emailSent = await emailService.sendAttendanceAlert(
              attendanceStats.parentEmail,
              {
                studentName: attendanceStats.studentName,
                studentId: attendanceStats.studentId,
                courses: attendanceStats.courses,
                overallAttendance: attendanceStats.overallAttendance,
                parentName: attendanceStats.parentName
              }
            );

            if (emailSent) {
              alertsSent++;
              console.log(`✅ Alert sent for ${attendanceStats.studentName} (${attendanceStats.overallAttendance}%)`);
            } else {
              console.log(`❌ Failed to send alert for ${attendanceStats.studentName}`);
            }
          } else {
            console.log(`⚠️ No parent email for ${attendanceStats.studentName}`);
          }
        }
      }

      console.log(`📈 Attendance check completed:`);
      console.log(`   - Students with low attendance: ${lowAttendanceCount}`);
      console.log(`   - Alerts sent successfully: ${alertsSent}`);

    } catch (error) {
      console.error('❌ Error in attendance check:', error);
    }
  }

  /**
   * Check attendance for students in a specific course
   */
  async checkCourseAttendance(courseId: string): Promise<void> {
    try {
      console.log(`🔍 Checking attendance for course: ${courseId}`);

      // Get all students enrolled in this course
      const enrollments = await prisma.courseenrollment.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              parentEmail: true,
              parentName: true
            }
          }
        }
      });

      for (const enrollment of enrollments) {
        const attendanceStats = await this.checkStudentAttendance(enrollment.user.id);
        
        if (attendanceStats && attendanceStats.overallAttendance < this.attendanceThreshold) {
          if (attendanceStats.parentEmail) {
            await emailService.sendAttendanceAlert(
              attendanceStats.parentEmail,
              {
                studentName: attendanceStats.studentName,
                studentId: attendanceStats.studentId,
                courses: attendanceStats.courses,
                overallAttendance: attendanceStats.overallAttendance,
                parentName: attendanceStats.parentName
              }
            );
          }
        }
      }

    } catch (error) {
      console.error('❌ Error checking course attendance:', error);
    }
  }

  /**
   * Get attendance statistics for admin dashboard
   */
  async getAttendanceStatistics(): Promise<{
    totalStudents: number;
    studentsWithParentEmail: number;
    lowAttendanceStudents: number;
    alertsSentToday: number;
  }> {
    try {
      const totalStudents = await prisma.user.count({
        where: { role: 'STUDENT' }
      });

      const studentsWithParentEmail = await prisma.user.count({
        where: {
          role: 'STUDENT',
          parentEmail: { not: null }
        }
      });

      // This would need to be implemented with a more complex query
      // For now, returning basic stats
      return {
        totalStudents,
        studentsWithParentEmail,
        lowAttendanceStudents: 0, // TODO: Implement
        alertsSentToday: 0 // TODO: Implement
      };

    } catch (error) {
      console.error('❌ Error getting attendance statistics:', error);
      return {
        totalStudents: 0,
        studentsWithParentEmail: 0,
        lowAttendanceStudents: 0,
        alertsSentToday: 0
      };
    }
  }
}

// Export singleton instance
export const attendanceChecker = new AttendanceChecker();
