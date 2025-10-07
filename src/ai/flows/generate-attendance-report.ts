'use server';
/**
 * @fileOverview A flow to generate a comprehensive attendance report using AI.
 *
 * - generateAttendanceReportFlow - Analyzes attendance data and creates an HTML report.
 * - GenerateReportInput - The input type for the flow.
 * - GenerateReportOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  jsonData: z.string().describe('A JSON string containing all the filtered data for the report, including students, courses, sessions, and records.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  reportHtml: z.string().describe('A comprehensive and visually appealing HTML report summarizing the attendance data. Use TailwindCSS classes for styling (e.g., `font-bold`, `text-lg`, `p-4`, `bg-blue-100`).'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateAttendanceReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an expert data analyst AI specializing in academic attendance. Your task is to analyze the provided JSON data and generate a comprehensive, well-structured, and insightful attendance report in HTML format.

  **Analyze the Data:**
  - The JSON data contains lists of students, lecturers, courses, attendance sessions, and attendance records based on the user's filter criteria.
  - Carefully examine the filters applied to understand the context of the report.
  - Calculate key metrics:
    - Overall attendance rate (present records / total possible attendances).
    - Attendance rates per course, student, or lecturer, if applicable.
    - Identify students with perfect attendance and those with the lowest attendance.
    - Pinpoint any courses or dates with unusually high or low attendance.

  **Generate the HTML Report:**
  - Structure the report with clear headings and sections.
  - Use TailwindCSS classes for styling. Make it look professional and readable. Use classes like \`<h3>\`, \`<h4>\`, \`<p>\`, \`<ul>\`, \`<li>\`, \`<strong>\`, etc.
  - Start with a high-level "Executive Summary".
  - Follow with "Key Insights" presented as a bulleted list.
  - Include sections for "High Performers" (students/courses with high attendance) and "Areas for Attention" (students/courses with low attendance).
  - If the data is empty or very limited, state that and explain that a meaningful report cannot be generated.
  - Conclude with "Recommendations" offering actionable advice based on the insights.
  - Do NOT include any \`<html>\`, \`<head>\`, or \`<body>\` tags. The output must be only the content that can be placed inside a \`<div>\`.

  **Data for Analysis:**
  \`\`\`json
  {{{jsonData}}}
  \`\`\`
  `,
});

export const generateAttendanceReportFlow = ai.defineFlow(
  {
    name: 'generateAttendanceReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
