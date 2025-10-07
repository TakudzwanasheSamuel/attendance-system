"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CourseForm } from "./course-form";
import type { Lecturer, Student } from "@/lib/types";
import { PlusCircle } from "lucide-react";

interface AddCourseDialogProps {
  lecturers: Lecturer[];
  students: Student[];
}

export function AddCourseDialog({ lecturers, students }: AddCourseDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Course</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new course.
          </DialogDescription>
        </DialogHeader>
        <CourseForm lecturers={lecturers} students={students} closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
