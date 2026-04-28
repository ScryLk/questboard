// Shapes locais usados pelos calculadores. Espelham as definições em
// `@questboard/types/dnd5e` e `@questboard/constants/dnd5e`, mas
// duplicadas aqui pra evitar dep cruzada (segue padrão de attack.ts e
// resistances.ts deste mesmo package).

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type AbilityScores = Record<AbilityKey, number>;

export interface BreakdownEntry {
  source: string;
  value: number;
}

/** Subset do shape de SrdItem necessário pros cálculos. Quem chamar
 *  passa os campos relevantes — engine não baixa item da DB. */
export interface ArmorItemRef {
  name: string;
  /** `{ base, dexBonus, maxDexBonus? }` da armadura. */
  armorClass: { base: number; dexBonus: boolean; maxDexBonus?: number };
}

export interface ShieldItemRef {
  name: string;
  /** Bônus que o escudo dá (em geral 2). */
  bonus: number;
}

export interface WeaponItemRef {
  name: string;
  damageDice: string;
  damageType: string;
  /** "MARTIAL_MELEE", "SIMPLE_RANGED", etc. */
  subcategory?: string;
  weaponProperties: string[];
  weaponRange?: { normal: number; long?: number };
}
