// ── HTTP API: entidades do Mundo ──
//
// Espelha apps/api/src/modules/world/world.routes.ts.

import { apiRequest } from "./api-client";

export type WorldEntityKindDto = "NPC" | "LOCATION" | "FACTION" | "LORE";
export type WorldDispositionDto =
  | "FRIENDLY"
  | "NEUTRAL"
  | "HOSTILE"
  | "UNKNOWN";

export interface WorldEntityDto {
  id: string;
  campaignId: string;
  authorId: string;
  kind: WorldEntityKindDto;
  name: string;
  subtitle: string | null;
  description: string;
  location: string | null;
  disposition: WorldDispositionDto | null;
  /** Privado pro GM. Backend já filtra pra não-GMs (só GM vê). */
  notes?: string | null;
  characterId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorldEntityInput {
  kind: WorldEntityKindDto;
  name: string;
  description: string;
  subtitle?: string;
  location?: string;
  disposition?: WorldDispositionDto;
  notes?: string;
  characterId?: string;
}

export function listWorldEntities(
  campaignId: string,
  query: { kind?: WorldEntityKindDto } = {},
) {
  const qs = query.kind ? `?kind=${query.kind}` : "";
  return apiRequest<WorldEntityDto[]>(
    `/campaigns/${campaignId}/world${qs}`,
  );
}

export function createWorldEntity(
  campaignId: string,
  input: CreateWorldEntityInput,
) {
  return apiRequest<WorldEntityDto>(`/campaigns/${campaignId}/world`, {
    method: "POST",
    body: input,
  });
}

export function getWorldEntity(id: string) {
  return apiRequest<WorldEntityDto>(`/world/${id}`);
}

export function updateWorldEntity(
  id: string,
  input: Partial<Omit<CreateWorldEntityInput, "kind">>,
) {
  return apiRequest<WorldEntityDto>(`/world/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteWorldEntity(id: string) {
  return apiRequest<void>(`/world/${id}`, { method: "DELETE" });
}

export function linkCharacterToEntity(
  id: string,
  characterId: string | null,
) {
  return apiRequest<WorldEntityDto>(`/world/${id}/link-character`, {
    method: "POST",
    body: { characterId },
  });
}

// ── Mapping helpers (frontend usa kind lowercase) ────────

const KIND_TO_DTO: Record<string, WorldEntityKindDto> = {
  npc: "NPC",
  location: "LOCATION",
  faction: "FACTION",
  lore: "LORE",
};

const KIND_FROM_DTO: Record<WorldEntityKindDto, string> = {
  NPC: "npc",
  LOCATION: "location",
  FACTION: "faction",
  LORE: "lore",
};

const DISPO_TO_DTO: Record<string, WorldDispositionDto> = {
  friendly: "FRIENDLY",
  neutral: "NEUTRAL",
  hostile: "HOSTILE",
  unknown: "UNKNOWN",
};

const DISPO_FROM_DTO: Record<WorldDispositionDto, string> = {
  FRIENDLY: "friendly",
  NEUTRAL: "neutral",
  HOSTILE: "hostile",
  UNKNOWN: "unknown",
};

export function kindToDto(k: string): WorldEntityKindDto {
  return KIND_TO_DTO[k] ?? "NPC";
}
export function kindFromDto(k: WorldEntityKindDto): string {
  return KIND_FROM_DTO[k];
}
export function dispoToDto(d: string | undefined): WorldDispositionDto | undefined {
  if (!d) return undefined;
  return DISPO_TO_DTO[d];
}
export function dispoFromDto(
  d: WorldDispositionDto | null,
): string | undefined {
  if (!d) return undefined;
  return DISPO_FROM_DTO[d];
}
