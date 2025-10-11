# Prompt for AI Agent: Full-Stack Backend Implementation (MySQL)

**Objective:** Transform the "Smart Student Monitoring System" from a Next.js application using mock data into a complete full-stack application by building out the entire backend using a relational database (MySQL) and an ORM like Prisma.

**Core Technologies:**
- **Framework:** Next.js (App Router, Server Actions)
- **Language:** TypeScript
- **Database:** MySQL (or any compatible SQL database)
- **ORM:** Prisma
- **AI:** Google Genkit

**Reference Documents:**
- `backend-structure.md`: Outlines the architectural approach.
- `database-structure.md`: Defines the relational database tables and schemas.

---

## Development Plan

Here is a step-by-step plan to implement the backend. Please execute these tasks sequentially.

### Phase 1: Database and Authentication Setup

1.  **Integrate Prisma ORM:**
    -   Set up Prisma in the project to connect to a MySQL database.
    -   Use the schema defined in `database-structure.md` to create the `schema.prisma` file.
    -   Generate the Prisma Client.

2.  **Implement Authentication:**
    -   Replace the current mock authentication system entirely.
    -   **Login (`/login`):** Update the `LoginForm`. On submission, query the `User` table for a matching email. Verify the password (you'll need to implement password hashing, e.g., with `bcrypt`). On success, create a session (e.g., using JWTs or a library like `next-auth`) and redirect the user to their respective portal based on their role.
    -   **Signup (`/signup`):** Update the `SignupForm`. On submission, hash the provided password and create a new record in the `User` table with the `name`, `email`, `hashedPassword`, and selected `role`.
    -   **Session Management:** Implement a global authentication provider that makes the current user's state and role available throughout the application. This will replace all mock user data. All layouts (`/student/layout.tsx`, `/lecturer/layout.tsx`, `/admin/layout.tsx`) must use this provider to get the current user's data.

### Phase 2: Migrate Mock Data to Database

**Task:** Replace all hardcoded data from `src/lib/mock-data.ts` with live data fetched from the MySQL database via Prisma. All data-mutating actions (create, update, delete) must be implemented as Server Actions that interact with the database.

1.  **User Management (`/admin/users`):**
    -   **Fetch:** The `UserTable` must fetch and display all records from the `User` table.
    -   **Create/Edit:** The `UserForm` should now perform create and update operations directly on the `User` table using Prisma Client. Password hashing is required for creation.
    -   **Delete:** The delete action should remove the user's record from the `User` table.

2.  **Course Management (`/admin/courses`):**
    -   **Fetch:** The `CourseTable` must fetch and display all records from the `Course` table, including lecturer and enrollment details via relations.
    -   **Create/Edit:** The `CourseForm` should perform create and update operations. This includes managing enrollments in the `CourseEnrollment` join table.
    -   **Delete:** The delete action must remove the specified course record.

3.  **Lecturer Course View (`/lecturer/dashboard` & `/lecturer/courses/[courseId]`):**
    -   Fetch and display only the courses assigned to the currently logged-in lecturer from the `Course` table.
    -   On the course detail page, fetch and display real-time attendance data from the `AttendanceRecord` table for the active `AttendanceSession`.

4.  **Student Views (`/student/dashboard` & `/student/history`):**
    -   The attendance history page must fetch and display all records for the logged-in student from the `AttendanceRecord` table, joining data with `AttendanceSession` and `Course` to show course names and dates.

### Phase 3: Implement Core Business Logic with Database

1.  **Create Attendance Session (`/lecturer/courses/[courseId]`):**
    -   The "Create New Session" action should create a new record in the `AttendanceSession` table with a unique `code`, `courseId`, and a calculated `expiresAt` timestamp.

2.  **Mark Attendance (`/student/dashboard`):**
    -   The `markAttendance` Server Action must be rewritten.
    -   It should query the `AttendanceSession` table to find a session with a matching `code` that has not expired.
    -   It must then verify that the logged-in student is enrolled in the course associated with that session by checking for a record in the `CourseEnrollment` table.
    -   If validation passes, create a new record in the `AttendanceRecord` table linking the `studentId` and `sessionId`.

### Phase 4: Update AI Flows to Use Live Data

1.  **Report Generation (Admin & Lecturer):**
    -   The `generateAttendanceReport` Server Actions (`/components/admin/actions.ts` and `/components/lecturer/actions.ts`) must be updated.
    -   Instead of filtering mock data, they must query the database using Prisma based on the user's filter criteria (date range, course, student, etc.).
    -   The queried, live data must then be passed to the `generateAttendanceReportFlow` Genkit flow. Ensure the data is scoped correctly so lecturers can only generate reports for their own students and courses.
