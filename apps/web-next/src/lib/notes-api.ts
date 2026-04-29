// ── HTTP API: notas de campanha ──
//
// Espelha apps/api/src/modules/notes/notes.routes.ts. Mapeia o
// `isGmOnly: boolean` do frontend pro `visibility: "GM_ONLY" |
// "PUBLIC"` do backend.

import { apiRequest } from "./api-client";

export type NoteCategoryDto =
  | "PLOT"
  | "ITEM"
  | "NPC"
  | "GENERAL"
  | "LOCATION";

export type NoteVisibilityDto = "PUBLIC" | "GM_ONLY" | "PRIVATE";

export interface NoteDto {
  id: string;
  campaignId: string;
  authorId: string;
  title: string;
  content: string;
  category: NoteCategoryDto;
  visibility: NoteVisibilityDto;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  category?: NoteCategoryDto;
  visibility?: NoteVisibilityDto;
}

export function listNotes(campaignId: string) {
  return apiRequest<NoteDto[]>(`/campaigns/${campaignId}/notes`);
}

export function createNote(campaignId: string, input: CreateNoteInput) {
  return apiRequest<NoteDto>(`/campaigns/${campaignId}/notes`, {
    method: "POST",
    body: input,
  });
}

export function getNote(noteId: string) {
  return apiRequest<NoteDto>(`/notes/${noteId}`);
}

export function updateNote(noteId: string, input: Partial<CreateNoteInput>) {
  return apiRequest<NoteDto>(`/notes/${noteId}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteNote(noteId: string) {
  return apiRequest<void>(`/notes/${noteId}`, { method: "DELETE" });
}

// ── Mapping helpers ──────────────────────────────────────

const CATEGORY_TO_DTO: Record<string, NoteCategoryDto> = {
  plot: "PLOT",
  item: "ITEM",
  npc: "NPC",
  general: "GENERAL",
  location: "LOCATION",
};

const CATEGORY_FROM_DTO: Record<NoteCategoryDto, string> = {
  PLOT: "plot",
  ITEM: "item",
  NPC: "npc",
  GENERAL: "general",
  LOCATION: "location",
};

export function categoryToDto(category: string): NoteCategoryDto {
  return CATEGORY_TO_DTO[category] ?? "GENERAL";
}

export function categoryFromDto(dto: NoteCategoryDto): string {
  return CATEGORY_FROM_DTO[dto];
}

export function isGmOnlyToVisibility(isGmOnly: boolean): NoteVisibilityDto {
  return isGmOnly ? "GM_ONLY" : "PUBLIC";
}

export function visibilityToIsGmOnly(visibility: NoteVisibilityDto): boolean {
  return visibility !== "PUBLIC";
}
