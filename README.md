# Smart Student Monitoring System

A modern, full-stack attendance tracking system built with Next.js and TypeScript. Features mobile QR code scanning, geofencing, VPN detection, and AI-powered analytics for educational institutions.

### User Roles

- **👨‍🎓 Student** - Mark attendance via QR codes, view attendance history
- **👨‍🏫 Lecturer** - Create sessions, manage courses, generate reports
- **👨‍💼 Administrator** - Full system control, user/course management, analytics

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Google's Genkit](https://firebase.google.com/docs/genkit)
- **Database**: [MySQL](https://www.mysql.com/) with [Prisma ORM](https://www.prisma.io/)

## 🚀 Key Features

- **📱 Mobile QR Code Access** - Students scan QR codes with their phones (no app required)
- **🔒 VPN Detection** - Blocks attendance through VPNs/proxies to prevent spoofing
- **📍 Geofencing** - GPS-based location verification (students must be within 50 meters)
- **⏱️ Flexible Session Timing** - Lecturers set start delays (0-60 min) and duration (1-180 min)
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
- **[Database SQL](./docs/database.sql)** - SQL schema for manual setup

## ✨ Additional Features

- **🌓 Dark/Light Mode** - Theme toggle with system preference support
- **📱 PWA Support** - Install as app on mobile home screen
- **🔄 Real-time Sync** - Live updates across all connected devices
- **📊 Analytics Dashboard** - Comprehensive attendance statistics
- **🔐 Secure Authentication** - JWT-based with bcrypt password hashing
- **🎨 Modern UI** - Clean, intuitive interface with ShadCN components
- **⏰ Session Scheduling** - Configure when students can start recording attendance
- **📏 Precise Geofencing** - 50-meter radius for accurate location verification

## 📝 License

This project is licensed under the MIT License.