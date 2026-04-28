// Cálculo de modificadores de perícia.
//
// modifier = abilityMod + (proficient ? profBonus : 0) + (expertise ? profBonus : 0)
//
// Expertise (Ladino/Bardo) DOBRA o bônus de proficiência (não soma um
// terceiro multiplicador). Uma perícia com expertise SEMPRE é proficiente.

import { abilityModifier } from "./ability";
import { proficiencyBonus } from "./proficiency";
import type { AbilityKey, AbilityScores, BreakdownEntry } from "./types";

const SKILL_TO_ABILITY: Record<string, AbilityKey> = {
  acrobatics: "dex",
  "animal-handling": "wis",
  arcana: "int",
  athletics: "str",
  deception: "cha",
  history: "int",
  insight: "wis",
  intimidation: "cha",
  investigation: "int",
  medicine: "wis",
  nature: "int",
  perception: "wis",
  performance: "cha",
  persuasion: "cha",
  religion: "int",
  "sleight-of-hand": "dex",
  stealth: "dex",
  survival: "wis",
};

export function getAbilityForSkill(skill: string): AbilityKey | null {
  return SKILL_TO_ABILITY[skill] ?? null;
}

export interface SkillModifierContext {
  skill: string;
  attributes: AbilityScores;
  level: number;
  proficient: boolean;
  expertise: boolean;
}

export interface SkillModifierOutput {
  skill: string;
  ability: AbilityKey;
  modifier: number;
  proficient: boolean;
  expertise: boolean;
  breakdown: BreakdownEntry[];
}

export function calculateSkillModifier(
  ctx: SkillModifierContext,
): SkillModifierOutput {
  const ability = getAbilityForSkill(ctx.skill);
  if (!ability) {
    throw new Error(`Perícia desconhecida: ${ctx.skill}`);
  }
  const abilityMod = abilityModifier(ctx.attributes[ability]);
  const profBonus = proficiencyBonus(ctx.level);

  const breakdown: BreakdownEntry[] = [
    { source: `Modificador de ${ability.toUpperCase()}`, value: abilityMod },
  ];

  let modifier = abilityMod;

  if (ctx.proficient) {
    modifier += profBonus;
    breakdown.push({ source: "Proficiência", value: profBonus });
  }
  if (ctx.expertise) {
    modifier += profBonus;
    breakdown.push({ source: "Especialização (×2)", value: profBonus });
  }

  return {
    skill: ctx.skill,
    ability,
    modifier,
    proficient: ctx.proficient || ctx.expertise,
    expertise: ctx.expertise,
    breakdown,
  };
}
