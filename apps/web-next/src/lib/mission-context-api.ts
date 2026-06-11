// ── HTTP API: contexto/briefing da missão ──
//
// Espelha apps/api/src/modules/sessions (rotas /sessions/:id/mission-
// context). Texto vive em `Session.settings.missionContext` no backend,
// mas o cliente lida só com `{ content }` pra simplificar.
//
// Leitura: qualquer participante. Escrita: GM/CO_GM.

import { apiRequest } from "./api-client";

export interface MissionContextDto {
  content: string;
  /** ISO string. Presente no PATCH; ausente no GET (não usamos hoje). */
  updatedAt?: string;
}

export function getMissionContext(sessionId: string) {
  return apiRequest<MissionContextDto>(
    `/sessions/${sessionId}/mission-context`,
  );
}

export function setMissionContext(sessionId: string, content: string) {
  return apiRequest<MissionContextDto>(
    `/sessions/${sessionId}/mission-context`,
    { method: "PATCH", body: { content } },
  );
}
