// ── Dice rolling system ──

export interface DiceResult {
  total: number;
  rolls: number[];
  modifier: number;
  formula: string;
  details: string;
  isNat20?: boolean;
  isNat1?: boolean;
}

/** Roll `count` dice of `sides` faces + optional modifier. */
export function rollDice(count: number, sides: number, modifier = 0): DiceResult {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + modifier;
  const modStr = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : "";
  const formula = `${count}d${sides}${modStr}`;
  const detailParts = rolls.map(String);
  if (modifier !== 0) detailParts.push(String(modifier));
  const details = detailParts.join("+").replace("+-", "-");

  return {
    total,
    rolls,
    modifier,
    formula,
    details,
    isNat20: count === 1 && sides === 20 && rolls[0] === 20,
    isNat1: count === 1 && sides === 20 && rolls[0] === 1,
  };
}

/** Roll a d20 with optional modifier, advantage, or disadvantage. */
export function rollD20(modifier = 0, advantage = false, disadvantage = false): DiceResult {
  const roll1 = Math.floor(Math.random() * 20) + 1;
  const roll2 = Math.floor(Math.random() * 20) + 1;

  let chosen: number;
  let rolls: number[];

  if (advantage && !disadvantage) {
    chosen = Math.max(roll1, roll2);
    rolls = [roll1, roll2];
  } else if (disadvantage && !advantage) {
    chosen = Math.min(roll1, roll2);
    rolls = [roll1, roll2];
  } else {
    chosen = roll1;
    rolls = [roll1];
  }

  const total = chosen + modifier;
  const modStr = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : "";
  const formula = `1d20${modStr}`;

  let details: string;
  if (rolls.length === 2) {
    const tag = advantage ? "adv" : "des";
    details = `(${roll1},${roll2})[${tag}]=${chosen}${modStr ? modStr : ""}`;
  } else {
    details = modifier !== 0 ? `${chosen}${modStr}` : `${chosen}`;
  }

  return {
    total,
    rolls,
    modifier,
    formula,
    details,
    isNat20: chosen === 20,
    isNat1: chosen === 1,
  };
}

/**
 * Parse and roll a dice formula like "2d8+4", "1d20-1", "3d6", "8d6".
 * Supports: NdS, NdS+M, NdS-M
 */
export function parseDiceFormula(formula: string): DiceResult {
  const cleaned = formula.replace(/\s/g, "").toLowerCase();
  const match = cleaned.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) {
    return {
      total: 0,
      rolls: [],
      modifier: 0,
      formula: cleaned,
      details: "invalid",
    };
  }
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;
  return rollDice(count, sides, modifier);
}
