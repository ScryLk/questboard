// Cálculo de testes de resistência (saving throws).
//
// Cada classe tem proficiência em 2 atributos pra saving. Modificador =
// abilityMod + (proficient ? profBonus : 0).

import { abilityModifier } from "./ability";
import { proficiencyBonus } from "./proficiency";
import type { AbilityKey, AbilityScores, BreakdownEntry } from "./types";

export interface SavingThrowOutput {
  ability: AbilityKey;
  modifier: number;
  proficient: boolean;
  breakdown: BreakdownEntry[];
}

export function calculateSavingThrow(
  ability: AbilityKey,
  attributes: AbilityScores,
  level: number,
  proficient: boolean,
): SavingThrowOutput {
  const abilityMod = abilityModifier(attributes[ability]);
  const breakdown: BreakdownEntry[] = [
    { source: `Modificador de ${ability.toUpperCase()}`, value: abilityMod },
  ];

  let modifier = abilityMod;
  if (proficient) {
    const profBonus = proficiencyBonus(level);
    modifier += profBonus;
    breakdown.push({ source: "Proficiência", value: profBonus });
  }

  return { ability, modifier, proficient, breakdown };
}
