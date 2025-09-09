import { config } from 'dotenv';
config();

import '@/ai/flows/lecture-cancellation-notification.ts';
import '@/ai/flows/check-availability.ts';
import '@/ai/flows/schedule-lecture.ts';
