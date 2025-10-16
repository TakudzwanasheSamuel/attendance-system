import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { attendanceChecker } from '@/lib/attendance-checker';

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const userPayload = verifyToken(token);
    
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    const { studentId, courseId, checkAll } = await request.json();

    if (checkAll) {
      // Check attendance for all students
      await attendanceChecker.checkAllStudentsAttendance();
      
      return NextResponse.json({
        success: true,
        message: 'Attendance check completed for all students'
      });
    } else if (courseId) {
      // Check attendance for specific course
      await attendanceChecker.checkCourseAttendance(courseId);
      
      return NextResponse.json({
        success: true,
        message: `Attendance check completed for course ${courseId}`
      });
    } else if (studentId) {
      // Check attendance for specific student
      const attendanceStats = await attendanceChecker.checkStudentAttendance(studentId);
      
      if (!attendanceStats) {
        return NextResponse.json(
          { success: false, error: 'Student not found or no attendance data' },
          { status: 404 }
        );
      }

      // If student has parent email, send attendance update (good or bad)
      if (attendanceStats.parentEmail) {
        const { emailService } = await import('@/lib/email-service');
        
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
          const emailType = attendanceStats.overallAttendance >= 50 ? 'update' : 'alert';
          console.log(`✅ ${emailType} sent to ${attendanceStats.parentEmail} for ${attendanceStats.studentName} (${attendanceStats.overallAttendance}%)`);
        } else {
          console.log(`❌ Failed to send email to ${attendanceStats.parentEmail} for ${attendanceStats.studentName}`);
        }
      }

      return NextResponse.json({
        success: true,
        attendanceStats
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in attendance check API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const userPayload = verifyToken(token);
    
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Get attendance statistics
    const stats = await attendanceChecker.getAttendanceStatistics();

    return NextResponse.json({
      success: true,
      statistics: stats
    });

  } catch (error) {
    console.error('Error getting attendance statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
