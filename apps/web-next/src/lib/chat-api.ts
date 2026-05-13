// ── HTTP API: Chat ────────────────────────────────────────────
//
// Espelha apps/api/src/modules/chat/chat.routes.ts.
// Chat é session-scoped no backend. /chat global usa o helper
// `getRecentSessionOfCampaign` pra resolver qual sessão consumir.

import { apiRequest } from "./api-client";

export type ChatChannel = "GENERAL" | "IN_CHARACTER" | "WHISPER" | "GM_ONLY" | "GROUP";
export type MessageContentType =
  | "TEXT"
  | "DICE_ROLL"
  | "SYSTEM"
  | "MEDIA"
  | "NARRATIVE"
  | "HANDOUT"
  | "DICE_REQUEST";

export interface MessageAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  channel: ChatChannel;
  contentType: MessageContentType;
  content: string;
  characterName: string | null;
  characterAvatar: string | null;
  recipientIds: string[];
  createdAt: string;
  user: MessageAuthor;
}

export interface RecentSessionDto {
  id: string;
  name: string;
  status: "IDLE" | "LOBBY" | "LIVE" | "PAUSED" | "ENDED" | "CANCELLED";
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

export function getRecentSession(campaignId: string) {
  return apiRequest<RecentSessionDto>(`/campaigns/${campaignId}/recent-session`);
}

export function listMessages(
  sessionId: string,
  opts: { channel?: ChatChannel; cursor?: string; limit?: number } = {},
) {
  const params = new URLSearchParams();
  if (opts.channel) params.set("channel", opts.channel);
  if (opts.cursor) params.set("cursor", opts.cursor);
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<{ messages: ChatMessage[]; nextCursor: string | null }>(
    `/sessions/${sessionId}/messages${qs}`,
  );
}

export function sendMessage(
  sessionId: string,
  input: {
    content: string;
    channel?: ChatChannel;
    characterId?: string;
    characterName?: string;
    contentType?: MessageContentType;
  },
) {
  return apiRequest<ChatMessage>(`/sessions/${sessionId}/messages`, {
    method: "POST",
    body: input,
  });
}

export function deleteMessage(sessionId: string, messageId: string) {
  return apiRequest<void>(`/sessions/${sessionId}/messages/${messageId}`, {
    method: "DELETE",
  });
}
