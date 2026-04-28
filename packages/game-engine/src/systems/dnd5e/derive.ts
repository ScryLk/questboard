// Orquestrador `deriveDnd5eCharacter` — recebe o estado da ficha
// (dados que o usuário preencheu) e o conteúdo SRD referenciado, retorna
// todos os valores derivados pra UI/combate consumirem.
//
// Cache: o resultado deve ser persistido em `Character.derived` (JSON)
// e recalculado em qualquer mudança da ficha. UI client-side pode
// chamar essa função direto sem ida ao backend.

import { abilityModifier } from "./ability";
import { calculateArmorClass } from "./armor-class";
import type { ArmorClassResult } from "./armor-class";
import { calculateWeaponAttack, calculateSpellAttack } from "./attack";
import { calculateSavingThrow } from "./saving-throws";
import type { SavingThrowOutput } from "./saving-throws";
import { calculateSkillModifier } from "./skills";
import type { SkillModifierOutput } from "./skills";
import {
  getSpellSlotsByClassAndLevel,
  getSpellcastingAbility,
  type SpellSlotsByLevel,
} from "./spell-slots";
import { proficiencyBonus } from "./proficiency";
import type {
  AbilityKey,
  AbilityScores,
  ArmorItemRef,
  ShieldItemRef,
  WeaponItemRef,
} from "./types";

const ALL_SKILLS = [
  "acrobatics",
  "animal-handling",
  "arcana",
  "athletics",
  "deception",
  "history",
  "insight",
  "intimidation",
  "investigation",
  "medicine",
  "nature",
  "perception",
  "performance",
  "persuasion",
  "religion",
  "sleight-of-hand",
  "stealth",
  "survival",
];

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

export interface DeriveCharacterInput {
  level: number;
  classSlug: string;
  /** Atributos finais já com bônus de raça aplicados. */
  attributes: AbilityScores;
  /** HP máximo informado pelo usuário (cresce ao subir nível). Engine
   *  não recalcula HP automaticamente — escolha do jogador respeitada. */
  hpMax: number;
  speed: number;
  /** Perícias com proficiência. */
  skillProficiencies: string[];
  /** Subset de `skillProficiencies` que ganhou expertise. */
  expertiseSkills: string[];
  /** Atributos com proficiência em saving throw. */
  savingThrowProficiencies: AbilityKey[];
  equippedArmor?: ArmorItemRef | null;
  equippedShield?: ShieldItemRef | null;
  /** Lista de armas equipadas pra calcular ataques. Engine não decide
   *  quais estão equipadas — caller filtra `equipment[].equipped`. */
  equippedWeapons: Array<{
    weapon: WeaponItemRef;
    /** Se a classe é proficiente com esse tipo de arma. Caller decide
     *  com base em `class.weaponProficiencies` × `weapon.subcategory`. */
    proficient: boolean;
  }>;
  /** Bônus avulsos de CA (anel +1, magia, etc.). */
  bonusArmorModifiers?: Array<{ source: string; value: number }>;
}

export interface Dnd5eDerivedStats {
  level: number;
  proficiencyBonus: number;
  abilityScores: AbilityScores;
  abilityModifiers: Record<AbilityKey, number>;
  armorClass: ArmorClassResult;
  initiative: number;
  hitPointsMax: number;
  passivePerception: number;
  speed: number;
  skills: SkillModifierOutput[];
  savingThrows: SavingThrowOutput[];
  attacks: Array<
    ReturnType<typeof calculateWeaponAttack> & { name: string; source: string }
  >;
  spellSlots: SpellSlotsByLevel;
  spellSaveDc: number | null;
  spellAttackBonus: number | null;
  spellcastingAbility: AbilityKey | null;
}

export function deriveDnd5eCharacter(
  input: DeriveCharacterInput,
): Dnd5eDerivedStats {
  const { level, classSlug, attributes } = input;
  const profBonus = proficiencyBonus(level);

  const abilityModifiers = ABILITIES.reduce((acc, ability) => {
    acc[ability] = abilityModifier(attributes[ability]);
    return acc;
  }, {} as Record<AbilityKey, number>);

  const armorClass = calculateArmorClass({
    attributes,
    classSlug,
    equippedArmor: input.equippedArmor,
    equippedShield: input.equippedShield,
    bonusModifiers: input.bonusArmorModifiers,
  });

  const initiative = abilityModifiers.dex;

  const profSkills = new Set(input.skillProficiencies);
  const expertSkills = new Set(input.expertiseSkills);
  const skills = ALL_SKILLS.map((skill) =>
    calculateSkillModifier({
      skill,
      attributes,
      level,
      proficient: profSkills.has(skill),
      expertise: expertSkills.has(skill),
    }),
  );

  const profSavings = new Set(input.savingThrowProficiencies);
  const savingThrows = ABILITIES.map((ability) =>
    calculateSavingThrow(ability, attributes, level, profSavings.has(ability)),
  );

  // Percepção passiva = 10 + modificador de Percepção (com prof se houver).
  const perception = skills.find((s) => s.skill === "perception");
  const passivePerception = 10 + (perception?.modifier ?? 0);

  const attacks = input.equippedWeapons.map(({ weapon, proficient }) => {
    const result = calculateWeaponAttack({
      weapon,
      attributes,
      level,
      proficient,
    });
    return { ...result, name: weapon.name, source: weapon.name };
  });

  const spellcastingAbility = getSpellcastingAbility(classSlug);
  const spellSlots = getSpellSlotsByClassAndLevel(classSlug, level);
  let spellSaveDc: number | null = null;
  let spellAttackBonus: number | null = null;
  if (spellcastingAbility) {
    const spell = calculateSpellAttack({
      spellcastingAbility,
      attributes,
      level,
    });
    spellAttackBonus = spell.attackBonus;
    spellSaveDc = spell.saveDc;
  }

  return {
    level,
    proficiencyBonus: profBonus,
    abilityScores: { ...attributes },
    abilityModifiers,
    armorClass,
    initiative,
    hitPointsMax: input.hpMax,
    passivePerception,
    speed: input.speed,
    skills,
    savingThrows,
    attacks,
    spellSlots,
    spellSaveDc,
    spellAttackBonus,
    spellcastingAbility,
  };
}
