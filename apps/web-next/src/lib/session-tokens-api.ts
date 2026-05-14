// ── HTTP API: Tokens da mapa ativa de uma sessão ──
//
// Endpoint: GET /sessions/:sid/maps/:mid/tokens (backend list)
// Helper aqui combina: descobrir map ativo via /sessions/:sid/maps,
// e listar tokens.

import { apiRequest } from "./api-client";

export interface MapLite {
  id: string;
  name: string;
  isActive: boolean;
  width: number;
  height: number;
  gridSize: number;
  gridCols: number;
  gridRows: number;
}

export interface TokenDto {
  id: string;
  mapId: string;
  characterId: string | null;
  ownerId: string | null;
  label: string | null;
  initials: string | null;
  imageUrl: string | null;
  color: string;
  x: number;
  y: number;
  size: number;
  currentHp: number | null;
  maxHp: number | null;
  ac: number | null;
}

export async function getActiveMap(sessionId: string): Promise<MapLite | null> {
  const maps = await apiRequest<MapLite[]>(`/sessions/${sessionId}/maps`);
  return maps.find((m) => m.isActive) ?? maps[0] ?? null;
}

export function listMapTokens(sessionId: string, mapId: string) {
  return apiRequest<TokenDto[]>(`/sessions/${sessionId}/maps/${mapId}/tokens`);
}
