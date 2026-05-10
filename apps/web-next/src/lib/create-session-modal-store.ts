"use client";

// Store global para o modal de criação de sessão. Vive aqui pra
// permitir abrir do header (botão "Nova Sessão") OU do compêndio
// (botão "Criar sessão" com sistema pré-selecionado). Não persiste.

import { create } from "zustand";

interface CreateSessionModalState {
  isOpen: boolean;
  /** Slug do sistema pré-preenchido no form (ex: "cosmic-horror"). */
  prefilledSystem: string | null;
  open: (prefilledSystem?: string) => void;
  close: () => void;
}

export const useCreateSessionModalStore = create<CreateSessionModalState>(
  (set) => ({
    isOpen: false,
    prefilledSystem: null,
    open: (prefilledSystem) =>
      set({ isOpen: true, prefilledSystem: prefilledSystem ?? null }),
    close: () => set({ isOpen: false, prefilledSystem: null }),
  }),
);
