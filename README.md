# Smart Student Monitoring System

This is a full-stack Next.js application designed to streamline and modernize classroom attendance tracking. It provides dedicated portals for Students, Lecturers, and Administrators, each with features tailored to their roles. The system leverages AI to provide insightful reports and simplify complex validation tasks.

## Core Features

### 1. Role-Based Access Control
The system has three distinct user roles, ensuring users only see what's relevant to them:
- **Student**: Can mark attendance and view their own history.
- **Lecturer**: Manages courses, creates attendance sessions, and views reports for their students.
- **Administrator**: Has a system-wide view with full control over users, courses, and reporting.

### 2. AI-Powered Reporting & Validation
- **Comprehensive Reports**: Both Lecturers and Administrators can generate detailed attendance reports using AI. The system analyzes filtered data to produce summaries, identify trends, and offer actionable insights.
- **Smart Validation**: Student attendance submissions are validated by an AI flow that checks for active session codes and course enrollment simultaneously.

### 3. Real-time Attendance Tracking
- **Session Codes & QR Codes**: Lecturers can generate unique, time-sensitive codes for each class session.
- **Live Updates**: When a session is active, lecturers can see students check in, in real-time.
- **Countdown Timers**: Real-time session countdown with current date/time display.
- **Geofencing**: Location-based attendance validation to ensure students are physically present.

### 4. Email Notification System
- **Parent Notifications**: Automated emails to parents/guardians about student attendance.
- **Smart Alerts**: Sends positive updates for good attendance (≥50%) and alerts for low attendance (<50%).
- **Professional Templates**: HTML and plain text email templates with course-wise breakdown.
- **Manual Controls**: Admin interface for sending individual or bulk notifications.

### 5. Geofencing & Location Validation
- **Virtual Boundaries**: Create geofences around specific venues with configurable radius.
- **GPS Validation**: Uses HTML5 Geolocation API to verify student location.
- **Coordinate Helper**: Built-in tools for getting accurate coordinates.
- **Fallback Options**: Manual override for technical issues or special circumstances.

### 6. Full-Featured Management Portals
- **User Management (Admin)**: Admins can create, view, search, edit, and delete all users in the system.
- **Course Management (Admin)**: Admins have full control over the course catalog, including creating courses, assigning lecturers, and managing student enrollments.
- **Geofence Management (Admin)**: Create and manage location boundaries for attendance validation.
- **Parent Email Management (Admin)**: Manage parent contact information and send attendance notifications.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Google's Genkit](https://firebase.google.com/docs/genkit)
- **Database**: [MySQL](https://www.mysql.com/) with [Prisma ORM](https://www.prisma.io/)
- **Email Service**: [Nodemailer](https://nodemailer.com/) with SMTP support
- **Scheduling**: [node-cron](https://www.npmjs.com/package/node-cron) for automated tasks
- **Geolocation**: HTML5 Geolocation API with Haversine formula for distance calculation

## Getting Started

📋 **For detailed setup instructions, please see [SETUP-INSTRUCTIONS.md](./SETUP-INSTRUCTIONS.md)**

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TakudzwanasheSamuel/attendance-system.git
   cd attendance-system
   ```

2. **Install dependencies** (⚠️ Use legacy peer deps flag):
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database and seed data**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:9002`.

### Demo Login Credentials

After seeding the database, you can log in with these accounts:

- **Admin**: `admin@msu.com` / `password123`
- **Lecturer**: `kudzai.moyo@msu.com` / `password123` (or any lecturer from seeded data)
- **Student**: `tendekai.moyo.82@msu.com` / `password123` (or any student from seeded data)

## Key Features

### 🎯 **Smart Attendance Tracking**
- **QR Code System**: Quick and secure attendance marking
- **Real-time Validation**: Instant verification of session codes and enrollment
- **Location Verification**: Geofencing ensures students are physically present
- **Session Management**: Time-limited attendance windows with countdown timers

### 📧 **Parent Communication**
- **Automated Notifications**: Smart emails for both good and poor attendance
- **Professional Templates**: Beautiful HTML emails with course breakdowns
- **Manual Controls**: Admin can send individual or bulk notifications
- **Multi-language Support**: Ready for localization

### 🗺️ **Geofencing System**
- **Virtual Boundaries**: Create location-based attendance zones
- **GPS Integration**: Uses device location for validation
- **Flexible Configuration**: Adjustable radius and multiple venues
- **Fallback Options**: Manual override for technical issues

### 🤖 **AI-Powered Insights**
- **Smart Reports**: AI-generated attendance analysis and trends
- **Predictive Analytics**: Identify at-risk students early
- **Automated Summaries**: Comprehensive reports for administrators
- **Actionable Insights**: Recommendations for improving attendance

### 👥 **Role-Based Access**
- **Student Portal**: Mark attendance, view personal history
- **Lecturer Dashboard**: Manage courses, create sessions, view reports
- **Admin Control**: Full system management and oversight
- **Secure Authentication**: JWT-based security with role validation

## Documentation

- **[Setup Instructions](./SETUP-INSTRUCTIONS.md)**: Complete installation and configuration guide
- **[Email Setup](./EMAIL-SETUP.md)**: Email notification system configuration
- **[Geofencing Guide](./GEOFENCING-IMPLEMENTATION.md)**: Location validation setup and usage

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

For support, email support@msu.com or create an issue in the GitHub repository.

---

**Built with ❤️ for Midlands State University**

 