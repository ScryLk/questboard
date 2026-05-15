// ── HTTP API: Players de uma sessão ──
//
// `joinSession` cria SessionPlayer no backend a partir do inviteCode.
// `listPlayers` lê a lista atual da sessão.

import { apiRequest } from "./api-client";

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
}

/** Junta-se (ou re-junta-se) a uma sessão via inviteCode. Backend é
 *  idempotente: se já é membro, atualiza characterId e garante Token
 *  na mapa ativa. Dispara sockets `session:player-joined` e
 *  `token:added` quando aplicável. */
export async function joinSessionByCode(
  inviteCode: string,
  characterId?: string,
): Promise<JoinResult> {
  // /sessions/:id/join — controller na verdade usa inviteCode do body
  // e ignora o param. Passamos "join" como placeholder.
  const result = await apiRequest<{ sessionId: string }>(
    `/sessions/join/join`,
    { method: "POST", body: { inviteCode, characterId } },
  );
  return { sessionId: result.sessionId };
}

export function listSessionPlayers(sessionId: string) {
  return apiRequest<SessionPlayerDto[]>(`/sessions/${sessionId}/players`);
}
