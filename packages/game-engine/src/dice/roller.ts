import type { ParsedFormula, DiceTerm, DiceModifier } from "./parser.js";
import { parseFormula } from "./parser.js";

export interface RollResult {
  formula: string;
  terms: TermResult[];
  flatBonus: number;
  total: number;
}

export interface TermResult {
  count: number;
  sides: number;
  rolls: number[];
  kept: number[];
  modifier: DiceModifier | null;
  subtotal: number;
}

/**
 * Roll dice using a formula string.
 * Uses crypto.getRandomValues for secure randomness.
 */
export function roll(formula: string): RollResult {
  const parsed = parseFormula(formula);
  return rollParsed(formula, parsed);
}

/**
 * Roll dice from a pre-parsed formula.
 */
export function rollParsed(
  formula: string,
  parsed: ParsedFormula
): RollResult {
  const terms = parsed.terms.map(rollTerm);
  const total =
    terms.reduce((sum, t) => sum + t.subtotal, 0) + parsed.flatBonus;

  return {
    formula,
    terms,
    flatBonus: parsed.flatBonus,
    total,
  };
}

function rollTerm(term: DiceTerm): TermResult {
  const absCount = Math.abs(term.count);
  const rolls = rollDice(absCount, term.sides);
  const kept = applyModifier(rolls, term.modifier);
  const sign = term.count < 0 ? -1 : 1;
  const subtotal = kept.reduce((sum, v) => sum + v, 0) * sign;

  return {
    count: term.count,
    sides: term.sides,
    rolls,
    kept,
    modifier: term.modifier,
    subtotal,
  };
}

/**
 * Roll N dice of S sides using crypto random.
 */
function rollDice(count: number, sides: number): number[] {
  const results: number[] = [];
  const bytes = new Uint32Array(count);
  crypto.getRandomValues(bytes);

  for (let i = 0; i < count; i++) {
    const value = bytes[i];
    if (value === undefined) continue;
    results.push((value % sides) + 1);
  }

  return results;
}

function applyModifier(
  rolls: number[],
  modifier: DiceModifier | null
): number[] {
  if (modifier === null) return [...rolls];

  const sorted = [...rolls].sort((a, b) => a - b);

  switch (modifier.type) {
    case "kh": // keep highest N
      return sorted.slice(-modifier.value);
    case "kl": // keep lowest N
      return sorted.slice(0, modifier.value);
    case "dh": // drop highest N
      return sorted.slice(0, -modifier.value);
    case "dl": // drop lowest N
      return sorted.slice(modifier.value);
  }
}
