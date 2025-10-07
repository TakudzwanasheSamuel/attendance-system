"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, Lecturer, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateAttendanceReport } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";


interface ReportGeneratorProps {
    courses: Course[];
    lecturers: Lecturer[];
    students: Student[];
}

const formSchema = z.object({
  courseId: z.string().optional(),
  lecturerId: z.string().optional(),
  studentId: z.string().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportGenerator({ courses, lecturers, students }: ReportGeneratorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            courseId: "all",
            lecturerId: "all",
            studentId: "all",
            dateRange: { from: undefined, to: undefined },
        },
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        setReport(null);
        
        // Don't send 'all' to the server action, send undefined instead
        const filters = {
            courseId: data.courseId === 'all' ? undefined : data.courseId,
            lecturerId: data.lecturerId === 'all' ? undefined : data.lecturerId,
            studentId: data.studentId === 'all' ? undefined : data.studentId,
            dateRange: data.dateRange,
        };

        try {
            const result = await generateAttendanceReport(filters);
            if (result.success && result.report) {
                setReport(result.report);
                toast({
                    title: "Report Generated",
                    description: "The AI-powered attendance summary is ready.",
                });
            } else {
                throw new Error(result.error || "Failed to generate report.");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error.message || "There was a problem with your request.",
            });
        } finally {
            setIsLoading(false);
        }
    }
  
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                    <CardDescription>Select criteria to generate the report. Leave fields blank to include all data.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                             <FormField
                                control={form.control}
                                name="dateRange"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date Range</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value?.from && "text-muted-foreground"
                                            )}
                                            >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value?.from ? (
                                                field.value.to ? (
                                                <>
                                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                                    {format(field.value.to, "LLL dd, y")}
                                                </>
                                                ) : (
                                                format(field.value.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={field.value?.from}
                                                selected={{ from: field.value?.from!, to: field.value?.to }}
                                                onSelect={field.onChange}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="courseId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Course</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Courses" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">All Courses</SelectItem>
                                            {courses.map(course => (
                                                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                            <SelectValue placeholder="All Lecturers" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">All Lecturers</SelectItem>
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
                                name="studentId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Student</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Students" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">All Students</SelectItem>
                                            {students.map(student => (
                                                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Wand2 className="mr-2 h-4 w-4" />
                                )}
                                Generate Report
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <div className="lg:col-span-2">
                <Card className="min-h-[500px]">
                    <CardHeader>
                        <CardTitle className="font-headline">AI-Generated Summary</CardTitle>
                         <CardDescription>A comprehensive analysis of the filtered attendance data.</CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-muted-foreground">The AI is analyzing the data...</p>
                            </div>
                        )}
                        {!isLoading && !report && (
                            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                                 <div className="text-center">
                                    <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-medium text-foreground">No Report Generated</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Select your filters and click "Generate Report".</p>
                                </div>
                            </div>
                        )}
                        {report && (
                            <div dangerouslySetInnerHTML={{ __html: report }} />
                        )}
                    </CardContent>
                </Card>
                 <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>About This Feature</AlertTitle>
                    <AlertDescription>
                        This report is generated by a large language model (LLM) based on the mock data in the application. The summary, analysis, and recommendations are all produced by AI.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}
