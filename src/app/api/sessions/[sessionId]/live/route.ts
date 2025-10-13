import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userPayload = verifyToken(token);
  if (!userPayload || userPayload.role !== 'LECTURER') {
    return new Response('Forbidden', { status: 403 });
  }

  // Verify session ownership
  const session = await prisma.attendancesession.findFirst({
    where: {
      id: sessionId,
      course: {
        lecturerId: userPayload.id
      }
    }
  });

  if (!session) {
    return new Response('Session not found', { status: 404 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial data
      const sendUpdate = async () => {
        try {
          const attendanceData = await prisma.attendancerecord.findMany({
            where: { sessionId },
            include: {
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
          });

          const data = {
            sessionId,
            count: attendanceData.length,
            records: attendanceData.map(record => ({
              id: record.id,
              studentName: record.user.name,
              studentEmail: record.user.email,
              timestamp: record.timestamp,
              status: record.status
            })),
            lastUpdate: new Date().toISOString()
          };

          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('SSE Error:', error);
          controller.error(error);
        }
      };

      // Send initial update
      sendUpdate();

      // Send updates every 5 seconds
      intervalId = setInterval(sendUpdate, 5000);

      // Send keep-alive every 30 seconds
      const keepAliveId = setInterval(() => {
        controller.enqueue(encoder.encode(': keep-alive\n\n'));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        clearInterval(keepAliveId);
        controller.close();
      });
    },

    cancel() {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}
