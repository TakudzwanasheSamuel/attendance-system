import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { BookOpen, Calendar, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboardPage() {
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
  
  if (!userPayload || userPayload.role !== 'STUDENT') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Access Denied</h2>
          <p className="text-muted-foreground">This page is only accessible to students.</p>
        </div>
      </div>
    );
  }

  // Get student data
  const student = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: {
      courseenrollment: {
        include: {
          course: {
            include: {
              user: true // lecturer info
            }
          }
        }
      },
      attendancerecord: {
        include: {
          attendancesession: {
            include: {
              course: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 5 // Get last 5 attendance records
      }
    }
  });

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Student Not Found</h2>
          <p className="text-muted-foreground">Unable to load student information.</p>
        </div>
      </div>
    );
  }

  const enrolledCourses = student.courseenrollment;
  const totalAttendance = student.attendancerecord.length;
  
  // Calculate attendance rate
  const totalSessions = await prisma.attendancesession.count({
    where: {
      courseId: {
        in: enrolledCourses.map(e => e.courseId)
      }
    }
  });
  
  const attendanceRate = totalSessions > 0 ? ((totalAttendance / totalSessions) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome, {student.name.split(' ')[0]}!</h2>
        <p className="text-muted-foreground">Here's an overview of your attendance and enrolled courses.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card key="enrolled-courses">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card key="total-sessions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card key="attended">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attended</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendance}</div>
            <p className="text-xs text-muted-foreground">Sessions attended</p>
          </CardContent>
        </Card>

        <Card key="attendance-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(attendanceRate) >= 75 ? 'text-green-600' : parseFloat(attendanceRate) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {attendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card key="courses-list">
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
            <CardDescription>Your current course enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">You are not enrolled in any courses yet.</p>
            ) : (
              <div className="space-y-3">
                {enrolledCourses.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{enrollment.course.name}</p>
                      <p className="text-sm text-muted-foreground">{enrollment.course.code}</p>
                      <p className="text-xs text-muted-foreground">Lecturer: {enrollment.course.user.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card key="recent-attendance">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your last 5 attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {student.attendancerecord.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            ) : (
              <div className="space-y-3">
                {student.attendancerecord.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.attendancesession.course.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                      record.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {student.attendancerecord.length > 0 && (
              <Link href="/student/history" className="block mt-4">
                <p className="text-sm text-blue-600 hover:underline">View full history →</p>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
