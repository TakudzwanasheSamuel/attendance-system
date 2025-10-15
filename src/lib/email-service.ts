import * as nodemailer from 'nodemailer';

interface EmailConfig {
  service: string;
  user: string;
  password: string;
  from: string;
}

interface AttendanceData {
  studentName: string;
  studentId: string;
  courses: Array<{
    courseName: string;
    courseCode: string;
    attendancePercentage: number;
    presentCount: number;
    totalSessions: number;
  }>;
  overallAttendance: number;
  parentName?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || ''
    };

    this.transporter = nodemailer.createTransport({
      service: this.config.service,
      auth: {
        user: this.config.user,
        pass: this.config.password
      }
    });
  }

  /**
   * Send attendance alert email to parent/guardian
   */
  async sendAttendanceAlert(parentEmail: string, attendanceData: AttendanceData): Promise<boolean> {
    try {
      const isGoodAttendance = attendanceData.overallAttendance >= 50;
      const htmlContent = this.generateAttendanceEmailHTML(attendanceData, isGoodAttendance);
      const textContent = this.generateAttendanceEmailText(attendanceData, isGoodAttendance);

      const subject = isGoodAttendance 
        ? `MSU Attendance Update - ${attendanceData.studentName} (Good Attendance)`
        : `MSU Attendance Alert - ${attendanceData.studentName} (Low Attendance)`;

      const mailOptions = {
        from: this.config.from,
        to: parentEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Generate HTML email content
   */
  private generateAttendanceEmailHTML(data: AttendanceData, isGoodAttendance: boolean = false): string {
    const greeting = data.parentName ? `Dear ${data.parentName}` : 'Dear Parent/Guardian';
    const alertClass = isGoodAttendance ? 'alert-success' : 'alert-warning';
    const alertIcon = isGoodAttendance ? '🎉' : '⚠️';
    const alertTitle = isGoodAttendance ? 'Attendance Update' : 'Attendance Alert';
    const alertMessage = isGoodAttendance 
      ? `Great news! Your child <strong>${data.studentName}</strong> (Student ID: ${data.studentId}) is maintaining excellent attendance with <strong>${data.overallAttendance}%</strong> overall attendance.`
      : `This is to inform you that your child <strong>${data.studentName}</strong> (Student ID: ${data.studentId}) has an overall attendance rate of <strong>${data.overallAttendance}%</strong>.`;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MSU Attendance Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #5B71E8;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 0 0 8px 8px;
        }
        .alert-box {
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
        }
        .alert-success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .alert-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
        }
        .course-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .course-table th,
        .course-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .course-table th {
            background-color: #5B71E8;
            color: white;
        }
        .attendance-low {
            color: #dc3545;
            font-weight: bold;
        }
        .attendance-good {
            color: #28a745;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏛️ Midlands State University</h1>
        <h2>Student Monitoring System</h2>
    </div>
    
    <div class="content">
        <p>${greeting},</p>
        
        <div class="alert-box ${alertClass}">
            <h3>${alertIcon} ${alertTitle}</h3>
            <p>${alertMessage}</p>
        </div>
        
        <h3>📊 Course-wise Attendance Details:</h3>
        <table class="course-table">
            <thead>
                <tr>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Attendance</th>
                    <th>Sessions</th>
                </tr>
            </thead>
            <tbody>
                ${data.courses.map(course => `
                <tr>
                    <td>${course.courseName}</td>
                    <td>${course.courseCode}</td>
                    <td class="${course.attendancePercentage < 50 ? 'attendance-low' : 'attendance-good'}">
                        ${course.attendancePercentage}%
                    </td>
                    <td>${course.presentCount}/${course.totalSessions}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3>📝 Important Information:</h3>
        <ul>
            ${isGoodAttendance ? `
            <li>Excellent attendance contributes to academic success</li>
            <li>Your child is on track for good academic performance</li>
            <li>Continue encouraging regular attendance</li>
            <li>Contact the university if you have any questions</li>
            ` : `
            <li>Regular attendance is crucial for academic success</li>
            <li>Students with attendance below 50% may face academic consequences</li>
            <li>Please discuss this matter with your child</li>
            <li>Contact the university if you have any concerns</li>
            `}
        </ul>
        
        <div class="footer">
            <p><strong>Best regards,</strong><br>
            Midlands State University<br>
            Student Monitoring System<br>
            📧 Email: attendance@msu.ac.zw<br>
            📞 Phone: +263 54 226 0400</p>
            
            <p><em>This is an automated message. Please do not reply to this email.</em></p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email content
   */
  private generateAttendanceEmailText(data: AttendanceData, isGoodAttendance: boolean = false): string {
    const greeting = data.parentName ? `Dear ${data.parentName}` : 'Dear Parent/Guardian';
    const alertType = isGoodAttendance ? 'ATTENDANCE UPDATE' : 'ATTENDANCE ALERT';
    const alertMessage = isGoodAttendance 
      ? `Great news! Your child ${data.studentName} (Student ID: ${data.studentId}) is maintaining excellent attendance with ${data.overallAttendance}% overall attendance.`
      : `This is to inform you that your child ${data.studentName} (Student ID: ${data.studentId}) has an overall attendance rate of ${data.overallAttendance}%.`;
    
    return `
MIDLANDS STATE UNIVERSITY - ${alertType}

${greeting},

${alertMessage}

COURSE-WISE ATTENDANCE DETAILS:
${data.courses.map(course => 
  `- ${course.courseName} (${course.courseCode}): ${course.attendancePercentage}% (${course.presentCount}/${course.totalSessions} sessions)`
).join('\n')}

IMPORTANT INFORMATION:
${isGoodAttendance ? `
- Excellent attendance contributes to academic success
- Your child is on track for good academic performance
- Continue encouraging regular attendance
- Contact the university if you have any questions
` : `
- Regular attendance is crucial for academic success
- Students with attendance below 50% may face academic consequences
- Please discuss this matter with your child
- Contact the university if you have any concerns
`}

Best regards,
Midlands State University
Student Monitoring System
Email: attendance@msu.ac.zw
Phone: +263 54 226 0400

This is an automated message. Please do not reply to this email.
    `;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.config.from,
        to: to,
        subject: 'MSU Email Service Test',
        text: 'This is a test email from the MSU Student Monitoring System.',
        html: '<h2>MSU Email Service Test</h2><p>This is a test email from the MSU Student Monitoring System.</p>'
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
