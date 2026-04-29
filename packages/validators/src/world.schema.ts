// ── Mundo: NPCs, locais, facções, lore ──
//
// Discriminator único `kind`. UI agrupa em tabs no frontend; backend
// trata como entidade unificada com campos opcionais condicionais
// (location, disposition só fazem sentido em NPC e FACTION).

import { z } from "zod";

export const WORLD_ENTITY_KINDS = [
  "NPC",
  "LOCATION",
  "FACTION",
  "LORE",
] as const;

export const WORLD_DISPOSITIONS = [
  "FRIENDLY",
  "NEUTRAL",
  "HOSTILE",
  "UNKNOWN",
] as const;

export const worldEntityCreateSchema = z.object({
  kind: z.enum(WORLD_ENTITY_KINDS),
  name: z.string().min(1).max(150),
  subtitle: z.string().max(200).optional(),
  description: z.string().min(0).max(10_000),
  location: z.string().max(200).optional(),
  disposition: z.enum(WORLD_DISPOSITIONS).optional(),
  notes: z.string().max(10_000).optional(),
  /** Vínculo opcional com um Character existente (kind=NPC). */
  characterId: z.string().min(1).optional(),
});

export const worldEntityUpdateSchema = worldEntityCreateSchema
  .omit({ kind: true })
  .partial();

export const worldEntityListQuerySchema = z.object({
  kind: z.enum(WORLD_ENTITY_KINDS).optional(),
});

export type WorldEntityCreate = z.infer<typeof worldEntityCreateSchema>;
export type WorldEntityUpdate = z.infer<typeof worldEntityUpdateSchema>;
export type WorldEntityListQuery = z.infer<typeof worldEntityListQuerySchema>;
