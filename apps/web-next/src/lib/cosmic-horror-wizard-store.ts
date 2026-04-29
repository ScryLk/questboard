"use client";

// ── Cosmic horror character wizard store ──
//
// Estado in-memory do wizard de 8 passos. Não persiste — abandono
// reseta no próximo enter. No passo 8 confirma e converte pra
// `CampaignCharacter` via characterStore.
//
// Atributos podem ser rolados (3d6×5 ou (2d6+6)×5) ou inseridos
// manualmente. Skills começam na base canônica e o usuário aloca os
// pontos de ocupação + interesse pessoal por cima.

import { create } from "zustand";
import type {
  CosmicHorrorAttrKey,
  CosmicHorrorWeaponEntry,
} from "@/types/character";

type AttrKey = CosmicHorrorAttrKey;

const ATTR_KEYS: AttrKey[] = [
  "for",
  "con",
  "tam",
  "des",
  "apa",
  "int",
  "pod",
  "edu",
];

export type AttrMethod = "roll" | "manual";

export interface CosmicHorrorWizardState {
  step: number; // 1..8

  // Step 1 — Identidade
  name: string;
  age: number;
  birthplace: string;
  residence: string;

  // Step 2 — Atributos
  attrMethod: AttrMethod;
  attributes: Record<AttrKey, number>;

  // Step 3 — Ocupação
  occupationSlug: string | null;

  // Step 4 — Skills
  /** Map slug → valor final escolhido pelo usuário (já com base
   *  considerada). Skills não tocadas saem da base. */
  skills: Record<string, number>;
  /** Slugs das skills opcionais selecionadas (ocupação dá N opcionais). */
  optionalSkillSlugs: string[];

  // Step 5 — Sanidade & Sorte
  /** Roll inicial de sorte (3d6×5). Null até o usuário rolar. */
  luck: number | null;
  /** Sanidade atual = startingMax - mythosKnowledge inicial = POD inicial. */

  // Step 6 — Equipamento
  weapons: CosmicHorrorWeaponEntry[];
  belongings: string[];
  creditRating: number;

  // Step 7 — Backstory
  personalDescription: string;
  ideologyBeliefs: string;
  significantPeople: string;
  meaningfulLocations: string;
  treasuredPossessions: string;
  traits: string;
  injuriesScars: string;
  phobiasManias: string;

  /** Quando preenchido, submit final atualiza esse personagem em vez
   *  de criar um novo. Set pelo modo "Editar cosmic-horror" via ?edit=ID. */
  editingCharacterId: string | null;

  // Actions
  setStep: (step: number) => void;
  next: () => void;
  prev: () => void;

  setName: (name: string) => void;
  setAge: (age: number) => void;
  setBirthplace: (v: string) => void;
  setResidence: (v: string) => void;

  setAttrMethod: (m: AttrMethod) => void;
  setAttribute: (key: AttrKey, value: number) => void;
  rollAttributes: () => void;

  setOccupation: (slug: string) => void;

  setSkill: (slug: string, value: number) => void;
  toggleOptionalSkill: (slug: string, max: number) => void;

  rollLuck: () => void;
  setLuck: (v: number) => void;

  addWeapon: (w: CosmicHorrorWeaponEntry) => void;
  removeWeapon: (index: number) => void;
  addBelonging: (b: string) => void;
  removeBelonging: (index: number) => void;
  setCreditRating: (v: number) => void;

  setBackstoryField: (
    field:
      | "personalDescription"
      | "ideologyBeliefs"
      | "significantPeople"
      | "meaningfulLocations"
      | "treasuredPossessions"
      | "traits"
      | "injuriesScars"
      | "phobiasManias",
    value: string,
  ) => void;

  hydrateFromCharacter: (
    characterId: string,
    data: {
      name: string;
      age: number;
      birthplace?: string;
      residence?: string;
      occupation: string;
      attributes: Record<AttrKey, number>;
      skills: Record<string, number>;
      luck: number;
      weapons: CosmicHorrorWeaponEntry[];
      belongings: string[];
      creditRating: number;
      personalDescription?: string;
      ideologyBeliefs?: string;
      significantPeople?: string;
      meaningfulLocations?: string;
      treasuredPossessions?: string;
      traits?: string;
      injuriesScars?: string;
      phobiasManias?: string;
    },
  ) => void;
  reset: () => void;
}

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/** 3d6 × 5 — gera 15-90 (mais provável centralizado em 52). */
function roll3d6Times5(): number {
  return (rollD6() + rollD6() + rollD6()) * 5;
}

/** (2d6 + 6) × 5 — gera 40-90, atributos "civilizados". */
function roll2d6Plus6Times5(): number {
  return (rollD6() + rollD6() + 6) * 5;
}

function generateAttrs(): Record<AttrKey, number> {
  return {
    for: roll3d6Times5(),
    con: roll3d6Times5(),
    tam: roll2d6Plus6Times5(),
    des: roll3d6Times5(),
    apa: roll3d6Times5(),
    int: roll2d6Plus6Times5(),
    pod: roll3d6Times5(),
    edu: roll2d6Plus6Times5(),
  };
}

const INITIAL_ATTRS: Record<AttrKey, number> = {
  for: 50,
  con: 50,
  tam: 65,
  des: 50,
  apa: 50,
  int: 65,
  pod: 50,
  edu: 65,
};

const INITIAL: Pick<
  CosmicHorrorWizardState,
  | "step"
  | "name"
  | "age"
  | "birthplace"
  | "residence"
  | "attrMethod"
  | "attributes"
  | "occupationSlug"
  | "skills"
  | "optionalSkillSlugs"
  | "luck"
  | "weapons"
  | "belongings"
  | "creditRating"
  | "personalDescription"
  | "ideologyBeliefs"
  | "significantPeople"
  | "meaningfulLocations"
  | "treasuredPossessions"
  | "traits"
  | "injuriesScars"
  | "phobiasManias"
  | "editingCharacterId"
> = {
  step: 1,
  name: "",
  age: 30,
  birthplace: "",
  residence: "",
  attrMethod: "manual",
  attributes: { ...INITIAL_ATTRS },
  occupationSlug: null,
  skills: {},
  optionalSkillSlugs: [],
  luck: null,
  weapons: [],
  belongings: [],
  creditRating: 30,
  personalDescription: "",
  ideologyBeliefs: "",
  significantPeople: "",
  meaningfulLocations: "",
  treasuredPossessions: "",
  traits: "",
  injuriesScars: "",
  phobiasManias: "",
  editingCharacterId: null,
};

export const useCosmicHorrorWizardStore = create<CosmicHorrorWizardState>(
  (set) => ({
    ...INITIAL,

    setStep: (step) => set({ step: Math.max(1, Math.min(8, step)) }),
    next: () => set((s) => ({ step: Math.min(8, s.step + 1) })),
    prev: () => set((s) => ({ step: Math.max(1, s.step - 1) })),

    setName: (name) => set({ name }),
    setAge: (age) => set({ age: Math.max(15, Math.min(90, age)) }),
    setBirthplace: (birthplace) => set({ birthplace }),
    setResidence: (residence) => set({ residence }),

    setAttrMethod: (m) => set({ attrMethod: m }),
    setAttribute: (key, value) =>
      set((s) => ({
        attributes: {
          ...s.attributes,
          [key]: Math.max(15, Math.min(99, value)),
        },
      })),
    rollAttributes: () => set({ attributes: generateAttrs(), attrMethod: "roll" }),

    setOccupation: (slug) =>
      set((s) => ({
        occupationSlug: slug,
        // Trocar ocupação reseta optional skills (pool de skills mudou).
        optionalSkillSlugs: s.occupationSlug === slug ? s.optionalSkillSlugs : [],
      })),

    setSkill: (slug, value) =>
      set((s) => ({
        skills: { ...s.skills, [slug]: Math.max(0, Math.min(99, value)) },
      })),

    toggleOptionalSkill: (slug, max) =>
      set((s) => {
        if (s.optionalSkillSlugs.includes(slug)) {
          return {
            optionalSkillSlugs: s.optionalSkillSlugs.filter((x) => x !== slug),
          };
        }
        if (s.optionalSkillSlugs.length >= max) return s;
        return { optionalSkillSlugs: [...s.optionalSkillSlugs, slug] };
      }),

    rollLuck: () => set({ luck: roll3d6Times5() }),
    setLuck: (v) => set({ luck: Math.max(15, Math.min(99, v)) }),

    addWeapon: (w) => set((s) => ({ weapons: [...s.weapons, w] })),
    removeWeapon: (index) =>
      set((s) => ({ weapons: s.weapons.filter((_, i) => i !== index) })),

    addBelonging: (b) =>
      set((s) =>
        b.trim() ? { belongings: [...s.belongings, b.trim()] } : s,
      ),
    removeBelonging: (index) =>
      set((s) => ({ belongings: s.belongings.filter((_, i) => i !== index) })),
    setCreditRating: (v) =>
      set({ creditRating: Math.max(0, Math.min(99, v)) }),

    setBackstoryField: (field, value) =>
      set({ [field]: value } as Partial<CosmicHorrorWizardState>),

    hydrateFromCharacter: (characterId, data) =>
      set({
        ...INITIAL,
        editingCharacterId: characterId,
        step: 8,
        name: data.name,
        age: data.age,
        birthplace: data.birthplace ?? "",
        residence: data.residence ?? "",
        attrMethod: "manual",
        attributes: { ...data.attributes },
        occupationSlug: data.occupation,
        skills: { ...data.skills },
        luck: data.luck,
        weapons: [...data.weapons],
        belongings: [...data.belongings],
        creditRating: data.creditRating,
        personalDescription: data.personalDescription ?? "",
        ideologyBeliefs: data.ideologyBeliefs ?? "",
        significantPeople: data.significantPeople ?? "",
        meaningfulLocations: data.meaningfulLocations ?? "",
        treasuredPossessions: data.treasuredPossessions ?? "",
        traits: data.traits ?? "",
        injuriesScars: data.injuriesScars ?? "",
        phobiasManias: data.phobiasManias ?? "",
      }),

    reset: () => set({ ...INITIAL, attributes: { ...INITIAL_ATTRS } }),
  }),
);

// ── Helpers ──

export const COSMIC_HORROR_ATTR_KEYS = ATTR_KEYS;

interface OccupationFormula {
  base: Array<{ attr: AttrKey; multiplier: number }>;
  choice?: {
    pickCount: number;
    options: Array<{ attr: AttrKey; multiplier: number }>;
  };
}

/** Pontos de skill da ocupação. Para formulas com choice, escolhe o
 *  maior valor entre as opções (assume que o jogador opta pelo melhor). */
export function calculateOccupationSkillPoints(
  formula: OccupationFormula,
  attrs: Record<AttrKey, number>,
): number {
  let total = 0;
  for (const term of formula.base) {
    total += (attrs[term.attr] ?? 0) * term.multiplier;
  }
  if (formula.choice) {
    const sorted = [...formula.choice.options]
      .map((o) => (attrs[o.attr] ?? 0) * o.multiplier)
      .sort((a, b) => b - a);
    for (let i = 0; i < formula.choice.pickCount && i < sorted.length; i++) {
      total += sorted[i] ?? 0;
    }
  }
  return total;
}

export function formatOccupationFormula(formula: OccupationFormula): string {
  const baseStr = formula.base
    .map((t) => `${t.attr.toUpperCase()} × ${t.multiplier}`)
    .join(" + ");
  if (!formula.choice) return baseStr;
  const choiceStr = formula.choice.options
    .map((o) => `${o.attr.toUpperCase()} × ${o.multiplier}`)
    .join(" ou ");
  return `${baseStr} + (${choiceStr})${formula.choice.pickCount > 1 ? ` × ${formula.choice.pickCount}` : ""}`;
}

/** Pontos de interesse pessoal — sempre INT × 2 no canônico. */
export function calculateInterestSkillPoints(int: number): number {
  return int * 2;
}
