/**
 * Profile Level Engine
 * XP table with logarithmic curve — 20 levels max.
 */

// Cumulative XP required for each level (index = level)
const XP_TABLE = [
  0,     // Lv 0 (unused)
  0,     // Lv 1
  100,   // Lv 2
  250,   // Lv 3
  500,   // Lv 4
  850,   // Lv 5
  1300,  // Lv 6
  1900,  // Lv 7
  2600,  // Lv 8
  3500,  // Lv 9
  4600,  // Lv 10
  5900,  // Lv 11
  7500,  // Lv 12
  9400,  // Lv 13
  11600, // Lv 14
  14200, // Lv 15
  17200, // Lv 16
  20700, // Lv 17
  24800, // Lv 18
  29500, // Lv 19
  35000, // Lv 20
];

export const MAX_LEVEL = 20;

/** Get level from total XP */
export function getLevelFromXP(xp: number): number {
  for (let i = MAX_LEVEL; i >= 1; i--) {
    if (xp >= XP_TABLE[i]) return i;
  }
  return 1;
}

/** Get XP progress within current level (0–1) */
export function getXPProgress(xp: number): { current: number; needed: number; percent: number } {
  const level = getLevelFromXP(xp);
  if (level >= MAX_LEVEL) return { current: 0, needed: 0, percent: 100 };

  const currentThreshold = XP_TABLE[level];
  const nextThreshold = XP_TABLE[level + 1];
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;

  return {
    current,
    needed,
    percent: Math.round((current / needed) * 100),
  };
}

/** Get XP required for next level */
export function getXPForNextLevel(xp: number): number {
  const level = getLevelFromXP(xp);
  if (level >= MAX_LEVEL) return 0;
  return XP_TABLE[level + 1] - xp;
}

// ── Level Badge Colors ──

export type LevelTier = "iron" | "bronze" | "silver" | "gold" | "platinum";

export function getLevelTier(level: number): LevelTier {
  if (level >= 20) return "platinum";
  if (level >= 15) return "gold";
  if (level >= 10) return "silver";
  if (level >= 5) return "bronze";
  return "iron";
}

export const LEVEL_TIER_COLORS: Record<LevelTier, { bg: string; text: string; border: string }> = {
  iron: { bg: "#2A2A3A", text: "#9090A0", border: "#3A3A4A" },
  bronze: { bg: "#3D2B1F", text: "#CD7F32", border: "#8B5E3C" },
  silver: { bg: "#2A2A35", text: "#C0C0C0", border: "#808090" },
  gold: { bg: "#3A2F10", text: "#FFD700", border: "#B8960F" },
  platinum: { bg: "#2A2A30", text: "#E5E4E2", border: "#A0A0A8" },
};

// ── Level Rewards (cosmetics unlocked at each level) ──

export const LEVEL_REWARDS: { level: number; cosmeticId: string; label: string }[] = [
  { level: 3, cosmeticId: "title-hero", label: "Título: Herói" },
  { level: 5, cosmeticId: "frame-silver-ring", label: "Moldura: Anel de Prata" },
  { level: 8, cosmeticId: "banner-emerald-forest", label: "Banner: Floresta Esmeralda" },
  { level: 10, cosmeticId: "frame-arcane-glow", label: "Moldura: Brilho Arcano" },
  { level: 13, cosmeticId: "bg-dungeon", label: "Fundo: Masmorra" },
  { level: 15, cosmeticId: "title-archmage", label: "Título: Arquimago" },
  { level: 18, cosmeticId: "bg-feywild", label: "Fundo: Feywild" },
  { level: 20, cosmeticId: "frame-celestial", label: "Moldura: Celestial" },
];

/** Get the next reward the player hasn't reached */
export function getNextReward(xp: number): { level: number; label: string } | null {
  const level = getLevelFromXP(xp);
  const next = LEVEL_REWARDS.find((r) => r.level > level);
  return next ? { level: next.level, label: next.label } : null;
}
