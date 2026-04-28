// ── D&D 5e Progression Tables ──
//
// Tabelas oficiais do SRD 5.1 (CC-BY 4.0). Bônus de proficiência sobe
// no 5/9/13/17 (regra geral). XP por nível segue o PHB.

export const DND5E_SYSTEM_SLUG = "dnd5e";

export const PROFICIENCY_BONUS_BY_LEVEL: Record<number, number> = {
  1: 2,
  2: 2,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
  11: 4,
  12: 4,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
  17: 6,
  18: 6,
  19: 6,
  20: 6,
};

export const XP_BY_LEVEL: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

export const MAX_LEVEL = 20;
export const MIN_LEVEL = 1;
