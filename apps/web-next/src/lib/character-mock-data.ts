import { getModifier } from "@questboard/utils";
import type { AbilityKey } from "@questboard/types";
import { DND5E_SKILLS } from "./dnd5e-data";
import type { SkillDefinition } from "./dnd5e-data";
import type {
  FullCharacter,
  CharacterAbility,
  CharacterSkill,
  SkillProficiency,
} from "./character-types";

// ─── Helpers ────────────────────────────────────────────

function makeAbility(score: number, save: boolean): CharacterAbility {
  return { score, modifier: getModifier(score), saveProficiency: save };
}

function makeSkills(
  abilities: Record<AbilityKey, CharacterAbility>,
  profBonus: number,
  proficient: Record<string, SkillProficiency>,
): CharacterSkill[] {
  return DND5E_SKILLS.map((def: SkillDefinition) => {
    const prof = proficient[def.name] ?? "none";
    const abilityMod = abilities[def.ability].modifier;
    let mod = abilityMod;
    if (prof === "proficient") mod += profBonus;
    else if (prof === "expertise") mod += profBonus * 2;
    return { name: def.name, ability: def.ability, proficiency: prof, modifier: mod };
  });
}

function getProfBonus(level: number): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

// ─── Empty data (previously mock) ───────────────────────

export const MOCK_FULL_CHARACTERS: Record<string, FullCharacter> = {};

export const TOKEN_TO_CHARACTER_MAP: Record<string, string> = {};
