import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";

export type FontSize = "small" | "medium" | "large";
export type DiceAnimationMode = "full" | "discrete" | "none";

export interface PlayerSettings {
  volumeGeneral: number;
  volumeMusic: number;
  volumeEffects: number;
  notifySound: boolean;
  notifyTurnSound: boolean;
  vibrateMobile: boolean;
  showGrid: boolean;
  showTooltips: boolean;
  fontSize: FontSize;
  reduceMotion: boolean;
  highContrast: boolean;
  /** full = nível 1 (inline) + nível 2 (central em crítico/falha);
   *  discrete = só nível 1; none = sem animação, resultado direto. */
  diceAnimation: DiceAnimationMode;
}

interface PlayerSettingsActions {
  update: <K extends keyof PlayerSettings>(
    key: K,
    value: PlayerSettings[K],
  ) => void;
  reset: () => void;
}

type PlayerSettingsStore = PlayerSettings & PlayerSettingsActions;

const DEFAULTS: PlayerSettings = {
  volumeGeneral: 80,
  volumeMusic: 60,
  volumeEffects: 70,
  notifySound: true,
  notifyTurnSound: true,
  vibrateMobile: false,
  showGrid: true,
  showTooltips: true,
  fontSize: "medium",
  reduceMotion: false,
  highContrast: false,
  diceAnimation: "full",
};

// Storage injetado (regra #6 do CLAUDE.md): nunca hardcodar localStorage.
// SSR-safe: passa storage dummy quando `window` não existe.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export function createPlayerSettingsStore(storage: StateStorage) {
  return create<PlayerSettingsStore>()(
    persist(
      (set) => ({
        ...DEFAULTS,
        update: (key, value) => set({ [key]: value } as never),
        reset: () => set({ ...DEFAULTS }),
      }),
      {
        name: "qb.player-settings",
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}

export const usePlayerSettings = createPlayerSettingsStore(
  typeof window !== "undefined" ? window.localStorage : noopStorage,
);
