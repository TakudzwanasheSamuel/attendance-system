import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userPayload = verifyToken(token);
    
    if (!userPayload || !['ADMIN', 'LECTURER'].includes(userPayload.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const courseId = searchParams.get('courseId');
    const sessionId = searchParams.get('sessionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query conditions
    const whereConditions: any = {};

    if (userPayload.role === 'LECTURER') {
      // Lecturers can only export their own courses
      whereConditions.attendancesession = {
        course: {
          lecturerId: userPayload.id
        }
      };
    }

    if (courseId) {
      whereConditions.attendancesession = {
        ...whereConditions.attendancesession,
        courseId: courseId
      };
    }

    if (sessionId) {
      whereConditions.sessionId = sessionId;
    }

    if (startDate || endDate) {
      whereConditions.timestamp = {};
      if (startDate) {
        whereConditions.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        whereConditions.timestamp.lte = new Date(endDate);
      }
    }

    // Fetch attendance records
    const records = await prisma.attendancerecord.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        attendancesession: {
          select: {
            code: true,
            createdAt: true,
            course: {
              select: {
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
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: records,
        count: records.length,
        exportedAt: new Date().toISOString()
      });
    }

    // Generate CSV
    const csvHeaders = [
      'Student Name',
      'Student Email',
      'Course Name',
      'Course Code',
      'Session Code',
      'Lecturer',
      'Attendance Status',
      'Timestamp',
      'Session Date'
    ];

    const csvRows = records.map(record => [
      record.user.name,
      record.user.email,
      record.attendancesession.course.name,
      record.attendancesession.course.code,
      record.attendancesession.code,
      record.attendancesession.course.user.name,
      record.status,
      record.timestamp.toISOString(),
      record.attendancesession.createdAt.toISOString().split('T')[0]
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const filename = `attendance-export-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export attendance data' },
      { status: 500 }
    );
  }
}
