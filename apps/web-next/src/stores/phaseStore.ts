import { create } from "zustand";
import type { PhaseType, SessionPhase } from "@/types/phase";
import { PHASE_META, PHASE_TRANSITIONS } from "@/constants/phaseTransitions";

function generatePhaseId(): string {
  return `ph_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface PhaseStore {
  history: SessionPhase[];
  current: SessionPhase;
  isModalOpen: boolean;

  openModal: () => void;
  closeModal: () => void;
  transitionTo: (type: PhaseType, label?: string, notes?: string) => void;
  updateCurrentLabel: (label: string) => void;
  updateCurrentNotes: (notes: string) => void;
  getSuggestions: () => PhaseType[];
  getElapsedMinutes: () => number;
}

// Mock: current phase started 10 minutes ago
const mockStartedAt = new Date(Date.now() - 10 * 60 * 1000);

export const usePhaseStore = create<PhaseStore>((set, get) => ({
  history: [
    {
      id: "ph_1",
      type: "narration",
      label: "Introdução",
      startedAt: new Date(Date.now() - 52 * 60 * 1000),
      endedAt: new Date(Date.now() - 45 * 60 * 1000),
      durationMinutes: 7,
      notes: "Strahd apareceu na janela da taverna",
    },
    {
      id: "ph_2",
      type: "roleplay",
      label: "Encontro com Ismark",
      startedAt: new Date(Date.now() - 45 * 60 * 1000),
      endedAt: new Date(Date.now() - 28 * 60 * 1000),
      durationMinutes: 17,
    },
    {
      id: "ph_3",
      type: "travel",
      label: "Caminho para o Castelo",
      startedAt: new Date(Date.now() - 28 * 60 * 1000),
      endedAt: new Date(Date.now() - 10 * 60 * 1000),
      durationMinutes: 18,
    },
  ],
  current: {
    id: "ph_4",
    type: "exploration",
    label: "Exploração do Castelo",
    startedAt: mockStartedAt,
  },
  isModalOpen: false,

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  transitionTo: (type, label, notes) => {
    const { current, history } = get();
    const now = new Date();
    const durationMinutes = Math.round(
      (now.getTime() - current.startedAt.getTime()) / 60000,
    );

    const closedPhase: SessionPhase = {
      ...current,
      endedAt: now,
      durationMinutes,
    };

    const newPhase: SessionPhase = {
      id: generatePhaseId(),
      type,
      label: label || PHASE_META[type].label,
      startedAt: now,
      notes,
    };

    set({
      history: [...history, closedPhase],
      current: newPhase,
    });
  },

  updateCurrentLabel: (label) =>
    set((s) => ({ current: { ...s.current, label } })),

  updateCurrentNotes: (notes) =>
    set((s) => ({ current: { ...s.current, notes } })),

  getSuggestions: () => {
    const { current } = get();
    const rule = PHASE_TRANSITIONS.find((r) => r.from === current.type);
    return rule?.suggestions ?? [];
  },

  getElapsedMinutes: () => {
    const { current } = get();
    return Math.floor((Date.now() - current.startedAt.getTime()) / 60000);
  },
}));
