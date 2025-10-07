# Prompt for AI Agent: Full-Stack Backend Implementation

**Objective:** Transform the "Smart Student Monitoring System" from a Next.js application using mock data into a complete full-stack application by building out the entire backend using Firebase.

**Core Technologies:**
- **Framework:** Next.js (App Router, Server Actions)
- **Language:** TypeScript
- **Database:** Google Cloud Firestore
- **Authentication:** Firebase Authentication
- **AI:** Google Genkit

**Reference Documents:**
- `backend-structure.md`: Outlines the architectural approach.
- `database-structure.md`: Defines the Firestore collections and schemas.

---

## Development Plan

Here is a step-by-step plan to implement the backend. Please execute these tasks sequentially.

### Phase 1: Firebase Setup and Authentication

1.  **Integrate Firebase:**
    -   Set up a Firebase project and configure the Next.js application to connect to it. Create the necessary `firebase/config.ts` and provider components.

2.  **Implement Authentication:**
    -   Replace the current mock authentication system entirely with Firebase Authentication.
    -   **Login (`/login`):** Update the `LoginForm` to use `signInWithEmailAndPassword`. On successful login, determine the user's role from their corresponding document in the `/users` collection and redirect them to the correct portal (`/student`, `/lecturer`, or `/admin`).
    -   **Signup (`/signup`):** Update the `SignupForm` to use `createUserWithEmailAndPassword`. Upon successful creation in Firebase Auth, immediately create a corresponding user document in the `users` collection in Firestore with the `name`, `email`, and selected `role`.
    -   **Session Management:** Implement a global authentication provider that makes the current user's state and role available throughout the application. This will replace all mock user data (e.g., `students[0]`, `lecturers[0]`). All layouts (`/student/layout.tsx`, `/lecturer/layout.tsx`, `/admin/layout.tsx`) must use this provider to get the current user's data.

### Phase 2: Migrate Mock Data to Firestore

**Task:** Replace all hardcoded data from `src/lib/mock-data.ts` with live data fetched from Firestore. All data-mutating actions (create, update, delete) must be implemented as Server Actions that interact with the Firestore database.

1.  **User Management (`/admin/users`):**
    -   **Fetch:** The `UserTable` must fetch and display all documents from the `users` collection.
    -   **Create/Edit:** The `UserForm` should now perform create and update operations directly on the `users` collection in Firestore. When creating a user, also create the user in Firebase Auth.
    -   **Delete:** The delete action should remove the user's document from the `users` collection and their account from Firebase Auth.

2.  **Course Management (`/admin/courses`):**
    -   **Fetch:** The `CourseTable` must fetch and display all documents from the `courses` collection.
    -   **Create/Edit:** The `CourseForm` should perform create and update operations on the `courses` collection.
    -   **Delete:** The delete action must remove the specified course document from Firestore.

3.  **Lecturer Course View (`/lecturer/dashboard` & `/lecturer/courses/[courseId]`):**
    -   Fetch and display only the courses assigned to the currently logged-in lecturer from the `courses` collection.
    -   On the course detail page, fetch and display real-time attendance data from the `attendanceRecords` collection for the active `attendanceSession`.

4.  **Student Views (`/student/dashboard` & `/student/history`):**
    -   The attendance history page must fetch and display all records for the logged-in student from the `attendanceRecords` collection, joining data with `attendanceSessions` and `courses` to show course names and dates.

### Phase 3: Implement Core Business Logic with Firestore

1.  **Create Attendance Session (`/lecturer/courses/[courseId]`):**
    -   The "Create New Session" action should create a new document in the `attendanceSessions` collection with a unique `code`, `courseId`, and a calculated `expiresAt` timestamp (e.g., 15 minutes from now).

2.  **Mark Attendance (`/student/dashboard`):**
    -   The `markAttendance` Server Action must be completely rewritten.
    -   It should query the `attendanceSessions` collection to find a session with a matching `code` that has not expired.
    -   It must then verify that the logged-in student is enrolled in the course associated with that session (check the `enrolledStudentIds` array in the `courses` collection).
    -   If validation passes, create a new document in the `attendanceRecords` collection linking the `studentId` and `sessionId`.

### Phase 4: Update AI Flows to Use Live Data

1.  **Report Generation (Admin & Lecturer):**
    -   The `generateAttendanceReport` Server Actions (`/components/admin/actions.ts` and `/components/lecturer/actions.ts`) must be updated.
    -   Instead of filtering mock data, they must query Firestore based on the user's filter criteria (date range, course, student, etc.).
    -   The queried, live data must then be passed to the `generateAttendanceReportFlow` Genkit flow. Ensure the data is scoped correctly so lecturers can only generate reports for their own students and courses.
