/**
 * Level Up System — XP thresholds, HP options (roll/average/manual),
 * ability score improvements, feature choices, spell slot progression.
 */

// ── Types ──

export interface LevelUpChoices {
  hpMethod: "roll" | "average" | "manual";
  hpRoll?: number;
  hpManual?: number;
  abilityScoreImprovements?: Record<string, number>;
  featChoice?: string;
  classFeatureChoices?: Record<string, string>;
  newSpells?: string[];
  skillProficiencies?: string[];
}

export interface LevelUpResult {
  previousLevel: number;
  newLevel: number;
  hpGained: number;
  newFeatures: string[];
  spellSlotsGained: Record<string, number>;
  changes: Record<string, unknown>;
}

export interface LevelConfig {
  hitDie: number; // e.g., 8 for d8, 10 for d10
  xpThresholds?: number[]; // Custom XP table, index = level
  asiLevels?: number[]; // Levels that grant ASI (default: 4, 8, 12, 16, 19)
  spellProgression?: "full" | "half" | "third" | "none";
}

// ── XP Thresholds (D&D 5e default) ──

const DND5E_XP_THRESHOLDS = [
  0,       // Level 1
  300,     // Level 2
  900,     // Level 3
  2700,    // Level 4
  6500,    // Level 5
  14000,   // Level 6
  23000,   // Level 7
  34000,   // Level 8
  48000,   // Level 9
  64000,   // Level 10
  85000,   // Level 11
  100000,  // Level 12
  120000,  // Level 13
  140000,  // Level 14
  165000,  // Level 15
  195000,  // Level 16
  225000,  // Level 17
  265000,  // Level 18
  305000,  // Level 19
  355000,  // Level 20
];

const DEFAULT_ASI_LEVELS = [4, 8, 12, 16, 19];

// ── Spell Slot Progression Tables ──

const FULL_CASTER_SLOTS: Record<number, Record<number, number>> = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

const HALF_CASTER_SLOTS: Record<number, Record<number, number>> = {
  2: { 1: 2 },
  3: { 1: 3 },
  4: { 1: 3 },
  5: { 1: 4, 2: 2 },
  6: { 1: 4, 2: 2 },
  7: { 1: 4, 2: 3 },
  8: { 1: 4, 2: 3 },
  9: { 1: 4, 2: 3, 3: 2 },
  10: { 1: 4, 2: 3, 3: 2 },
  11: { 1: 4, 2: 3, 3: 3 },
  12: { 1: 4, 2: 3, 3: 3 },
  13: { 1: 4, 2: 3, 3: 3, 4: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 2 },
  16: { 1: 4, 2: 3, 3: 3, 4: 2 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
};

const THIRD_CASTER_SLOTS: Record<number, Record<number, number>> = {
  3: { 1: 2 },
  4: { 1: 3 },
  5: { 1: 3 },
  6: { 1: 3 },
  7: { 1: 4, 2: 2 },
  8: { 1: 4, 2: 2 },
  9: { 1: 4, 2: 2 },
  10: { 1: 4, 2: 3 },
  11: { 1: 4, 2: 3 },
  12: { 1: 4, 2: 3 },
  13: { 1: 4, 2: 3, 3: 2 },
  14: { 1: 4, 2: 3, 3: 2 },
  15: { 1: 4, 2: 3, 3: 2 },
  16: { 1: 4, 2: 3, 3: 3 },
  17: { 1: 4, 2: 3, 3: 3 },
  18: { 1: 4, 2: 3, 3: 3 },
  19: { 1: 4, 2: 3, 3: 3, 4: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 1 },
};

// ── Core Functions ──

/**
 * Check if a character can level up based on XP.
 */
export function canLevelUp(
  currentLevel: number,
  experience: number,
  config?: LevelConfig
): boolean {
  if (currentLevel >= 20) return false;
  const thresholds = config?.xpThresholds ?? DND5E_XP_THRESHOLDS;
  const nextLevelXP = thresholds[currentLevel]; // index = level means next level threshold
  if (nextLevelXP === undefined) return false;
  return experience >= nextLevelXP;
}

/**
 * Get XP required for next level.
 */
export function xpForNextLevel(
  currentLevel: number,
  config?: LevelConfig
): number | null {
  if (currentLevel >= 20) return null;
  const thresholds = config?.xpThresholds ?? DND5E_XP_THRESHOLDS;
  return thresholds[currentLevel] ?? null;
}

/**
 * Calculate proficiency bonus for a given level (D&D 5e).
 */
export function proficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

/**
 * Check if a level grants an Ability Score Improvement.
 */
export function isASILevel(level: number, config?: LevelConfig): boolean {
  const asiLevels = config?.asiLevels ?? DEFAULT_ASI_LEVELS;
  return asiLevels.includes(level);
}

/**
 * Calculate HP gained on level up.
 */
export function calculateHpGain(
  choices: LevelUpChoices,
  config: LevelConfig,
  constitutionModifier: number
): number {
  const hitDie = config.hitDie;

  let hpFromDie: number;
  switch (choices.hpMethod) {
    case "roll":
      // Player provides the roll result; validate it
      hpFromDie = choices.hpRoll ?? Math.ceil(hitDie / 2) + 1;
      hpFromDie = Math.max(1, Math.min(hitDie, hpFromDie));
      break;
    case "average":
      hpFromDie = Math.ceil(hitDie / 2) + 1;
      break;
    case "manual":
      hpFromDie = choices.hpManual ?? Math.ceil(hitDie / 2) + 1;
      hpFromDie = Math.max(1, hpFromDie);
      break;
  }

  // Minimum 1 HP per level (even with negative CON mod)
  return Math.max(1, hpFromDie + constitutionModifier);
}

/**
 * Get spell slots for a given level and caster type.
 */
export function getSpellSlots(
  level: number,
  progression: "full" | "half" | "third" | "none"
): Record<number, number> {
  switch (progression) {
    case "full":
      return FULL_CASTER_SLOTS[level] ?? {};
    case "half":
      return HALF_CASTER_SLOTS[level] ?? {};
    case "third":
      return THIRD_CASTER_SLOTS[level] ?? {};
    case "none":
      return {};
  }
}

/**
 * Calculate spell slot gains between levels.
 */
export function getSpellSlotGains(
  oldLevel: number,
  newLevel: number,
  progression: "full" | "half" | "third" | "none"
): Record<string, number> {
  const oldSlots = getSpellSlots(oldLevel, progression);
  const newSlots = getSpellSlots(newLevel, progression);
  const gains: Record<string, number> = {};

  for (const [levelStr, count] of Object.entries(newSlots)) {
    const level = parseInt(levelStr, 10);
    const old = oldSlots[level] ?? 0;
    if (count > old) {
      gains[`level_${level}`] = count - old;
    }
  }

  return gains;
}

/**
 * Apply level up to character data. Returns the changes to apply.
 */
export function applyLevelUp(
  currentLevel: number,
  currentData: Record<string, unknown>,
  choices: LevelUpChoices,
  config: LevelConfig
): LevelUpResult {
  const newLevel = currentLevel + 1;
  const changes: Record<string, unknown> = {};
  const newFeatures: string[] = [];

  // Calculate HP gain
  const conMod = typeof currentData["abilities.constitution.modifier"] === "number"
    ? (currentData["abilities.constitution.modifier"] as number)
    : 0;
  const hpGained = calculateHpGain(choices, config, conMod);
  changes["hp_gained"] = hpGained;

  // Apply ASI if applicable
  if (isASILevel(newLevel, config) && choices.abilityScoreImprovements) {
    for (const [ability, increase] of Object.entries(choices.abilityScoreImprovements)) {
      changes[`asi.${ability}`] = increase;
    }
    if (choices.featChoice) {
      changes["feat"] = choices.featChoice;
      newFeatures.push(`Feat: ${choices.featChoice}`);
    } else {
      newFeatures.push("Ability Score Improvement");
    }
  }

  // Spell slot progression
  const progression = config.spellProgression ?? "none";
  const spellSlotsGained = getSpellSlotGains(currentLevel, newLevel, progression);

  // New spells
  if (choices.newSpells?.length) {
    changes["new_spells"] = choices.newSpells;
  }

  // Class feature choices
  if (choices.classFeatureChoices) {
    for (const [feature, choice] of Object.entries(choices.classFeatureChoices)) {
      changes[`feature.${feature}`] = choice;
      newFeatures.push(feature);
    }
  }

  // Skill proficiencies
  if (choices.skillProficiencies?.length) {
    changes["new_skill_proficiencies"] = choices.skillProficiencies;
  }

  // Proficiency bonus change
  const oldProf = proficiencyBonus(currentLevel);
  const newProf = proficiencyBonus(newLevel);
  if (newProf > oldProf) {
    newFeatures.push(`Proficiency Bonus: +${newProf}`);
  }

  return {
    previousLevel: currentLevel,
    newLevel,
    hpGained,
    newFeatures,
    spellSlotsGained,
    changes,
  };
}

// ── Rest System ──

export interface RestConfig {
  type: "short" | "long";
  hitDie: number;
  maxHitDice: number;
  currentHitDice: number;
  currentHp: number;
  maxHp: number;
  constitutionModifier: number;
  resettableResources?: Array<{ path: string; resetOn: "short" | "long"; maxValue: number }>;
  spellSlots?: Record<number, { current: number; max: number }>;
}

export interface RestResult {
  type: "short" | "long";
  hpRestored: number;
  hitDiceUsed: number;
  resourcesReset: string[];
  spellSlotsRecovered: Record<string, number>;
}

/**
 * Apply a short rest. Players can spend hit dice to heal.
 */
export function applyShortRest(
  config: RestConfig,
  hitDiceToSpend: number
): RestResult {
  const actualDice = Math.min(hitDiceToSpend, config.currentHitDice);
  let hpRestored = 0;

  // Each hit die: roll hitDie + CON modifier (minimum 0 per die)
  for (let i = 0; i < actualDice; i++) {
    const roll = Math.ceil(config.hitDie / 2) + 1; // Use average for server-side
    hpRestored += Math.max(0, roll + config.constitutionModifier);
  }

  // Cap HP restoration
  const maxHeal = config.maxHp - config.currentHp;
  hpRestored = Math.min(hpRestored, maxHeal);

  // Reset short-rest resources
  const resourcesReset: string[] = [];
  if (config.resettableResources) {
    for (const resource of config.resettableResources) {
      if (resource.resetOn === "short" || resource.resetOn === "long") {
        resourcesReset.push(resource.path);
      }
    }
  }

  return {
    type: "short",
    hpRestored,
    hitDiceUsed: actualDice,
    resourcesReset,
    spellSlotsRecovered: {},
  };
}

/**
 * Apply a long rest. Full HP, recover half hit dice, reset resources, restore spell slots.
 */
export function applyLongRest(config: RestConfig): RestResult {
  const hpRestored = config.maxHp - config.currentHp;

  // Reset all resources
  const resourcesReset: string[] = [];
  if (config.resettableResources) {
    for (const resource of config.resettableResources) {
      resourcesReset.push(resource.path);
    }
  }

  // Restore all spell slots
  const spellSlotsRecovered: Record<string, number> = {};
  if (config.spellSlots) {
    for (const [level, slots] of Object.entries(config.spellSlots)) {
      const recovered = slots.max - slots.current;
      if (recovered > 0) {
        spellSlotsRecovered[`level_${level}`] = recovered;
      }
    }
  }

  return {
    type: "long",
    hpRestored,
    hitDiceUsed: 0,
    resourcesReset,
    spellSlotsRecovered,
  };
}
