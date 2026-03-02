import { create } from "zustand";
import type { AbilityKey, DiceRollResult } from "./data/dnd5e/types";
import { DND5E_RACES } from "./data/dnd5e/races";
import { DND5E_CLASSES } from "./data/dnd5e/classes";
import {
  getModifier,
  computeHP,
  computeBaseAC,
  computeInitiative,
} from "./data/dnd5e/abilities";

// ─── State Interfaces ────────────────────────────────────

export interface CharacterIdentity {
  name: string;
  concept: string;
  level: number;
  alignment: string | null;
}

export interface CharacterRaceState {
  raceId: string | null;
  subRaceId: string | null;
  choices: Record<string, string | string[]>;
}

export interface CharacterClassState {
  classId: string | null;
  skills: string[];
  featureChoices: Record<string, string>;
}

export type AbilityMethod = "roll" | "point-buy" | "standard-array" | null;

export interface CharacterAbilitiesState {
  method: AbilityMethod;
  baseScores: Record<AbilityKey, number>;
  rollResults: DiceRollResult[];
  standardArrayAssignment: Record<AbilityKey, number | null>;
}

export interface CharacterCreationState {
  systemId: string | null;
  currentStep: number;
  totalSteps: number;

  identity: CharacterIdentity;
  race: CharacterRaceState;
  class_: CharacterClassState;
  abilities: CharacterAbilitiesState;

  setSystem: (systemId: string) => void;
  setStep: (step: number) => void;
  updateIdentity: (data: Partial<CharacterIdentity>) => void;
  updateRace: (data: Partial<CharacterRaceState>) => void;
  updateClass: (data: Partial<CharacterClassState>) => void;
  updateAbilities: (data: Partial<CharacterAbilitiesState>) => void;
  setAbilityScore: (ability: AbilityKey, value: number) => void;
  reset: () => void;
}

// ─── Initial Values ──────────────────────────────────────

const INITIAL_IDENTITY: CharacterIdentity = {
  name: "",
  concept: "",
  level: 1,
  alignment: null,
};

const INITIAL_RACE: CharacterRaceState = {
  raceId: null,
  subRaceId: null,
  choices: {},
};

const INITIAL_CLASS: CharacterClassState = {
  classId: null,
  skills: [],
  featureChoices: {},
};

const INITIAL_ABILITIES: CharacterAbilitiesState = {
  method: null,
  baseScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  rollResults: [],
  standardArrayAssignment: {
    str: null,
    dex: null,
    con: null,
    int: null,
    wis: null,
    cha: null,
  },
};

// ─── Store ───────────────────────────────────────────────

export const useCharacterCreationStore = create<CharacterCreationState>(
  (set) => ({
    systemId: null,
    currentStep: 0,
    totalSteps: 5,

    identity: { ...INITIAL_IDENTITY },
    race: { ...INITIAL_RACE },
    class_: { ...INITIAL_CLASS },
    abilities: {
      ...INITIAL_ABILITIES,
      baseScores: { ...INITIAL_ABILITIES.baseScores },
      standardArrayAssignment: { ...INITIAL_ABILITIES.standardArrayAssignment },
    },

    setSystem: (systemId) => set({ systemId, currentStep: 1 }),

    setStep: (step) => set({ currentStep: step }),

    updateIdentity: (data) =>
      set((state) => ({
        identity: { ...state.identity, ...data },
      })),

    updateRace: (data) =>
      set((state) => ({
        race: { ...state.race, ...data },
      })),

    updateClass: (data) =>
      set((state) => ({
        class_: { ...state.class_, ...data },
      })),

    updateAbilities: (data) =>
      set((state) => ({
        abilities: { ...state.abilities, ...data },
      })),

    setAbilityScore: (ability, value) =>
      set((state) => ({
        abilities: {
          ...state.abilities,
          baseScores: { ...state.abilities.baseScores, [ability]: value },
        },
      })),

    reset: () =>
      set({
        systemId: null,
        currentStep: 0,
        identity: { ...INITIAL_IDENTITY },
        race: { ...INITIAL_RACE },
        class_: { ...INITIAL_CLASS },
        abilities: {
          ...INITIAL_ABILITIES,
          baseScores: { ...INITIAL_ABILITIES.baseScores },
          standardArrayAssignment: {
            ...INITIAL_ABILITIES.standardArrayAssignment,
          },
        },
      }),
  }),
);

// ─── Computed Selectors ──────────────────────────────────

export function getRacialBonuses(
  state: CharacterCreationState,
): Record<AbilityKey, number> {
  const bonuses: Record<AbilityKey, number> = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  };
  const race = DND5E_RACES.find((r) => r.id === state.race.raceId);
  if (!race) return bonuses;

  for (const b of race.abilityBonuses) {
    bonuses[b.ability] += b.bonus;
  }

  if (state.race.subRaceId) {
    const subRace = race.subRaces.find(
      (s) => s.id === state.race.subRaceId,
    );
    if (subRace) {
      for (const b of subRace.abilityBonuses) {
        bonuses[b.ability] += b.bonus;
      }
    }
  }

  // Handle Half-Elf ability bonus choices
  const abilityChoice = state.race.choices["half-elf-ability-bonus"];
  if (race.id === "half-elf" && Array.isArray(abilityChoice)) {
    for (const id of abilityChoice) {
      if (id in bonuses) {
        bonuses[id as AbilityKey] += 1;
      }
    }
  }

  return bonuses;
}

export function getFinalScores(
  state: CharacterCreationState,
): Record<AbilityKey, number> {
  const bonuses = getRacialBonuses(state);
  const result = { ...state.abilities.baseScores };
  for (const key of Object.keys(result) as AbilityKey[]) {
    result[key] += bonuses[key];
  }
  return result;
}

export function getComputedStats(state: CharacterCreationState) {
  const scores = getFinalScores(state);
  const cls = DND5E_CLASSES.find((c) => c.id === state.class_.classId);
  const hitDie = cls?.hitDie ?? 8;

  return {
    hp: computeHP(hitDie, scores.con, state.identity.level),
    ac: computeBaseAC(scores.dex),
    initiative: computeInitiative(scores.dex),
  };
}
