import type { AbilityKey } from "@questboard/types";

export interface SkillDefinition {
  name: string;
  ability: AbilityKey;
}

export const DND5E_SKILLS: SkillDefinition[] = [
  { name: "Acrobacia", ability: "dex" },
  { name: "Adestrar Animais", ability: "wis" },
  { name: "Arcanismo", ability: "int" },
  { name: "Atletismo", ability: "str" },
  { name: "Enganação", ability: "cha" },
  { name: "Furtividade", ability: "dex" },
  { name: "História", ability: "int" },
  { name: "Intimidação", ability: "cha" },
  { name: "Intuição", ability: "wis" },
  { name: "Investigação", ability: "int" },
  { name: "Medicina", ability: "wis" },
  { name: "Natureza", ability: "int" },
  { name: "Percepção", ability: "wis" },
  { name: "Performance", ability: "cha" },
  { name: "Persuasão", ability: "cha" },
  { name: "Prestidigitação", ability: "dex" },
  { name: "Religião", ability: "int" },
  { name: "Sobrevivência", ability: "wis" },
];
