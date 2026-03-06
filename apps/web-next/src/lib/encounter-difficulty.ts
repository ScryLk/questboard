import { parseCR } from "./creature-data";

// ── XP by Challenge Rating (D&D 5e) ────────────────

const CR_XP: Record<string, number> = {
  "0": 10,
  "1/8": 25,
  "1/4": 50,
  "1/2": 100,
  "1": 200,
  "2": 450,
  "3": 700,
  "4": 1100,
  "5": 1800,
  "6": 2300,
  "7": 2900,
  "8": 3900,
  "9": 5000,
  "10": 5900,
  "11": 7200,
  "12": 8400,
  "13": 10000,
  "14": 11500,
  "15": 13000,
  "16": 15000,
  "17": 18000,
  "18": 20000,
  "19": 22000,
  "20": 25000,
  "21": 33000,
  "22": 41000,
  "23": 50000,
  "24": 62000,
  "25": 75000,
  "26": 90000,
  "27": 105000,
  "28": 120000,
  "29": 135000,
  "30": 155000,
};

// Multiplier by number of monsters
const MULTIPLIERS: Array<{ min: number; max: number; mult: number }> = [
  { min: 1, max: 1, mult: 1 },
  { min: 2, max: 2, mult: 1.5 },
  { min: 3, max: 6, mult: 2 },
  { min: 7, max: 10, mult: 2.5 },
  { min: 11, max: 14, mult: 3 },
  { min: 15, max: 999, mult: 4 },
];

// XP thresholds per character level
const THRESHOLDS: Record<
  number,
  { easy: number; medium: number; hard: number; deadly: number }
> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

export type DifficultyLevel =
  | "trivial"
  | "easy"
  | "medium"
  | "hard"
  | "deadly";

export interface EncounterDifficulty {
  totalXP: number;
  adjustedXP: number;
  difficulty: DifficultyLevel;
  thresholds: { easy: number; medium: number; hard: number; deadly: number };
}

export function getXPForCR(cr: string): number {
  return CR_XP[cr] ?? 0;
}

export function calculateEncounterDifficulty(
  creatures: Array<{ cr: string; count: number }>,
  partyLevels: number[],
): EncounterDifficulty {
  // Total XP
  let totalXP = 0;
  let totalMonsters = 0;
  for (const c of creatures) {
    totalXP += getXPForCR(c.cr) * c.count;
    totalMonsters += c.count;
  }

  // Monster count multiplier
  const mult =
    MULTIPLIERS.find(
      (m) => totalMonsters >= m.min && totalMonsters <= m.max,
    )?.mult ?? 1;
  const adjustedXP = Math.round(totalXP * mult);

  // Party thresholds
  const partyThresholds = partyLevels.reduce(
    (acc, level) => {
      const t = THRESHOLDS[Math.min(Math.max(level, 1), 20)] ?? THRESHOLDS[1];
      return {
        easy: acc.easy + t.easy,
        medium: acc.medium + t.medium,
        hard: acc.hard + t.hard,
        deadly: acc.deadly + t.deadly,
      };
    },
    { easy: 0, medium: 0, hard: 0, deadly: 0 },
  );

  // Determine difficulty
  let difficulty: DifficultyLevel = "trivial";
  if (adjustedXP >= partyThresholds.deadly) difficulty = "deadly";
  else if (adjustedXP >= partyThresholds.hard) difficulty = "hard";
  else if (adjustedXP >= partyThresholds.medium) difficulty = "medium";
  else if (adjustedXP >= partyThresholds.easy) difficulty = "easy";

  return {
    totalXP,
    adjustedXP,
    difficulty,
    thresholds: partyThresholds,
  };
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "trivial":
      return "#6B7280";
    case "easy":
      return "#4ADE80";
    case "medium":
      return "#FBBF24";
    case "hard":
      return "#F97316";
    case "deadly":
      return "#EF4444";
    default:
      return "#6B7280";
  }
}

export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case "trivial":
      return "Trivial";
    case "easy":
      return "Facil";
    case "medium":
      return "Medio";
    case "hard":
      return "Dificil";
    case "deadly":
      return "Mortal";
    default:
      return difficulty;
  }
}

export function getDifficultyPercent(
  adjustedXP: number,
  thresholds: { easy: number; medium: number; hard: number; deadly: number },
): number {
  if (thresholds.deadly === 0) return 0;
  // Scale: 0% = 0 XP, 100% = deadly threshold, can exceed
  return Math.min(100, Math.round((adjustedXP / thresholds.deadly) * 100));
}
