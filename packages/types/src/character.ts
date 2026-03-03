// ── Character Models ──

export interface Character {
  id: string;
  name: string;
  system: string;
  templateId: string | null;
  data: Record<string, unknown>;
  avatarUrl: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterTemplate {
  id: string;
  system: string;
  name: string;
  schema: Record<string, unknown>;
  version: number;
}

// ── D&D 5e Character Types (platform-independent, no icon imports) ──

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface AbilityBonus {
  ability: AbilityKey;
  bonus: number;
}

export interface RacialTrait {
  name: string;
  icon: string;
  shortDescription: string;
  description: string;
}

export interface RaceChoice {
  id: string;
  label: string;
  type: "cantrip" | "language" | "skill" | "tool" | "ability" | "ancestry";
  count?: number;
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
  icon: string;
  abilityBonuses: AbilityBonus[];
  size: "Small" | "Medium";
  speed: number;
  languages: string[];
  traits: RacialTrait[];
  subRaces: SubRace[];
  choices?: RaceChoice[];
}

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
  icon: string;
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

export interface DiceRollResult {
  dice: [number, number, number, number];
  dropped: number;
  total: number;
  ability: AbilityKey | null;
}

// ── Background Types ──

export interface BackgroundFeature {
  name: string;
  description: string;
}

export interface PersonalitySuggestion {
  id: string;
  text: string;
}

export interface Background {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languages: number;
  feature: BackgroundFeature;
  personalityTraits: PersonalitySuggestion[];
  ideals: PersonalitySuggestion[];
  bonds: PersonalitySuggestion[];
  flaws: PersonalitySuggestion[];
  equipment: string[];
}

export interface EquipmentOption {
  id: string;
  name: string;
  items: string[];
}

export interface EquipmentChoice {
  id: string;
  label: string;
  options: EquipmentOption[];
}

export interface ClassEquipmentPack {
  classId: string;
  fixed: string[];
  choices: EquipmentChoice[];
}

// ── Condition Types ──

export interface DndCondition {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// ── Character Sheet Types (gameplay) ──

export interface CharacterSheetAbility {
  score: number;
  modifier: number;
  saveProficiency: boolean;
}

export interface CharacterSheetSkill {
  name: string;
  modifier: number;
  proficient: boolean;
}

export interface CharacterSheetFeature {
  name: string;
  description: string;
  uses?: { current: number; max: number };
}

export interface CharacterSheetData {
  name: string;
  playerName: string;
  class: string;
  race: string;
  level: number;
  hp: { current: number; max: number };
  ac: number;
  initiative: number;
  speed: number;
  abilities: Record<AbilityKey, CharacterSheetAbility>;
  skills: CharacterSheetSkill[];
  proficiencies: string[];
  features: CharacterSheetFeature[];
}

export interface NPCAction {
  name: string;
  description: string;
  attackBonus?: number;
  damage?: string;
}

export type NPCHostility = "hostile" | "neutral" | "friendly";

export interface NPCStatBlock {
  name: string;
  type: string;
  hp: { current: number; max: number };
  ac: number;
  speed: number;
  passivePerception: number;
  hostility: NPCHostility;
  abilities: Record<AbilityKey, number>;
  actions: NPCAction[];
  traits: string[];
  conditions: string[];
}
