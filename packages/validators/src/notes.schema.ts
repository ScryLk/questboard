// ── Notas de campanha ──
//
// Frontend mantém `isGmOnly` boolean; backend mapeia pra
// NoteVisibility ("GM_ONLY" | "PUBLIC"). Categorias são exatas as do
// enum NoteCategory.

import { z } from "zod";

export const NOTE_CATEGORIES = [
  "PLOT",
  "ITEM",
  "NPC",
  "GENERAL",
  "LOCATION",
] as const;

export const NOTE_VISIBILITIES = ["PUBLIC", "GM_ONLY", "PRIVATE"] as const;

export const noteCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(0).max(20_000),
  category: z.enum(NOTE_CATEGORIES).default("GENERAL"),
  visibility: z.enum(NOTE_VISIBILITIES).default("GM_ONLY"),
});

export const noteUpdateSchema = noteCreateSchema.partial();

export type NoteCreate = z.infer<typeof noteCreateSchema>;
export type NoteUpdate = z.infer<typeof noteUpdateSchema>;

// Helpers pro client mapear `isGmOnly` <-> `visibility`.
export function isGmOnlyToVisibility(
  isGmOnly: boolean,
): (typeof NOTE_VISIBILITIES)[number] {
  return isGmOnly ? "GM_ONLY" : "PUBLIC";
}

export function visibilityToIsGmOnly(
  visibility: (typeof NOTE_VISIBILITIES)[number],
): boolean {
  return visibility !== "PUBLIC";
}
