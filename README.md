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

### 4. Full-Featured Management Portals
- **User Management (Admin)**: Admins can create, view, search, edit, and delete all users in the system.
- **Course Management (Admin)**: Admins have full control over the course catalog, including creating courses, assigning lecturers, and managing student enrollments.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Google's Genkit](https://firebase.google.com/docs/genkit)
- **Database (Proposed)**: [Google Cloud Firestore](https://firebase.google.com/docs/firestore)

## Getting Started

To run the application locally, follow these steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   This will start the Next.js application, typically on `http://localhost:9002`.

### Demo Login Credentials

You can use the following email addresses on the login page to explore the different roles. Any password will be accepted.

- Student: student@msu.com
Lecturer: lecturer@msu.com
Admin: admin@msu.com

 password: student123, lecturer123, or admin123

 