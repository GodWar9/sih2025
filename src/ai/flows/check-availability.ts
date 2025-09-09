'use server';
/**
 * @fileOverview Defines a Genkit flow to check for available classroom and instructor time slots.
 *
 * - checkAvailability - Checks for availability based on room and/or instructor.
 * - CheckAvailabilityInput - The input type for the checkAvailability function.
 * - CheckAvailabilityOutput - The return type for the checkAvailability function.
 */

import { ai } from '@/ai/genkit';
import { lectures as allLectures } from '@/lib/data';
import { z } from 'genkit';

const CheckAvailabilityInputSchema = z.object({
  room: z.string().optional().describe('The classroom to check for availability.'),
  instructor: z.string().optional().describe('The instructor to check for availability.'),
});
export type CheckAvailabilityInput = z.infer<typeof CheckAvailabilityInputSchema>;

const CheckAvailabilityOutputSchema = z.object({
    availableSlots: z.array(z.object({
        dayOfWeek: z.string().describe('The day of the week for the available slot.'),
        startTime: z.string().describe('The start time of the available slot (e.g., "13:00").'),
        endTime: z.string().describe('The end time of the available slot (e.g., "14:00").'),
    })).describe('A list of available time slots.')
});
export type CheckAvailabilityOutput = z.infer<typeof CheckAvailabilityOutputSchema>;

export async function checkAvailability(input: CheckAvailabilityInput): Promise<CheckAvailabilityOutput> {
  return checkAvailabilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkAvailabilityPrompt',
  input: {
    schema: z.object({
        schedule: z.string().describe("The current schedule of all lectures."),
        room: z.string().optional().describe('The classroom to check for availability.'),
        instructor: z.string().optional().describe('The instructor to check for availability.'),
    }),
  },
  output: { 
    schema: CheckAvailabilityOutputSchema
  },
  prompt: `You are an AI assistant that helps schedule university lectures.
  
  You are given the current schedule of lectures for the week (Monday to Friday, 09:00 to 17:00).
  Your task is to find all available 1-hour time slots for a given classroom, instructor, or both.

  Current Schedule:
  {{{schedule}}}

  Check availability for:
  {{#if room}}Classroom: {{{room}}}{{/if}}
  {{#if instructor}}Instructor: {{{instructor}}}{{/if}}

  Analyze the provided schedule and identify all 1-hour slots where the specified resources are free.
  A standard lecture is 1.5 hours, but you should find all possible 1-hour slots.
  Assume working hours are Monday to Friday, from 09:00 to 17:00.
  
  Output a JSON object containing a list of available slots.`,
});

const checkAvailabilityFlow = ai.defineFlow(
  {
    name: 'checkAvailabilityFlow',
    inputSchema: CheckAvailabilityInputSchema,
    outputSchema: CheckAvailabilityOutputSchema,
  },
  async (input) => {
    // Convert the lectures data to a simple string format for the prompt
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
