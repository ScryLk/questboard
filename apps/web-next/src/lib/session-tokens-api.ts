// ── HTTP API: Tokens da mapa ativa de uma sessão ──
//
// Endpoint: GET /sessions/:sid/maps/:mid/tokens (backend list)
// Helper aqui combina: descobrir map ativo via /sessions/:sid/maps,
// e listar tokens.

import { apiRequest } from "./api-client";
import { useGameplayStore } from "./gameplay-store";

export interface MapLite {
  id: string;
  name: string;
  isActive: boolean;
  width: number;
  height: number;
  gridSize: number;
  gridCols: number;
  gridRows: number;
  // Assets visuais — vêm preenchidos pelo `prisma.map.findMany` sem
  // `select`, então a list endpoint já entrega isso sem alteração no
  // backend. Player/GM bridges propagam pro gameplay-store.
  imageUrl: string | null;
  backgroundImage: string | null;
  gridOffsetX?: number;
  gridOffsetY?: number;
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

/** Patch parcial. Atualiza ownerId, label, x/y, HP, etc. Backend
 *  emite socket `token:updated` pra todos da sala. */
export function updateToken(
  sessionId: string,
  mapId: string,
  tokenId: string,
  changes: Partial<{
    ownerId: string | null;
    label: string;
    x: number;
    y: number;
    currentHp: number;
    maxHp: number;
    ac: number;
    isHidden: boolean;
  }>,
) {
  return apiRequest<TokenDto>(
    `/sessions/${sessionId}/maps/${mapId}/tokens/${tokenId}`,
    { method: "PATCH", body: changes },
  );
}

/**
 * Fire-and-forget: persiste posição de token no backend lendo sessionId
 * e mapId direto do gameplay-store. No-op se algum dos dois faltar
 * (modo offline/dev sem backend). Use em qualquer caminho onde o GM
 * mexe em token.x/token.y localmente — o backend emite token:updated
 * pra player view sincronizar.
 */
export function persistTokenMove(
  tokenId: string,
  x: number,
  y: number,
): void {
  const { sessionId, activeMapId } = useGameplayStore.getState();
  if (!sessionId || !activeMapId) return;
  void updateToken(sessionId, activeMapId, tokenId, { x, y }).catch((err) => {
    console.warn("[persistTokenMove] PATCH falhou:", err);
  });
}
