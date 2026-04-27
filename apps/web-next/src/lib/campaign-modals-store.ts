"use client";

// Store para modais globais relacionados à campanha (atualmente só
// settings — pode acomodar outros ad-hoc no futuro). Não persiste:
// modal aberto não deve sobreviver a recarregar a página.

import { create } from "zustand";

interface CampaignModalsState {
  /** Id da campanha cujo modal de settings está aberto, ou null. */
  settingsCampaignId: string | null;
  openSettings: (campaignId: string) => void;
  closeSettings: () => void;

  /** Id da campanha sendo pré-visualizada no quick modal, ou null. */
  previewCampaignId: string | null;
  openPreview: (campaignId: string) => void;
  closePreview: () => void;
}

export const useCampaignModalsStore = create<CampaignModalsState>((set) => ({
  settingsCampaignId: null,
  openSettings: (campaignId) =>
    set({ settingsCampaignId: campaignId, previewCampaignId: null }),
  closeSettings: () => set({ settingsCampaignId: null }),

  previewCampaignId: null,
  openPreview: (campaignId) => set({ previewCampaignId: campaignId }),
  closePreview: () => set({ previewCampaignId: null }),
}));
