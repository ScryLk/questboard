"use client";

// Mission context store — texto que o GM mantém pra orientar a mesa
// sobre a missão atual: objetivo, NPCs envolvidos, dicas coletadas,
// próximos passos. Persistido em `Session.settings.missionContext`;
// alterações broadcast via socket pra players verem em tempo real.
//
// Fluxo:
//   1. Layout (gameplay ou player-view) chama `useMissionContextSync`
//      passando o `sessionId`. O hook hidrata o `content` via GET +
//      escuta `session:mission-context-updated` pra refletir mudanças
//      do GM em tempo real (writeProtect: ignora payloads de outras
//      sessões).
//   2. GM edita: `setContent(next)` atualiza local imediato; `save()`
//      é chamado on-blur/on-close pra mandar PATCH. Player nunca
//      chama `save()` (modal abre em readOnly).
//   3. Saída/fechamento da sessão: `reset()` zera estado pra próxima.

import { create } from "zustand";

interface MissionContextState {
  isOpen: boolean;
  /** Texto markdown-lite (linhas + listas simples). Sem renderer rico
   *  no primeiro corte — só <pre> com whitespace preservado. */
  content: string;
  /** sessionId atualmente ligado ao store. `null` antes de hydrate. */
  sessionId: string | null;
  /** `true` enquanto o GET inicial está em vôo. */
  loading: boolean;
  /** `true` enquanto o PATCH está em vôo (debounce + save explícito). */
  saving: boolean;
  /** Marca quando o usuário GM mudou o `content` desde o último
   *  hydrate/save bem-sucedido. Save explícito limpa. */
  dirty: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Substitui o conteúdo localmente. NÃO dispara save — usar `save()`
   *  ou compor com um setTimeout no caller. */
  setContent: (next: string) => void;
  /** Substitui o conteúdo localmente + marca dirty. Para uso do GM. */
  edit: (next: string) => void;
  hydrate: (sessionId: string, content: string) => void;
  setLoading: (v: boolean) => void;
  setSaving: (v: boolean) => void;
  markClean: () => void;
  /** Zera o store ao deslogar/sair da sessão. */
  reset: () => void;
}

export const useMissionContextStore = create<MissionContextState>((set) => ({
  isOpen: false,
  content: "",
  sessionId: null,
  loading: false,
  saving: false,
  dirty: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  setContent: (next) => set({ content: next }),
  edit: (next) => set({ content: next, dirty: true }),

  hydrate: (sessionId, content) =>
    set({ sessionId, content, loading: false, dirty: false }),

  setLoading: (v) => set({ loading: v }),
  setSaving: (v) => set({ saving: v }),
  markClean: () => set({ dirty: false }),

  reset: () =>
    set({
      isOpen: false,
      content: "",
      sessionId: null,
      loading: false,
      saving: false,
      dirty: false,
    }),
}));
