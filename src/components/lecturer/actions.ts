
"use server";

import { generateAttendanceReportFlow, type GenerateReportInput } from "@/ai/flows/generate-attendance-report";
import { prisma } from "@/lib/prisma";

// Enhanced report generator with comprehensive analytics
function generateFallbackReport(data: any): string {
    const { courses, students, sessions, records, summary } = data;
    
    const totalStudents = summary?.totalStudents || students.length;
    const totalSessions = summary?.totalSessions || sessions.length;
    const totalRecords = summary?.totalRecords || records.length;
    
    // Calculate comprehensive statistics
    const overallAttendanceRate = totalSessions > 0 && totalStudents > 0 
        ? ((totalRecords / (totalStudents * totalSessions)) * 100).toFixed(1) 
        : '0';
    
    // Group records by course and calculate detailed stats
    const recordsByCourse = records.reduce((acc: any, record: any) => {
        if (!acc[record.courseName]) {
            acc[record.courseName] = [];
        }
        acc[record.courseName].push(record);
        return acc;
    }, {});
    
    // Calculate student attendance rates
    const studentAttendance: any = {};
    records.forEach((record: any) => {
        const studentName = record.studentName || 'Unknown';
        if (!studentAttendance[studentName]) {
            studentAttendance[studentName] = { attended: 0, total: totalSessions };
        }
        studentAttendance[studentName].attended++;
    });
    
    // Sort students by attendance
    const sortedStudents = Object.entries(studentAttendance)
        .map(([name, data]: [string, any]) => ({
            name,
            rate: ((data.attended / data.total) * 100).toFixed(1),
            attended: data.attended,
            total: data.total
        }))
        .sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));
    
    const topPerformers = sortedStudents.slice(0, 5);
    const lowPerformers = sortedStudents.slice(-5).reverse();
    
    // Calculate course statistics
    const courseStats = Object.entries(recordsByCourse).map(([courseName, courseRecords]: [string, any]) => {
        const courseSessions = sessions.filter((s: any) => s.courseName === courseName).length;
        const uniqueStudents = new Set(courseRecords.map((r: any) => r.studentName)).size;
        const expectedRecords = courseSessions * uniqueStudents;
        const rate = expectedRecords > 0 ? ((courseRecords.length / expectedRecords) * 100).toFixed(1) : '0';
        
        return {
            name: courseName,
            rate: parseFloat(rate),
            sessions: courseSessions,
            records: courseRecords.length,
            students: uniqueStudents
        };
    }).sort((a, b) => b.rate - a.rate);
    
    let reportHtml = `
        <div class="attendance-report">
            <h1 class="report-title">📊 Comprehensive Attendance Analysis Report</h1>
            
            <div class="executive-summary">
                <h2>📋 Executive Summary</h2>
                <p>This report provides a detailed analysis of attendance patterns across ${totalSessions} sessions involving ${totalStudents} students, with a total of ${totalRecords} attendance records captured.</p>
                <p><strong>Overall Attendance Rate:</strong> ${overallAttendanceRate}% - ${parseFloat(overallAttendanceRate) >= 75 ? 'Good attendance levels maintained' : 'Attendance requires attention and improvement strategies'}.</p>
            </div>
            
            <h2>📈 Key Metrics</h2>
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
                <div class="stat-card ${parseFloat(overallAttendanceRate) >= 75 ? 'stat-good' : 'stat-warning'}">
                    <h3>${overallAttendanceRate}%</h3>
                    <p>Overall Attendance Rate</p>
                </div>
            </div>
            
            <h2>📊 Course Performance Analysis</h2>
            <div class="chart-container">
                <h3>Attendance Rate by Course</h3>
                <div class="bar-chart">
    `;
    
    // Generate bar chart for courses
    courseStats.forEach((course: any) => {
        const barColor = course.rate >= 75 ? '#10b981' : course.rate >= 50 ? '#f59e0b' : '#ef4444';
        reportHtml += `
            <div class="bar-item">
                <div class="bar-label">${course.name}</div>
                <div class="bar-wrapper">
                    <div class="bar-fill" style="width: ${course.rate}%; background-color: ${barColor};">
                        <span class="bar-value">${course.rate}%</span>
                    </div>
                </div>
                <div class="bar-details">${course.records} records / ${course.sessions} sessions</div>
            </div>
        `;
    });
    
    reportHtml += `
                </div>
            </div>
            
            <h2>🎯 Student Performance Analysis</h2>
            <div class="chart-container">
                <h3>Top 5 Students by Attendance</h3>
                <div class="bar-chart">
    `;
    
    // Generate bar chart for top performers
    topPerformers.forEach((student: any) => {
        reportHtml += `
            <div class="bar-item">
                <div class="bar-label">${student.name}</div>
                <div class="bar-wrapper">
                    <div class="bar-fill" style="width: ${student.rate}%; background-color: #10b981;">
                        <span class="bar-value">${student.rate}%</span>
                    </div>
                </div>
                <div class="bar-details">${student.attended}/${student.total} sessions</div>
            </div>
        `;
    });
    
    reportHtml += `
                </div>
            </div>
            
            <h2>💡 Key Insights</h2>
            <div class="insights-section">
                <ul class="insights-list">
    `;
    
    // Generate insights
    if (parseFloat(overallAttendanceRate) >= 80) {
        reportHtml += `<li><strong>✅ Excellent Overall Performance:</strong> The overall attendance rate of ${overallAttendanceRate}% indicates strong student engagement across the board.</li>`;
    } else if (parseFloat(overallAttendanceRate) >= 60) {
        reportHtml += `<li><strong>⚠️ Moderate Performance:</strong> The overall attendance rate of ${overallAttendanceRate}% suggests room for improvement in student engagement.</li>`;
    } else {
        reportHtml += `<li><strong>🚨 Critical Attention Needed:</strong> The overall attendance rate of ${overallAttendanceRate}% is below acceptable standards and requires immediate intervention.</li>`;
    }
    
    if (courseStats.length > 0) {
        const bestCourse = courseStats[0];
        const worstCourse = courseStats[courseStats.length - 1];
        reportHtml += `<li><strong>📚 Best Performing Course:</strong> ${bestCourse.name} leads with ${bestCourse.rate}% attendance rate.</li>`;
        if (worstCourse.rate < 60) {
            reportHtml += `<li><strong>📉 Course Requiring Attention:</strong> ${worstCourse.name} has a ${worstCourse.rate}% attendance rate and may benefit from engagement strategies.</li>`;
        }
    }
    
    if (topPerformers.length > 0) {
        reportHtml += `<li><strong>🌟 High Achievers:</strong> ${topPerformers.length} students maintain excellent attendance records above 80%.</li>`;
    }
    
    if (lowPerformers.length > 0 && parseFloat(lowPerformers[0].rate) < 50) {
        reportHtml += `<li><strong>🔔 Students Needing Support:</strong> Several students show attendance rates below 50%, indicating potential academic or personal challenges.</li>`;
    }
    
    reportHtml += `
                </ul>
            </div>
            
            <h2>🎓 Recommendations</h2>
            <div class="recommendations-section">
                <ul class="recommendations-list">
    `;
    
    // Generate recommendations
    if (parseFloat(overallAttendanceRate) < 75) {
        reportHtml += `<li><strong>Implement Attendance Incentives:</strong> Consider introducing rewards or recognition programs for consistent attendance to boost overall participation.</li>`;
        reportHtml += `<li><strong>Early Warning System:</strong> Establish automated alerts for students falling below 60% attendance to enable timely intervention.</li>`;
    }
    
    if (courseStats.some((c: any) => c.rate < 60)) {
        reportHtml += `<li><strong>Course-Specific Interventions:</strong> Review teaching methods and scheduling for courses with low attendance rates. Consider student feedback sessions.</li>`;
    }
    
    reportHtml += `<li><strong>One-on-One Check-ins:</strong> Schedule individual meetings with students showing declining attendance patterns to understand and address underlying issues.</li>`;
    reportHtml += `<li><strong>Flexible Learning Options:</strong> Explore hybrid or recorded session options for students who may face legitimate barriers to physical attendance.</li>`;
    reportHtml += `<li><strong>Regular Monitoring:</strong> Continue tracking attendance trends weekly to identify patterns early and adjust strategies accordingly.</li>`;
    
    reportHtml += `
                </ul>
            </div>
            
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
                .attendance-report { 
                    max-width: 1000px; 
                    margin: 0 auto; 
                    padding: 30px; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                }
                .report-title {
                    color: #1e40af;
                    border-bottom: 3px solid #3b82f6;
                    padding-bottom: 10px;
                    margin-bottom: 30px;
                }
                .executive-summary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .executive-summary h2 {
                    margin-top: 0;
                    color: white;
                }
                .stats-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
                    gap: 20px; 
                    margin: 25px 0; 
                }
                .stat-card { 
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 25px; 
                    border-radius: 12px; 
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                }
                .stat-card h3 { 
                    font-size: 2.5em; 
                    margin: 0; 
                    color: #1e40af;
                    font-weight: bold;
                }
                .stat-card p { 
                    margin: 10px 0 0 0; 
                    color: #4b5563;
                    font-weight: 500;
                }
                .stat-good h3 { color: #059669; }
                .stat-warning h3 { color: #d97706; }
                
                .chart-container {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    margin: 25px 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .chart-container h3 {
                    color: #374151;
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-size: 1.2em;
                }
                .bar-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .bar-item {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .bar-label {
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.95em;
                }
                .bar-wrapper {
                    background: #e5e7eb;
                    border-radius: 8px;
                    height: 35px;
                    position: relative;
                    overflow: hidden;
                }
                .bar-fill {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-right: 10px;
                    border-radius: 8px;
                    transition: width 0.3s ease;
                    min-width: 50px;
                }
                .bar-value {
                    color: white;
                    font-weight: bold;
                    font-size: 0.9em;
                }
                .bar-details {
                    font-size: 0.85em;
                    color: #6b7280;
                }
                
                .insights-section, .recommendations-section {
                    background: #f9fafb;
                    padding: 25px;
                    border-radius: 12px;
                    margin: 25px 0;
                    border-left: 4px solid #3b82f6;
                }
                .insights-list, .recommendations-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .insights-list li, .recommendations-list li {
                    padding: 12px 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                .insights-list li:last-child, .recommendations-list li:last-child {
                    border-bottom: none;
                }
                
                h2 {
                    color: #1f2937;
                    margin-top: 40px;
                    margin-bottom: 20px;
                    font-size: 1.5em;
                }
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
