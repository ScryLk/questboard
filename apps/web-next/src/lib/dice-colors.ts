// Cores hexa puras (sem #) usadas como `themeColor` no dice-box.
// Origem: prompt visual §2.1. Caminho C (aproximação) — themeColor
// tinta o material padrão do dice-box, sem `MeshPhysicalMaterial` real.
// Caminho B (cristal verdadeiro) é fase futura.

import type { AttackDamageType } from "@questboard/types";

/** d20 de ataque sempre cyan, independente de tipo de dano. */
export const ATTACK_DICE_COLOR = "#a5f3fc";

/** Crítico — overlay dourado adicional pulsando ao revelar. */
export const CRIT_DICE_COLOR = "#fde68a";

/** Mapa lookup por tipo de dano. */
export const DAMAGE_TYPE_COLOR: Record<AttackDamageType, string> = {
  true: "#f0abfc",
  bludgeoning: "#f0abfc",
  slashing: "#f0abfc",
  piercing: "#f0abfc",
  fire: "#fcd34d",
  cold: "#bfdbfe",
  lightning: "#c4b5fd",
  thunder: "#c4b5fd",
  acid: "#bef264",
  poison: "#bef264",
  psychic: "#f0abfc",
  necrotic: "#cbd5e1",
  radiant: "#fde68a",
  force: "#a5f3fc",
};
