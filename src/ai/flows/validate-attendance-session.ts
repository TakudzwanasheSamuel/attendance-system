'use server';

/**
 * @fileOverview A flow to validate attendance sessions based on session codes and student enrollment.
 *
 * - validateAttendanceSession - Validates the attendance session and student enrollment.
 * - ValidateAttendanceSessionInput - The input type for the validateAttendanceSession function.
 * - ValidateAttendanceSessionOutput - The return type for the validateAttendanceSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAttendanceSessionInputSchema = z.object({
  sessionCode: z.string().describe('The session code entered by the student.'),
  studentId: z.string().describe('The unique identifier for the student.'),
  courseId: z.string().describe('The unique identifier for the course.'),
});
export type ValidateAttendanceSessionInput = z.infer<typeof ValidateAttendanceSessionInputSchema>;

const ValidateAttendanceSessionOutputSchema = z.object({
  isValidSession: z.boolean().describe('Whether the session code is valid for an active session.'),
  isEnrolled: z.boolean().describe('Whether the student is enrolled in the course for the session.'),
  validationMessage: z.string().describe('A message indicating the validation result.'),
});
export type ValidateAttendanceSessionOutput = z.infer<typeof ValidateAttendanceSessionOutputSchema>;

export async function validateAttendanceSession(input: ValidateAttendanceSessionInput): Promise<ValidateAttendanceSessionOutput> {
  return validateAttendanceSessionFlow(input);
}

const validateAttendanceSessionPrompt = ai.definePrompt({
  name: 'validateAttendanceSessionPrompt',
  input: {schema: ValidateAttendanceSessionInputSchema},
  output: {schema: ValidateAttendanceSessionOutputSchema},
  prompt: `You are an AI assistant that validates student attendance sessions.

  Determine if the provided session code is valid and if the student is enrolled in the course for that session.

  Session Code: {{{sessionCode}}}
  Student ID: {{{studentId}}}
  Course ID: {{{courseId}}}

  Provide a clear validation message indicating the result. Set isValidSession and isEnrolled to true or false accordingly.

  Ensure that the output is a JSON object that conforms to the ValidateAttendanceSessionOutputSchema schema.  The schema description:
  ${JSON.stringify(ValidateAttendanceSessionOutputSchema.description, null, 2)}`,
});

const validateAttendanceSessionFlow = ai.defineFlow(
  {
    name: 'validateAttendanceSessionFlow',
    inputSchema: ValidateAttendanceSessionInputSchema,
    outputSchema: ValidateAttendanceSessionOutputSchema,
  },
  async input => {
    const {output} = await validateAttendanceSessionPrompt(input);
    return output!;
  }
);
