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
- **Database**: [MySQL](https://www.mysql.com/) with [Prisma ORM](https://www.prisma.io/)

## Getting Started

📋 **For detailed setup instructions, please see [SETUP-INSTRUCTIONS.md](./docs/SETUP-INSTRUCTIONS.md)**

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
- **Student**: `tinashe.mazvihwa.40@msu.com` / `password123` (or any student from database)
- **Lecturer**: Any lecturer email from database (format: `firstname.lastname.##@msu.com`)

**To find more accounts:**
```bash
# Check MySQL database
mysql -u root -p
USE smart_student_monitoring;
SELECT email, name, role FROM users LIMIT 10;
```

All seeded accounts use password: `password123`

**Note:** If login fails, reseed the database:
```bash
npm run seed
```

## 📖 Documentation

All project documentation is organized in the [`docs/`](./docs) folder:

- **[Setup Instructions](./docs/SETUP-INSTRUCTIONS.md)** - Complete setup guide
- **[Database Structure](./docs/database-structure.md)** - Database schema and relationships
- **[Backend Structure](./docs/backend-structure.md)** - Backend architecture
- **[Database SQL](./docs/database.sql)** - SQL schema for manual setup
- **[Geo-Fencing Implementation](./IMPLEMENTATION-SUMMARY.md)** - Location-based attendance tracking

## ✨ Features

- **Dark/Light Mode** - Toggle between themes with system preference support
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates** - Live attendance tracking during sessions
- **AI-Powered Reports** - Intelligent insights and analytics
- **QR Code Support** - Quick attendance marking via QR codes
- **Geo-Fencing** - Location-based attendance verification
- **Role-Based Dashboards** - Customized views for each user type

## 📝 License

This project is licensed under the MIT License.