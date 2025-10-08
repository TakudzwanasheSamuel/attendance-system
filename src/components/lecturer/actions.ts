
"use server";

import { generateAttendanceReportFlow, type GenerateReportInput } from "@/ai/flows/generate-attendance-report";
import { prisma } from "@/lib/prisma";

// Fallback report generator when AI is unavailable
function generateFallbackReport(data: any): string {
    const { courses, students, sessions, records } = data;
    
    const totalStudents = students.length;
    const totalSessions = sessions.length;
    const totalRecords = records.length;
    
    // Calculate basic statistics
    const attendanceRate = totalSessions > 0 ? ((totalRecords / (totalStudents * totalSessions)) * 100).toFixed(1) : '0';
    
    // Group records by course
    const recordsByCourse = records.reduce((acc: any, record: any) => {
        if (!acc[record.courseName]) {
            acc[record.courseName] = [];
        }
        acc[record.courseName].push(record);
        return acc;
    }, {});
    
    let reportHtml = `
        <div class="attendance-report">
            <h1>📊 Lecturer Attendance Report</h1>
            <div class="alert alert-info">
                <p><strong>Note:</strong> This is a basic report generated without AI analysis. For detailed insights, please ensure your Google AI API key is properly configured.</p>
            </div>
            
            <h2>📈 Summary Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${totalStudents}</h3>
                    <p>Total Students</p>
                </div>
                <div class="stat-card">
                    <h3>${totalSessions}</h3>
                    <p>Total Sessions</p>
                </div>
                <div class="stat-card">
                    <h3>${totalRecords}</h3>
                    <p>Attendance Records</p>
                </div>
                <div class="stat-card">
                    <h3>${attendanceRate}%</h3>
                    <p>Overall Attendance Rate</p>
                </div>
            </div>
            
            <h2>📚 Course Breakdown</h2>
    `;
    
    Object.entries(recordsByCourse).forEach(([courseName, courseRecords]: [string, any]) => {
        const courseStudents = students.filter((s: any) => 
            courseRecords.some((r: any) => r.studentId === s.id)
        ).length;
        const courseAttendanceRate = courseStudents > 0 ? 
            ((courseRecords.length / (courseStudents * sessions.filter((s: any) => s.courseName === courseName).length)) * 100).toFixed(1) : '0';
        
        reportHtml += `
            <div class="course-section">
                <h3>${courseName}</h3>
                <p><strong>Students:</strong> ${courseStudents} | <strong>Attendance Rate:</strong> ${courseAttendanceRate}%</p>
                <p><strong>Records:</strong> ${courseRecords.length}</p>
            </div>
        `;
    });
    
    reportHtml += `
            <h2>📅 Recent Activity</h2>
            <p>Last 5 attendance records:</p>
            <ul>
    `;
    
    records.slice(-5).forEach((record: any) => {
        const student = students.find((s: any) => s.id === record.studentId);
        const session = sessions.find((s: any) => s.id === record.sessionId);
        reportHtml += `
            <li>${student?.name || 'Unknown'} attended ${record.courseName} on ${new Date(record.timestamp).toLocaleDateString()}</li>
        `;
    });
    
    reportHtml += `
            </ul>
            
            <style>
                .attendance-report { max-width: 800px; margin: 0 auto; padding: 20px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
                .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
                .stat-card h3 { font-size: 2em; margin: 0; color: #2563eb; }
                .stat-card p { margin: 5px 0 0 0; color: #6b7280; }
                .course-section { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; }
                .alert { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .alert-info { background: #dbeafe; border-color: #3b82f6; }
            </style>
        </div>
    `;
    
    return reportHtml;
}

type DateRange = {
    from?: Date;
    to?: Date;
};

interface ReportFilters {
    courseId?: string;
    studentId?: string;
    dateRange?: DateRange;
}

// TODO: In a real app, this would come from the user's session/authentication
// For now, we'll use a placeholder - this should be replaced with actual user context
// This should be updated to get the lecturer ID from the authentication context
const MOCK_LECTURER_ID = 'lecturer-1'; // This should be replaced with actual lecturer ID from session

async function filterData(filters: ReportFilters, lecturerId: string) {
    console.log('🔍 Lecturer filtering data with filters:', filters, 'for lecturer:', lecturerId);
    
    const whereClause: any = {
        course: {
            lecturerId: lecturerId // Security: Only sessions for courses taught by this lecturer
        }
    };

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
        whereClause.createdAt = {};
        if (filters.dateRange?.from) {
            whereClause.createdAt.gte = filters.dateRange.from;
        }
        if (filters.dateRange?.to) {
            const toDate = new Date(filters.dateRange.to);
            toDate.setDate(toDate.getDate() + 1);
            whereClause.createdAt.lt = toDate;
        }
    }
    
    // Course filter (already scoped to lecturer)
    if (filters.courseId) {
        whereClause.courseId = filters.courseId;
    }

    console.log('📊 Querying lecturer sessions with where clause:', whereClause);

    const sessions = await prisma.attendancesession.findMany({
        where: whereClause,
        include: {
            course: {
                include: {
                    user: true // lecturer info
                }
            },
            attendancerecord: {
                include: {
                    user: true // student info
                }
            }
        }
    });

    console.log(`📈 Found ${sessions.length} sessions for lecturer`);

    let filteredRecords = sessions.flatMap(s => s.attendancerecord);

    // Student filter
    if (filters.studentId) {
        filteredRecords = filteredRecords.filter(r => r.studentId === filters.studentId);
    }
    
    console.log(`📋 Found ${filteredRecords.length} attendance records for lecturer`);
    
    return { filteredSessions: sessions, filteredRecords };
}

export async function generateAttendanceReport(filters: ReportFilters) {
    try {
        console.log('🚀 Lecturer generating attendance report with filters:', filters);
        
        const { filteredSessions, filteredRecords } = await filterData(filters, MOCK_LECTURER_ID);

        // Get lecturer's courses and enrolled students
        const lecturerCourses = await prisma.course.findMany({
            where: { lecturerId: MOCK_LECTURER_ID },
            include: {
                user: true, // lecturer info
                courseenrollment: {
                    include: {
                        user: true // student info
                    }
                }
            }
        });

        const lecturer = await prisma.user.findUnique({
            where: { id: MOCK_LECTURER_ID }
        });

        const enrolledStudents = lecturerCourses.flatMap(c => c.courseenrollment.map(e => e.user));

        console.log(`📊 Lecturer stats: ${lecturerCourses.length} courses, ${enrolledStudents.length} enrolled students`);

        // Re-shape data for the AI prompt (optimized for token usage)
        const dataForAI = {
            filters,
            summary: {
                totalStudents: enrolledStudents.length,
                totalCourses: lecturerCourses.length,
                totalSessions: filteredSessions.length,
                totalRecords: filteredRecords.length
            },
            // Only include essential data to reduce token usage
            students: enrolledStudents.slice(0, 20).map(s => ({
                name: s.name,
                email: s.email
            })),
            lecturers: lecturer ? [{
                name: lecturer.name,
                email: lecturer.email
            }] : [],
            courses: lecturerCourses.slice(0, 10).map(c => ({
                name: c.name,
                code: c.code
            })),
            sessions: filteredSessions.slice(0, 30).map(s => ({
                code: s.code,
                createdAt: s.createdAt.toISOString(),
                courseName: s.course.name
            })),
            records: filteredRecords.slice(0, 50).map(r => {
                // Find the session to get the course name
                const session = filteredSessions.find(s => s.id === r.sessionId);
                return {
                    timestamp: r.timestamp.toISOString(),
                    status: r.status,
                    studentName: r.user.name,
                    courseName: session?.course.name || 'Unknown Course'
                };
            }),
        };

        console.log('🤖 Sending lecturer data to AI for report generation...');
        const input: GenerateReportInput = {
            jsonData: JSON.stringify(dataForAI, null, 2),
        };
        
        try {
            const result = await generateAttendanceReportFlow(input);
            console.log('✅ Lecturer report generated successfully');
            return { success: true, report: result.reportHtml };
        } catch (aiError: any) {
            console.log('⚠️ AI service unavailable, generating fallback report...');
            
            // Generate a fallback report without AI
            const fallbackReport = generateFallbackReport(dataForAI);
            return { success: true, report: fallbackReport };
        }
    } catch (error) {
        console.error("💥 Error generating lecturer attendance report:", error);
        return { success: false, error: "Failed to communicate with the AI service." };
    }
}
