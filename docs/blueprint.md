# **App Name**: SMART STUDENT MONITORING SYSTEM

## Core Features:

- User Authentication: Firebase Authentication for Student and Lecturer roles.
- Lecturer Dashboard: Dashboard for lecturers to manage courses and attendance sessions.
- Student Dashboard: Dashboard for students to mark attendance and view attendance history.
- QR Code Generation: Generate a unique, time-sensitive QR code for each attendance session.
- Attendance Tracking: Real-time tracking of students who have marked attendance for the active session.
- Attendance Reports: Generate attendance reports displaying student attendance percentages using Cloud Firestore data.
- Data validation and integrity tool: The LLM assesses whether the session code provided by a student corresponds to any of the existing and ongoing sessions, also ensuring the user's enrolment on that subject prior to validating the presence. Display success/failure messages in real-time to give a clear error trace.

## Style Guidelines:

- Primary color: Vibrant purple (#9C27B0) to represent the academic environment and instill a sense of professionalism.
- Background color: Light grey (#F0F0F0), subtly desaturated purple to offer a clean and unobtrusive backdrop, ensuring legibility and visual comfort.
- Accent color: A lively green (#8BC34A) to add visual contrast and highlight key interactive elements such as buttons and active states.
- Body and headline font: 'PT Sans', a humanist sans-serif offering a balance of modernity and warmth for readability.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, clear icons to represent different actions and status messages.
- Subtle animations to provide feedback on user interactions.