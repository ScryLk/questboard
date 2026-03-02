import type { LucideIcon } from "lucide-react-native";

// ─── Ability Scores ──────────────────────────────────────

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface AbilityBonus {
  ability: AbilityKey;
  bonus: number;
}

// ─── Races ───────────────────────────────────────────────

export interface RacialTrait {
  name: string;
  icon: LucideIcon;
  shortDescription: string;
  description: string;
}

export interface RaceChoice {
  id: string;
  label: string;
  type: "cantrip" | "language" | "skill" | "tool" | "ability" | "ancestry";
  count?: number; // for multi-select (e.g., Half-Elf +1 to two abilities)
  options: { id: string; name: string; description?: string }[];
}

export interface SubRace {
  id: string;
  name: string;
  abilityBonuses: AbilityBonus[];
  traits: RacialTrait[];
  choices?: RaceChoice[];
}

export interface Race {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  abilityBonuses: AbilityBonus[];
  size: "Small" | "Medium";
  speed: number;
  languages: string[];
  traits: RacialTrait[];
  subRaces: SubRace[];
  choices?: RaceChoice[];
}

// ─── Classes ─────────────────────────────────────────────

export interface FeatureChoice {
  id: string;
  label: string;
  options: { id: string; name: string; description: string }[];
}

export interface ClassFeature {
  name: string;
  description: string;
  level: number;
  choices?: FeatureChoice;
}

export interface SkillChoices {
  count: number;
  options: string[];
}

export type ClassRole = "martial" | "caster" | "hybrid" | "support";
export type ClassComplexity = "simple" | "moderate" | "complex";

export interface CharacterClass {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  color: string;
  hitDie: number;
  primaryAbilities: AbilityKey[];
  savingThrows: AbilityKey[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies?: string[];
  skillChoices: SkillChoices;
  features: ClassFeature[];
  role: ClassRole;
  complexity: ClassComplexity;
}

// ─── Dice Rolling ────────────────────────────────────────

export interface DiceRollResult {
  dice: [number, number, number, number];
  dropped: number;
  total: number;
  ability: AbilityKey | null;
}
