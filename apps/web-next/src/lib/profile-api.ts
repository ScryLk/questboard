// ── HTTP API: Profile do usuário ──
//
// Espelha apps/api/src/modules/user/user.routes.ts. Mantém displayName,
// bio, timezone, locale no backend. Avatar é upload separado.

import { apiRequest } from "./api-client";

export interface ProfileDto {
  id: string;
  displayName: string;
  bio: string | null;
  timezone: string;
  locale: string;
  email: string;
  avatarUrl: string | null;
}

export function updateProfile(input: {
  displayName?: string;
  bio?: string;
  timezone?: string;
  locale?: string;
}) {
  return apiRequest<ProfileDto>("/users/me", {
    method: "PATCH",
    body: input,
  });
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<{ avatarUrl: string }>("/users/me/avatar", {
    method: "PUT",
    body: form,
  });
}
