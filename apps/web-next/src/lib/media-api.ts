// ── HTTP API: broadcast de mídia ──
//
// Espelha apps/api/src/modules/media/media.routes.ts. GM mostra/oculta
// vídeo pra todos os jogadores da sessão.

import { apiRequest } from "./api-client";

export type MediaProvider = "youtube" | "vimeo" | "mp4" | "unknown";

export interface ActiveMediaDto {
  provider: MediaProvider;
  embedUrl: string;
  originalUrl: string;
  title?: string;
  startedAt: string;
  by: string;
}

export function getActiveMedia(sessionId: string) {
  return apiRequest<ActiveMediaDto | null>(`/sessions/${sessionId}/media`);
}

export function showMedia(
  sessionId: string,
  input: { url: string; title?: string },
) {
  return apiRequest<ActiveMediaDto>(`/sessions/${sessionId}/media`, {
    method: "POST",
    body: input,
  });
}

export function hideMedia(sessionId: string) {
  return apiRequest<void>(`/sessions/${sessionId}/media`, { method: "DELETE" });
}
