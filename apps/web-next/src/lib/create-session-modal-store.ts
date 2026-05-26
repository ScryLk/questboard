"use client";

// Store global para o modal de criação de sessão. Vive aqui pra
// permitir abrir do header (botão "Nova Sessão"), do compêndio (botão
// "Criar sessão" com sistema pré-selecionado) e da página de campanha
// (botão "Agendar sessão" com campaignId + sistema da campanha).

import { create } from "zustand";

interface OpenOptions {
  /** Slug do sistema pré-preenchido no form (ex: "cosmic-horror"). */
  system?: string;
  /** ID da campanha à qual a sessão criada será vinculada. */
  campaignId?: string;
}

interface CreateSessionModalState {
  isOpen: boolean;
  prefilledSystem: string | null;
  prefilledCampaignId: string | null;
  /** Aceita tanto a forma legada (string com slug do sistema) quanto o
   *  objeto de opções com sistema e campaignId. */
  open: (opts?: string | OpenOptions) => void;
  close: () => void;
}

export const useCreateSessionModalStore = create<CreateSessionModalState>(
  (set) => ({
    isOpen: false,
    prefilledSystem: null,
    prefilledCampaignId: null,
    open: (opts) => {
      if (typeof opts === "string") {
        set({
          isOpen: true,
          prefilledSystem: opts,
          prefilledCampaignId: null,
        });
        return;
      }
      set({
        isOpen: true,
        prefilledSystem: opts?.system ?? null,
        prefilledCampaignId: opts?.campaignId ?? null,
      });
    },
    close: () =>
      set({
        isOpen: false,
        prefilledSystem: null,
        prefilledCampaignId: null,
      }),
  }),
);
