// Modificador de atributo D&D 5e: piso de (score - 10) / 2.
// Score 10/11 → 0; score 18 → +4; score 8 → -1; score 1 → -5.

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Formata modificador como string com sinal explícito (`+3`, `-1`). */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
