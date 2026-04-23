import { create } from "zustand";
import type { Campaign, CampaignSession, CampaignPlayer } from "@questboard/types";
import {
  getMyCampaignsAsGM,
  getMyCampaignsAsPlayer,
  getMyPendingInvites,
  getMockCampaign,
  getMockCampaignSessions,
  getMockCampaignPlayers,
  resolveMockCode,
  getNextSession,
  getLiveSession,
  getGMName,
  getMyCharacterName,
} from "./campaign-mock-data";

export interface CampaignStore {
  // Data
  campaignsAsPlayer: Campaign[];
  campaignsAsGM: Campaign[];
  pendingInvites: Campaign[];

  // Join flow
  joinLoading: boolean;
  joinError: string | null;

  // Selected campaign detail
  selectedCampaign: Campaign | null;
  selectedCampaignSessions: CampaignSession[];
  selectedCampaignPlayers: CampaignPlayer[];

  // Actions
  loadCampaigns: () => void;
  resolveCode: (
    code: string,
  ) => Promise<{
    type: "campaign" | "session";
    id: string;
    status?: string;
  } | null>;
  joinCampaign: (
    campaignId: string,
    characterId: string,
  ) => Promise<"joined" | "pending">;
  acceptInvite: (campaignId: string) => void;
  declineInvite: (campaignId: string) => void;
  selectCampaign: (campaignId: string) => void;
  clearSelection: () => void;
  clearJoinError: () => void;

  // Helpers
  getNextSessionForCampaign: (campaignId: string) => CampaignSession | null;
  getLiveSessionForCampaign: (campaignId: string) => CampaignSession | null;
  getGMNameForCampaign: (campaignId: string) => string;
  getMyCharacterNameForCampaign: (campaignId: string) => string | null;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaignsAsPlayer: [],
  campaignsAsGM: [],
  pendingInvites: [],

  joinLoading: false,
  joinError: null,

  selectedCampaign: null,
  selectedCampaignSessions: [],
  selectedCampaignPlayers: [],

  loadCampaigns: () => {
    set({
      campaignsAsPlayer: getMyCampaignsAsPlayer(),
      campaignsAsGM: getMyCampaignsAsGM(),
      pendingInvites: getMyPendingInvites(),
    });
  },

  resolveCode: async (code) => {
    set({ joinLoading: true, joinError: null });
    try {
      const result = await resolveMockCode(code);
      if (!result) {
        set({ joinLoading: false, joinError: "Código não encontrado" });
        return null;
      }
      set({ joinLoading: false });
      return result;
    } catch {
      set({ joinLoading: false, joinError: "Erro ao verificar código" });
      return null;
    }
  },

  joinCampaign: async (campaignId, _characterId) => {
    set({ joinLoading: true, joinError: null });
    return new Promise((resolve) => {
      setTimeout(() => {
        const campaign = getMockCampaign(campaignId);
        if (!campaign) {
          set({ joinLoading: false, joinError: "Campanha não encontrada" });
          resolve("pending");
          return;
        }

        // Simulate: Waterdeep requires approval, others auto-join
        if (campaignId === "camp_waterdeep") {
          set({ joinLoading: false });
          resolve("pending");
        } else {
          // Move from invites to player campaigns
          const invites = get().pendingInvites.filter(
            (c) => c.id !== campaignId,
          );
          const asPlayer = [...get().campaignsAsPlayer, campaign];
          set({
            joinLoading: false,
            pendingInvites: invites,
            campaignsAsPlayer: asPlayer,
          });
          resolve("joined");
        }
      }, 600);
    });
  },

  acceptInvite: (campaignId) => {
    const campaign = get().pendingInvites.find((c) => c.id === campaignId);
    if (!campaign) return;
    set({
      pendingInvites: get().pendingInvites.filter((c) => c.id !== campaignId),
      campaignsAsPlayer: [...get().campaignsAsPlayer, campaign],
    });
  },

  declineInvite: (campaignId) => {
    set({
      pendingInvites: get().pendingInvites.filter((c) => c.id !== campaignId),
    });
  },

  selectCampaign: (campaignId) => {
    const campaign = getMockCampaign(campaignId);
    set({
      selectedCampaign: campaign,
      selectedCampaignSessions: getMockCampaignSessions(campaignId),
      selectedCampaignPlayers: getMockCampaignPlayers(campaignId),
    });
  },

  clearSelection: () => {
    set({
      selectedCampaign: null,
      selectedCampaignSessions: [],
      selectedCampaignPlayers: [],
    });
  },

  clearJoinError: () => set({ joinError: null }),

  getNextSessionForCampaign: (campaignId) => getNextSession(campaignId),
  getLiveSessionForCampaign: (campaignId) => getLiveSession(campaignId),
  getGMNameForCampaign: (campaignId) => getGMName(campaignId),
  getMyCharacterNameForCampaign: (campaignId) => getMyCharacterName(campaignId),
}));
