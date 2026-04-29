"use client";

// Store da conversa ativa com NPC (modo SCRIPTED). In-memory — uma
// conversa por vez no painel do GM, não persiste localmente.
//
// Funciona em dois modos:
//   - "local"   (default): tudo client-side, útil em dev offline.
//   - "backend" : abre conversa via REST e escuta `npc:*` Socket.IO.
//                  Persiste em apps/api e sincroniza entre players.
//
// Modos AI/HYBRID (CLAUDE.md §6.3) ficam pra Sprint 6 (Gemini).

import { create } from "zustand";
import {
  finishConversation as apiFinish,
  gmOverrideMessage as apiGmOverride,
  openConversation as apiOpen,
  sendConversationMessage as apiSendMessage,
  type ConversationMessageDto,
} from "./npc-api";

export type ConversationMode = "local" | "backend";

/** Linha do log da conversa em curso. */
export interface ConversationLine {
  /** "npc" = fala do personagem; "player" = opção escolhida pelo
   *  jogador; "gm" = override digitado pelo GM. */
  speaker: "npc" | "player" | "gm";
  text: string;
  /** Timestamp ISO — pra ordenação determinística. */
  at: string;
}

interface NpcConversationState {
  mode: ConversationMode;
  /** ID do personagem que está conversando. Null = modal fechado. */
  activeNpcId: string | null;
  /** ID da Conversation no backend (apenas modo "backend"). */
  conversationId: string | null;
  /** ID da sessão (apenas modo "backend"). Null em local. */
  sessionId: string | null;
  /** Histórico da conversa atual (saudação + escolhas + respostas). */
  log: ConversationLine[];
  /** Quando true, conversa terminou (mostra botão "Encerrar"). */
  finished: boolean;
  /** Operação em andamento (REST/Socket) — desabilita botões. */
  pending: boolean;
  /** Última mensagem de erro (legível, em pt-BR). */
  errorMessage: string | null;

  // ── Local mode ─────────────────────────────────
  open: (npcId: string, greeting?: string) => void;
  selectBranch: (
    branchId: string,
    trigger: string,
    response: string,
    isFinal?: boolean,
  ) => void;
  finish: (farewell?: string) => void;

  // ── Backend mode ───────────────────────────────
  /** Abre conversa via REST. Frontend nem precisa montar saudação —
   *  backend devolve ConversationDto com `messages[]` já populado. */
  openBackend: (sessionId: string, npcId: string) => Promise<void>;
  /** Player escolhe branch via REST; backend persiste e broadcast. */
  selectBranchBackend: (branchId: string) => Promise<void>;
  /** GM digita override; backend valida role e broadcast. */
  gmOverrideBackend: (text: string) => Promise<void>;
  /** Encerra a conversa via REST. */
  finishBackend: () => Promise<void>;
  /** Aplica payload de Socket.IO `npc:message` (chamado pelo bridge). */
  applyServerMessage: (msg: ConversationMessageDto, finished: boolean) => void;

  // ── Comum ─────────────────────────────────────
  close: () => void;
}

function speakerToLine(s: ConversationMessageDto["speaker"]): ConversationLine["speaker"] {
  if (s === "PLAYER") return "player";
  if (s === "GM_OVERRIDE") return "gm";
  return "npc";
}

export const useNpcConversationStore = create<NpcConversationState>(
  (set, get) => ({
    mode: "local",
    activeNpcId: null,
    conversationId: null,
    sessionId: null,
    log: [],
    finished: false,
    pending: false,
    errorMessage: null,

    // ── Local mode ─────────────────────────────────

    open: (npcId, greeting) => {
      const initialLog: ConversationLine[] = greeting
        ? [{ speaker: "npc", text: greeting, at: new Date().toISOString() }]
        : [];
      set({
        mode: "local",
        activeNpcId: npcId,
        conversationId: null,
        sessionId: null,
        log: initialLog,
        finished: false,
        pending: false,
        errorMessage: null,
      });
    },

    selectBranch: (_branchId, trigger, response, isFinal) =>
      set((s) => {
        const now = Date.now();
        return {
          log: [
            ...s.log,
            { speaker: "player", text: trigger, at: new Date(now).toISOString() },
            {
              speaker: "npc",
              text: response,
              at: new Date(now + 1).toISOString(),
            },
          ],
          finished: Boolean(isFinal),
        };
      }),

    finish: (farewell) =>
      set((s) =>
        farewell
          ? {
              log: [
                ...s.log,
                { speaker: "npc", text: farewell, at: new Date().toISOString() },
              ],
              finished: true,
            }
          : { finished: true },
      ),

    // ── Backend mode ───────────────────────────────

    openBackend: async (sessionId, npcId) => {
      set({
        mode: "backend",
        activeNpcId: npcId,
        sessionId,
        log: [],
        finished: false,
        pending: true,
        errorMessage: null,
      });
      try {
        const conv = await apiOpen(sessionId, { npcId });
        const initialLog: ConversationLine[] =
          conv.messages?.map((m) => ({
            speaker: speakerToLine(m.speaker),
            text: m.text,
            at: m.createdAt,
          })) ?? [];
        set({
          conversationId: conv.id,
          log: initialLog,
          finished: !conv.isOpen,
          pending: false,
        });
      } catch (err) {
        set({
          pending: false,
          errorMessage:
            (err as { message?: string }).message ??
            "Erro ao abrir conversa.",
        });
      }
    },

    selectBranchBackend: async (branchId) => {
      const cId = get().conversationId;
      if (!cId) return;
      set({ pending: true, errorMessage: null });
      try {
        const result = await apiSendMessage(cId, { branchId });
        // O Socket bridge também recebe — applyServerMessage é
        // idempotente por id. Como bridge pode chegar antes/depois,
        // não duplicamos aqui: aplicamos só se ainda não está no log.
        get().applyServerMessage(result.playerMessage, false);
        get().applyServerMessage(result.npcMessage, result.finished);
        set({ pending: false, finished: result.finished });
      } catch (err) {
        set({
          pending: false,
          errorMessage:
            (err as { message?: string }).message ??
            "Erro ao enviar resposta.",
        });
      }
    },

    gmOverrideBackend: async (text) => {
      const cId = get().conversationId;
      if (!cId) return;
      set({ pending: true, errorMessage: null });
      try {
        const msg = await apiGmOverride(cId, text);
        get().applyServerMessage(msg, false);
        set({ pending: false });
      } catch (err) {
        set({
          pending: false,
          errorMessage:
            (err as { message?: string }).message ?? "Erro no override.",
        });
      }
    },

    finishBackend: async () => {
      const cId = get().conversationId;
      if (!cId) return;
      set({ pending: true });
      try {
        await apiFinish(cId);
        set({ finished: true, pending: false });
      } catch (err) {
        set({
          pending: false,
          errorMessage:
            (err as { message?: string }).message ??
            "Erro ao encerrar conversa.",
        });
      }
    },

    applyServerMessage: (msg, finished) =>
      set((s) => {
        // Idempotente: se já temos uma linha com o mesmo timestamp +
        // texto, ignoramos (broadcast pode duplicar com REST optimistic).
        const exists = s.log.some(
          (l) => l.text === msg.text && l.at === msg.createdAt,
        );
        if (exists) return finished !== s.finished ? { finished } : s;
        return {
          log: [
            ...s.log,
            {
              speaker: speakerToLine(msg.speaker),
              text: msg.text,
              at: msg.createdAt,
            },
          ],
          finished,
        };
      }),

    // ── Comum ─────────────────────────────────────

    close: () =>
      set({
        mode: "local",
        activeNpcId: null,
        conversationId: null,
        sessionId: null,
        log: [],
        finished: false,
        pending: false,
        errorMessage: null,
      }),
  }),
);
