// ── Sistema d100 — testes de perícia ──
//
// Núcleo das regras: rola 1d100, sucesso quando ≤ valor da skill.
// Sucesso tem nível (regular/hard/extreme) baseado em frações do
// valor. Falhas pequenas → fumble.

export type SkillCheckResult =
  | "EXTREME_SUCCESS"
  | "HARD_SUCCESS"
  | "REGULAR_SUCCESS"
  | "FAILURE"
  | "FUMBLE";

/** Avalia 1 rolagem contra valor de skill.
 *  - Extreme: roll ≤ skill/5
 *  - Hard:    roll ≤ skill/2
 *  - Regular: roll ≤ skill
 *  - Fumble:  skill < 50 → roll 96-100; skill ≥ 50 → roll 100. */
export function evaluateSkillCheck(
  roll: number,
  skillValue: number,
): SkillCheckResult {
  if (skillValue < 50 && roll >= 96) return "FUMBLE";
  if (skillValue >= 50 && roll === 100) return "FUMBLE";
  if (roll > skillValue) return "FAILURE";
  if (roll <= Math.floor(skillValue / 5)) return "EXTREME_SUCCESS";
  if (roll <= Math.floor(skillValue / 2)) return "HARD_SUCCESS";
  return "REGULAR_SUCCESS";
}

const RESULT_LEVEL: Record<SkillCheckResult, number> = {
  FUMBLE: -1,
  FAILURE: 0,
  REGULAR_SUCCESS: 1,
  HARD_SUCCESS: 2,
  EXTREME_SUCCESS: 3,
};

/** Resolve teste oposto entre dois personagens. Compara níveis;
 *  empate vai pra maior skill; persistindo, empate. */
export function resolveOpposed(
  rollA: number,
  skillA: number,
  rollB: number,
  skillB: number,
): "A_WINS" | "B_WINS" | "TIE" {
  const resultA = evaluateSkillCheck(rollA, skillA);
  const resultB = evaluateSkillCheck(rollB, skillB);
  const levelA = RESULT_LEVEL[resultA];
  const levelB = RESULT_LEVEL[resultB];
  if (levelA > levelB) return "A_WINS";
  if (levelB > levelA) return "B_WINS";
  if (skillA > skillB) return "A_WINS";
  if (skillB > skillA) return "B_WINS";
  return "TIE";
}

/** Variante "bonus die": quando há circunstância favorável, rola 2d10
 *  pra dezenas e pega o MENOR. Função pura — caller passa os dois
 *  resultados (d100 original + dezenas alternativas). */
export function rollWithBonusDie(
  d100Result: number,
  bonusDieTens: number,
): number {
  const units = d100Result % 10;
  const originalTens = Math.floor(d100Result / 10) * 10;
  const newTens = Math.min(originalTens, normalizeBonusDie(bonusDieTens));
  return newTens + units;
}

/** Variante "penalty die": pega o MAIOR das dezenas — circunstância
 *  desfavorável. */
export function rollWithPenaltyDie(
  d100Result: number,
  penaltyDieTens: number,
): number {
  const units = d100Result % 10;
  const originalTens = Math.floor(d100Result / 10) * 10;
  const newTens = Math.max(originalTens, normalizeBonusDie(penaltyDieTens));
  return newTens + units;
}

/** Garante que o valor está num múltiplo de 10 entre 0 e 90 (regra
 *  de tens-die). Caller pode passar 1-100 que normaliza. */
function normalizeBonusDie(value: number): number {
  if (value <= 0) return 0;
  if (value >= 100) return 90;
  return Math.floor(value / 10) * 10;
}
