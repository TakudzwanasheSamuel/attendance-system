
"use server";

import { generateAttendanceReportFlow, type GenerateReportInput } from "@/ai/flows/generate-attendance-report";
import { attendanceRecords, attendanceSessions, courses, lecturers, students } from "@/lib/mock-data";

type DateRange = {
    from?: Date;
    to?: Date;
};

interface ReportFilters {
    courseId?: string;
    studentId?: string;
    dateRange?: DateRange;
}

// In a real app, this would come from the user's session.
const MOCK_LECTURER_ID = 'lecturer-1';

function filterData(filters: ReportFilters) {
    let filteredSessions = [...attendanceSessions];
    let filteredRecords = [...attendanceRecords];

    // Security: Scope sessions to only those for courses taught by the current lecturer
    const lecturerCourses = courses.filter(c => c.lecturerId === MOCK_LECTURER_ID).map(c => c.id);
    filteredSessions = filteredSessions.filter(s => lecturerCourses.includes(s.courseId));

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
    
    // Course filter (already scoped to lecturer)
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

        // We also need to scope the full data lists for the AI context
        const lecturer = lecturers.find(l => l.id === MOCK_LECTURER_ID);
        const lecturerCourseIds = courses.filter(c => c.lecturerId === MOCK_LECTURER_ID).map(c => c.id);
        const lecturerStudentIds = new Set(courses.filter(c => c.lecturerId === MOCK_LECTURER_ID).flatMap(c => c.enrolledStudentIds));
        
        const relevantCourses = courses.filter(c => lecturerCourseIds.includes(c.id));
        const relevantStudents = students.filter(s => lecturerStudentIds.has(s.id));

        // Re-shape data for the AI prompt
        const dataForAI = {
            filters,
            students: relevantStudents,
            lecturers: lecturer ? [lecturer] : [],
            courses: relevantCourses,
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
