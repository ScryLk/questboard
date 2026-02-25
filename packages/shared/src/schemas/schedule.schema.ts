import { z } from "zod";
import { RsvpStatus } from "../types/enums.js";

export const createScheduleSchema = z.object({
  scheduledFor: z.coerce.date(),
  duration: z.number().int().min(15).max(1440).optional().nullable(),
  isRecurring: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export const updateScheduleSchema = z.object({
  scheduledFor: z.coerce.date().optional(),
  duration: z.number().int().min(15).max(1440).optional().nullable(),
  cancelReason: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const rsvpSchema = z.object({
  status: z.enum([RsvpStatus.CONFIRMED, RsvpStatus.DECLINED, RsvpStatus.TENTATIVE]),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
