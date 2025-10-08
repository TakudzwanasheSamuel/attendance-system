import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, QrCode, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { QRCodeGenerator } from "@/components/lecturer/qr-code-generator";
import { CopyButton } from "@/components/lecturer/copy-button";

interface SessionPageProps {
  params: Promise<{ courseId: string; sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { courseId, sessionId } = await params;
  
  console.log('🔍 Loading session page for course:', courseId, 'session:', sessionId);
  
  // Get the current user from the auth token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Not Authenticated</h2>
          <p className="text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Verify the token and get user info
  const userPayload = verifyToken(token);
  
  if (!userPayload || userPayload.role !== 'LECTURER') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Access Denied</h2>
          <p className="text-muted-foreground">This page is only accessible to lecturers.</p>
        </div>
      </div>
    );
  }

  // Get the session with course and attendance data
  const session = await prisma.attendancesession.findFirst({
    where: { 
      id: sessionId,
      courseId: courseId,
      course: {
        lecturerId: userPayload.id // Ensure the lecturer owns this course
      }
    },
    include: {
      course: true,
      attendancerecord: {
        include: {
          user: true // student info
        }
      }
    }
  });

  if (!session) {
    console.log('❌ Session not found or not owned by lecturer');
    notFound();
  }

  const isActive = session.expiresAt > new Date();
  const attendanceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/attendance/${sessionId}`;
  
  console.log(`📊 Session ${session.code} has ${session.attendancerecord.length} attendance records`);

  return (
    <div className="space-y-6">
      <Link 
        href={`/lecturer/courses/${courseId}`} 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Attendance Session</h2>
          <p className="text-muted-foreground">{session.course.name} - {session.course.code}</p>
        </div>
        <Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-2">
          {isActive ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Active
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              Expired
            </>
          )}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
            <CardDescription>
              Students can scan this QR code to mark their attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <QRCodeGenerator 
                url={attendanceUrl}
                sessionCode={session.code}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Scan with your phone camera or QR code app
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Session Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Session Code
            </CardTitle>
            <CardDescription>
              Students can manually enter this code to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold tracking-wider bg-muted p-4 rounded-lg">
                {session.code}
              </div>
              <CopyButton 
                text={session.code}
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Share this code with students
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{session.attendancerecord.length}</div>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Date(session.expiresAt).toLocaleTimeString()}
              </div>
              <p className="text-xs text-muted-foreground">Expires</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {isActive ? 'Live' : 'Ended'}
              </div>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      {session.attendancerecord.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>
              Students who have marked their attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {session.attendancerecord.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <p className="font-medium">{record.user.name}</p>
                    <p className="text-sm text-muted-foreground">{record.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
