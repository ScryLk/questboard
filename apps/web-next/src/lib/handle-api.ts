// ── HTTP API: Handle do usuário (Name#TAG) ──
//
// Espelha apps/api/src/modules/user/user.routes.ts. Operações:
//  - GET   /users/me/handle      → handle atual + flags de cooldown
//  - PATCH /users/me/username    → muda username (gera novo tag)
//  - POST  /users/me/tag/reroll  → rerola só o tag
//  - GET   /users/search?q=…     → autocomplete por prefixo
//  - GET   /users/by-handle/:u/:t → resolve handle pra userId

import { apiRequest } from "./api-client";

export interface MyHandleDto {
  username: string;
  tag: string;
  handle: string;
  canChangeUsernameAt: string;
  canRerollTagAt: string;
  freeRerollsLeft: number;
}

export interface PublicHandleDto {
  id: string;
  username: string;
  tag: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export function getMyHandle() {
  return apiRequest<MyHandleDto>("/users/me/handle");
}

export function updateUsername(username: string) {
  return apiRequest<MyHandleDto>("/users/me/username", {
    method: "PATCH",
    body: { username },
  });
}

export function rerollTag() {
  return apiRequest<MyHandleDto>("/users/me/tag/reroll", { method: "POST" });
}

export function searchByHandle(q: string, limit?: number) {
  const params = new URLSearchParams({ q });
  if (limit) params.set("limit", String(limit));
  return apiRequest<PublicHandleDto[]>(`/users/search?${params.toString()}`);
}

export function resolveHandle(username: string, tag: string) {
  return apiRequest<PublicHandleDto>(
    `/users/by-handle/${encodeURIComponent(username)}/${encodeURIComponent(tag)}`,
  );
}
