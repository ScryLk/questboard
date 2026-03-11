// ─── Game System ──────────────────────────────────────────

export type GameSystem = "dnd5e" | "coc" | "generic";

// ─── Ability Categories ───────────────────────────────────

export type AbilityCategory =
  | "weapon"
  | "spell"
  | "feature"
  | "item"
  | "skill_check";

// ─── Action Economy ───────────────────────────────────────

export type ActionCostType =
  | "action"
  | "bonus_action"
  | "reaction"
  | "free"
  | "movement"
  | "none";

// ─── Damage Types ─────────────────────────────────────────

export type DamageType =
  | "slashing"
  | "piercing"
  | "bludgeoning"
  | "fire"
  | "cold"
  | "lightning"
  | "thunder"
  | "poison"
  | "acid"
  | "necrotic"
  | "radiant"
  | "force"
  | "psychic"
  | "healing";

// ─── Targeting ────────────────────────────────────────────

export type TargetType = "self" | "single" | "area" | "multi" | "none";

// ─── Resource Costs ───────────────────────────────────────

export interface ResourceCost {
  type: "spell_slot" | "feature_use" | "custom_resource" | "item_charge" | "hp";
  /** Spell slot level (for type === "spell_slot") */
  level?: number;
  amount: number;
  /** ID of the feature/custom resource being consumed */
  resourceId?: string;
}

// ─── Dice Formulas ────────────────────────────────────────

export interface AbilityDiceFormula {
  /** e.g. "1d20+5", "2d6+3" */
  formula: string;
  /** e.g. "Ataque", "Dano" */
  label: string;
  damageType?: DamageType;
}

// ─── Auto Effects ─────────────────────────────────────────

export interface AutoEffect {
  type:
    | "damage"
    | "healing"
    | "condition_add"
    | "condition_remove"
    | "temp_hp"
    | "spell_slot_use"
    | "concentration";
  /** Fixed number or dice formula */
  value?: number | string;
  condition?: string;
  spellId?: string;
}

// ─── Unified Game Ability ─────────────────────────────────
// Named GameAbility (not CharacterAbility) because CharacterAbility
// already exists in character-types.ts for ability scores (STR/DEX/etc).

export interface GameAbility {
  id: string;
  /** Original source ID (spell.id, item.id, feature.id) */
  sourceId: string;
  name: string;
  category: AbilityCategory;
  /** Key for lucide icon lookup */
  iconKey: string;
  description: string;
  actionCost: ActionCostType;
  resourceCosts: ResourceCost[];
  rolls: AbilityDiceFormula[];
  autoEffects: AutoEffect[];
  range: string;
  targetType: TargetType;
  /** e.g. "melee", "ranged", "concentration", "ritual", "finesse" */
  tags: string[];
  /** Spell level (0 = cantrip) */
  spellLevel?: number;
  upcastable?: boolean;
  /** false if resources unavailable */
  available: boolean;
  unavailableReason?: string;
  system: GameSystem;
  /** Human-readable source: "Espada Longa", "Bola de Fogo" */
  source: string;
}

// ─── Use Resolution ───────────────────────────────────────

export interface UseOptions {
  upcastLevel?: number;
  targetIds?: string[];
  advantageState?: "normal" | "advantage" | "disadvantage";
}

export interface DiceRollResult {
  formula: string;
  rolls: number[];
  total: number;
  label: string;
  damageType?: DamageType;
  isNat20?: boolean;
  isNat1?: boolean;
}

export interface AppliedEffect {
  type: AutoEffect["type"];
  description: string;
}

export interface UseResult {
  success: boolean;
  rolls: DiceRollResult[];
  effects: AppliedEffect[];
  errors: string[];
}
