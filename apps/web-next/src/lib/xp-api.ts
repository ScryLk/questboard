// ── HTTP API: XP awards ──────────────────────────────────
//
// Espelha apps/api/src/modules/character/xp.* routes.

import { apiRequest } from "./api-client";
import type {
  BulkSessionAwardInput,
  SingleCharacterAwardInput,
  XpAwardHistoryItem,
  XpAwardResult,
} from "@questboard/validators";

/** Bulk: GM dá XP no encerrar sessão pra todos os personagens. */
export function awardSessionXp(
  sessionId: string,
  input: BulkSessionAwardInput,
) {
  return apiRequest<XpAwardResult[]>(`/sessions/${sessionId}/xp`, {
    method: "POST",
    body: input,
  });
}

/** Single: ajuste manual num personagem (pode ser negativo). */
export function awardCharacterXp(
  characterId: string,
  input: SingleCharacterAwardInput,
) {
  return apiRequest<XpAwardResult>(`/characters/${characterId}/xp`, {
    method: "POST",
    body: input,
  });
}

/** Histórico do personagem (mais recente primeiro, max 100). */
export function getCharacterXpHistory(
  characterId: string,
  limit?: number,
) {
  const params = limit ? `?limit=${limit}` : "";
  return apiRequest<XpAwardHistoryItem[]>(
    `/characters/${characterId}/xp-history${params}`,
  );
}
