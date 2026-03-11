import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Creature } from "./creature-data";
import type {
  SavedToken,
  EncounterGroup,
} from "./token-library-types";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const TOKEN_COLORS = [
  "#FF4444",
  "#00B894",
  "#FDCB6E",
  "#74B9FF",
  "#E17055",
  "#A29BFE",
  "#6C5CE7",
  "#FD79A8",
];

export function createDefaultSavedToken(
  partial?: Partial<SavedToken>,
): SavedToken {
  const now = new Date().toISOString();
  return {
    id: generateId("stok"),
    name: "",
    type: "hostile",
    source: "custom",
    creatureType: "humanoid",
    size: "medium",
    alignment: "",
    cr: "0",
    xp: 10,
    tags: [],
    gmNotes: "",
    hp: 10,
    hpFormula: "1d8+2",
    ac: 10,
    acDesc: "",
    speed: "30ft",
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    savingThrows: [],
    skills: [],
    senses: "",
    languages: "",
    abilities: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    icon: "",
    color: TOKEN_COLORS[Math.floor(Math.random() * TOKEN_COLORS.length)],
    gridSize: 1,
    showHPBar: true,
    showName: true,
    nameDisplay: "full",
    rollHPOnAdd: false,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function savedTokenFromCreature(creature: Creature): SavedToken {
  const now = new Date().toISOString();
  const sizeToGrid: Record<string, number> = {
    tiny: 1,
    small: 1,
    medium: 1,
    large: 2,
    huge: 3,
    gargantuan: 4,
  };
  return {
    id: generateId("stok"),
    name: creature.name,
    type: "hostile",
    source: "compendium",
    compendiumId: creature.id,
    creatureType: creature.type,
    size: creature.size,
    alignment: creature.alignment,
    cr: creature.cr,
    xp: creature.xp,
    tags: [...creature.tags],
    gmNotes: "",
    hp: creature.hp,
    hpFormula: creature.hpFormula,
    ac: creature.ac,
    acDesc: creature.acDesc,
    speed: creature.speed,
    str: creature.str,
    dex: creature.dex,
    con: creature.con,
    int: creature.int,
    wis: creature.wis,
    cha: creature.cha,
    savingThrows: [],
    skills: [...creature.skills],
    damageVulnerabilities: creature.damageVulnerabilities,
    damageResistances: creature.damageResistances,
    damageImmunities: creature.damageImmunities,
    conditionImmunities: creature.conditionImmunities,
    senses: creature.senses,
    languages: creature.languages,
    abilities: creature.abilities.map((a) => ({ ...a })),
    actions: creature.actions.map((a) => ({ ...a })),
    bonusActions: [],
    reactions: creature.reactions?.map((a) => ({ ...a })) ?? [],
    legendaryActions: creature.legendaryActions?.map((a) => ({ ...a })),
    icon: creature.icon,
    color: creature.color,
    gridSize: sizeToGrid[creature.size] ?? 1,
    showHPBar: true,
    showName: true,
    nameDisplay: "full",
    rollHPOnAdd: false,
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

interface TokenLibraryState {
  savedTokens: SavedToken[];
  encounterGroups: EncounterGroup[];

  // CRUD tokens
  createToken: (token: SavedToken) => void;
  updateToken: (id: string, updates: Partial<SavedToken>) => void;
  deleteToken: (id: string) => void;
  duplicateToken: (id: string) => SavedToken;
  saveFromCompendium: (creature: Creature) => SavedToken;

  // CRUD groups
  createGroup: (group: EncounterGroup) => void;
  updateGroup: (id: string, updates: Partial<EncounterGroup>) => void;
  deleteGroup: (id: string) => void;
  duplicateGroup: (id: string) => EncounterGroup;

  // Helpers
  toggleFavorite: (id: string) => void;
  toggleGroupFavorite: (id: string) => void;
}

export const useTokenLibraryStore = create<TokenLibraryState>()(
  persist(
    (set, get) => ({
      savedTokens: [],
      encounterGroups: [],

      // ── Token CRUD ──

      createToken: (token) =>
        set((s) => ({ savedTokens: [token, ...s.savedTokens] })),

      updateToken: (id, updates) =>
        set((s) => ({
          savedTokens: s.savedTokens.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t,
          ),
        })),

      deleteToken: (id) =>
        set((s) => ({
          savedTokens: s.savedTokens.filter((t) => t.id !== id),
        })),

      duplicateToken: (id) => {
        const original = get().savedTokens.find((t) => t.id === id);
        if (!original) return createDefaultSavedToken();
        const now = new Date().toISOString();
        const copy: SavedToken = {
          ...original,
          id: generateId("stok"),
          name: `${original.name} (copia)`,
          favorite: false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ savedTokens: [copy, ...s.savedTokens] }));
        return copy;
      },

      saveFromCompendium: (creature) => {
        const token = savedTokenFromCreature(creature);
        set((s) => ({ savedTokens: [token, ...s.savedTokens] }));
        return token;
      },

      // ── Group CRUD ──

      createGroup: (group) =>
        set((s) => ({ encounterGroups: [group, ...s.encounterGroups] })),

      updateGroup: (id, updates) =>
        set((s) => ({
          encounterGroups: s.encounterGroups.map((g) =>
            g.id === id ? { ...g, ...updates } : g,
          ),
        })),

      deleteGroup: (id) =>
        set((s) => ({
          encounterGroups: s.encounterGroups.filter((g) => g.id !== id),
        })),

      duplicateGroup: (id) => {
        const original = get().encounterGroups.find((g) => g.id === id);
        if (!original) {
          const empty: EncounterGroup = {
            id: generateId("egrp"),
            name: "",
            description: "",
            tags: [],
            members: [],
            formation: "free",
            hpMode: "fixed",
            autoRollInitiative: false,
            addToCombat: false,
            defaultVisibility: "visible",
            totalXP: 0,
            adjustedXP: 0,
            estimatedDifficulty: "trivial",
            favorite: false,
            createdAt: new Date().toISOString(),
          };
          return empty;
        }
        const copy: EncounterGroup = {
          ...original,
          id: generateId("egrp"),
          name: `${original.name} (copia)`,
          favorite: false,
          members: original.members.map((m) => ({ ...m })),
          tags: [...original.tags],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ encounterGroups: [copy, ...s.encounterGroups] }));
        return copy;
      },

      // ── Helpers ──

      toggleFavorite: (id) =>
        set((s) => ({
          savedTokens: s.savedTokens.map((t) =>
            t.id === id ? { ...t, favorite: !t.favorite } : t,
          ),
        })),

      toggleGroupFavorite: (id) =>
        set((s) => ({
          encounterGroups: s.encounterGroups.map((g) =>
            g.id === id ? { ...g, favorite: !g.favorite } : g,
          ),
        })),
    }),
    {
      name: "questboard-token-library",
      version: 1,
    },
  ),
);
