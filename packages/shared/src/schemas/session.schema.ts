import { z } from "zod";
import { SessionType, SessionVisibility } from "../types/enums.js";

export const createSessionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  system: z.string().min(1).max(50).default("generic"),
  tags: z.array(z.string().max(30)).max(10).default([]),
  type: z.nativeEnum(SessionType).default(SessionType.PRIVATE),
  visibility: z.nativeEnum(SessionVisibility).default(SessionVisibility.UNLISTED),
  maxPlayers: z.number().int().min(1).max(20).default(5),
  allowSpectators: z.boolean().default(false),
  maxSpectators: z.number().int().min(0).max(50).default(0),
  scheduledAt: z.coerce.date().nullable().optional(),
  timezone: z.string().max(50).optional().nullable(),
  recurringRule: z.record(z.unknown()).optional().nullable(),
  remindBeforeMinutes: z.number().int().min(0).max(1440).optional().nullable(),
  password: z.string().min(4).max(100).optional().nullable(),
  settings: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateSessionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  system: z.string().min(1).max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  type: z.nativeEnum(SessionType).optional(),
  visibility: z.nativeEnum(SessionVisibility).optional(),
  maxPlayers: z.number().int().min(1).max(20).optional(),
  allowSpectators: z.boolean().optional(),
  maxSpectators: z.number().int().min(0).max(50).optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  timezone: z.string().max(50).optional().nullable(),
  recurringRule: z.record(z.unknown()).optional().nullable(),
  remindBeforeMinutes: z.number().int().min(0).max(1440).optional().nullable(),
  settings: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const joinSessionSchema = z.object({
  inviteCode: z.string().optional(),
  token: z.string().optional(),
  password: z.string().optional(),
});

export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
