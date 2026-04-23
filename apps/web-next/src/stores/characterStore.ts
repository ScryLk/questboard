import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CampaignCharacter, CharacterStats } from "@/types/character";
import { MOCK_CHARACTERS } from "@/lib/character-mock-data-campaign";

function generateId(): string {
  return `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const PORTRAIT_COLORS = [
  "#6C5CE7",
  "#FF4444",
  "#00B894",
  "#FDCB6E",
  "#74B9FF",
  "#E17055",
  "#A0522D",
  "#6B7280",
];

const DEFAULT_STATS: CharacterStats = {
  hp: 10,
  maxHp: 10,
  ac: 10,
  speed: 30,
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

export function createDefaultCharacter(
  partial?: Partial<CampaignCharacter>,
): CampaignCharacter {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "",
    description: "",
    category: "npc",
    disposition: "neutral",
    spriteUrl: null,
    spriteGeneratedByAI: false,
    portraitColor:
      PORTRAIT_COLORS[Math.floor(Math.random() * PORTRAIT_COLORS.length)],
    stats: { ...DEFAULT_STATS },
    actions: [],
    dialogueEnabled: false,
    createdByUserId: "user-1",
    isPublic: false,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

// ── Store ─────────────────────────────────────────────────────

interface CharacterStoreState {
  characters: CampaignCharacter[];
  characterTokenMap: Record<string, string[]>;

  // CRUD
  createCharacter: (c: CampaignCharacter) => void;
  updateCharacter: (id: string, updates: Partial<CampaignCharacter>) => void;
  deleteCharacter: (id: string) => void;
  duplicateCharacter: (id: string) => CampaignCharacter;
  toggleFavorite: (id: string) => void;

  // Token linking
  linkTokenToCharacter: (characterId: string, tokenId: string) => void;
  unlinkTokenFromCharacter: (characterId: string, tokenId: string) => void;
  unlinkAllTokensForCharacter: (characterId: string) => void;
  getTokenCharacterId: (tokenId: string) => string | undefined;

  // Helpers
  getCharacterById: (id: string) => CampaignCharacter | undefined;
}

export const useCharacterStore = create<CharacterStoreState>()(
  persist(
    (set, get) => ({
      characters: MOCK_CHARACTERS,
      characterTokenMap: {},

      createCharacter: (c) =>
        set((s) => ({
          characters: [c, ...s.characters],
        })),

      updateCharacter: (id, updates) =>
        set((s) => ({
          characters: s.characters.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c,
          ),
        })),

      deleteCharacter: (id) =>
        set((s) => {
          const nextMap = { ...s.characterTokenMap };
          delete nextMap[id];
          return {
            characters: s.characters.filter((c) => c.id !== id),
            characterTokenMap: nextMap,
          };
        }),

      duplicateCharacter: (id) => {
        const original = get().characters.find((c) => c.id === id);
        if (!original) return createDefaultCharacter();
        const now = new Date().toISOString();
        const copy: CampaignCharacter = {
          ...original,
          id: generateId(),
          name: `${original.name} (copia)`,
          favorite: false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ characters: [copy, ...s.characters] }));
        return copy;
      },

      toggleFavorite: (id) =>
        set((s) => ({
          characters: s.characters.map((c) =>
            c.id === id ? { ...c, favorite: !c.favorite } : c,
          ),
        })),

      // Token linking
      linkTokenToCharacter: (characterId, tokenId) =>
        set((s) => {
          const existing = s.characterTokenMap[characterId] ?? [];
          if (existing.includes(tokenId)) return s;
          return {
            characterTokenMap: {
              ...s.characterTokenMap,
              [characterId]: [...existing, tokenId],
            },
          };
        }),

      unlinkTokenFromCharacter: (characterId, tokenId) =>
        set((s) => {
          const existing = s.characterTokenMap[characterId];
          if (!existing) return s;
          const filtered = existing.filter((t) => t !== tokenId);
          const nextMap = { ...s.characterTokenMap };
          if (filtered.length === 0) {
            delete nextMap[characterId];
          } else {
            nextMap[characterId] = filtered;
          }
          return { characterTokenMap: nextMap };
        }),

      unlinkAllTokensForCharacter: (characterId) =>
        set((s) => {
          const nextMap = { ...s.characterTokenMap };
          delete nextMap[characterId];
          return { characterTokenMap: nextMap };
        }),

      getTokenCharacterId: (tokenId) => {
        const map = get().characterTokenMap;
        for (const [charId, tokenIds] of Object.entries(map)) {
          if (tokenIds.includes(tokenId)) return charId;
        }
        return undefined;
      },

      getCharacterById: (id) => {
        return get().characters.find((c) => c.id === id);
      },
    }),
    {
      name: "questboard-characters",
      version: 1,
    },
  ),
);
