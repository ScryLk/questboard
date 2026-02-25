import { z } from "zod";

export const createTokenSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["PC", "NPC", "ENEMY", "ALLY", "OBJECT", "VEHICLE", "EFFECT"]),
  imageUrl: z.string().url().optional().nullable(),
  color: z.string().max(20).optional(),
  x: z.number().default(0),
  y: z.number().default(0),
  rotation: z.number().min(0).max(360).default(0),
  width: z.number().int().min(1).max(10).default(1),
  height: z.number().int().min(1).max(10).default(1),
  ownerId: z.string().optional().nullable(),
  characterId: z.string().optional().nullable(),
  isVisible: z.boolean().default(true),
  hp: z.object({ current: z.number(), max: z.number(), temp: z.number().optional() }).optional().nullable(),
  conditions: z.array(z.string()).default([]),
  statusRing: z.string().optional().nullable(),
  auraRadius: z.number().optional().nullable(),
  auraColor: z.string().optional().nullable(),
  elevation: z.number().default(0),
  label: z.string().max(50).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateTokenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["PC", "NPC", "ENEMY", "ALLY", "OBJECT", "VEHICLE", "EFFECT"]).optional(),
  imageUrl: z.string().url().optional().nullable(),
  color: z.string().max(20).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  rotation: z.number().min(0).max(360).optional(),
  width: z.number().int().min(1).max(10).optional(),
  height: z.number().int().min(1).max(10).optional(),
  ownerId: z.string().optional().nullable(),
  characterId: z.string().optional().nullable(),
  isVisible: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  layer: z.number().int().optional(),
  hp: z.object({ current: z.number(), max: z.number(), temp: z.number().optional() }).optional().nullable(),
  conditions: z.array(z.string()).optional(),
  statusRing: z.string().optional().nullable(),
  auraRadius: z.number().optional().nullable(),
  auraColor: z.string().optional().nullable(),
  elevation: z.number().optional(),
  label: z.string().max(50).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateTokenHpSchema = z.object({
  delta: z.number(),
});

export const batchCreateTokensSchema = z.object({
  tokens: z.array(createTokenSchema).min(1).max(50),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type UpdateTokenInput = z.infer<typeof updateTokenSchema>;
