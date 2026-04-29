"use client";

// Store da conversa ativa com NPC (modo SCRIPTED). In-memory — uma
// conversa por vez no painel do GM, não persiste. Modos AI/HYBRID
// (CLAUDE.md §6.3) virão quando o backend Gemini subir.

import { create } from "zustand";

/** Linha do log da conversa em curso. */
export interface ConversationLine {
  /** "npc" = fala do personagem; "player" = opção escolhida pelo jogador. */
  speaker: "npc" | "player";
  text: string;
  /** Timestamp ISO — pra ordenação determinística. */
  at: string;
}

interface NpcConversationState {
  /** ID do personagem que está conversando. Null = modal fechado. */
  activeNpcId: string | null;
  /** Histórico da conversa atual (saudação + escolhas + respostas). */
  log: ConversationLine[];
  /** Quando true, conversa terminou (mostra botão "Encerrar"). */
  finished: boolean;

  /** Abre conversa com um NPC, registrando saudação inicial. */
  open: (npcId: string, greeting?: string) => void;
  /** Jogador escolhe uma branch — registra trigger + response no log. */
  selectBranch: (
    branchId: string,
    trigger: string,
    response: string,
    isFinal?: boolean,
  ) => void;
  /** Encerra a conversa, mostrando despedida (se houver). */
  finish: (farewell?: string) => void;
  /** Fecha o modal e reseta estado. */
  close: () => void;
}

export const useNpcConversationStore = create<NpcConversationState>((set) => ({
  activeNpcId: null,
  log: [],
  finished: false,

  open: (npcId, greeting) => {
    const initialLog: ConversationLine[] = greeting
      ? [{ speaker: "npc", text: greeting, at: new Date().toISOString() }]
      : [];
    set({ activeNpcId: npcId, log: initialLog, finished: false });
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

  close: () => set({ activeNpcId: null, log: [], finished: false }),
}));
