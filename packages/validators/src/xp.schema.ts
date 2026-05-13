// ── XP Award schemas ──────────────────────────────────────────
//
// Três endpoints:
//   1. Bulk session award — GM termina sessão, dá X XP pra party toda
//   2. Single character award — ajuste manual (+/-)
//   3. History — leitura do audit trail
//
// Regras:
//   - delta != 0
//   - reason obrigatório quando delta < 0 (subtração precisa contexto)
//   - amount lump sum sempre >= 0 (subtração só via single)

import { z } from "zod";

const REASON_MIN = 3;
const REASON_MAX = 500;

/** Concede XP pra todos os personagens de uma sessão. Bônus opcional
 *  por personagem (mapa charId → delta extra). */
export const bulkSessionAwardSchema = z
  .object({
    amount: z.number().int().min(0).max(100_000),
    perCharacter: z
      .record(z.string(), z.number().int().min(-100_000).max(100_000))
      .optional(),
    reason: z.string().min(REASON_MIN).max(REASON_MAX).optional(),
  })
  .refine((v) => v.amount > 0 || Object.keys(v.perCharacter ?? {}).length > 0, {
    message: "Pelo menos um valor (amount ou perCharacter) deve ser informado.",
  });

export type BulkSessionAwardInput = z.infer<typeof bulkSessionAwardSchema>;

/** Ajuste manual em um personagem. Pode ser negativo — exige reason. */
export const singleCharacterAwardSchema = z
  .object({
    delta: z.number().int().refine((v) => v !== 0, "Delta não pode ser zero."),
    reason: z.string().max(REASON_MAX).optional(),
  })
  .refine(
    (v) =>
      v.delta >= 0 ||
      (typeof v.reason === "string" && v.reason.trim().length >= REASON_MIN),
    {
      path: ["reason"],
      message: "Subtração de XP exige uma razão (mínimo 3 caracteres).",
    },
  );

export type SingleCharacterAwardInput = z.infer<
  typeof singleCharacterAwardSchema
>;

/** Item do histórico — retornado pela API. */
export interface XpAwardHistoryItem {
  id: string;
  delta: number;
  reason: string | null;
  sessionId: string | null;
  awardedById: string;
  createdAt: string;
}

/** Resposta do award — informa se subiu de nível. */
export interface XpAwardResult {
  characterId: string;
  previousLevel: number;
  newLevel: number;
  previousXp: number;
  newXp: number;
  leveledUp: boolean;
}
