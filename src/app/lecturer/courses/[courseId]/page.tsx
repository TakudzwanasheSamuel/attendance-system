import { AttendanceTracker } from "@/components/lecturer/attendance-tracker";
import { CreateSessionDialog } from "@/components/lecturer/create-session-dialog";
import { EnrolledStudentsDialog } from "@/components/lecturer/enrolled-students-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  // Await params to fix Next.js 15 async params issue
  const { courseId } = await params;
  
  console.log('🔍 Loading course detail for course ID:', courseId);
  
  // Get the current user from the auth token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  // Verify the token and get user info
  const userPayload = verifyToken(token);
  
  if (!userPayload || userPayload.role !== 'LECTURER') {
    redirect('/login');
  }

  // Get the course with all related data
  const course = await prisma.course.findFirst({
    where: { 
      id: courseId,
      lecturerId: userPayload.id // Ensure the lecturer owns this course
    },
    include: {
      courseenrollment: {
        include: {
          user: true // student info
        }
      },
      attendancesession: {
        where: {
          expiresAt: {
            gt: new Date() // Only active sessions
          }
        },
        include: {
          attendancerecord: {
            include: {
              user: true // student info
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 1 // Get the most recent active session
      }
    }
  });

  if (!course) {
    console.log('❌ Course not found or not owned by lecturer');
    notFound();
  }

  console.log(`📊 Course ${course.name} has ${course.courseenrollment.length} enrolled students`);

  const activeSession = course.attendancesession[0] || null;
  
  const attendedStudents = activeSession
    ? activeSession.attendancerecord.map(record => record.user)
    : [];

  const enrolledStudents = course.courseenrollment.map(enrollment => enrollment.user);

  return (
    <div className="space-y-6">
       <Link href="/lecturer/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">{course.name}</h2>
            <p className="text-muted-foreground">{course.code}</p>
        </div>
        <CreateSessionDialog courseId={course.id} activeSession={activeSession} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{enrolledStudents.length}</div>
                <p className="text-xs text-muted-foreground mb-3">Total students in this course</p>
                <EnrolledStudentsDialog students={enrolledStudents} courseName={course.name} />
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Session</CardTitle>
                <div className={`h-2 w-2 rounded-full ${activeSession ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activeSession ? 'Live' : 'Inactive'}</div>
                <p className="text-xs text-muted-foreground">{activeSession ? 'An attendance session is currently running.' : 'No active session.'}</p>
            </CardContent>
        </Card>
      </div>

      {activeSession && <AttendanceTracker attendedStudents={attendedStudents} />}

    </div>
  );
}
