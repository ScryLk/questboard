import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";

export type UnitSystem = "IMPERIAL" | "METRIC" | "ABSTRACT";

export interface MapScaleState {
  /** Sistema de unidade usado pela campanha. IMPERIAL (ft) é compatível
   *  com D&D 5e e mantém compat com `cellSizeFt` existente. */
  unitSystem: UnitSystem;
  /** Quanto vale 1 célula em unidades do sistema. Ex: 5 (ft) pra D&D
   *  5e, 1.5 (m) pra T20/CoC, irrelevante pra ABSTRACT. */
  unitsPerCell: number;
  setScale: (unitSystem: UnitSystem, unitsPerCell: number) => void;
}

const DEFAULTS: Pick<MapScaleState, "unitSystem" | "unitsPerCell"> = {
  // IMPERIAL + 5 mantém compat exata com `CELL_SIZE_FT = 5` existente.
  unitSystem: "IMPERIAL",
  unitsPerCell: 5,
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export function createMapScaleStore(storage: StateStorage) {
  return create<MapScaleState>()(
    persist(
      (set) => ({
        ...DEFAULTS,
        setScale: (unitSystem, unitsPerCell) =>
          set({ unitSystem, unitsPerCell }),
      }),
      {
        name: "qb.map-scale",
        storage: createJSONStorage(() => storage),
      },
    ),
  );
}

export const useMapScale = createMapScaleStore(
  typeof window !== "undefined" ? window.localStorage : noopStorage,
);
