'use server';
/**
 * @fileOverview A Genkit flow to find available slots for rescheduling a canceled lecture.
 *
 * - findRescheduleSlots - Finds available slots for a given lecture, teacher, classroom, and students.
 * - FindRescheduleSlotsInput - The input type for the findRescheduleSlots function.
 * - FindRescheduleSlotsOutput - The return type for the findRescheduleSlots function.
 */

import { ai } from '@/ai/genkit';
import { lectures as allLectures, users as allUsers } from '@/lib/data';
import { z } from 'genkit';

const FindRescheduleSlotsInputSchema = z.object({
  teacher: z.string().describe('The teacher for the lecture.'),
  classroom: z.string().describe('The classroom for the lecture.'),
  studentIds: z.array(z.string()).describe('A list of student IDs enrolled in the lecture.'),
});
export type FindRescheduleSlotsInput = z.infer<typeof FindRescheduleSlotsInputSchema>;

const FindRescheduleSlotsOutputSchema = z.object({
    availableSlots: z.array(z.object({
        dayOfWeek: z.string().describe('The day of the week for the available slot.'),
        startTime: z.string().describe('The start time of the available slot (e.g., "13:00").'),
        endTime: z.string().describe('The end time of the available slot (e.g., "14:30").'),
    })).describe('A list of available 1.5-hour time slots for the lecture.')
});
export type FindRescheduleSlotsOutput = z.infer<typeof FindRescheduleSlotsOutputSchema>;

export async function findRescheduleSlots(input: FindRescheduleSlotsInput): Promise<FindRescheduleSlotsOutput> {
  return findRescheduleSlotsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findRescheduleSlotsPrompt',
  input: {
    schema: z.object({
        schedule: z.string().describe("The current schedule of all lectures."),
        teacher: z.string().describe('The teacher for the lecture.'),
        classroom: z.string().describe('The classroom for the lecture.'),
        studentSchedules: z.string().describe("The schedules of all students enrolled in the lecture to be rescheduled."),
    }),
  },
  output: {
    schema: FindRescheduleSlotsOutputSchema
  },
  prompt: `You are an AI assistant that helps reschedule university lectures.
  
  You are given the current schedule of all lectures and the individual schedules for all students that need to attend the rescheduled lecture.
  Your task is to find all available 1.5-hour time slots to reschedule a lecture.

  The constraints are:
  - The teacher must be free.
  - The classroom must be free.
  - ALL students enrolled in the lecture must be free.

  Current Full Schedule (for teacher and classroom availability):
  {{{schedule}}}

  Schedules for Enrolled Students (for student availability):
  {{{studentSchedules}}}

  Analyze all the provided schedules and identify all 1.5-hour slots where the teacher, the classroom, and all specified students are simultaneously available.
  Working hours are Monday to Friday, from 09:00 to 17:00.
  
  Output a JSON object containing a list of all suitable available slots.`,
});

const findRescheduleSlotsFlow = ai.defineFlow(
  {
    name: 'findRescheduleSlotsFlow',
    inputSchema: FindRescheduleSlotsInputSchema,
    outputSchema: FindRescheduleSlotsOutputSchema,
  },
  async (input) => {
    // Convert the lectures data to a simple string format for the prompt
    const scheduleString = allLectures
      .filter(l => l.status !== 'canceled')
      .map(
        (l) =>
          `- ${l.day}, ${l.startTime}-${l.endTime}: ${l.subject} with ${l.teacher} in ${l.classroom}`
      )
      .join('\n');

    // Generate schedules for each student
    const studentSchedules = input.studentIds.map(studentId => {
        const student = allUsers.find(u => u.id === studentId);
        const studentLectures = allLectures.filter(l => l.students.some(s => s.studentId === studentId) && l.status !== 'canceled');
        const schedule = studentLectures.map(l => `  - ${l.day}, ${l.startTime}-${l.endTime}: ${l.subject}`).join('\n');
        return `Student ${student?.name || studentId}:\n${schedule}`;
    }).join('\n\n');


    const { output } = await prompt({
        schedule: scheduleString,
        teacher: input.teacher,
        classroom: input.classroom,
        studentSchedules: studentSchedules,
    });
    return output!;
  }
);
