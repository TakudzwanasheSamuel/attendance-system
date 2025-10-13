import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Session code is required' },
        { status: 400 }
      );
    }

    // Find the session by code
    const session = await prisma.attendancesession.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        code: true,
        expiresAt: true,
        course: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session code' },
        { status: 404 }
      );
    }

    // Check if session is still active
    if (session.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionCode: session.code,
      courseName: session.course.name,
      courseCode: session.course.code,
      expiresAt: session.expiresAt
    });

  } catch (error) {
    console.error('Session find error:', error);
    return NextResponse.json(
      { error: 'Failed to find session' },
      { status: 500 }
    );
  }
}
