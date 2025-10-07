import { CourseTable } from "@/components/admin/course-table";
import { AddCourseDialog } from "@/components/admin/add-course-dialog";
import { courses, lecturers, students } from "@/lib/mock-data";

export default function CourseManagementPage() {

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">Course Management</h2>
                    <p className="text-muted-foreground">Create, view, and manage all courses in the system.</p>
                </div>
                <AddCourseDialog lecturers={lecturers} students={students} />
            </div>
            <CourseTable courses={courses} lecturers={lecturers} students={students} />
        </div>
    );
}
