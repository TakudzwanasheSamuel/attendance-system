# Project Structure

## 📁 Directory Overview

```
attendance-system/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── next.config.ts           # Next.js configuration
│   ├── tailwind.config.ts       # Tailwind CSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── components.json          # shadcn/ui configuration
│   ├── postcss.config.mjs       # PostCSS configuration
│   ├── .gitignore              # Git ignore rules
│   └── env.example             # Environment variables template
│
├── 📚 Documentation
│   ├── README.md               # Project overview and quick start
│   ├── QUICK-START.md          # 5-minute setup guide
│   ├── FEATURES.md             # Complete feature list
│   ├── API.md                  # API documentation
│   ├── TESTING.md              # Testing framework guide
│   ├── PROJECT-STRUCTURE.md    # This file
│   └── docs/                   # Detailed documentation
│       ├── README.md           # Documentation index
│       ├── SETUP-INSTRUCTIONS.md  # Detailed setup
│       ├── MOBILE-ACCESS.md    # Mobile configuration
│       ├── VPN-DETECTION.md    # Security setup
│       ├── database-structure.md  # Database schema
│       ├── CONTRIBUTING.md     # Development guidelines
│       └── DEPLOYMENT.md       # Production deployment
│
├── 🗄️ Database
│   └── prisma/
│       ├── schema.prisma       # Database schema
│       └── migrations/         # Database migrations
│
├── 🎨 Frontend Assets
│   └── public/
│       ├── manifest.json       # PWA manifest
│       ├── favicon.ico         # Site icon
│       └── icons/              # PWA icons
│
├── 🧪 Scripts
│   ├── README.md               # Scripts documentation
│   ├── seed-database.js        # Database seeding
│   ├── testing/                # Testing scripts
│   │   ├── run-all-tests.js    # Master test runner
│   │   ├── quick-test.js       # Fast health check
│   │   ├── test-all-components.js  # Backend tests
│   │   ├── test-frontend-components.js  # Frontend tests
│   │   ├── test-performance.js # Performance tests
│   │   ├── test-enrollment.js  # Enrollment tests
│   │   └── test-auth.js        # Authentication tests
│   ├── utilities/              # Utility scripts
│   │   ├── check-enrollment-data.js  # Data verification
│   │   ├── check-database.js   # Database status
│   │   ├── check-attendance.js # Attendance validation
│   │   ├── get-users.js        # User listing
│   │   ├── get-lecturer.js     # Lecturer info
│   │   └── get-lecturer-id.js  # Lecturer lookup
│   └── development/            # Development helpers
│       ├── assign-course.js    # Course assignment
│       ├── create-test-session.js  # Test sessions
│       ├── debug-session.js    # Session debugging
│       └── performance-test.js # Performance utilities
│
└── 💻 Source Code
    └── src/
        ├── app/                # Next.js app directory (pages & API)
        │   ├── globals.css     # Global styles
        │   ├── layout.tsx      # Root layout
        │   ├── page.tsx        # Home page
        │   ├── login/          # Authentication pages
        │   ├── signup/
        │   ├── admin/          # Admin portal
        │   ├── lecturer/       # Lecturer portal
        │   ├── student/        # Student portal
        │   └── api/            # API endpoints
        │       ├── auth/       # Authentication APIs
        │       ├── courses/    # Course management
        │       ├── sessions/   # Session management
        │       ├── attendance/ # Attendance tracking
        │       ├── admin/      # Admin operations
        │       ├── export/     # Data export
        │       └── health/     # System health
        │
        ├── components/         # React components
        │   ├── ui/            # Base UI components (shadcn/ui)
        │   ├── auth/          # Authentication components
        │   ├── admin/         # Admin-specific components
        │   ├── lecturer/      # Lecturer-specific components
        │   ├── student/       # Student-specific components
        │   ├── shared/        # Shared components
        │   └── mobile/        # Mobile-optimized components
        │
        ├── lib/               # Utility functions and configurations
        │   ├── auth.ts        # Authentication utilities
        │   ├── auth-actions.ts # Server actions for auth
        │   ├── prisma.ts      # Database client
        │   ├── queries.ts     # Optimized database queries
        │   ├── cache.ts       # Caching utilities
        │   ├── database-actions.ts # Database operations
        │   ├── mock-data.ts   # Mock data for development
        │   └── utils.ts       # General utilities
        │
        └── middleware.ts      # Next.js middleware
```

## 🎯 Key Directories Explained

### `/src/app/` - Application Pages & APIs
- **Pages:** Each directory represents a route in the application
- **API Routes:** RESTful endpoints for frontend-backend communication
- **Layouts:** Shared layouts for different user roles

### `/src/components/` - React Components
- **ui/:** Base components from shadcn/ui library
- **Role-specific:** Components organized by user role (admin, lecturer, student)
- **shared/:** Reusable components across roles
- **mobile/:** Mobile-optimized components

### `/src/lib/` - Business Logic & Utilities
- **Authentication:** JWT handling, password hashing
- **Database:** Prisma client, queries, caching
- **Actions:** Server-side actions for form handling

### `/scripts/` - Utility Scripts
- **testing/:** Comprehensive testing framework
- **utilities/:** Data verification and checking tools
- **development/:** Development and debugging helpers

### `/docs/` - Documentation
- **Setup guides:** Installation and configuration
- **API documentation:** Complete endpoint reference
- **Deployment guides:** Production deployment instructions

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `next.config.ts` | Next.js framework configuration |
| `tailwind.config.ts` | Tailwind CSS styling configuration |
| `tsconfig.json` | TypeScript compiler configuration |
| `prisma/schema.prisma` | Database schema definition |
| `components.json` | shadcn/ui component configuration |
| `.env.example` | Environment variables template |

## 🚀 Quick Navigation

### For Developers
- **Start here:** [`README.md`](./README.md)
- **Setup:** [`QUICK-START.md`](./QUICK-START.md)
- **Contributing:** [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md)
- **Testing:** [`TESTING.md`](./TESTING.md)

### For Users
- **Features:** [`FEATURES.md`](./FEATURES.md)
- **Mobile setup:** [`docs/MOBILE-ACCESS.md`](./docs/MOBILE-ACCESS.md)
- **API reference:** [`API.md`](./API.md)

### For Deployment
- **Production:** [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- **Database:** [`docs/database-structure.md`](./docs/database-structure.md)
- **Security:** [`docs/VPN-DETECTION.md`](./docs/VPN-DETECTION.md)

## 📊 File Statistics

- **Total Components:** 25+ React components
- **API Endpoints:** 15+ RESTful endpoints
- **Test Scripts:** 7 comprehensive test suites
- **Documentation:** 12 detailed guides
- **Utility Scripts:** 10+ helper scripts

## 🎨 Design Patterns

### Frontend Architecture
- **Component-based:** Modular React components
- **Role-based routing:** Separate portals for each user type
- **Responsive design:** Mobile-first approach
- **State management:** React hooks and server state

### Backend Architecture
- **API-first:** RESTful endpoints with clear contracts
- **Database-first:** Prisma ORM with type safety
- **Authentication:** JWT-based with role-based access
- **Caching:** Intelligent caching for performance

### Code Organization
- **Feature-based:** Components grouped by functionality
- **Type-safe:** Full TypeScript coverage
- **Modular:** Reusable utilities and components
- **Testable:** Comprehensive testing framework

---

**Last Updated:** October 2025  
**Project Version:** 3.0 Enterprise Edition
