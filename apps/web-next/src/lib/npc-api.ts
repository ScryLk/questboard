// ── HTTP API: NPC dialog (modo SCRIPTED) ──
//
// Espelha apps/api/src/modules/npc/npc.routes.ts. Cada função aqui
// chama um endpoint REST. Não cobre Socket.IO — pra sync em tempo
// real, ver `lib/session-socket.ts` + listeners em `lib/npc-socket-bridge.ts`.

import { apiRequest } from "./api-client";

// ── Branches ─────────────────────────────────────────────

export interface DialogueBranchDto {
  id: string;
  characterId: string;
  trigger: string;
  response: string;
  isFinal: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function listDialogueBranches(characterId: string) {
  return apiRequest<DialogueBranchDto[]>(
    `/characters/${characterId}/dialogue-branches`,
  );
}

export interface CreateDialogueBranchInput {
  trigger: string;
  response: string;
  isFinal?: boolean;
  order?: number;
}

export function createDialogueBranch(
  characterId: string,
  input: CreateDialogueBranchInput,
) {
  return apiRequest<DialogueBranchDto>(
    `/characters/${characterId}/dialogue-branches`,
    { method: "POST", body: input },
  );
}

export function updateDialogueBranch(
  characterId: string,
  branchId: string,
  input: Partial<CreateDialogueBranchInput>,
) {
  return apiRequest<DialogueBranchDto>(
    `/characters/${characterId}/dialogue-branches/${branchId}`,
    { method: "PATCH", body: input },
  );
}

export function deleteDialogueBranch(characterId: string, branchId: string) {
  return apiRequest<void>(
    `/characters/${characterId}/dialogue-branches/${branchId}`,
    { method: "DELETE" },
  );
}

export function reorderDialogueBranches(characterId: string, ids: string[]) {
  return apiRequest<void>(
    `/characters/${characterId}/dialogue-branches/reorder`,
    { method: "PATCH", body: { ids } },
  );
}

// ── Conversations ────────────────────────────────────────

export type ConversationSpeaker = "NPC" | "PLAYER" | "GM_OVERRIDE";
export type NpcDialogueMode = "SCRIPTED" | "AI" | "HYBRID";

export interface ConversationMessageDto {
  id: string;
  conversationId: string;
  speaker: ConversationSpeaker;
  text: string;
  branchId?: string | null;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  sessionId: string | null;
  npcId: string;
  initiatorId: string;
  mode: NpcDialogueMode;
  reputation: number;
  isOpen: boolean;
  startedAt: string;
  endedAt: string | null;
  messages?: ConversationMessageDto[];
  npc?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    dialogueEnabled: boolean;
    dialogueGreeting: string | null;
    dialogueFarewell: string | null;
    dialogueNotes: string | null;
  };
}

export function listConversations(sessionId: string) {
  return apiRequest<ConversationDto[]>(
    `/sessions/${sessionId}/conversations`,
  );
}

export function openConversation(
  sessionId: string,
  input: { npcId: string; mode?: NpcDialogueMode },
) {
  return apiRequest<ConversationDto>(
    `/sessions/${sessionId}/conversations`,
    { method: "POST", body: { mode: "SCRIPTED", ...input } },
  );
}

export function getConversation(conversationId: string) {
  return apiRequest<ConversationDto>(`/conversations/${conversationId}`);
}

export interface SendMessageInput {
  branchId?: string;
  text?: string;
}

export interface SendMessageResult {
  playerMessage: ConversationMessageDto;
  npcMessage: ConversationMessageDto;
  finished: boolean;
}

export function sendConversationMessage(
  conversationId: string,
  input: SendMessageInput,
) {
  return apiRequest<SendMessageResult>(
    `/conversations/${conversationId}/messages`,
    { method: "POST", body: input },
  );
}

export function gmOverrideMessage(conversationId: string, text: string) {
  return apiRequest<ConversationMessageDto>(
    `/conversations/${conversationId}/gm-override`,
    { method: "POST", body: { text } },
  );
}

export function finishConversation(conversationId: string) {
  return apiRequest<ConversationDto>(
    `/conversations/${conversationId}/finish`,
    { method: "PATCH" },
  );
}
