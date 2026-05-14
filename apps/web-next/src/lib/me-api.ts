// ── HTTP API: usuário corrente ─────────────────────────────
//
// Wrapper minimalista pra GET /users/me. Frontend usa pra resolver
// o `id` interno do User no DB (diferente do Clerk externalId).

import { apiRequest } from "./api-client";

export interface MeDto {
  id: string;
  externalId: string;
  email: string;
  displayName: string;
  username: string;
  tag: string;
  avatarUrl: string | null;
  role: string;
  plan: string;
}

export function getMe() {
  return apiRequest<MeDto>("/users/me");
}
