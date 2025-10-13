# Smart Student Monitoring System

A comprehensive, production-ready attendance tracking system built with Next.js 15 and TypeScript. Designed for educational institutions, it combines mobile QR code scanning, precise geofencing (50m radius), VPN detection, and AI-powered analytics to ensure accurate and secure attendance management.

## 👥 User Roles

- **👨‍🎓 Student** - Scan QR codes to mark attendance, view personal attendance history and statistics
- **👨‍🏫 Lecturer** - Create timed sessions, monitor live attendance, generate AI-powered reports
- **👨‍💼 Administrator** - Manage users and courses, view system-wide analytics, configure settings

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Google's Genkit](https://firebase.google.com/docs/genkit)
- **Database**: [MySQL](https://www.mysql.com/) with [Prisma ORM](https://www.prisma.io/)

## 🚀 Key Features

### Security & Verification
- **📍 Strict Geofencing** - Enforces 50-meter radius requirement; students outside this range are blocked from recording attendance
- **🔒 VPN/Proxy Detection** - Multi-layer detection system blocks attendance through VPNs to prevent location spoofing
- **🔐 Secure Authentication** - JWT-based authentication with bcrypt password hashing

### Session Management
- **⏱️ Flexible Timing** - Configure session start delays (0-60 min) and duration (1-180 min)
- **📱 Mobile QR Codes** - Students scan QR codes with phone cameras (no app installation required)
- **⚡ Real-time Tracking** - Live attendance monitoring with instant updates

### Intelligence & Analytics
- **🤖 AI-Powered Reports** - Google Gemini generates intelligent attendance insights and recommendations
- **📊 Comprehensive Analytics** - Track attendance patterns, trends, and statistics
- **👥 Role-Based Dashboards** - Customized interfaces for Students, Lecturers, and Administrators

**⚡ Quick Setup:** See [QUICK-START.md](./QUICK-START.md) for 5-minute mobile access configuration.

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

### 🔑 Demo Login Credentials

After seeding the database, use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@msu.com` | `password123` |
| **Student** | `tinashe.mazvihwa.40@msu.com` | `password123` |
| **Lecturer** | Any lecturer from database | `password123` |

**Find all accounts:**
```bash
mysql -u root -p
USE smart_student_monitoring;
SELECT email, name, role FROM users LIMIT 10;
```

**Troubleshooting:** If login fails, reseed the database:
```bash
npm run seed
```

## 📖 Documentation

### 🚀 Getting Started
- **[Quick Start Guide](./QUICK-START.md)** - 5-minute mobile access setup
- **[Setup Instructions](./docs/SETUP-INSTRUCTIONS.md)** - Complete installation guide
- **[Features Overview](./FEATURES.md)** - Detailed feature documentation

### 🔧 Configuration
- **[Mobile Access](./docs/MOBILE-ACCESS.md)** - WiFi, hotspot, and mobile data setup
- **[VPN Detection](./docs/VPN-DETECTION.md)** - Configure VPN/proxy blocking

### 📚 Technical Reference
- **[Database Structure](./docs/database-structure.md)** - Complete schema documentation
- **[Database SQL](./docs/database.sql)** - Manual database setup

## ✨ Additional Features

### User Experience
- **🌓 Dark/Light Mode** - Automatic theme switching with system preference detection
- **📱 PWA Support** - Install as native app on mobile devices
- **🎨 Modern UI** - Clean, intuitive interface built with ShadCN UI components
- **♿ Accessibility** - WCAG compliant with keyboard navigation support

### Technical Excellence
- **🔄 Real-time Sync** - WebSocket-based live updates across all devices
- **⚡ Performance** - Server-side rendering with optimized bundle sizes
- **🛡️ Security** - OWASP best practices, SQL injection prevention
- **📈 Scalability** - Efficient database queries with proper indexing

### Deployment Options
- **☁️ Cloud Ready** - Deploy to Vercel, Railway, or Render
- **🌐 Network Flexible** - Works with WiFi, hotspot, or mobile data (when deployed)
- **🔧 Configurable** - Environment-based configuration for all environments

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for educational institutions**