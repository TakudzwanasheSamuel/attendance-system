"use server";

import { generateAttendanceReportFlow, type GenerateReportInput } from "@/ai/flows/generate-attendance-report";
import { attendanceRecords, attendanceSessions, courses, lecturers, students } from "@/lib/mock-data";

type DateRange = {
    from?: Date;
    to?: Date;
};

interface ReportFilters {
    courseId?: string;
    lecturerId?: string;
    studentId?: string;
    dateRange?: DateRange;
}

function filterData(filters: ReportFilters) {
    let filteredSessions = [...attendanceSessions];
    let filteredRecords = [...attendanceRecords];

    // Date range filter
    if (filters.dateRange?.from) {
        filteredSessions = filteredSessions.filter(s => s.createdAt >= filters.dateRange!.from!);
    }
    if (filters.dateRange?.to) {
        // Add 1 day to the 'to' date to include the whole day
        const toDate = new Date(filters.dateRange.to);
        toDate.setDate(toDate.getDate() + 1);
        filteredSessions = filteredSessions.filter(s => s.createdAt < toDate);
    }
    
    // Lecturer filter
    if (filters.lecturerId) {
        const lecturerCourses = courses.filter(c => c.lecturerId === filters.lecturerId).map(c => c.id);
        filteredSessions = filteredSessions.filter(s => lecturerCourses.includes(s.courseId));
    }
    
    // Course filter
    if (filters.courseId) {
        filteredSessions = filteredSessions.filter(s => s.courseId === filters.courseId);
    }

    const sessionIds = filteredSessions.map(s => s.id);
    filteredRecords = filteredRecords.filter(r => sessionIds.includes(r.sessionId));

    // Student filter
    if (filters.studentId) {
        filteredRecords = filteredRecords.filter(r => r.studentId === filters.studentId);
    }
    
    return { filteredSessions, filteredRecords };
}

export async function generateAttendanceReport(filters: ReportFilters) {
    try {
        const { filteredSessions, filteredRecords } = filterData(filters);

        // Re-shape data for the AI prompt
        const dataForAI = {
            filters,
            students,
            lecturers,
            courses,
            sessions: filteredSessions.map(s => ({...s, createdAt: s.createdAt.toISOString(), expiresAt: s.expiresAt.toISOString()})),
            records: filteredRecords.map(r => ({...r, timestamp: r.timestamp.toISOString()})),
        };

        const input: GenerateReportInput = {
            jsonData: JSON.stringify(dataForAI, null, 2),
        };
        
        const result = await generateAttendanceReportFlow(input);

        return { success: true, report: result.reportHtml };
    } catch (error) {
        console.error("Error generating attendance report:", error);
        return { success: false, error: "Failed to communicate with the AI service." };
    }
}
