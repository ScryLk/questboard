import type { AbilityKey, DiceRollResult } from "./types";

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "Força",
  dex: "Destreza",
  con: "Constituição",
  int: "Inteligência",
  wis: "Sabedoria",
  cha: "Carisma",
};

export const ABILITY_SHORT_LABELS: Record<AbilityKey, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

export const ABILITY_ORDER: AbilityKey[] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const POINT_BUY_TOTAL = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

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
): number {
  return ABILITY_ORDER.reduce(
    (sum, key) => sum + (POINT_BUY_COSTS[scores[key]] ?? 0),
    0,
  );
}

export function getPointsRemaining(
  scores: Record<AbilityKey, number>,
): number {
  return POINT_BUY_TOTAL - getPointBuyCost(scores);
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
