import { z } from "zod";

export const createInteractiveObjectSchema = z.object({
  tokenId: z.string(),
  interactionType: z.enum(["DOOR", "CHEST", "LEVER", "NPC_TALK", "EXAMINE", "TELEPORT", "TRAP", "PICKUP", "CUSTOM"]),
  interactionRange: z.number().min(0).default(1),
  requiresLineOfSight: z.boolean().default(true),
  requiredRole: z.array(z.string()).default(["GM", "CO_GM", "PLAYER"]),
  requiredCheck: z.record(z.unknown()).optional().nullable(),
  onInteract: z.record(z.unknown()).default({}),
  isHidden: z.boolean().default(false),
  highlightOnHover: z.boolean().default(true),
  highlightColor: z.string().max(20).default("#6C5CE760"),
  interactionIcon: z.string().max(10).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateInteractiveObjectSchema = z.object({
  interactionType: z.enum(["DOOR", "CHEST", "LEVER", "NPC_TALK", "EXAMINE", "TELEPORT", "TRAP", "PICKUP", "CUSTOM"]).optional(),
  interactionRange: z.number().min(0).optional(),
  requiresLineOfSight: z.boolean().optional(),
  requiredRole: z.array(z.string()).optional(),
  requiredCheck: z.record(z.unknown()).optional().nullable(),
  onInteract: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  highlightOnHover: z.boolean().optional(),
  highlightColor: z.string().max(20).optional(),
  interactionIcon: z.string().max(10).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const batchCreateInteractiveObjectsSchema = z.object({
  objects: z.array(createInteractiveObjectSchema).min(1).max(100),
});

export const interactWithObjectSchema = z.object({
  context: z.object({
    diceResult: z.number().optional(),
    hasItem: z.string().optional(),
  }).optional(),
});

export type CreateInteractiveObjectInput = z.infer<typeof createInteractiveObjectSchema>;
export type UpdateInteractiveObjectInput = z.infer<typeof updateInteractiveObjectSchema>;
