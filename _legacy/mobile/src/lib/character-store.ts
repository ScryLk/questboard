import { create } from "zustand";
import { getModifier } from "./data/dnd5e/abilities";
import { MOCK_FULL_CHARACTERS } from "./character-mock-data";
import type { AbilityKey } from "./data/dnd5e/types";
import type { FullCharacter } from "./character-types";

// ─── Store Interface ────────────────────────────────────

interface CharacterStore {
  characters: Record<string, FullCharacter>;

  // Edit draft
  editDraft: FullCharacter | null;
  editCharacterId: string | null;

  // Collection
  loadCharacters: () => void;

  // Edit flow
  startEdit: (id: string) => void;
  updateDraft: (updates: Partial<FullCharacter>) => void;
  saveDraft: () => void;
  discardDraft: () => void;

  // Direct mutations
  updateCharacterHp: (id: string, delta: number) => void;
  updateFeatureUses: (id: string, featureId: string, delta: number) => void;
  updateSpellSlotUsed: (id: string, level: number, delta: number) => void;
  shortRest: (id: string) => void;
  longRest: (id: string) => void;
}

// ─── Helpers ────────────────────────────────────────────

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getProfBonus(level: number): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

/** Recompute skill modifiers from abilities and proficiency bonus */
function recomputeSkills(char: FullCharacter): FullCharacter {
  const profBonus = getProfBonus(char.level);
  return {
    ...char,
    proficiencyBonus: profBonus,
    skills: char.skills.map((skill) => {
      const abilityMod = char.abilities[skill.ability as AbilityKey]?.modifier ?? 0;
      let mod = abilityMod;
      if (skill.proficiency === "proficient") mod += profBonus;
      else if (skill.proficiency === "expertise") mod += profBonus * 2;
      return { ...skill, modifier: mod };
    }),
  };
}

/** Recompute ability modifiers from scores */
function recomputeAbilities(char: FullCharacter): FullCharacter {
  const abilities = { ...char.abilities };
  for (const key of Object.keys(abilities) as AbilityKey[]) {
    abilities[key] = {
      ...abilities[key],
      modifier: getModifier(abilities[key].score),
    };
  }
  return { ...char, abilities };
}

// ─── Store ──────────────────────────────────────────────

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: {},
  editDraft: null,
  editCharacterId: null,

  loadCharacters: () =>
    set({ characters: deepCopy(MOCK_FULL_CHARACTERS) }),

  // ─── Edit Flow ──────────────────────────────────────

  startEdit: (id) => {
    const char = get().characters[id];
    if (!char) return;
    set({ editDraft: deepCopy(char), editCharacterId: id });
  },

  updateDraft: (updates) =>
    set((s) => {
      if (!s.editDraft) return s;
      let draft = { ...s.editDraft, ...updates };
      // Recompute derived values if abilities changed
      if (updates.abilities) {
        draft = recomputeAbilities(draft);
        draft = recomputeSkills(draft);
      }
      // Recompute skills if level changed
      if (updates.level !== undefined) {
        draft = recomputeSkills(draft);
      }
      return { editDraft: draft };
    }),

  saveDraft: () => {
    const { editDraft, editCharacterId, characters } = get();
    if (!editDraft || !editCharacterId) return;
    set({
      characters: {
        ...characters,
        [editCharacterId]: { ...editDraft, updatedAt: new Date().toISOString() },
      },
      editDraft: null,
      editCharacterId: null,
    });
  },

  discardDraft: () => set({ editDraft: null, editCharacterId: null }),

  // ─── Direct Mutations ───────────────────────────────

  updateCharacterHp: (id, delta) =>
    set((s) => {
      const char = s.characters[id];
      if (!char) return s;
      const newHp = Math.max(0, Math.min(char.hp.max, char.hp.current + delta));
      return {
        characters: {
          ...s.characters,
          [id]: { ...char, hp: { ...char.hp, current: newHp } },
        },
      };
    }),

  updateFeatureUses: (id, featureId, delta) =>
    set((s) => {
      const char = s.characters[id];
      if (!char) return s;
      return {
        characters: {
          ...s.characters,
          [id]: {
            ...char,
            features: char.features.map((f) => {
              if (f.id !== featureId || !f.uses) return f;
              const newCurrent = Math.max(0, Math.min(f.uses.max, f.uses.current + delta));
              return { ...f, uses: { ...f.uses, current: newCurrent } };
            }),
          },
        },
      };
    }),

  updateSpellSlotUsed: (id, level, delta) =>
    set((s) => {
      const char = s.characters[id];
      if (!char) return s;
      return {
        characters: {
          ...s.characters,
          [id]: {
            ...char,
            spellSlots: char.spellSlots.map((slot) => {
              if (slot.level !== level) return slot;
              const newUsed = Math.max(0, Math.min(slot.total, slot.used + delta));
              return { ...slot, used: newUsed };
            }),
          },
        },
      };
    }),

  shortRest: (id) =>
    set((s) => {
      const char = s.characters[id];
      if (!char) return s;
      return {
        characters: {
          ...s.characters,
          [id]: {
            ...char,
            features: char.features.map((f) => {
              if (!f.uses || f.uses.reset !== "short") return f;
              return { ...f, uses: { ...f.uses, current: f.uses.max } };
            }),
          },
        },
      };
    }),

  longRest: (id) =>
    set((s) => {
      const char = s.characters[id];
      if (!char) return s;
      return {
        characters: {
          ...s.characters,
          [id]: {
            ...char,
            hp: { ...char.hp, current: char.hp.max },
            spellSlots: char.spellSlots.map((slot) => ({ ...slot, used: 0 })),
            hitDice: {
              ...char.hitDice,
              current: Math.min(
                char.hitDice.max,
                char.hitDice.current + Math.max(1, Math.floor(char.hitDice.max / 2)),
              ),
            },
            features: char.features.map((f) => {
              if (!f.uses || (f.uses.reset !== "short" && f.uses.reset !== "long")) return f;
              return { ...f, uses: { ...f.uses, current: f.uses.max } };
            }),
          },
        },
      };
    }),
}));
