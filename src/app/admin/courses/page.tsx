import { CourseTable } from "@/components/admin/course-table";
import { AddCourseDialog } from "@/components/admin/add-course-dialog";
import { getAllCourses } from "@/lib/database-actions";
import { prisma } from "@/lib/prisma";

export default async function CourseManagementPage() {
    try {
        const courses = await getAllCourses();
        // Fetch lecturers and students for assignment UIs
        const [lecturers, students] = await Promise.all([
            prisma.user.findMany({ where: { role: 'LECTURER' }, select: { id: true, name: true, email: true } }),
            prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, email: true } })
        ]);
        
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight font-headline">Course Management</h2>
                        <p className="text-muted-foreground">Create, view, and manage all courses in the system.</p>
                    </div>
                    <AddCourseDialog lecturers={lecturers} students={students} />
                </div>
                <CourseTable courses={courses || []} lecturers={lecturers} students={students} />
            </div>
        );
    } catch (error) {
        console.error('Error fetching courses:', error);
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight font-headline">Course Management</h2>
                        <p className="text-muted-foreground">Create, view, and manage all courses in the system.</p>
                    </div>
                    <AddCourseDialog />
                </div>
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Error loading courses. Please try again.</p>
                </div>
            </div>
        );
    }
}
