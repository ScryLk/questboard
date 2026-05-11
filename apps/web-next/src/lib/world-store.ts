import { create } from "zustand";
import { persist } from "zustand/middleware";

// Entidades do "Mundo" — NPCs, locais, facções e lore. Modelados com
// um discriminator único (`kind`) pra simplificar o store e a UI:
// CRUD compartilhado, campos extras por tipo.

export type WorldEntityKind = "npc" | "location" | "faction" | "lore";

export type Disposition = "friendly" | "neutral" | "hostile" | "unknown";

export interface WorldEntity {
  id: string;
  campaignId: string;
  kind: WorldEntityKind;
  name: string;
  /** Texto livre — descrição, lore, motivações. */
  description: string;
  /** Campo livre exibido no card (raça pra NPC, tipo pra local, etc.). */
  subtitle?: string;
  /** Campo de localização — usado por NPCs e ocasionalmente facções. */
  location?: string;
  /** Disposição (default neutral). Só faz sentido pra NPC e facção. */
  disposition?: Disposition;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WorldState {
  entities: WorldEntity[];
  createEntity: (
    e: Omit<WorldEntity, "id" | "createdAt" | "updatedAt">,
  ) => WorldEntity;
  updateEntity: (
    id: string,
    updates: Partial<Omit<WorldEntity, "id" | "createdAt" | "campaignId" | "kind">>,
  ) => void;
  deleteEntity: (id: string) => void;
}

function generateId(): string {
  return `world_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// Store inicia vazio — dados vêm do backend via `useBackendWorld`
// (apps/api/src/modules/world) ou da UI quando GM cria.
const SEED: WorldEntity[] = [];

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      entities: SEED,

      createEntity: (entity) => {
        const now = new Date().toISOString();
        const newEntity: WorldEntity = {
          ...entity,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ entities: [newEntity, ...s.entities] }));
        return newEntity;
      },

      updateEntity: (id, updates) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            e.id === id
              ? { ...e, ...updates, updatedAt: new Date().toISOString() }
              : e,
          ),
        })),

      deleteEntity: (id) =>
        set((s) => ({ entities: s.entities.filter((e) => e.id !== id) })),
    }),
    {
      name: "questboard-world",
      version: 1,
    },
  ),
);

// ── Labels & helpers ──

export const WORLD_KIND_LABELS: Record<WorldEntityKind, string> = {
  npc: "NPCs",
  location: "Locais",
  faction: "Facções",
  lore: "Lore",
};

export const WORLD_KIND_SINGULAR: Record<WorldEntityKind, string> = {
  npc: "NPC",
  location: "Local",
  faction: "Facção",
  lore: "Entrada de Lore",
};

export const DISPOSITION_LABELS: Record<Disposition, string> = {
  friendly: "Amigável",
  neutral: "Neutro",
  hostile: "Hostil",
  unknown: "Desconhecido",
};

export const DISPOSITION_COLORS: Record<Disposition, string> = {
  friendly: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  neutral: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  hostile: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  unknown: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};
