"use client";

// ── D&D 5e character wizard store ──
//
// Estado in-memory do wizard de 10 passos (não persiste — quem
// abandona o wizard reseta no próximo `enter`). Quando o user clica
// "Criar personagem" no passo 10, o estado é convertido em
// `CampaignCharacter` e enviado ao characterStore canônico.
//
// Atributos seguem ponto buy 27 (PHB) — começam todos em 8 e o user
// gasta pontos. Standard array é alternativa.

import { create } from "zustand";

export type StatMethod = "point-buy" | "standard-array" | "manual";

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface Dnd5eWizardState {
  step: number; // 1-10
  systemSlug: "dnd5e";

  // Step 2: Raça
  raceSlug: string | null;

  // Step 3: Classe (subclasse só no nível 3+, ignorado no MVP)
  classSlug: string | null;

  // Step 4: Background
  background: string | null;

  // Step 5: Atributos
  statMethod: StatMethod;
  attributes: Record<AbilityKey, number>;

  // Step 6: Perícias selecionadas (slugs)
  skillProficiencies: string[];

  // Step 7: Equipamento — slugs do compêndio que o usuário escolhe
  // levar de início. MVP: usuário marca os básicos sem pacote completo.
  equipment: string[];

  // Step 8: Magias (só pra classes conjuradoras)
  cantrips: string[];
  firstLevelSpells: string[];

  // Step 9: Detalhes
  name: string;
  alignment: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  // Actions
  setStep: (step: number) => void;
  next: () => void;
  prev: () => void;
  setRace: (slug: string) => void;
  setClass: (slug: string) => void;
  setBackground: (background: string) => void;
  setStatMethod: (method: StatMethod) => void;
  setAttribute: (ability: AbilityKey, value: number) => void;
  setAttributes: (attrs: Record<AbilityKey, number>) => void;
  toggleSkill: (skill: string, max: number) => void;
  toggleEquipment: (slug: string) => void;
  toggleCantrip: (slug: string, max: number) => void;
  toggleFirstLevelSpell: (slug: string, max: number) => void;
  setDetail: <K extends DetailField>(field: K, value: string) => void;
  reset: () => void;
}

type DetailField =
  | "name"
  | "alignment"
  | "personalityTraits"
  | "ideals"
  | "bonds"
  | "flaws";

const INITIAL_ATTRS: Record<AbilityKey, number> = {
  str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
};

const INITIAL: Omit<Dnd5eWizardState, keyof Actions> = {
  step: 1,
  systemSlug: "dnd5e",
  raceSlug: null,
  classSlug: null,
  background: null,
  statMethod: "point-buy",
  attributes: { ...INITIAL_ATTRS },
  skillProficiencies: [],
  equipment: [],
  cantrips: [],
  firstLevelSpells: [],
  name: "",
  alignment: "",
  personalityTraits: "",
  ideals: "",
  bonds: "",
  flaws: "",
};

type Actions = Pick<
  Dnd5eWizardState,
  | "setStep"
  | "next"
  | "prev"
  | "setRace"
  | "setClass"
  | "setBackground"
  | "setStatMethod"
  | "setAttribute"
  | "setAttributes"
  | "toggleSkill"
  | "toggleEquipment"
  | "toggleCantrip"
  | "toggleFirstLevelSpell"
  | "setDetail"
  | "reset"
>;

export const useDnd5eWizardStore = create<Dnd5eWizardState>((set) => ({
  ...INITIAL,

  setStep: (step) => set({ step: Math.max(1, Math.min(10, step)) }),
  next: () => set((s) => ({ step: Math.min(10, s.step + 1) })),
  prev: () => set((s) => ({ step: Math.max(1, s.step - 1) })),

  setRace: (slug) => set({ raceSlug: slug }),
  setClass: (slug) =>
    set({
      classSlug: slug,
      // Trocar classe limpa skill/spell selections (lista de opções muda).
      skillProficiencies: [],
      cantrips: [],
      firstLevelSpells: [],
    }),
  setBackground: (background) => set({ background }),

  setStatMethod: (method) => {
    if (method === "standard-array") {
      // Default: 15/14/13/12/10/8, usuário arrasta no step. Por
      // simplicidade colocamos em ordem natural — ajusta no UI.
      set({
        statMethod: method,
        attributes: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      });
    } else if (method === "point-buy") {
      set({ statMethod: method, attributes: { ...INITIAL_ATTRS } });
    } else {
      set({ statMethod: method });
    }
  },
  setAttribute: (ability, value) =>
    set((s) => ({
      attributes: { ...s.attributes, [ability]: value },
    })),
  setAttributes: (attrs) => set({ attributes: attrs }),

  toggleSkill: (skill, max) =>
    set((s) => {
      if (s.skillProficiencies.includes(skill)) {
        return {
          skillProficiencies: s.skillProficiencies.filter((sk) => sk !== skill),
        };
      }
      if (s.skillProficiencies.length >= max) return s;
      return { skillProficiencies: [...s.skillProficiencies, skill] };
    }),

  toggleEquipment: (slug) =>
    set((s) => ({
      equipment: s.equipment.includes(slug)
        ? s.equipment.filter((e) => e !== slug)
        : [...s.equipment, slug],
    })),

  toggleCantrip: (slug, max) =>
    set((s) => {
      if (s.cantrips.includes(slug)) {
        return { cantrips: s.cantrips.filter((c) => c !== slug) };
      }
      if (s.cantrips.length >= max) return s;
      return { cantrips: [...s.cantrips, slug] };
    }),

  toggleFirstLevelSpell: (slug, max) =>
    set((s) => {
      if (s.firstLevelSpells.includes(slug)) {
        return {
          firstLevelSpells: s.firstLevelSpells.filter((sp) => sp !== slug),
        };
      }
      if (s.firstLevelSpells.length >= max) return s;
      return { firstLevelSpells: [...s.firstLevelSpells, slug] };
    }),

  setDetail: (field, value) => set({ [field]: value } as Partial<Dnd5eWizardState>),

  reset: () => set({ ...INITIAL, attributes: { ...INITIAL_ATTRS } }),
}));

// ── Point Buy helpers ──

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};
export const POINT_BUY_TOTAL = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

export function pointBuyCost(score: number): number {
  return POINT_BUY_COSTS[score] ?? 0;
}

export function totalPointsSpent(attrs: Record<AbilityKey, number>): number {
  let total = 0;
  for (const ability of Object.keys(attrs) as AbilityKey[]) {
    total += pointBuyCost(attrs[ability]);
  }
  return total;
}
