// ── Dashboard da campanha ──────────────────────────────────────
//
// Endpoint agregado: GET /campaigns/:id/dashboard
// Permissão: qualquer membro da campanha (GM/CO_GM/PLAYER/SPECTATOR).
//
// Invariantes:
//   - PLAYER         → userCharacter pode ser null (se ainda não criou),
//                      gmPanel SEMPRE null.
//   - GM / CO_GM     → gmPanel preenchido, userCharacter null.
//   - SPECTATOR      → ambos null.

import { z } from "zod";

export const CAMPAIGN_ROLES = ["GM", "CO_GM", "PLAYER", "SPECTATOR"] as const;
export type CampaignRoleDto = (typeof CAMPAIGN_ROLES)[number];

export const recentSessionSchema = z.object({
  id: z.string(),
  /** Ordem cronológica decrescente — primeira sessão = `count`, segunda = `count-1`. */
  number: z.number().int().positive(),
  title: z.string(),
  playedAt: z.string(),
  /** `endedAt - startedAt` em minutos. 0 quando ainda não tem `startedAt`. */
  durationMinutes: z.number().int().nonnegative(),
  /** Mapeado do enum SessionStatus do Prisma. `ENDED` é a "Completa". */
  status: z.enum(["ENDED", "CANCELLED"]),
});

export const dashboardDtoSchema = z.object({
  campaign: z.object({
    id: z.string(),
    name: z.string(),
  }),

  totals: z.object({
    sessions: z.number().int().nonnegative(),
    /** Soma de `endedAt - startedAt` em horas (decimal: 36.5h). */
    hoursPlayed: z.number().nonnegative(),
    /** Média do `level` dos personagens da campanha. null = nenhum. */
    averagePlayerLevel: z.number().nullable(),
  }),

  nextSession: z
    .object({
      id: z.string(),
      title: z.string(),
      scheduledFor: z.string(),
    })
    .nullable(),

  storyProgress: z.object({
    completedEvents: z.number().int().nonnegative(),
    totalEvents: z.number().int().nonnegative(),
    percentage: z.number().min(0).max(100),
  }),

  recentSessions: z.array(recentSessionSchema).max(5),

  userCharacter: z
    .object({
      id: z.string(),
      name: z.string(),
      level: z.number().int().positive(),
      currentXp: z.number().int().nonnegative(),
      xpToNextLevel: z.number().int().nonnegative(),
      /** `null` quando já atingiu o último marco de título. */
      nextRewardLevel: z.number().int().positive().nullable(),
      /** `null` quando `nextRewardLevel` é null. */
      nextRewardTitle: z.string().nullable(),
    })
    .nullable(),

  gmPanel: z
    .object({
      sessionsHosted: z.number().int().nonnegative(),
      npcsCreated: z.number().int().nonnegative(),
      mapsUsed: z.number().int().nonnegative(),
    })
    .nullable(),

  viewerRole: z.enum(CAMPAIGN_ROLES),
});

export type DashboardDto = z.infer<typeof dashboardDtoSchema>;
export type RecentSessionDto = z.infer<typeof recentSessionSchema>;
