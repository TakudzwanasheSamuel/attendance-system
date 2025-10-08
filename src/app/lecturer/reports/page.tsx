
import { ReportGenerator } from "@/components/lecturer/report-generator";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function ReportsPage() {
  // Get the current user from the auth token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Not Authenticated</h2>
          <p className="text-muted-foreground">Please log in to access the reports page.</p>
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

  console.log('🔍 Loading lecturer reports for lecturer:', userPayload.id);

  // Get lecturer's courses and enrolled students
  const lecturerCourses = await prisma.course.findMany({
    where: { lecturerId: userPayload.id },
    include: {
      courseenrollment: {
        include: {
          user: true // student info
        }
      }
    }
  });

  // Get unique students (a student might be enrolled in multiple courses)
  const allStudents = lecturerCourses.flatMap(course => 
    course.courseenrollment.map(enrollment => enrollment.user)
  );
  
  // Remove duplicates by creating a Map with student ID as key
  const uniqueStudentsMap = new Map();
  allStudents.forEach(student => {
    if (!uniqueStudentsMap.has(student.id)) {
      uniqueStudentsMap.set(student.id, student);
    }
  });
  
  const enrolledStudents = Array.from(uniqueStudentsMap.values());

  console.log(`📊 Lecturer has ${lecturerCourses.length} courses and ${enrolledStudents.length} enrolled students`);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Generate Attendance Report</h2>
        <p className="text-muted-foreground">
          Use AI to generate a comprehensive summary of attendance data for your courses.
        </p>
      </div>
      <ReportGenerator 
        courses={lecturerCourses.map(c => ({
          id: c.id,
          name: c.name,
          code: c.code,
          lecturerId: c.lecturerId,
          enrolledStudentIds: c.courseenrollment.map(e => e.studentId)
        }))}
        students={enrolledStudents.map(s => ({
          id: s.id,
          name: s.name,
          email: s.email
        }))}
      />
    </div>
  );
}
