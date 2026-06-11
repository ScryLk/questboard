// ── HTTP API: lifecycle de sessão ──
//
// Espelha apps/api/src/modules/sessions/sessions.routes.ts (state
// transitions). Apenas GM titular pode chamar (validado no backend
// via `requireGmOwner`).

import { apiRequest } from "./api-client";

export interface SessionLifecycleResult {
  id: string;
  status: "IDLE" | "LOBBY" | "LIVE" | "PAUSED" | "ENDED" | "ARCHIVED";
  endedAt?: string | null;
  startedAt?: string | null;
}

export function endSession(sessionId: string) {
  return apiRequest<SessionLifecycleResult>(`/sessions/${sessionId}/end`, {
    method: "POST",
  });
}

export function startSession(sessionId: string) {
  return apiRequest<SessionLifecycleResult>(`/sessions/${sessionId}/start`, {
    method: "POST",
  });
}

export function pauseSession(sessionId: string) {
  return apiRequest<SessionLifecycleResult>(`/sessions/${sessionId}/pause`, {
    method: "POST",
  });
}

export function resumeSession(sessionId: string) {
  return apiRequest<SessionLifecycleResult>(`/sessions/${sessionId}/resume`, {
    method: "POST",
  });
}
