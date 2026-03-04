import { create } from "zustand";
import type {
  Campaign,
  CampaignDashboardData,
  SessionDashboardData,
  ScheduledSessionData,
} from "@questboard/types";
import {
  MOCK_CAMPAIGNS,
  getMockCampaignDashboard,
  getMockSessionDashboard,
  getMockScheduledSessionData,
} from "./mock-data.js";

export type DashboardView = "campaign" | "session" | "live" | "scheduled";

interface CampaignState {
  // Campaign selection
  campaigns: Campaign[];
  activeCampaignId: string | null;
  activeCampaign: Campaign | null;

  // Dashboard view
  dashboardView: DashboardView;
  activeSessionId: string | null;

  // Dashboard data
  campaignDashboard: CampaignDashboardData | null;
  sessionDashboard: SessionDashboardData | null;
  scheduledSessionData: ScheduledSessionData | null;

  // UI state
  sidebarCollapsed: boolean;
  createSessionModalOpen: boolean;

  // Actions
  loadCampaigns: () => void;
  selectCampaign: (id: string) => void;
  selectSession: (id: string) => void;
  goToCampaignOverview: () => void;
  toggleSidebar: () => void;
  openCreateSession: () => void;
  closeCreateSession: () => void;
  toggleChecklistItem: (itemId: string) => void;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  activeCampaignId: null,
  activeCampaign: null,
  dashboardView: "campaign",
  activeSessionId: null,
  campaignDashboard: null,
  sessionDashboard: null,
  scheduledSessionData: null,
  sidebarCollapsed: false,
  createSessionModalOpen: false,

  loadCampaigns: () => {
    const first = MOCK_CAMPAIGNS[0];
    const dashboard = first ? getMockCampaignDashboard(first.id) : null;
    set({
      campaigns: MOCK_CAMPAIGNS,
      activeCampaignId: first?.id ?? null,
      activeCampaign: first ?? null,
      campaignDashboard: dashboard ?? null,
      dashboardView: "campaign",
    });
  },

  selectCampaign: (id) => {
    const campaign = get().campaigns.find((c) => c.id === id) ?? null;
    const dashboard = campaign ? getMockCampaignDashboard(id) : null;
    set({
      activeCampaignId: id,
      activeCampaign: campaign,
      campaignDashboard: dashboard ?? null,
      dashboardView: "campaign",
      activeSessionId: null,
      sessionDashboard: null,
      scheduledSessionData: null,
    });
  },

  selectSession: (id) => {
    const sessionData = getMockSessionDashboard(id);
    if (!sessionData) return;

    const isScheduled = sessionData.session.status === "SCHEDULED";
    const isLive = sessionData.session.status === "LIVE";
    const scheduledData = isScheduled
      ? getMockScheduledSessionData(id)
      : null;

    let view: DashboardView = "session";
    if (isScheduled) view = "scheduled";
    if (isLive) view = "live";

    set({
      activeSessionId: id,
      sessionDashboard: sessionData,
      scheduledSessionData: scheduledData,
      dashboardView: view,
    });
  },

  goToCampaignOverview: () =>
    set({
      dashboardView: "campaign",
      activeSessionId: null,
      sessionDashboard: null,
      scheduledSessionData: null,
    }),

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  openCreateSession: () => set({ createSessionModalOpen: true }),
  closeCreateSession: () => set({ createSessionModalOpen: false }),

  toggleChecklistItem: (itemId) => {
    const data = get().scheduledSessionData;
    if (!data) return;
    set({
      scheduledSessionData: {
        ...data,
        checklist: data.checklist.map((item) =>
          item.id === itemId
            ? { ...item, completed: !item.completed }
            : item,
        ),
      },
    });
  },
}));
