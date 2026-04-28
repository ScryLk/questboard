// ── Cálculos derivados (Horror Investigativo) ──
//
// Tabelas seguem o cânone d100 clássico mas com nomes próprios.
// Tudo função pura — sem RNG, sem IO. Tests verificam edge cases.

import type { Attributes } from "./types";

/** Bônus de dano físico (corpo-a-corpo + arremesso). Notação dos dados
 *  segue o padrão da engine de dice: "+1d4" / "-1" / "+2d6". */
export function calculateDamageBonus(attrs: Pick<Attributes, "for" | "tam">): string {
  const sum = attrs.for + attrs.tam;
  if (sum <= 64) return "-2";
  if (sum <= 84) return "-1";
  if (sum <= 124) return "+0";
  if (sum <= 164) return "+1d4";
  if (sum <= 204) return "+1d6";
  if (sum <= 284) return "+2d6";
  if (sum <= 364) return "+3d6";
  if (sum <= 444) return "+4d6";
  return "+5d6";
}

/** Build — modificador discreto pro número de oponentes em combate
 *  corpo-a-corpo. Quanto maior, mais inimigos pode segurar. */
export function calculateBuild(attrs: Pick<Attributes, "for" | "tam">): number {
  const sum = attrs.for + attrs.tam;
  if (sum <= 64) return -2;
  if (sum <= 84) return -1;
  if (sum <= 124) return 0;
  if (sum <= 164) return 1;
  if (sum <= 204) return 2;
  if (sum <= 284) return 3;
  if (sum <= 364) return 4;
  if (sum <= 444) return 5;
  return 6;
}

export function calculateHitPoints(attrs: Pick<Attributes, "con" | "tam">): number {
  return Math.floor((attrs.con + attrs.tam) / 10);
}

export function calculateMagicPoints(pod: number): number {
  return Math.floor(pod / 5);
}

/** SAN máxima inicial = POD. Conforme o personagem aprende sobre o
 *  Mythos, esse teto desce: `sanityMax = startingMax - mythosKnowledge`. */
export function calculateMaxSanity(
  startingMax: number,
  mythosKnowledge: number,
): number {
  return Math.max(0, startingMax - mythosKnowledge);
}

/** Movimento por turno (metros). Considera FOR/DES vs TAM e idade. */
export function calculateMoveRate(input: {
  attrs: Attributes;
  age: number;
}): number {
  const { for: forAttr, des, tam } = input.attrs;
  const { age } = input;

  let mov: number;
  if (forAttr < tam && des < tam) {
    mov = 7;
  } else if (forAttr > tam && des > tam) {
    mov = 9;
  } else {
    mov = 8;
  }

  // Penalidade por idade (cumulativa).
  if (age >= 80) mov -= 5;
  else if (age >= 70) mov -= 4;
  else if (age >= 60) mov -= 3;
  else if (age >= 50) mov -= 2;
  else if (age >= 40) mov -= 1;

  return Math.max(mov, 1);
}

/** Esquivar = DES / 2 (truncado). Skill base. Subir treina como skill. */
export function calculateDodgeBase(des: number): number {
  return Math.floor(des / 2);
}
