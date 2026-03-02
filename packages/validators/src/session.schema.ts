import { z } from "zod";
import { SessionType } from "@questboard/types";

export const createSessionSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(SessionType).default(SessionType.PRIVATE),
  system: z.string().min(1).max(50),
  maxPlayers: z.number().int().min(1).max(20).default(5),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10).default([]),
  scheduledAt: z.coerce.date().nullable().optional(),
});

export const updateSessionSchema = createSessionSchema.partial();

export const joinSessionSchema = z.object({
  inviteCode: z.string().min(1),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
