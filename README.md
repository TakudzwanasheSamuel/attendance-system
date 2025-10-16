# Smart Student Monitoring System

A modern, full-stack attendance tracking system built with Next.js and TypeScript. Features mobile QR code scanning, geofencing, VPN detection, AI-powered analytics, and automated parent notifications for educational institutions.

## Core Features

### 1. Role-Based Access Control
The system has three distinct user roles, ensuring users only see what's relevant to them:
- **👨‍🎓 Student**: Mark attendance via QR codes, view attendance history
- **👨‍🏫 Lecturer**: Create sessions, manage courses, generate reports
- **👨‍💼 Administrator**: Full system control, user/course management, analytics

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

## 🚀 Key Features

- **📱 Mobile QR Code Access** - Students scan QR codes with their phones (no app required)
- **🔒 VPN Detection** - Blocks attendance through VPNs/proxies to prevent spoofing
- **📍 Geofencing** - GPS-based location verification for physical presence
- **🤖 AI Reports** - Intelligent attendance analytics with Google Gemini
- **⚡ Real-time Updates** - Live attendance tracking during sessions
- **👥 Role-Based Access** - Separate dashboards for Students, Lecturers, and Admins

**Quick Setup:** See [QUICK-START.md](./QUICK-START.md) for mobile access and VPN detection setup.

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

<<<<<<< HEAD
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

 
=======
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

### Quick Start
- **[Quick Start Guide](./QUICK-START.md)** - 5-minute setup for mobile access and VPN detection

### Setup & Configuration
- **[Setup Instructions](./docs/SETUP-INSTRUCTIONS.md)** - Complete installation guide
- **[Mobile Access](./docs/MOBILE-ACCESS.md)** - Detailed mobile configuration
- **[VPN Detection](./docs/VPN-DETECTION.md)** - VPN/proxy detection setup

### Technical Reference
- **[Database Structure](./docs/database-structure.md)** - Schema and relationships
- **[Backend Structure](./docs/backend-structure.md)** - Architecture overview
- **[Geofencing](./IMPLEMENTATION-SUMMARY.md)** - Location verification details
- **[Database SQL](./docs/database.sql)** - SQL schema for manual setup

## ✨ Additional Features

- **🌓 Dark/Light Mode** - Theme toggle with system preference support
- **📱 PWA Support** - Install as app on mobile home screen
- **🔄 Real-time Sync** - Live updates across all connected devices
- **📊 Analytics Dashboard** - Comprehensive attendance statistics
- **🔐 Secure Authentication** - JWT-based with bcrypt password hashing
- **🎨 Modern UI** - Clean, intuitive interface with ShadCN components

## 📝 License

This project is licensed under the MIT License.
>>>>>>> f80bbbd0ad13078efe88517bd4970807d87b172a
