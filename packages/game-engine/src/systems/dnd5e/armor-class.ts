// Cálculo de Classe de Armadura (CA) D&D 5e.
//
// Casos cobertos:
//   - Sem armadura: 10 + Des
//   - Com armadura leve: base + Des
//   - Com armadura média: base + min(Des, +2)
//   - Com armadura pesada: base (Des não soma)
//   - Defesa Sem Armadura (Bárbaro): 10 + Des + Con
//   - Defesa Sem Armadura (Monge): 10 + Des + Sab
//   - +2 de escudo
//   - Bônus extras (anel, magia, capacete, etc.)

import { abilityModifier } from "./ability";
import type {
  AbilityScores,
  ArmorItemRef,
  BreakdownEntry,
  ShieldItemRef,
} from "./types";

export interface ArmorClassContext {
  attributes: AbilityScores;
  classSlug: string;
  /** Armadura equipada. null = sem armadura. */
  equippedArmor?: ArmorItemRef | null;
  /** Escudo equipado. null = sem escudo. */
  equippedShield?: ShieldItemRef | null;
  /** Bônus avulsos (anel +1, escudo arcano, etc.). */
  bonusModifiers?: BreakdownEntry[];
}

export interface ArmorClassResult {
  total: number;
  breakdown: BreakdownEntry[];
}

export function calculateArmorClass(ctx: ArmorClassContext): ArmorClassResult {
  const dexMod = abilityModifier(ctx.attributes.dex);
  const breakdown: BreakdownEntry[] = [];
  let total: number;

  if (ctx.equippedArmor) {
    const armor = ctx.equippedArmor.armorClass;
    if (armor.dexBonus) {
      const cappedDex =
        armor.maxDexBonus !== undefined
          ? Math.min(dexMod, armor.maxDexBonus)
          : dexMod;
      total = armor.base + cappedDex;
      const dexLabel =
        armor.maxDexBonus !== undefined
          ? ` + Des limitada a ${armor.maxDexBonus}`
          : " + Des";
      breakdown.push({
        source: `${ctx.equippedArmor.name} (${armor.base}${dexLabel})`,
        value: total,
      });
    } else {
      total = armor.base;
      breakdown.push({ source: ctx.equippedArmor.name, value: total });
    }
  } else if (ctx.classSlug === "barbarian") {
    const conMod = abilityModifier(ctx.attributes.con);
    total = 10 + dexMod + conMod;
    breakdown.push({
      source: "Defesa Sem Armadura (Bárbaro): 10 + Des + Con",
      value: total,
    });
  } else if (ctx.classSlug === "monk") {
    const wisMod = abilityModifier(ctx.attributes.wis);
    total = 10 + dexMod + wisMod;
    breakdown.push({
      source: "Defesa Sem Armadura (Monge): 10 + Des + Sab",
      value: total,
    });
  } else {
    total = 10 + dexMod;
    breakdown.push({ source: "Sem armadura: 10 + Des", value: total });
  }

  if (ctx.equippedShield) {
    total += ctx.equippedShield.bonus;
    breakdown.push({
      source: ctx.equippedShield.name,
      value: ctx.equippedShield.bonus,
    });
  }

  if (ctx.bonusModifiers) {
    for (const bonus of ctx.bonusModifiers) {
      total += bonus.value;
      breakdown.push(bonus);
    }
  }

  return { total, breakdown };
}
