import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { BookOpen, Users, UserPlus } from "lucide-react";
import { EnrollButton } from "@/components/student/enroll-button";
import { redirect } from "next/navigation";
import { getStudentCoursesData } from "@/lib/queries";

export default async function StudentCoursesPage() {
  // Get the current user from the auth token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }

  // Verify the token and get user info
  const userPayload = verifyToken(token);
  
  if (!userPayload || userPayload.role !== 'STUDENT') {
    redirect('/login');
  }

  // Get optimized courses data with caching
  const { enrolledCourses, availableCourses } = await getStudentCoursesData(userPayload.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Course Enrollment</h2>
        <p className="text-muted-foreground">Browse and enroll in available courses.</p>
      </div>

      {/* Enrolled Courses Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">My Enrolled Courses ({enrolledCourses.length})</h3>
        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You are not enrolled in any courses yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Browse available courses below to get started!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{course.name}</span>
                    <Badge variant="secondary">Enrolled</Badge>
                  </CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Lecturer: {course.user.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span>{course._count.courseenrollment} students enrolled</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Courses Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Courses ({availableCourses.length})</h3>
        {availableCourses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No more courses available for enrollment.</p>
                <p className="text-sm text-muted-foreground mt-2">You are enrolled in all available courses!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Lecturer: {course.user.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <UserPlus className="h-4 w-4 mr-2" />
                        <span>{course._count.courseenrollment} students enrolled</span>
                      </div>
                    </div>
                    <EnrollButton 
                      courseId={course.id} 
                      courseName={course.name}
                      studentId={userPayload.id}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
