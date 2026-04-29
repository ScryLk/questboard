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

const SEED: WorldEntity[] = [
  {
    id: "world_seed_npc1",
    campaignId: "camp_seed_strahd",
    kind: "npc",
    name: "Taverneiro Brom",
    subtitle: "Humano · Taverneiro",
    location: "Taverna do Dragão Adormecido",
    disposition: "friendly",
    description:
      "Taverneiro veterano, ex-soldado. Conhece todos os fofocas da vila e troca rumores por uma rodada de cerveja.",
    notes: "Tem mapa antigo escondido sob o balcão.",
    createdAt: "2026-04-20T12:00:00Z",
    updatedAt: "2026-04-20T12:00:00Z",
  },
  {
    id: "world_seed_npc2",
    campaignId: "camp_seed_strahd",
    kind: "npc",
    name: "Eldrith, a Sábia",
    subtitle: "Elfa · Conselheira",
    location: "Torre da Magia",
    disposition: "neutral",
    description:
      "Anciã de longas memórias. Nunca dá resposta direta — sempre uma adivinha.",
    createdAt: "2026-04-20T13:00:00Z",
    updatedAt: "2026-04-20T13:00:00Z",
  },
  {
    id: "world_seed_npc3",
    campaignId: "camp_seed_strahd",
    kind: "npc",
    name: "Garuk Sangue-Frio",
    subtitle: "Orc · Líder Bandido",
    location: "Montanhas Negras",
    disposition: "hostile",
    description:
      "Antigo capitão imperial caído em desgraça. Comanda um bando de saqueadores nas estradas.",
    createdAt: "2026-04-21T09:00:00Z",
    updatedAt: "2026-04-21T09:00:00Z",
  },
  {
    id: "world_seed_loc1",
    campaignId: "camp_seed_strahd",
    kind: "location",
    name: "Vila de Barovia",
    subtitle: "Vila pequena · Sombria",
    description:
      "Vila enevoada perpetuamente cinzenta. Ruas de terra, poucos visitantes, todos os habitantes evitam contato visual.",
    createdAt: "2026-04-19T10:00:00Z",
    updatedAt: "2026-04-19T10:00:00Z",
  },
  {
    id: "world_seed_fac1",
    campaignId: "camp_seed_strahd",
    kind: "faction",
    name: "Ordem da Lua Prateada",
    subtitle: "Guarda mágica",
    disposition: "friendly",
    description:
      "Confraria de magos defensores do reino. Operam discretamente — só intervêm contra ameaças sobrenaturais.",
    createdAt: "2026-04-18T14:00:00Z",
    updatedAt: "2026-04-18T14:00:00Z",
  },
];

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
