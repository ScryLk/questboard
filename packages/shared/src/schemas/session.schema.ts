import { z } from "zod";
import { SessionType } from "../types/enums.js";

export const createSessionSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(SessionType).default(SessionType.PRIVATE),
  system: z.string().min(1).max(50),
  maxPlayers: z.number().int().min(1).max(20).default(5),
  tags: z.array(z.string().max(30)).max(10).default([]),
  description: z.string().max(1000).optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  scheduledAt: z.coerce.date().nullable().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const updateSessionSchema = createSessionSchema.partial();

export const joinSessionSchema = z.object({
  inviteCode: z.string().min(1),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
