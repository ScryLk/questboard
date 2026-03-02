import type { LucideIcon } from "lucide-react-native";
import type {
  AbilityKey,
  AbilityBonus,
  RaceChoice,
  SkillChoices,
  ClassFeature,
  ClassRole,
  ClassComplexity,
} from "@questboard/types";

// ─── Re-export platform-independent types ───────────────

export type {
  AbilityKey,
  AbilityBonus,
  RaceChoice,
  FeatureChoice,
  ClassFeature,
  SkillChoices,
  ClassRole,
  ClassComplexity,
  DiceRollResult,
  BackgroundFeature,
  PersonalitySuggestion,
  EquipmentOption,
  EquipmentChoice,
  ClassEquipmentPack,
  CharacterSheetAbility,
  CharacterSheetSkill,
  CharacterSheetFeature,
  CharacterSheetData,
  NPCAction,
  NPCHostility,
  NPCStatBlock,
} from "@questboard/types";

// ─── Mobile-specific types (LucideIcon for native rendering) ──

export interface RacialTrait {
  name: string;
  icon: LucideIcon;
  shortDescription: string;
  description: string;
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
