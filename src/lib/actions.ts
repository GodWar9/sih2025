'use server';

import {
  lectureCancellationNotification,
  type LectureCancellationNotificationInput,
} from '@/ai/flows/lecture-cancellation-notification';
import {
  checkAvailability as checkAvailabilityFlow,
  type CheckAvailabilityInput,
} from '@/ai/flows/check-availability';

import {
  scheduleLecture as scheduleLectureFlow,
  type ScheduleLectureInput,
} from '@/ai/flows/schedule-lecture';

import { z } from 'zod';

const cancelActionSchema = z.object({
  lectureDetails: z.string().min(1, { message: 'Lecture details are required.' }),
  studentList: z.array(z.object({
    studentId: z.string(),
    attendanceRate: z.number().min(0).max(1),
    missedSessions: z.number().min(0),
  })).min(1, { message: 'At least one student is required.' }),
});

export async function getCancellationNotifications(
  input: LectureCancellationNotificationInput
) {
  const validation = cancelActionSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    const result = await lectureCancellationNotification(validation.data);
    return { success: true, data: result };
  } catch (e) {
    console.error('Genkit Flow Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while running the AI flow.';
    return { success: false, error: { _form: [errorMessage] } };
  }
}

const checkAvailabilitySchema = z.object({
  room: z.string().optional(),
  instructor: z.string().optional(),
}).refine(data => !!data.room || !!data.instructor, {
  message: 'Either room or instructor must be provided.'
});

export async function checkAvailability(
  input: CheckAvailabilityInput
) {
    const validation = checkAvailabilitySchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: validation.error.flatten().fieldErrors };
    }

    try {
        const result = await checkAvailabilityFlow(validation.data);
        return { success: true, data: result };
    } catch (e) {
        console.error('Genkit Flow Error:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while running the AI flow.';
        return { success: false, error: { _form: [errorMessage] } };
    }
}

const scheduleLectureSchema = z.object({
    subject: z.string().min(1, { message: 'Subject is required.' }),
    teacher: z.string().min(1, { message: 'Teacher is required.' }),
    classroom: z.string().min(1, { message: 'Classroom is required.' }),
});

export async function scheduleLecture(
    input: ScheduleLectureInput
) {
    const validation = scheduleLectureSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: validation.error.flatten().fieldErrors };
    }

    try {
        const result = await scheduleLectureFlow(validation.data);
        return { success: true, data: result };
    } catch (e) {
        console.error('Genkit Flow Error:', e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while running the AI flow.';
        return { success: false, error: { _form: [errorMessage] } };
    }
}
