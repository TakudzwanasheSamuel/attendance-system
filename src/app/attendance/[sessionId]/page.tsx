import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AttendanceForm } from "@/components/student/attendance-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, QrCode } from "lucide-react";

interface AttendancePageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function AttendancePage({ params }: AttendancePageProps) {
  const { sessionId } = await params;
  
  console.log('🔍 Loading attendance page for session:', sessionId);
  
  // Get the session with course information
  const session = await prisma.attendancesession.findUnique({
    where: { id: sessionId },
    include: {
      course: {
        include: {
          user: true // lecturer info
        }
      }
    }
  });

  if (!session) {
    console.log('❌ Session not found');
    notFound();
  }

  const isActive = session.expiresAt > new Date();
  const now = new Date();
  const timeRemaining = Math.max(0, Math.floor((session.expiresAt.getTime() - now.getTime()) / (1000 * 60))); // minutes

  console.log(`📊 Session ${session.code} is ${isActive ? 'active' : 'expired'}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Mark Your Attendance
            </h1>
            <p className="text-muted-foreground">
              {session.course.name} - {session.course.code}
            </p>
            <p className="text-sm text-muted-foreground">
              Lecturer: {session.course.user.name}
            </p>
          </div>

          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Code: {session.code}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={isActive ? "default" : "destructive"}>
                  {isActive ? (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      Active ({timeRemaining}m left)
                    </>
                  ) : (
                    "Expired"
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                How to Mark Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Method 1: QR Code Scan</h4>
                  <p className="text-sm text-muted-foreground">
                    If you scanned a QR code to get here, you're all set! Just enter your credentials below.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Method 2: Manual Entry</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter your email, password, and the session code: <strong>{session.code}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Form */}
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Credentials</CardTitle>
              <CardDescription>
                {isActive 
                  ? "Enter your email and password to mark your attendance"
                  : "This session has expired. You cannot mark attendance."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceForm 
                sessionId={sessionId}
                sessionCode={session.code}
                isActive={isActive}
              />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Smart Student Monitoring System</p>
            <p>If you have any issues, contact your lecturer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
