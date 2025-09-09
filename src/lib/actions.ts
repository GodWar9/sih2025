'use server';

import {
  lectureCancellationNotification,
  type LectureCancellationNotificationInput,
} from '@/ai/flows/lecture-cancellation-notification';
import { z } from 'zod';

const actionSchema = z.object({
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
  const validation = actionSchema.safeParse(input);
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
