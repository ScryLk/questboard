import type { AbilityKey } from "@questboard/types";

// ─── Skill Proficiency ──────────────────────────────────

export type SkillProficiency = "none" | "proficient" | "expertise";

// ─── Abilities ──────────────────────────────────────────

export interface CharacterAbility {
  score: number;
  modifier: number;
  saveProficiency: boolean;
}

// ─── Skills ─────────────────────────────────────────────

export interface CharacterSkill {
  name: string;
  ability: AbilityKey;
  proficiency: SkillProficiency;
  modifier: number;
}

// ─── Spells ─────────────────────────────────────────────

export interface CharacterSpell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
}

export interface SpellSlot {
  level: number;
  total: number;
  used: number;
}

export interface SpellcastingInfo {
  ability: AbilityKey;
  saveDC: number;
  attackBonus: number;
}

// ─── Inventory ──────────────────────────────────────────

export type ItemCategory = "weapon" | "armor" | "gear" | "consumable" | "treasure";

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  weight: number;
  equipped: boolean;
  description: string;
  damage?: string;
  attackBonus?: number;
  armorClass?: number;
  properties?: string[];
}

export interface Coins {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

// ─── Features ───────────────────────────────────────────

export type FeatureSource = "race" | "class" | "background" | "feat" | "custom";
export type FeatureReset = "short" | "long" | "manual";

export interface CharacterFeature {
  id: string;
  name: string;
  source: FeatureSource;
  description: string;
  uses: { current: number; max: number; reset: FeatureReset } | null;
}

// ─── Backstory ──────────────────────────────────────────

export interface CharacterBackstory {
  backgroundId: string | null;
  backgroundName: string;
  personalityTraits: string[];
  ideal: string;
  bond: string;
  flaw: string;
  backstory: string;
  appearance: string;
  age: string;
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  skin: string;
}

// ─── Full Character ─────────────────────────────────────

export interface FullCharacter {
  // Identity
  id: string;
  name: string;
  playerName: string;
  system: string;
  avatarIcon: string;
  avatarUrl: string | null;

  // Basics
  raceId: string | null;
  raceName: string;
  classId: string | null;
  className: string;
  level: number;
  xp: number;
  alignment: string | null;

  // Combat stats
  hp: { current: number; max: number; temp: number };
  ac: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;
  hitDice: { current: number; max: number; die: number };

  // Abilities & Skills
  abilities: Record<AbilityKey, CharacterAbility>;
  skills: CharacterSkill[];

  // Proficiencies
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };

  // Features
  features: CharacterFeature[];

  // Spellcasting
  spellcasting: SpellcastingInfo | null;
  spellSlots: SpellSlot[];
  spells: CharacterSpell[];

  // Inventory
  coins: Coins;
  inventory: InventoryItem[];
  carryCapacity: number;

  // Backstory
  backstory: CharacterBackstory;

  // Notes
  notes: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}
