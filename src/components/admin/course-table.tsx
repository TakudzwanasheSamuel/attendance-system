import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CourseTableActions } from "./course-table-actions";
import { Course } from "@prisma/client";
import type { Lecturer, Student } from "@/lib/types";

interface CourseTableProps {
  courses: (Course & {
    user: { name: string };
    courseenrollment: { user: { name: string } }[];
  })[];
  lecturers: Lecturer[];
  students: Student[];
}

export function CourseTable({ courses, lecturers, students }: CourseTableProps) {
  // Add safety checks
  if (!courses) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Enrolled Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No courses found.</TableCell>
                        </TableRow>
                    )}
                    {courses.map((course) => {
                      // Add safety check for individual course
                      if (!course) return null;
                      
                      return (
                        <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.name || '—'}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{course.code || '—'}</Badge>
                            </TableCell>
                            <TableCell>{course.user?.name ?? '—'}</TableCell>
                            <TableCell>{course.courseenrollment?.length ?? 0}</TableCell>
                            <TableCell className="text-right">
                                <CourseTableActions course={course as any} lecturers={lecturers || []} students={students || []} />
                            </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
