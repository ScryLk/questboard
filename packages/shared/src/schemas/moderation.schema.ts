import { z } from "zod";
import { ChatChannel, ModerationAction } from "../types/enums.js";

// ── Mute User ──

export const muteUserSchema = z.object({
  userId: z.string(),
  duration: z.number().int().min(0).max(86400).optional(), // 0 = permanent, max 24h in seconds
  reason: z.string().max(500).optional(),
});

export type MuteUserInput = z.infer<typeof muteUserSchema>;

// ── Unmute User ──

export const unmuteUserSchema = z.object({
  userId: z.string(),
});

// ── Review Flagged Content ──

export const reviewContentSchema = z.object({
  moderationId: z.string(),
  approved: z.boolean(),
  notes: z.string().max(500).optional(),
});

export type ReviewContentInput = z.infer<typeof reviewContentSchema>;

// ── Set Slow Mode ──

export const slowModeSchema = z.object({
  channel: z.nativeEnum(ChatChannel),
  seconds: z.number().int().min(0).max(300), // 0 = off, max 5 minutes
});

export type SlowModeInput = z.infer<typeof slowModeSchema>;

// ── Moderation Log Query ──

export const moderationLogQuerySchema = z.object({
  userId: z.string().optional(),
  action: z.nativeEnum(ModerationAction).optional(),
  automaticOnly: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ModerationLogQuery = z.infer<typeof moderationLogQuerySchema>;

// ── Warn User ──

export const warnUserSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1).max(500),
});

export type WarnUserInput = z.infer<typeof warnUserSchema>;
