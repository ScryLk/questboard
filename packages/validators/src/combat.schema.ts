import { z } from "zod";
import { COMBAT_CONDITION_IDS } from "@questboard/constants";

// ── Primitivos ──

export const combatAlignmentSchema = z.enum([
  "player",
  "hostile",
  "neutral",
  "ally",
] as const);

export const combatConditionIdSchema = z.enum(COMBAT_CONDITION_IDS);

export const combatTurnTimerSchema = z.union([
  z.literal(0),
  z.literal(60),
  z.literal(90),
]);

// ── Entidades ──

export const combatConditionSchema = z.object({
  conditionId: combatConditionIdSchema,
  customLabel: z.string().min(1).max(40).optional(),
  appliedAt: z.number().int().positive(),
  durationRounds: z.number().int().positive().nullable(),
  appliedByUserId: z.string().cuid(),
});

export const combatParticipantSchema = z.object({
  tokenId: z.string().min(1),
  name: z.string().min(1).max(80),
  avatarUrl: z.string().url().nullable(),
  initiative: z.number().int(),
  initiativeModifier: z.number().int().default(0),
  hpCurrent: z.number().int(),
  hpMax: z.number().int().positive(),
  hpTemp: z.number().int().min(0).default(0),
  armorClass: z.number().int().nullable(),
  alignment: combatAlignmentSchema,
  conditions: z.array(combatConditionSchema).default([]),
  isDead: z.boolean().default(false),
  hasActed: z.boolean().default(false),
});

export const combatConfigSchema = z.object({
  showEnemyHp: z.boolean().default(false),
  turnTimerSec: combatTurnTimerSchema.default(0),
});

export const combatStateSchema = z.object({
  sessionId: z.string().cuid(),
  isActive: z.boolean(),
  round: z.number().int().positive(),
  currentIndex: z.number().int().min(0),
  participants: z.array(combatParticipantSchema),
  config: combatConfigSchema,
  startedAt: z.number().int().positive().nullable(),
  turnStartedAt: z.number().int().positive().nullable(),
});

// ── Inputs de eventos (cliente → servidor) ──

const sessionIdSchema = z.string().cuid();

export const combatStartSchema = z.object({
  sessionId: sessionIdSchema,
  participantTokenIds: z.array(z.string().min(1)),
});

export const combatEndSchema = z.object({ sessionId: sessionIdSchema });

export const combatNextTurnSchema = z.object({ sessionId: sessionIdSchema });

export const combatPreviousTurnSchema = z.object({ sessionId: sessionIdSchema });

export const combatRollAllInitiativeSchema = z.object({
  sessionId: sessionIdSchema,
});

export const combatRollInitiativeSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
});

export const combatSetInitiativeSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  value: z.number().int(),
});

export const combatReorderInitiativeSchema = z.object({
  sessionId: sessionIdSchema,
  tokenIds: z.array(z.string().min(1)).min(1),
});

export const combatAddParticipantSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  initiative: z.number().int().optional(),
});

export const combatRemoveParticipantSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
});

export const combatAddConditionSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  conditionId: combatConditionIdSchema,
  customLabel: z.string().min(1).max(40).optional(),
  durationRounds: z.number().int().positive().optional(),
});

export const combatRemoveConditionSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  conditionId: combatConditionIdSchema,
});

export const combatSkipTurnSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
});

export const combatUpdateConfigSchema = z.object({
  sessionId: sessionIdSchema,
  showEnemyHp: z.boolean().optional(),
  turnTimerSec: combatTurnTimerSchema.optional(),
});

export const combatPassTurnSchema = z.object({ sessionId: sessionIdSchema });

// ── Fatia 3A — novos intents ──

export const combatDuplicateParticipantSchema = z.object({
  sessionId: sessionIdSchema,
  sourceTokenId: z.string().min(1),
  // Nome computado no cliente para evitar corrida em duplicações rápidas.
  // Servidor pode reconciliar se colidir.
  autoName: z.string().min(1).max(80),
});

export const combatMarkActedSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  hasActed: z.boolean(),
});

export const combatConditionUpdatedSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  conditionId: combatConditionIdSchema,
  durationRounds: z.number().int().positive().nullable(),
});

// HP-changed extendido — aceita delta, absolute ou hpTemp. Variants
// mutuamente exclusivas; superRefine garante exatamente um campo.
export const combatHpChangeSchema = z
  .object({
    sessionId: sessionIdSchema,
    tokenId: z.string().min(1),
    delta: z.number().int().optional(),
    absolute: z.number().int().min(0).optional(),
    hpTemp: z.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const fields = [data.delta, data.absolute, data.hpTemp].filter(
      (v) => v !== undefined,
    );
    if (fields.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Forneça exatamente um de: delta, absolute, hpTemp.",
      });
    }
  });

// ── Payloads de eventos (servidor → cliente) ──

export const combatStartedPayloadSchema = z.object({
  combat: combatStateSchema,
});

export const combatEndedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
});

export const combatTurnChangedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  round: z.number().int().positive(),
  currentIndex: z.number().int().min(0),
  currentTokenId: z.string().min(1),
});

export const combatInitiativeChangedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  value: z.number().int(),
});

export const combatReorderedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  order: z.array(z.string().min(1)).min(1),
});

export const combatParticipantAddedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  participant: combatParticipantSchema,
});

export const combatParticipantRemovedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
});

export const combatConditionAddedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  condition: combatConditionSchema,
});

export const combatConditionRemovedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  conditionId: combatConditionIdSchema,
});

export const combatConfigChangedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  config: combatConfigSchema,
});

export const combatHpChangedPayloadSchema = z.object({
  sessionId: sessionIdSchema,
  tokenId: z.string().min(1),
  hpCurrent: z.number().int(),
  hpTemp: z.number().int().min(0).optional(),
});

// ── Tipos inferidos ──

export type CombatStartInput = z.infer<typeof combatStartSchema>;
export type CombatEndInput = z.infer<typeof combatEndSchema>;
export type CombatNextTurnInput = z.infer<typeof combatNextTurnSchema>;
export type CombatPreviousTurnInput = z.infer<typeof combatPreviousTurnSchema>;
export type CombatRollAllInitiativeInput = z.infer<typeof combatRollAllInitiativeSchema>;
export type CombatRollInitiativeInput = z.infer<typeof combatRollInitiativeSchema>;
export type CombatSetInitiativeInput = z.infer<typeof combatSetInitiativeSchema>;
export type CombatReorderInitiativeInput = z.infer<typeof combatReorderInitiativeSchema>;
export type CombatAddParticipantInput = z.infer<typeof combatAddParticipantSchema>;
export type CombatRemoveParticipantInput = z.infer<typeof combatRemoveParticipantSchema>;
export type CombatAddConditionInput = z.infer<typeof combatAddConditionSchema>;
export type CombatRemoveConditionInput = z.infer<typeof combatRemoveConditionSchema>;
export type CombatSkipTurnInput = z.infer<typeof combatSkipTurnSchema>;
export type CombatUpdateConfigInput = z.infer<typeof combatUpdateConfigSchema>;
export type CombatPassTurnInput = z.infer<typeof combatPassTurnSchema>;
export type CombatDuplicateParticipantInput = z.infer<typeof combatDuplicateParticipantSchema>;
export type CombatMarkActedInput = z.infer<typeof combatMarkActedSchema>;
export type CombatConditionUpdatedInput = z.infer<typeof combatConditionUpdatedSchema>;
export type CombatHpChangeInput = z.infer<typeof combatHpChangeSchema>;
