import { create } from "zustand";

// ─── State Interfaces ────────────────────────────────────

export interface SessionIdentity {
  name: string;
  system: string;
  campaignType: "oneshot" | "campaign" | "westmarch";
  description: string;
  tags: string[];
}

export interface SessionConfiguration {
  maxPlayers: number;
  visibility: "private" | "public";
  password: string;
  diceVisibility: "public" | "gm-only";
  hpMethod: "manual" | "auto-roll" | "fixed";
  allowHomebrewContent: boolean;
  scheduledAt: string | null;
  scheduleRecurrence: "none" | "weekly" | "biweekly";
}

export interface SessionAmbiance {
  mapUrl: string | null;
  gridEnabled: boolean;
  gmNotes: string;
}

export interface SessionInvite {
  inviteCode: string;
  welcomeMessage: string;
}

export interface SessionCreationState {
  mode: "quick" | "wizard" | null;
  currentStep: number;
  totalSteps: number;

  identity: SessionIdentity;
  configuration: SessionConfiguration;
  ambiance: SessionAmbiance;
  invite: SessionInvite;

  setMode: (mode: "quick" | "wizard") => void;
  setStep: (step: number) => void;
  updateIdentity: (data: Partial<SessionIdentity>) => void;
  updateConfiguration: (data: Partial<SessionConfiguration>) => void;
  updateAmbiance: (data: Partial<SessionAmbiance>) => void;
  updateInvite: (data: Partial<SessionInvite>) => void;
  reset: () => void;
}

// ─── Helpers ─────────────────────────────────────────────

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ─── Initial Values ──────────────────────────────────────

const INITIAL_IDENTITY: SessionIdentity = {
  name: "",
  system: "",
  campaignType: "campaign",
  description: "",
  tags: [],
};

const INITIAL_CONFIGURATION: SessionConfiguration = {
  maxPlayers: 5,
  visibility: "private",
  password: "",
  diceVisibility: "public",
  hpMethod: "manual",
  allowHomebrewContent: false,
  scheduledAt: null,
  scheduleRecurrence: "none",
};

const INITIAL_AMBIANCE: SessionAmbiance = {
  mapUrl: null,
  gridEnabled: false,
  gmNotes: "",
};

const INITIAL_INVITE: SessionInvite = {
  inviteCode: generateInviteCode(),
  welcomeMessage: "",
};

// ─── Store ───────────────────────────────────────────────

export const useSessionCreationStore = create<SessionCreationState>(
  (set) => ({
    mode: null,
    currentStep: 0,
    totalSteps: 5,

    identity: { ...INITIAL_IDENTITY },
    configuration: { ...INITIAL_CONFIGURATION },
    ambiance: { ...INITIAL_AMBIANCE },
    invite: { ...INITIAL_INVITE },

    setMode: (mode) => set({ mode, currentStep: mode === "wizard" ? 1 : 0 }),

    setStep: (step) => set({ currentStep: step }),

    updateIdentity: (data) =>
      set((state) => ({
        identity: { ...state.identity, ...data },
      })),

    updateConfiguration: (data) =>
      set((state) => ({
        configuration: { ...state.configuration, ...data },
      })),

    updateAmbiance: (data) =>
      set((state) => ({
        ambiance: { ...state.ambiance, ...data },
      })),

    updateInvite: (data) =>
      set((state) => ({
        invite: { ...state.invite, ...data },
      })),

    reset: () =>
      set({
        mode: null,
        currentStep: 0,
        identity: { ...INITIAL_IDENTITY },
        configuration: { ...INITIAL_CONFIGURATION },
        ambiance: { ...INITIAL_AMBIANCE },
        invite: {
          inviteCode: generateInviteCode(),
          welcomeMessage: "",
        },
      }),
  }),
);

// ─── Validators ──────────────────────────────────────────

export function canProceedStep1(state: SessionCreationState): boolean {
  return state.identity.name.trim().length >= 2 && state.identity.system !== "";
}

export function canProceedQuick(state: SessionCreationState): boolean {
  return canProceedStep1(state);
}
