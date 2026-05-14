// ── HTTP API: Players de uma sessão ──
//
// `joinSession` cria SessionPlayer no backend a partir do inviteCode.
// `listPlayers` lê a lista atual da sessão.

import { apiRequest } from "./api-client";
import { isApiError } from "./api-client";

export interface SessionPlayerDto {
  userId: string;
  role: "GM" | "CO_GM" | "PLAYER" | "SPECTATOR";
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface JoinResult {
  sessionId: string;
  /** True quando o backend recusou com 409 "já está na sessão" — UX
   *  trata como sucesso pra cobrir o caso GM testando em duas abas. */
  alreadyMember: boolean;
}

/** Junta-se a uma sessão via inviteCode. Backend cria SessionPlayer
 *  e dispara socket `session:player-joined`. Aceita 409 como sucesso
 *  (já é membro). */
export async function joinSessionByCode(inviteCode: string): Promise<JoinResult> {
  try {
    // /sessions/:id/join — controller na verdade usa inviteCode do body
    // e ignora o param. Passamos "join" como placeholder.
    const result = await apiRequest<{ sessionId: string }>(
      `/sessions/join/join`,
      { method: "POST", body: { inviteCode } },
    );
    return { sessionId: result.sessionId, alreadyMember: false };
  } catch (err) {
    if (isApiError(err) && err.statusCode === 409) {
      // Já é membro — resolver o sessionId via lookup by code.
      const session = await apiRequest<{ id: string }>(
        `/sessions/by-code/${encodeURIComponent(inviteCode)}`,
      );
      return { sessionId: session.id, alreadyMember: true };
    }
    throw err;
  }
}

export function listSessionPlayers(sessionId: string) {
  return apiRequest<SessionPlayerDto[]>(`/sessions/${sessionId}/players`);
}
