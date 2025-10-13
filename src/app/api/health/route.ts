import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - dbStart;

    // Get basic system stats
    const [userCount, courseCount, sessionCount, attendanceCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.attendancesession.count(),
      prisma.attendancerecord.count()
    ]);

    // Get active sessions
    const activeSessions = await prisma.attendancesession.count({
      where: {
        expiresAt: {
          gt: new Date()
        }
      }
    });

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      database: {
        status: 'connected',
        responseTime: `${dbTime}ms`
      },
      stats: {
        users: userCount,
        courses: courseCount,
        totalSessions: sessionCount,
        activeSessions: activeSessions,
        attendanceRecords: attendanceCount
      },
      performance: {
        responseTime: `${totalTime}ms`,
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        status: 'disconnected'
      }
    }, { status: 503 });
  }
}
