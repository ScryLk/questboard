// ─── Resistance / immunity / vulnerability resolver ───
//
// Traduz dano bruto + tipo + tabela de modificadores do alvo em dano
// efetivo, preservando a regra clássica: imunidade → 0, resistência →
// metade (truncado), vulnerabilidade → dobro.
//
// `true` damage ignora resistências/imunidades/vulnerabilidades —
// consistente com a ideia de "dano puro narrativo" do prompt.
//
// Tipos definidos localmente pra evitar dep cruzada com @questboard/types
// (segue padrão do attack.ts neste mesmo package). O frontend casta
// `AttackDamageType` para `string` ao chamar.

export type DamageModifier = "normal" | "resist" | "immune" | "vuln";

export interface DamageMultipliers {
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
}

const EMPTY_MULTIPLIERS: DamageMultipliers = {
  resistances: [],
  immunities: [],
  vulnerabilities: [],
};

/** Calcula o dano final aplicado ao HP, considerando resist/imune/vuln.
 *  Para `damageType === "true"` retorna `{ final: rawDamage, modifier: "normal" }`
 *  sem inspecionar a tabela. */
export function computeFinalDamage(
  rawDamage: number,
  damageType: string,
  multipliers: DamageMultipliers | null | undefined,
): { final: number; modifier: DamageModifier } {
  if (rawDamage <= 0) {
    return { final: 0, modifier: "normal" };
  }
  if (damageType === "true") {
    return { final: rawDamage, modifier: "normal" };
  }

  const m = multipliers ?? EMPTY_MULTIPLIERS;

  if (m.immunities.includes(damageType)) {
    return { final: 0, modifier: "immune" };
  }
  if (m.vulnerabilities.includes(damageType)) {
    return { final: rawDamage * 2, modifier: "vuln" };
  }
  if (m.resistances.includes(damageType)) {
    return { final: Math.floor(rawDamage / 2), modifier: "resist" };
  }
  return { final: rawDamage, modifier: "normal" };
}
