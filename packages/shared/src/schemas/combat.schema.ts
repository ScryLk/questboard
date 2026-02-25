import { z } from "zod";

export const initiativeEntrySchema = z.object({
  type: z.enum(["player", "npc", "lair"]),
  name: z.string().min(1).max(100),
  userId: z.string().optional(),
  characterId: z.string().optional(),
  initiative: z.number(),
  dexModifier: z.number().default(0),
  hp: z.object({
    current: z.number().int(),
    max: z.number().int().min(1),
  }),
  conditions: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
  color: z.string().optional().nullable(),
});

export const startCombatSchema = z.object({
  entries: z.array(initiativeEntrySchema).min(1),
});

export const updateHpSchema = z.object({
  entryId: z.string().min(1),
  delta: z.number().int(),
});

export const setConditionSchema = z.object({
  entryId: z.string().min(1),
  conditions: z.array(z.string()),
});

export type InitiativeEntryInput = z.infer<typeof initiativeEntrySchema>;
export type StartCombatInput = z.infer<typeof startCombatSchema>;
