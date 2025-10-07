"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, Lecturer, Student } from "@/lib/types";
import { Badge } from "../ui/badge";

interface CourseFormProps {
    course?: Course;
    lecturers: Lecturer[];
    students: Student[];
    closeDialog: () => void;
}

const formSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters."),
  code: z.string().min(2, "Course code must be at least 2 characters."),
  lecturerId: z.string({ required_error: "Please select a lecturer." }),
  enrolledStudentIds: z.array(z.string()).min(1, "Select at least one student."),
});

type CourseFormValues = z.infer<typeof formSchema>;

export function CourseForm({ course, lecturers, students, closeDialog }: CourseFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: course?.name || "",
      code: course?.code || "",
      lecturerId: course?.lecturerId || "",
      enrolledStudentIds: course?.enrolledStudentIds || [],
    },
  });
  
  function onSubmit(data: CourseFormValues) {
    setIsLoading(true);
    console.log(data);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: course ? "Course Updated" : "Course Created",
        description: `The course "${data.name}" has been successfully saved.`,
      });
      closeDialog();
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Advanced Web Development" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Course Code</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., CS449" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="lecturerId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lecturer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a lecturer" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {lecturers.map(lecturer => (
                            <SelectItem key={lecturer.id} value={lecturer.id}>{lecturer.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="enrolledStudentIds"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Enrolled Students</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between h-auto",
                                    !field.value?.length && "text-muted-foreground"
                                )}
                                >
                                <div className="flex gap-1 flex-wrap">
                                    {field.value?.length > 0 ? 
                                        field.value.slice(0, 3).map(studentId => {
                                            const student = students.find(s => s.id === studentId);
                                            return <Badge key={studentId} variant="secondary">{student?.name}</Badge>
                                        })
                                        : "Select students"}
                                    {field.value?.length > 3 && <Badge variant="outline">+{field.value.length - 3} more</Badge>}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search students..." />
                                    <CommandList>
                                        <CommandEmpty>No students found.</CommandEmpty>
                                        <CommandGroup>
                                            {students.map((student) => (
                                            <CommandItem
                                                value={student.name}
                                                key={student.id}
                                                onSelect={() => {
                                                    const currentIds = field.value || [];
                                                    const updatedIds = currentIds.includes(student.id)
                                                        ? currentIds.filter(id => id !== student.id)
                                                        : [...currentIds, student.id];
                                                    field.onChange(updatedIds);
                                                }}
                                            >
                                                <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value?.includes(student.id) ? "opacity-100" : "opacity-0"
                                                )}
                                                />
                                                {student.name}
                                            </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            Select the students to enroll in this course.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {course ? "Save Changes" : "Create Course"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
