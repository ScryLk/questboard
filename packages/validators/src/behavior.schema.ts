// ── Comportamento de NPCs (CLAUDE.md §6.2) ──
//
// Behaviors são acionados pelo GM em uma sessão ativa. O backend
// roda um tick loop que move os tokens conforme o tipo (multidão,
// fuga, patrulha, etc) e emite eventos via Socket.IO.

import { z } from "zod";

export const NPC_BEHAVIOR_TYPES = [
  "IDLE",
  "CROWD",
  "PATROL",
  "GUARD",
  "FLEE",
  "PANIC",
  "RIOT",
  "FOLLOW",
  "SEARCH",
] as const;

export const BEHAVIOR_STATUSES = ["ACTIVE", "PAUSED", "FINISHED"] as const;

/** Parâmetros narrativos por tipo. Schema flexível — cada tipo
 *  consume os campos relevantes; demais ficam ignorados. */
const behaviorParamsSchema = z
  .object({
    /** PATROL/GUARD: lista de pontos {x, y} no grid. */
    waypoints: z
      .array(z.object({ x: z.number(), y: z.number() }))
      .optional(),
    /** GUARD: raio de alerta em células. */
    alertRadius: z.number().int().min(0).max(50).optional(),
    /** FLEE/PANIC: alvo de fuga (ponto). Se ausente, fugir do
     *  centro do grupo de PCs (calculado pelo worker). */
    fleeTarget: z.object({ x: z.number(), y: z.number() }).optional(),
    /** FOLLOW: tokenId que está sendo seguido. */
    followTokenId: z.string().optional(),
    /** SEARCH: ponto de origem da busca. */
    searchOrigin: z.object({ x: z.number(), y: z.number() }).optional(),
    /** SEARCH: raio máximo de busca em células. */
    searchRadius: z.number().int().min(1).max(100).optional(),
    /** Tick rate desejado (ms). Default no worker: 200ms. */
    tickIntervalMs: z.number().int().min(60).max(1000).optional(),
  })
  .passthrough();

export const behaviorStartSchema = z.object({
  type: z.enum(NPC_BEHAVIOR_TYPES),
  /** IDs dos tokens que vão participar. Mínimo 1, máximo 60 pra
   *  evitar overload do tick loop. */
  tokenIds: z.array(z.string().min(1)).min(1).max(60),
  params: behaviorParamsSchema.optional(),
});

export const behaviorUpdateSchema = z.object({
  params: behaviorParamsSchema.optional(),
  status: z.enum(BEHAVIOR_STATUSES).optional(),
});

export type NpcBehaviorType = (typeof NPC_BEHAVIOR_TYPES)[number];
export type BehaviorStatus = (typeof BEHAVIOR_STATUSES)[number];
export type BehaviorStartInput = z.infer<typeof behaviorStartSchema>;
export type BehaviorUpdateInput = z.infer<typeof behaviorUpdateSchema>;
export type BehaviorParams = z.infer<typeof behaviorParamsSchema>;
