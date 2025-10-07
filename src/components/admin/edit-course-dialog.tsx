"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseForm } from "./course-form";
import type { Course, Lecturer, Student } from "@/lib/types";

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  lecturers: Lecturer[];
  students: Student[];
}

export function EditCourseDialog({ open, onOpenChange, course, lecturers, students }: EditCourseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Course</DialogTitle>
          <DialogDescription>
            Update the details for "{course.name}".
          </DialogDescription>
        </DialogHeader>
        <CourseForm
            course={course}
            lecturers={lecturers}
            students={students}
            closeDialog={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
