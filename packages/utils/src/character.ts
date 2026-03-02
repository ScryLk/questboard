// ── Character Computation Utilities ──

import type { AbilityKey, DiceRollResult } from "@questboard/types";

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function roll4d6DropLowest(): DiceRollResult {
  const dice = Array.from(
    { length: 4 },
    () => Math.floor(Math.random() * 6) + 1,
  ) as [number, number, number, number];
  const minIndex = dice.indexOf(Math.min(...dice));
  const total = dice.reduce(
    (sum, d, i) => (i === minIndex ? sum : sum + d),
    0,
  );
  return { dice, dropped: minIndex, total, ability: null };
}

export function getPointBuyCost(
  scores: Record<AbilityKey, number>,
  costs: Record<number, number>,
  abilityOrder: AbilityKey[],
): number {
  return abilityOrder.reduce(
    (sum, key) => sum + (costs[scores[key]] ?? 0),
    0,
  );
}

export function getPointsRemaining(
  scores: Record<AbilityKey, number>,
  total: number,
  costs: Record<number, number>,
  abilityOrder: AbilityKey[],
): number {
  return total - getPointBuyCost(scores, costs, abilityOrder);
}

export function computeHP(
  hitDie: number,
  conScore: number,
  level: number,
): number {
  const conMod = getModifier(conScore);
  if (level === 1) return hitDie + conMod;
  const avgRoll = Math.floor(hitDie / 2) + 1;
  return hitDie + conMod + (level - 1) * (avgRoll + conMod);
}

export function computeBaseAC(dexScore: number): number {
  return 10 + getModifier(dexScore);
}

export function computeInitiative(dexScore: number): number {
  return getModifier(dexScore);
}
