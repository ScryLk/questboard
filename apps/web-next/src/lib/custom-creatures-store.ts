import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomCreature } from "./ai-types";

interface CustomCreaturesState {
  creatures: CustomCreature[];
  addCreature: (c: CustomCreature) => void;
  removeCreature: (id: string) => void;
  updateCreature: (id: string, updates: Partial<CustomCreature>) => void;
}

export const useCustomCreaturesStore = create<CustomCreaturesState>()(
  persist(
    (set) => ({
      creatures: [],
      addCreature: (c) =>
        set((s) => ({ creatures: [c, ...s.creatures] })),
      removeCreature: (id) =>
        set((s) => ({ creatures: s.creatures.filter((c) => c.id !== id) })),
      updateCreature: (id, updates) =>
        set((s) => ({
          creatures: s.creatures.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),
    }),
    {
      name: "questboard-custom-creatures",
      version: 1,
    },
  ),
);
