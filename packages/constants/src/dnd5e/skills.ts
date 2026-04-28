// ── D&D 5e Skills (SRD 5.1) ──
//
// 18 perícias canônicas mapeadas pra atributo. Não inclui ferramentas
// (Tools) — essas são proficiências separadas no schema da ficha.

import type { AbilityKey } from "@questboard/types";

export const SKILLS_BY_ABILITY: Record<AbilityKey, string[]> = {
  str: ["athletics"],
  dex: ["acrobatics", "sleight-of-hand", "stealth"],
  con: [],
  int: ["arcana", "history", "investigation", "nature", "religion"],
  wis: ["animal-handling", "insight", "medicine", "perception", "survival"],
  cha: ["deception", "intimidation", "performance", "persuasion"],
};

export const ALL_SKILLS: readonly string[] = [
  "acrobatics",
  "animal-handling",
  "arcana",
  "athletics",
  "deception",
  "history",
  "insight",
  "intimidation",
  "investigation",
  "medicine",
  "nature",
  "perception",
  "performance",
  "persuasion",
  "religion",
  "sleight-of-hand",
  "stealth",
  "survival",
] as const;

export const SKILL_LABELS_PT: Record<string, string> = {
  acrobatics: "Acrobacia",
  "animal-handling": "Adestrar Animais",
  arcana: "Arcanismo",
  athletics: "Atletismo",
  deception: "Enganação",
  history: "História",
  insight: "Intuição",
  intimidation: "Intimidação",
  investigation: "Investigação",
  medicine: "Medicina",
  nature: "Natureza",
  perception: "Percepção",
  performance: "Atuação",
  persuasion: "Persuasão",
  religion: "Religião",
  "sleight-of-hand": "Prestidigitação",
  stealth: "Furtividade",
  survival: "Sobrevivência",
};

/** Lookup invertido — slug da perícia → atributo. Usado pra calcular
 *  modificador. Pré-computado pra evitar O(n) por chamada. */
export const SKILL_TO_ABILITY: Record<string, AbilityKey> = (() => {
  const map: Record<string, AbilityKey> = {};
  for (const ability of Object.keys(SKILLS_BY_ABILITY) as AbilityKey[]) {
    for (const skill of SKILLS_BY_ABILITY[ability]) {
      map[skill] = ability;
    }
  }
  return map;
})();

export function getAbilityForSkill(skill: string): AbilityKey | null {
  return SKILL_TO_ABILITY[skill] ?? null;
}
