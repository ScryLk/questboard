// ── Progressão de personagem (XP + títulos) ──
//
// Tabela de XP até o nível 20, baseada na curva clássica do D&D 5e
// como placeholder. QuestBoard pode customizar no futuro sem mexer
// nos callers — eles consomem só `xpRequiredForLevel`/`titleForLevel`.
//
// TODO: tornar a tabela configurável por sistema (dnd5e, cosmicHorror,
// custom) quando o sistema de regras de progressão for definido.

const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2100,
  8: 2800,
  9: 3600,
  10: 4500,
  11: 5500,
  12: 6600,
  13: 7800,
  14: 9100,
  15: 10500,
  16: 12000,
  17: 13600,
  18: 15300,
  19: 17100,
  20: 19000,
};

export const MAX_LEVEL = 20;

/** XP acumulado total necessário pra atingir o nível. */
export function xpRequiredForLevel(level: number): number {
  if (level < 1) return 0;
  if (level > MAX_LEVEL) return Number.POSITIVE_INFINITY;
  return XP_THRESHOLDS[level] ?? Number.POSITIVE_INFINITY;
}

/** Resolve o nível a partir do XP total. */
export function levelForXp(xp: number): number {
  if (xp <= 0) return 1;
  let level = 1;
  for (let l = MAX_LEVEL; l >= 1; l--) {
    if (xp >= (XP_THRESHOLDS[l] ?? Number.POSITIVE_INFINITY)) {
      level = l;
      break;
    }
  }
  return level;
}

/** Quanto XP falta pro próximo nível. Retorna 0 se já está no max. */
export function xpToNextLevel(currentXp: number, currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;
  const nextThreshold = xpRequiredForLevel(currentLevel + 1);
  return Math.max(0, nextThreshold - currentXp);
}

// ── Títulos por nível ────────────────────────────────────────────

const TITLES: Record<number, string> = {
  3: "Aventureiro",
  5: "Herói",
  8: "Veterano",
  11: "Campeão",
  14: "Mestre de Armas",
  17: "Lendário",
  20: "Lenda Viva",
};

/** Próximo nível que carrega um título, a partir do nível atual. */
export function nextRewardLevel(currentLevel: number): number | null {
  for (const level of Object.keys(TITLES)
    .map(Number)
    .sort((a, b) => a - b)) {
    if (level > currentLevel) return level;
  }
  return null;
}

/** Título associado ao nível. Retorna `null` se o nível não desbloqueia. */
export function titleForLevel(level: number): string | null {
  return TITLES[level] ?? null;
}
