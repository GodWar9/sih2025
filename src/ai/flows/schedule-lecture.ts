'use server';
/**
 * @fileOverview A Genkit flow to schedule a new lecture.
 *
 * - scheduleLecture - Schedules a new lecture based on availability.
 * - ScheduleLectureInput - The input type for the scheduleLecture function.
 * - ScheduleLectureOutput - The return type for the scheduleLecture function.
 */

import { ai } from '@/ai/genkit';
import { lectures as allLectures } from '@/lib/data';
import { z } from 'genkit';

const ScheduleLectureInputSchema = z.object({
  subject: z.string().describe('The subject of the lecture to schedule.'),
  teacher: z.string().describe('The teacher for the lecture.'),
  classroom: z.string().describe('The classroom for the lecture.'),
});
export type ScheduleLectureInput = z.infer<typeof ScheduleLectureInputSchema>;

const ScheduleLectureOutputSchema = z.object({
    success: z.boolean().describe('Whether the scheduling was successful.'),
    dayOfWeek: z.string().optional().describe('The day of the week for the scheduled lecture.'),
    startTime: z.string().optional().describe('The start time of the scheduled lecture (e.g., "13:00").'),
    endTime: z.string().optional().describe('The end time of the scheduled lecture (e.g., "14:30").'),
    reason: z.string().optional().describe('Reason if scheduling failed.'),
});
export type ScheduleLectureOutput = z.infer<typeof ScheduleLectureOutputSchema>;

export async function scheduleLecture(input: ScheduleLectureInput): Promise<ScheduleLectureOutput> {
  return scheduleLectureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleLecturePrompt',
  input: {
    schema: z.object({
        schedule: z.string().describe("The current schedule of all lectures."),
        subject: z.string().describe('The subject of the lecture to schedule.'),
        teacher: z.string().describe('The teacher for the lecture.'),
        classroom: z.string().describe('The classroom for the lecture.'),
    }),
  },
  output: {
    schema: ScheduleLectureOutputSchema
  },
  prompt: `You are an AI assistant that helps schedule university lectures.
  
  You are given the current schedule of lectures for the week (Monday to Friday, 09:00 to 17:00).
  Your task is to find a 1.5-hour time slot to schedule a new lecture.

  Current Schedule:
  {{{schedule}}}

  Schedule a new lecture for:
  Subject: {{{subject}}}
  Teacher: {{{teacher}}}
  Classroom: {{{classroom}}}

  Analyze the provided schedule and find the first available 1.5-hour slot where both the teacher and the classroom are free.
  Working hours are Monday to Friday, from 09:00 to 17:00.
  
  If a slot is found, output the day and time, and set success to true.
  If no slot is available, set success to false and provide a brief reason.`,
});

const scheduleLectureFlow = ai.defineFlow(
  {
    name: 'scheduleLectureFlow',
    inputSchema: ScheduleLectureInputSchema,
    outputSchema: ScheduleLectureOutputSchema,
  },
  async (input) => {
    const scheduleString = allLectures
      .map(
        (l) =>
          `- ${l.day}, ${l.startTime}-${l.endTime}: ${l.subject} with ${l.teacher} in ${l.classroom}`
      )
      .join('\n');

    const { output } = await prompt({
        schedule: scheduleString,
        ...input,
    });
    return output!;
  }
);
