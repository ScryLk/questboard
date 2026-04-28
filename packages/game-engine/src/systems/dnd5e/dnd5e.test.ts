import { describe, expect, it } from "vitest";
import { abilityModifier, formatModifier } from "./ability";
import { proficiencyBonus } from "./proficiency";
import { calculateArmorClass } from "./armor-class";
import { calculateSkillModifier, getAbilityForSkill } from "./skills";
import { calculateSavingThrow } from "./saving-throws";
import { calculateWeaponAttack, calculateSpellAttack } from "./attack";
import {
  getSpellSlotsByClassAndLevel,
  getSpellcastingAbility,
} from "./spell-slots";
import { deriveDnd5eCharacter } from "./derive";
import type { AbilityScores } from "./types";

const STD: AbilityScores = {
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
};

describe("abilityModifier", () => {
  it("score 10/11 = 0", () => {
    expect(abilityModifier(10)).toBe(0);
    expect(abilityModifier(11)).toBe(0);
  });
  it("score 18 = +4", () => {
    expect(abilityModifier(18)).toBe(4);
  });
  it("score 1 = -5", () => {
    expect(abilityModifier(1)).toBe(-5);
  });
  it("score 8 = -1, 9 = -1", () => {
    expect(abilityModifier(8)).toBe(-1);
    expect(abilityModifier(9)).toBe(-1);
  });
});

describe("formatModifier", () => {
  it("positivo com +", () => {
    expect(formatModifier(3)).toBe("+3");
  });
  it("zero com +", () => {
    expect(formatModifier(0)).toBe("+0");
  });
  it("negativo com -", () => {
    expect(formatModifier(-2)).toBe("-2");
  });
});

describe("proficiencyBonus", () => {
  it("nível 1-4 = +2", () => {
    expect(proficiencyBonus(1)).toBe(2);
    expect(proficiencyBonus(4)).toBe(2);
  });
  it("nível 5-8 = +3", () => {
    expect(proficiencyBonus(5)).toBe(3);
    expect(proficiencyBonus(8)).toBe(3);
  });
  it("nível 17-20 = +6", () => {
    expect(proficiencyBonus(17)).toBe(6);
    expect(proficiencyBonus(20)).toBe(6);
  });
  it("clamp fora do range 1-20", () => {
    expect(proficiencyBonus(0)).toBe(2);
    expect(proficiencyBonus(99)).toBe(6);
  });
});

describe("calculateArmorClass", () => {
  it("sem armadura: 10 + Des", () => {
    const r = calculateArmorClass({
      attributes: { ...STD, dex: 14 },
      classSlug: "wizard",
    });
    expect(r.total).toBe(12);
  });

  it("armadura leve (dexBonus, sem cap): base + Des completo", () => {
    const r = calculateArmorClass({
      attributes: { ...STD, dex: 16 }, // +3
      classSlug: "rogue",
      equippedArmor: {
        name: "Couro batido",
        armorClass: { base: 12, dexBonus: true },
      },
    });
    expect(r.total).toBe(15);
  });

  it("armadura média (dexBonus capped a +2)", () => {
    const r = calculateArmorClass({
      attributes: { ...STD, dex: 18 }, // +4 mas armadura cap em +2
      classSlug: "fighter",
      equippedArmor: {
        name: "Cota de malha",
        armorClass: { base: 14, dexBonus: true, maxDexBonus: 2 },
      },
    });
    expect(r.total).toBe(16);
  });

  it("armadura pesada: ignora Des", () => {
    const r = calculateArmorClass({
      attributes: { ...STD, dex: 18 },
      classSlug: "fighter",
      equippedArmor: {
        name: "Placas",
        armorClass: { base: 18, dexBonus: false },
      },
    });
    expect(r.total).toBe(18);
  });

  it("escudo soma +2", () => {
    const r = calculateArmorClass({
      attributes: { ...STD, dex: 14 },
      classSlug: "fighter",
      equippedArmor: {
        name: "Cota de malha",
        armorClass: { base: 14, dexBonus: true, maxDexBonus: 2 },
      },
      equippedShield: { name: "Escudo", bonus: 2 },
    });
    expect(r.total).toBe(18);
  });

  it("Bárbaro Defesa Sem Armadura: 10 + Des + Con", () => {
    const r = calculateArmorClass({
      attributes: { ...STD, dex: 14, con: 16 }, // +2 +3
      classSlug: "barbarian",
    });
    expect(r.total).toBe(15);
  });

  it("Monge Defesa Sem Armadura: 10 + Des + Sab", () => {
    const r = calculateArmorClass({
      attributes: { ...STD, dex: 16, wis: 14 }, // +3 +2
      classSlug: "monk",
    });
    expect(r.total).toBe(15);
  });

  it("bônus extras somam", () => {
    const r = calculateArmorClass({
      attributes: { ...STD, dex: 14 },
      classSlug: "wizard",
      bonusModifiers: [{ source: "Anel de Proteção", value: 1 }],
    });
    expect(r.total).toBe(13);
  });
});

describe("calculateSkillModifier", () => {
  it("perícia em atributo = mod do atributo", () => {
    const r = calculateSkillModifier({
      skill: "stealth",
      attributes: { ...STD, dex: 16 }, // +3
      level: 1,
      proficient: false,
      expertise: false,
    });
    expect(r.modifier).toBe(3);
  });

  it("proficiente soma profBonus", () => {
    const r = calculateSkillModifier({
      skill: "stealth",
      attributes: { ...STD, dex: 16 }, // +3
      level: 5, // prof +3
      proficient: true,
      expertise: false,
    });
    expect(r.modifier).toBe(6);
  });

  it("expertise dobra profBonus", () => {
    const r = calculateSkillModifier({
      skill: "stealth",
      attributes: { ...STD, dex: 16 }, // +3
      level: 5, // prof +3
      proficient: true,
      expertise: true,
    });
    expect(r.modifier).toBe(9);
  });

  it("perícia desconhecida lança erro", () => {
    expect(() =>
      calculateSkillModifier({
        skill: "blacksmithing",
        attributes: STD,
        level: 1,
        proficient: false,
        expertise: false,
      }),
    ).toThrow();
  });

  it("getAbilityForSkill: athletics → str", () => {
    expect(getAbilityForSkill("athletics")).toBe("str");
    expect(getAbilityForSkill("nonsense")).toBeNull();
  });
});

describe("calculateSavingThrow", () => {
  it("não-proficiente = só ability mod", () => {
    const r = calculateSavingThrow("dex", { ...STD, dex: 14 }, 5, false);
    expect(r.modifier).toBe(2);
  });
  it("proficiente soma prof", () => {
    const r = calculateSavingThrow("con", { ...STD, con: 14 }, 5, true);
    expect(r.modifier).toBe(5); // +2 con + +3 prof
  });
});

describe("calculateWeaponAttack", () => {
  const longsword = {
    name: "Espada longa",
    damageDice: "1d8",
    damageType: "slashing",
    subcategory: "MARTIAL_MELEE",
    weaponProperties: ["versatile"],
    weaponRange: { normal: 5 },
  };

  const rapier = {
    name: "Rapieira",
    damageDice: "1d8",
    damageType: "piercing",
    subcategory: "MARTIAL_MELEE",
    weaponProperties: ["finesse"],
    weaponRange: { normal: 5 },
  };

  const longbow = {
    name: "Arco longo",
    damageDice: "1d8",
    damageType: "piercing",
    subcategory: "MARTIAL_RANGED",
    weaponProperties: ["heavy", "two-handed", "ammunition"],
    weaponRange: { normal: 150, long: 600 },
  };

  it("arma normal usa Força", () => {
    const r = calculateWeaponAttack({
      weapon: longsword,
      attributes: { ...STD, str: 16, dex: 12 },
      level: 5,
      proficient: true,
    });
    expect(r.ability).toBe("str");
    expect(r.bonus).toBe(6); // +3 str + +3 prof
    expect(r.damageBonus).toBe(3);
    expect(r.usedFinesse).toBe(false);
    expect(r.notation).toBe("1d8+3");
  });

  it("arma com finesse: maior entre Força e Destreza vence", () => {
    const r = calculateWeaponAttack({
      weapon: rapier,
      attributes: { ...STD, str: 12, dex: 18 },
      level: 1,
      proficient: true,
    });
    expect(r.ability).toBe("dex");
    expect(r.usedFinesse).toBe(true);
    expect(r.bonus).toBe(6); // +4 dex + +2 prof
  });

  it("arma à distância usa Destreza independente de finesse", () => {
    const r = calculateWeaponAttack({
      weapon: longbow,
      attributes: { ...STD, str: 18, dex: 14 },
      level: 5,
      proficient: true,
    });
    expect(r.ability).toBe("dex");
    expect(r.bonus).toBe(5); // +2 dex + +3 prof
    expect(r.rangeNormal).toBe(150);
    expect(r.rangeLong).toBe(600);
  });

  it("não-proficiente: sem prof bonus", () => {
    const r = calculateWeaponAttack({
      weapon: longsword,
      attributes: { ...STD, str: 16 },
      level: 5,
      proficient: false,
    });
    expect(r.bonus).toBe(3); // só +3 str
  });

  it("notation com bônus zero não tem sinal", () => {
    const r = calculateWeaponAttack({
      weapon: longsword,
      attributes: { ...STD, str: 10 },
      level: 1,
      proficient: false,
    });
    expect(r.notation).toBe("1d8");
  });
});

describe("calculateSpellAttack", () => {
  it("Mago nível 5 INT 18: bônus +7, CD 15", () => {
    const r = calculateSpellAttack({
      spellcastingAbility: "int",
      attributes: { ...STD, int: 18 },
      level: 5,
    });
    expect(r.attackBonus).toBe(7); // +3 prof + +4 int
    expect(r.saveDc).toBe(15); // 8 + 3 + 4
  });
});

describe("getSpellSlotsByClassAndLevel", () => {
  it("Mago nível 1: 2 slots de nível 1", () => {
    expect(getSpellSlotsByClassAndLevel("wizard", 1)).toEqual({ 1: 2 });
  });
  it("Mago nível 5: até nível 3", () => {
    expect(getSpellSlotsByClassAndLevel("wizard", 5)).toEqual({
      1: 4, 2: 3, 3: 2,
    });
  });
  it("Paladino nível 1: SEM slots (meia-progressão começa no 2)", () => {
    expect(getSpellSlotsByClassAndLevel("paladin", 1)).toEqual({});
  });
  it("Paladino nível 5: nível 1 e 2", () => {
    expect(getSpellSlotsByClassAndLevel("paladin", 5)).toEqual({ 1: 4, 2: 2 });
  });
  it("Bruxo Pact Magic: poucos slots de nível alto", () => {
    expect(getSpellSlotsByClassAndLevel("warlock", 5)).toEqual({ 3: 2 });
    expect(getSpellSlotsByClassAndLevel("warlock", 11)).toEqual({ 5: 3 });
  });
  it("Guerreiro: vazio", () => {
    expect(getSpellSlotsByClassAndLevel("fighter", 10)).toEqual({});
  });
  it("getSpellcastingAbility: Mago=INT, Clérigo=SAB, Bardo=CAR", () => {
    expect(getSpellcastingAbility("wizard")).toBe("int");
    expect(getSpellcastingAbility("cleric")).toBe("wis");
    expect(getSpellcastingAbility("bard")).toBe("cha");
    expect(getSpellcastingAbility("fighter")).toBeNull();
  });
});

describe("deriveDnd5eCharacter (smoke)", () => {
  it("Mago nível 5 com Robe + Adaga proficiente — bate todos os campos", () => {
    const result = deriveDnd5eCharacter({
      level: 5,
      classSlug: "wizard",
      attributes: { str: 8, dex: 14, con: 14, int: 18, wis: 12, cha: 10 },
      hpMax: 28,
      speed: 30,
      skillProficiencies: ["arcana", "history"],
      expertiseSkills: [],
      savingThrowProficiencies: ["int", "wis"],
      equippedWeapons: [
        {
          weapon: {
            name: "Adaga",
            damageDice: "1d4",
            damageType: "piercing",
            subcategory: "SIMPLE_MELEE",
            weaponProperties: ["finesse", "light", "thrown"],
            weaponRange: { normal: 20, long: 60 },
          },
          proficient: true,
        },
      ],
    });

    expect(result.proficiencyBonus).toBe(3);
    expect(result.armorClass.total).toBe(12); // 10 + 2 dex, sem armadura
    expect(result.initiative).toBe(2);
    expect(result.hitPointsMax).toBe(28);
    expect(result.spellcastingAbility).toBe("int");
    expect(result.spellSaveDc).toBe(15); // 8 + 3 + 4
    expect(result.spellAttackBonus).toBe(7);
    expect(result.spellSlots).toEqual({ 1: 4, 2: 3, 3: 2 });
    // Adaga: finesse, dex 14 (+2) > str 8 (-1), prof
    expect(result.attacks).toHaveLength(1);
    const dagger = result.attacks[0]!;
    expect(dagger.ability).toBe("dex");
    expect(dagger.usedFinesse).toBe(true);
    expect(dagger.bonus).toBe(5); // +2 dex + +3 prof
    expect(dagger.notation).toBe("1d4+2");
    // Saving throws: INT/WIS proficientes
    const intSave = result.savingThrows.find((s) => s.ability === "int");
    expect(intSave?.modifier).toBe(7); // +4 int + +3 prof
    expect(intSave?.proficient).toBe(true);
    const strSave = result.savingThrows.find((s) => s.ability === "str");
    expect(strSave?.proficient).toBe(false);
    expect(strSave?.modifier).toBe(-1);
    // Perícia Arcana proficiente: +4 int + +3 prof = 7
    const arcana = result.skills.find((s) => s.skill === "arcana");
    expect(arcana?.modifier).toBe(7);
    expect(arcana?.proficient).toBe(true);
    // Percepção passiva: 10 + sab mod (sem prof)
    expect(result.passivePerception).toBe(11); // 10 + +1
  });
});
