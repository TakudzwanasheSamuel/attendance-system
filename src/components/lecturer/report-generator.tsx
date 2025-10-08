
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Wand2, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, Student } from "@/lib/types";
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


interface ReportGeneratorProps {
    courses: Course[];
    students: Student[];
}

const formSchema = z.object({
  courseId: z.string().optional(),
  studentId: z.string().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportGenerator({ courses, students }: ReportGeneratorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const { toast } = useToast();

    const handlePrint = () => {
        if (!report) return;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Attendance Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1, h2, h3 { color: #333; }
                            .report-content { max-width: 800px; margin: 0 auto; }
                            @media print { body { margin: 0; } }
                        </style>
                    </head>
                    <body>
                        <div class="report-content">
                            ${report}
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleExportPDF = async () => {
        if (!report) return;
        
        try {
            // Create a temporary element with the report content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = report;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);

            // Use html2canvas and jsPDF to generate PDF
            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');
            
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Clean up
            document.body.removeChild(tempDiv);
            
            // Download the PDF
            const fileName = `lecturer-attendance-report-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            toast({
                title: "PDF Exported",
                description: "The report has been exported as a PDF file.",
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "Failed to export the report as PDF. Please try again.",
            });
        }
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            courseId: "all",
            studentId: "all",
            dateRange: { from: undefined, to: undefined },
        },
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        setReport(null);
        
        const filters = {
            courseId: data.courseId === 'all' ? undefined : data.courseId,
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
                                            <SelectItem value="all">All My Courses</SelectItem>
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
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline">AI-Generated Summary</CardTitle>
                                <CardDescription>A comprehensive analysis of the filtered attendance data.</CardDescription>
                            </div>
                            {report && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrint}
                                        className="flex items-center gap-2"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportPDF}
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export PDF
                                    </Button>
                                </div>
                            )}
                        </div>
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
            </div>
        </div>
    );
}
