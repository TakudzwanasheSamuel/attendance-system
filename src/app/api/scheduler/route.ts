import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { attendanceScheduler } from '@/lib/scheduler';

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

    // Get scheduler status
    const status = attendanceScheduler.getStatus();

    return NextResponse.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { action } = await request.json();

    switch (action) {
      case 'start':
        attendanceScheduler.startDailyCheck();
        return NextResponse.json({
          success: true,
          message: 'Attendance scheduler started'
        });

      case 'stop':
        attendanceScheduler.stop();
        return NextResponse.json({
          success: true,
          message: 'Attendance scheduler stopped'
        });

      case 'run':
        await attendanceScheduler.runAttendanceCheck();
        return NextResponse.json({
          success: true,
          message: 'Attendance check completed'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error managing scheduler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
