# Smart Student Monitoring System

A production-ready attendance tracking system built with Next.js 15 and TypeScript. Features mobile QR code scanning, 50m geofencing, VPN detection, and AI-powered analytics for educational institutions.

## 🚀 Key Features

- **📱 Mobile QR Scanning** - No app required, works in any browser
- **📍 Strict Geofencing** - 50m radius enforcement with GPS verification
- **🔒 VPN Detection** - Multi-layer fraud prevention
- **🤖 AI Analytics** - Google Gemini powered insights
- **👥 Role-Based Access** - Student, Lecturer, and Admin portals

## Tech Stack

Next.js 15 • TypeScript • Tailwind CSS • ShadCN UI • MySQL • Prisma • Google Genkit

## Quick Start

**⚡ 5-minute setup:** See [QUICK-START.md](./QUICK-START.md) for mobile access configuration.

## Installation

```bash
# Clone and install
git clone https://github.com/TakudzwanasheSamuel/attendance-system.git
cd attendance-system
npm install --legacy-peer-deps

# Configure environment
cp env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma db push
npm run seed

# Start development server
npm run dev
```

Application runs at `http://localhost:9002`

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@msu.com` | `password123` |
| **Student** | `tinashe.mazvihwa.40@msu.com` | `password123` |
| **Lecturer** | Any lecturer from database | `password123` |

**Troubleshooting:** Run `npm run seed` if login fails.

## Documentation

- **[Quick Start](./QUICK-START.md)** - 5-minute mobile setup
- **[Features](./FEATURES.md)** - Complete feature list
- **[Setup Guide](./docs/SETUP-INSTRUCTIONS.md)** - Detailed installation
- **[Mobile Access](./docs/MOBILE-ACCESS.md)** - Network configuration
- **[VPN Detection](./docs/VPN-DETECTION.md)** - Security setup

## Features

**Security:** 50m geofencing • VPN detection • JWT auth • SQL injection protection  
**Mobile:** QR scanning • PWA support • Responsive design • Location services  
**Analytics:** AI reports • Real-time tracking • Export options • Visual charts  
**Deployment:** Vercel ready • Environment configs • Cloud scalable

## License

MIT License - see LICENSE file for details.

---

**Built for educational institutions** 🎓