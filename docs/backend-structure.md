# Backend Structure

This document outlines the backend architecture for the Smart Student Monitoring System, built with Next.js and Genkit.

## 1. Core Technology

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **AI Integration**: Google's Genkit

## 2. Architectural Components

### Next.js App Router

The foundation of our application is the Next.js App Router. We leverage its core features to build a modern, server-centric web application.

- **Server Components**: By default, our pages and components are React Server Components (RSCs). This allows us to fetch data and render content on the server, sending minimal JavaScript to the client. This is ideal for pages like dashboards and user lists.
- **Client Components**: For interactive UI, such as forms, dialogs, and live-updating components, we use Client Components (marked with `"use client"`).

### Server Actions

Server Actions are the primary mechanism for handling data mutations (creations, updates, deletes) from the client. They are secure, server-side functions that can be called directly from our React components, simplifying form submissions and eliminating the need for traditional API endpoints for many use cases.

- **Usage**: Used for logging in, creating/editing users and courses, marking attendance, and initiating AI report generation.
- **Location**: Typically co-located with the components that use them (e.g., `src/components/admin/actions.ts`) or within the relevant page directory.

### Genkit AI Flows

All Generative AI functionality is managed through Genkit flows. These are server-side operations that orchestrate calls to large language models (LLMs).

- **Purpose**:
    - **Attendance Validation**: Validating a student's session code and enrollment status.
    - **Report Generation**: Analyzing attendance data and producing comprehensive, formatted reports.
- **Location**: All Genkit flows are stored in the `src/ai/flows/` directory.

### Authentication

Currently, the application uses a mock authentication system for demonstration purposes. In a full-stack production environment, this would be replaced with a robust authentication provider.

- **Proposed Solution**: Firebase Authentication would be an ideal choice, offering secure, easy-to-use solutions for email/password and social logins.

## 3. Data Flow Example: Generating a Report

1.  **Client (Admin Portal)**: The admin selects filters (date, course, etc.) in the `ReportGenerator` component and clicks "Generate Report."
2.  **Server Action**: The form submission triggers the `generateAttendanceReport` Server Action located in `src/components/admin/actions.ts`.
3.  **Data Filtering**: The Server Action queries the database (currently mock data, proposed Firestore) to get the data corresponding to the filters.
4.  **Genkit Flow**: The filtered data (in JSON format) is passed as input to the `generateAttendanceReportFlow`.
5.  **LLM Call**: The Genkit flow sends the data and a carefully crafted prompt to the configured Gemini model.
6.  **Response**: The LLM returns a structured JSON object containing the report as an HTML string.
7.  **Client Update**: The Server Action returns the HTML report to the `ReportGenerator` component, which then updates its state and renders the report on the screen.
