// ── D&D 5e Engine Types ──
//
// Shapes derivados do motor de cálculo (deriveDnd5eCharacter). Servem
// pra UI da ficha viva mostrar tooltips de breakdown e pra gameplay
// integrar ataques/perícias.

import type { AbilityKey } from "./character";

/** Componente do cálculo (ex: "Cota de malha", "Defesa Sem Armadura"). */
export interface BreakdownEntry {
  source: string;
  value: number;
}

/** Resultado do calculateArmorClass. `total` é o que vai na ficha; o
 *  breakdown serve pra tooltip "como foi calculado". */
export interface ArmorClassResult {
  total: number;
  breakdown: BreakdownEntry[];
}

/** Atributo usado em ataque — deriva da arma (acuidade/distância) + atributos. */
export type AttackAttributeOrigin = "str" | "dex" | "spell";

/** Resultado do calculateAttackBonus pra uma arma. */
export interface AttackBonusResult {
  /** Bônus a somar no d20. */
  bonus: number;
  /** Bônus a somar no dano. */
  damageBonus: number;
  /** Atributo usado pra calcular bônus/dano (`spell` quando ataque mágico). */
  ability: AbilityKey;
  /** Se a arma tem propriedade `finesse` e usou Des por ser maior. */
  usedFinesse: boolean;
}

/** Modificador de uma perícia já calculado. */
export interface SkillModifierResult {
  skill: string;
  /** Modificador final (atributo + prof + expertise + outros). */
  modifier: number;
  /** Atributo associado. */
  ability: AbilityKey;
  /** Componentes que somaram pra explicação na UI. */
  breakdown: BreakdownEntry[];
  /** True se a ficha tem proficiência nessa perícia. */
  proficient: boolean;
  /** True se aplicou expertise (Ladino/Bardo). */
  expertise: boolean;
}

/** Slots de magia disponíveis: chave = nível da magia (1-9), valor = qtd. */
export type SpellSlotsByLevel = Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, number>>;

/** Ataque pronto pra fluxo de combate (já calculado). */
export interface Dnd5eAttackEntry {
  /** Slug do item (`SrdItem.slug`) ou identificador da magia. */
  source: string;
  name: string;
  /** "weapon" pra arma física; "spell" pra ataque mágico. */
  kind: "weapon" | "spell";
  attackBonus: number;
  damageDice: string;
  damageBonus: number;
  damageType: string;
  /** Notação completa pronta pro engine de dados (ex: "1d8+3"). */
  notation: string;
  /** Range em pés (corpo a corpo = 5; à distância = normal/long). */
  rangeNormal: number;
  rangeLong: number | null;
  ability: AbilityKey;
  properties: string[];
}

/** Saving throw já calculado. */
export interface SavingThrowResult {
  ability: AbilityKey;
  modifier: number;
  proficient: boolean;
  breakdown: BreakdownEntry[];
}

/** Bloco completo retornado pelo orquestrador `deriveDnd5eCharacter`.
 *  Vai direto na ficha viva; tooltip de cada campo usa os breakdowns. */
export interface Dnd5eDerivedStats {
  level: number;
  proficiencyBonus: number;
  abilityModifiers: Record<AbilityKey, number>;
  /** Atributos finais (com bônus de raça aplicados). */
  abilityScores: Record<AbilityKey, number>;
  armorClass: ArmorClassResult;
  initiative: number;
  hitPointsMax: number;
  passivePerception: number;
  speed: number;
  skills: SkillModifierResult[];
  savingThrows: SavingThrowResult[];
  attacks: Dnd5eAttackEntry[];
  spellSlots: SpellSlotsByLevel;
  /** Para conjuradores. null se a classe não tem magia. */
  spellSaveDc: number | null;
  spellAttackBonus: number | null;
  spellcastingAbility: AbilityKey | null;
}
