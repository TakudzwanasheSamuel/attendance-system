import { AttendanceTracker } from "@/components/lecturer/attendance-tracker";
import { CreateSessionDialog } from "@/components/lecturer/create-session-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { attendanceRecords, attendanceSessions, courses, students } from "@/lib/mock-data";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const course = courses.find(c => c.id === params.courseId);
  if (!course) {
    notFound();
  }

  const activeSession = attendanceSessions.find(s => s.courseId === course.id && s.expiresAt > new Date());
  
  const attendedStudents = activeSession
    ? attendanceRecords
        .filter(r => r.sessionId === activeSession.id)
        .map(r => students.find(s => s.id === r.studentId))
        .filter((s): s is NonNullable<typeof s> => s !== undefined)
    : [];

  const enrolledStudents = students.filter(s => course.enrolledStudentIds.includes(s.id));

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
                <p className="text-xs text-muted-foreground">Total students in this course</p>
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
