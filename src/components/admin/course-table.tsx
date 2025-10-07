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
import type { Course, Lecturer, Student } from "@/lib/types";

interface CourseTableProps {
  courses: Course[];
  lecturers: Lecturer[];
  students: Student[];
}

export function CourseTable({ courses, lecturers, students }: CourseTableProps) {
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
                        const lecturer = lecturers.find(l => l.id === course.lecturerId);
                        return (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{course.code}</Badge>
                                </TableCell>
                                <TableCell>{lecturer?.name || 'N/A'}</TableCell>
                                <TableCell>{course.enrolledStudentIds.length}</TableCell>
                                <TableCell className="text-right">
                                    <CourseTableActions course={course} lecturers={lecturers} students={students} />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
