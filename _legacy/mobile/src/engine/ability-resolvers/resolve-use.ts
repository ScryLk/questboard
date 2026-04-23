import type {
  GameAbility,
  UseOptions,
  UseResult,
  DiceRollResult,
  AppliedEffect,
  ResourceCost,
} from "../../types/ability";

// ─── Dice Helpers ─────────────────────────────────────────

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function parseAndRoll(formula: string): {
  rolls: number[];
  total: number;
} {
  const match = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) {
    const r = rollDie(20);
    return { rolls: [r], total: r };
  }

  const count = parseInt(match[1] || "1", 10);
  const sides = parseInt(match[2], 10);
  const modifier = parseInt(match[3] || "0", 10);

  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const r = rollDie(sides);
    rolls.push(r);
    sum += r;
  }

  return { rolls, total: sum + modifier };
}

// ─── Context Interface ────────────────────────────────────
// Callbacks so the resolver stays pure of store dependencies

export interface ResolveContext {
  /** Consume a spell slot at the given level. Returns false if unavailable. */
  consumeSpellSlot: (level: number) => boolean;
  /** Consume a feature use. Returns false if unavailable. */
  consumeFeatureUse: (featureId: string) => boolean;
  /** Consume an item charge (decrement quantity). Returns false if unavailable. */
  consumeItemCharge: (itemId: string) => boolean;
  /** Use an action in combat economy. Returns false if already used. */
  consumeAction: (type: "action" | "bonus_action" | "reaction") => boolean;
  /** Whether we are in combat (affects action economy validation). */
  inCombat: boolean;
  /** Character name for chat messages. */
  characterName: string;
  /** Character icon for chat messages. */
  characterIcon: string;
}

// ─── Resource Consumption ─────────────────────────────────

function consumeResource(
  cost: ResourceCost,
  context: ResolveContext,
): string | null {
  switch (cost.type) {
    case "spell_slot": {
      const ok = context.consumeSpellSlot(cost.level ?? 1);
      if (!ok) return `Sem slots de nível ${cost.level ?? 1}`;
      return null;
    }
    case "feature_use": {
      const ok = context.consumeFeatureUse(cost.resourceId ?? "");
      if (!ok) return "Sem usos restantes";
      return null;
    }
    case "item_charge": {
      const ok = context.consumeItemCharge(cost.resourceId ?? "");
      if (!ok) return "Item indisponível";
      return null;
    }
    case "custom_resource": {
      const ok = context.consumeFeatureUse(cost.resourceId ?? "");
      if (!ok) return "Recurso indisponível";
      return null;
    }
    case "hp":
      // HP cost is informational only for now
      return null;
  }
}

// ─── Main Resolver ────────────────────────────────────────

export function resolveUse(
  ability: GameAbility,
  options: UseOptions,
  context: ResolveContext,
): UseResult {
  const errors: string[] = [];
  const rolls: DiceRollResult[] = [];
  const effects: AppliedEffect[] = [];

  // 1. Validate availability
  if (!ability.available) {
    return {
      success: false,
      rolls: [],
      effects: [],
      errors: [ability.unavailableReason ?? "Habilidade indisponível"],
    };
  }

  // 2. Consume action economy (only in combat)
  if (context.inCombat && ability.actionCost !== "none" && ability.actionCost !== "free") {
    const costType = ability.actionCost === "bonus_action" ? "bonus_action" : ability.actionCost;
    const ok = context.consumeAction(costType as "action" | "bonus_action" | "reaction");
    if (!ok) {
      errors.push(`${ability.actionCost === "action" ? "Ação" : ability.actionCost === "bonus_action" ? "Ação bônus" : "Reação"} já utilizada`);
    }
  }

  // 3. Consume resources
  const actualCosts = [...ability.resourceCosts];

  // Handle upcast: replace spell slot level if upcasting
  if (options.upcastLevel && ability.category === "spell") {
    const slotCostIndex = actualCosts.findIndex((c) => c.type === "spell_slot");
    if (slotCostIndex >= 0) {
      actualCosts[slotCostIndex] = {
        ...actualCosts[slotCostIndex],
        level: options.upcastLevel,
      };
    }
  }

  for (const cost of actualCosts) {
    const error = consumeResource(cost, context);
    if (error) errors.push(error);
  }

  // If any critical errors, abort
  if (errors.length > 0) {
    return { success: false, rolls: [], effects: [], errors };
  }

  // 4. Roll dice
  for (const rollDef of ability.rolls) {
    const result = parseAndRoll(rollDef.formula);
    const isD20 = rollDef.formula.match(/1d20/i) !== null;

    rolls.push({
      formula: rollDef.formula,
      rolls: result.rolls,
      total: result.total,
      label: rollDef.label,
      damageType: rollDef.damageType,
      isNat20: isD20 && result.rolls[0] === 20,
      isNat1: isD20 && result.rolls[0] === 1,
    });
  }

  // Handle advantage/disadvantage for first d20 roll
  if (options.advantageState && options.advantageState !== "normal" && rolls.length > 0) {
    const firstRoll = rolls[0];
    if (firstRoll.formula.match(/1d20/i)) {
      const secondResult = parseAndRoll(firstRoll.formula);
      if (options.advantageState === "advantage") {
        if (secondResult.total > firstRoll.total) {
          rolls[0] = {
            formula: firstRoll.formula,
            rolls: secondResult.rolls,
            total: secondResult.total,
            label: firstRoll.label,
            damageType: firstRoll.damageType,
            isNat20: secondResult.rolls[0] === 20,
            isNat1: secondResult.rolls[0] === 1,
          };
        }
      } else {
        if (secondResult.total < firstRoll.total) {
          rolls[0] = {
            formula: firstRoll.formula,
            rolls: secondResult.rolls,
            total: secondResult.total,
            label: firstRoll.label,
            damageType: firstRoll.damageType,
            isNat20: secondResult.rolls[0] === 20,
            isNat1: secondResult.rolls[0] === 1,
          };
        }
      }
    }
  }

  // 5. Apply auto effects
  for (const effect of ability.autoEffects) {
    switch (effect.type) {
      case "concentration":
        effects.push({ type: "concentration", description: `Concentrando em ${ability.name}` });
        break;
      case "damage":
        effects.push({ type: "damage", description: `Dano: ${effect.value}` });
        break;
      case "healing":
        effects.push({ type: "healing", description: `Cura: ${effect.value}` });
        break;
      case "condition_add":
        effects.push({ type: "condition_add", description: `Condição: ${effect.condition}` });
        break;
      case "condition_remove":
        effects.push({ type: "condition_remove", description: `Removeu: ${effect.condition}` });
        break;
      case "temp_hp":
        effects.push({ type: "temp_hp", description: `HP temporário: ${effect.value}` });
        break;
      default:
        effects.push({ type: effect.type, description: effect.type });
    }
  }

  return { success: true, rolls, effects, errors: [] };
}
