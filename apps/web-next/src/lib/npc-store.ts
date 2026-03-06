import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  NPCData,
  NPCPersonality,
  NPCAttitude,
} from "./npc-types";

function generateId(): string {
  return `npc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const DEFAULT_PERSONALITY: NPCPersonality = {
  personalityTrait: "",
  ideal: "",
  bond: "",
  flaw: "",
  quirk: "",
  voiceStyle: "",
  greeting: "",
};

const DEFAULT_ATTITUDE: NPCAttitude = {
  initialAttitude: "indifferent",
  currentAttitude: "indifferent",
  attitudeCanChange: true,
  persuasionDC: 15,
  intimidationDC: 12,
  deceptionDC: 14,
};

const PORTRAIT_COLORS = [
  "#6C5CE7",
  "#FF4444",
  "#00B894",
  "#FDCB6E",
  "#74B9FF",
  "#E17055",
];

export function createDefaultNPC(partial?: Partial<NPCData>): NPCData {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "",
    title: "",
    race: "",
    gender: "",
    age: "",
    appearance: "",
    type: "neutral",
    tags: [],
    location: "",
    favorite: false,
    archived: false,
    portrait: "",
    portraitColor:
      PORTRAIT_COLORS[Math.floor(Math.random() * PORTRAIT_COLORS.length)],
    personality: { ...DEFAULT_PERSONALITY },
    attitude: { ...DEFAULT_ATTITUDE },
    knowledge: [],
    secrets: [],
    combatBehavior: "non_combatant",
    statBlockSource: "none",
    aiEnabled: false,
    aiContext: "",
    aiCreativity: 70,
    interactions: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

interface NPCState {
  npcs: NPCData[];
  npcTokenMap: Record<string, string[]>;

  createNPC: (npc: NPCData) => void;
  updateNPC: (id: string, updates: Partial<NPCData>) => void;
  deleteNPC: (id: string) => void;
  duplicateNPC: (id: string) => NPCData;

  toggleFavorite: (id: string) => void;

  linkTokenToNpc: (npcId: string, tokenId: string) => void;
  unlinkTokenFromNpc: (npcId: string, tokenId: string) => void;
  unlinkAllTokensForNpc: (npcId: string) => void;
  getTokenNpcId: (tokenId: string) => string | undefined;
}

export const useNPCStore = create<NPCState>()(
  persist(
    (set, get) => ({
      npcs: [],
      npcTokenMap: {},

      createNPC: (npc) =>
        set((s) => ({
          npcs: [npc, ...s.npcs],
        })),

      updateNPC: (id, updates) =>
        set((s) => ({
          npcs: s.npcs.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n,
          ),
        })),

      deleteNPC: (id) =>
        set((s) => {
          const next = { ...s.npcTokenMap };
          delete next[id];
          return {
            npcs: s.npcs.filter((n) => n.id !== id),
            npcTokenMap: next,
          };
        }),

      duplicateNPC: (id) => {
        const original = get().npcs.find((n) => n.id === id);
        if (!original) return createDefaultNPC();
        const now = new Date().toISOString();
        const copy: NPCData = {
          ...original,
          id: generateId(),
          name: `${original.name} (copia)`,
          favorite: false,
          interactions: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ npcs: [copy, ...s.npcs] }));
        return copy;
      },

      toggleFavorite: (id) =>
        set((s) => ({
          npcs: s.npcs.map((n) =>
            n.id === id ? { ...n, favorite: !n.favorite } : n,
          ),
        })),

      linkTokenToNpc: (npcId, tokenId) =>
        set((s) => {
          const current = s.npcTokenMap[npcId] ?? [];
          if (current.includes(tokenId)) return s;
          return {
            npcTokenMap: {
              ...s.npcTokenMap,
              [npcId]: [...current, tokenId],
            },
          };
        }),

      unlinkTokenFromNpc: (npcId, tokenId) =>
        set((s) => {
          const current = s.npcTokenMap[npcId];
          if (!current) return s;
          const filtered = current.filter((id) => id !== tokenId);
          const next = { ...s.npcTokenMap };
          if (filtered.length === 0) {
            delete next[npcId];
          } else {
            next[npcId] = filtered;
          }
          return { npcTokenMap: next };
        }),

      unlinkAllTokensForNpc: (npcId) =>
        set((s) => {
          const next = { ...s.npcTokenMap };
          delete next[npcId];
          return { npcTokenMap: next };
        }),

      getTokenNpcId: (tokenId) => {
        const map = get().npcTokenMap;
        for (const [npcId, tokenIds] of Object.entries(map)) {
          if (tokenIds.includes(tokenId)) return npcId;
        }
        return undefined;
      },
    }),
    {
      name: "questboard-npcs",
      version: 1,
    },
  ),
);
