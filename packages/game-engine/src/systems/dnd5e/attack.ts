// Cálculo de bônus de ataque com arma D&D 5e.
//
// Regras:
//   - Armas marciais/simples: usa Força.
//   - Armas com `finesse`: usa o maior entre Força e Destreza.
//   - Armas à distância (`ranged`): usa Destreza.
//   - Armas com `thrown` corpo a corpo: Força (mesmo se acuidade decide
//     pra arremesso, mas simplificamos pro melee).
//   - Bônus = abilityMod + (proficient ? profBonus : 0).
//   - Dano = damageDice + abilityMod (sem profBonus no dano).

import { abilityModifier } from "./ability";
import { proficiencyBonus } from "./proficiency";
import type { AbilityKey, AbilityScores, WeaponItemRef } from "./types";

export interface WeaponAttackContext {
  weapon: WeaponItemRef;
  attributes: AbilityScores;
  level: number;
  proficient: boolean;
}

export interface WeaponAttackOutput {
  bonus: number;
  damageBonus: number;
  ability: AbilityKey;
  /** True quando `finesse` foi aplicada e Des venceu Força. */
  usedFinesse: boolean;
  notation: string;
  damageDice: string;
  damageType: string;
  rangeNormal: number;
  rangeLong: number | null;
}

function isRangedWeapon(weapon: WeaponItemRef): boolean {
  // Só `subcategory` decide. Armas de mão como adaga têm `weaponRange.long`
  // (alcance de arremesso) mas continuam sendo melee — uso de Força/Des
  // segue a regra de finesse/normal nesses casos.
  return Boolean(weapon.subcategory && weapon.subcategory.includes("RANGED"));
}

function buildNotation(damageDice: string, mod: number): string {
  if (mod === 0) return damageDice;
  const sign = mod > 0 ? "+" : "";
  return `${damageDice}${sign}${mod}`;
}

export function calculateWeaponAttack(
  ctx: WeaponAttackContext,
): WeaponAttackOutput {
  const { weapon, attributes, level, proficient } = ctx;
  const ranged = isRangedWeapon(weapon);
  const hasFinesse = weapon.weaponProperties.includes("finesse");

  let ability: AbilityKey;
  let usedFinesse = false;

  if (ranged) {
    ability = "dex";
  } else if (hasFinesse) {
    const strMod = abilityModifier(attributes.str);
    const dexMod = abilityModifier(attributes.dex);
    ability = dexMod > strMod ? "dex" : "str";
    usedFinesse = ability === "dex";
  } else {
    ability = "str";
  }

  const abilityMod = abilityModifier(attributes[ability]);
  const profBonus = proficient ? proficiencyBonus(level) : 0;

  return {
    bonus: abilityMod + profBonus,
    damageBonus: abilityMod,
    ability,
    usedFinesse,
    notation: buildNotation(weapon.damageDice, abilityMod),
    damageDice: weapon.damageDice,
    damageType: weapon.damageType,
    rangeNormal: weapon.weaponRange?.normal ?? 5,
    rangeLong: weapon.weaponRange?.long ?? null,
  };
}

export interface SpellAttackContext {
  spellcastingAbility: AbilityKey;
  attributes: AbilityScores;
  level: number;
}

/** Bônus de ataque mágico = profBonus + abilityMod do atributo de
 *  conjuração. CD de magia = 8 + profBonus + abilityMod. */
export function calculateSpellAttack(ctx: SpellAttackContext): {
  attackBonus: number;
  saveDc: number;
  ability: AbilityKey;
} {
  const abilityMod = abilityModifier(ctx.attributes[ctx.spellcastingAbility]);
  const profBonus = proficiencyBonus(ctx.level);
  return {
    attackBonus: profBonus + abilityMod,
    saveDc: 8 + profBonus + abilityMod,
    ability: ctx.spellcastingAbility,
  };
}
