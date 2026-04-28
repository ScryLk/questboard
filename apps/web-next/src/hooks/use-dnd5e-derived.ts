"use client";

// Re-deriva stats de um CampaignCharacter quando ele tem dnd5eData
// preenchido. Retorna null pra personagens sem dados 5e (caem no view
// genérico). Memoizado por shape do character — recalcula só quando
// algo no `dnd5eData` muda.

import { useMemo } from "react";
import { dnd5e } from "@questboard/game-engine";
import type { CampaignCharacter, Dnd5eCharacterPersisted } from "@/types/character";
import { listClasses, listItems, listRaces } from "@/lib/srd";

export type Dnd5eDerivedSnapshot = ReturnType<typeof dnd5e.deriveDnd5eCharacter>;

export interface Dnd5eSheetContext {
  derived: Dnd5eDerivedSnapshot;
  data: Dnd5eCharacterPersisted;
  className: string;
  raceName: string;
  spellcastingAbility: ReturnType<typeof dnd5e.getSpellcastingAbility>;
}

export function useDnd5eDerived(
  character: CampaignCharacter | undefined,
): Dnd5eSheetContext | null {
  return useMemo(() => {
    if (!character?.dnd5eData) return null;
    const data = character.dnd5eData;

    const klass = listClasses("dnd5e").find((c) => c.slug === data.classSlug);
    const race = listRaces("dnd5e").find((r) => r.slug === data.raceSlug);
    if (!klass || !race) return null;

    const equippedItems = listItems("dnd5e").filter((i) =>
      data.equipment.some((e) => e.itemSlug === i.slug && e.equipped),
    );
    const equippedArmor = equippedItems.find(
      (i) =>
        i.category === "armor" &&
        i.armorClass &&
        !(i.subcategory ?? "").includes("SHIELD"),
    );
    const equippedShield = equippedItems.find(
      (i) => i.subcategory === "SHIELD" && i.armorClass,
    );
    const equippedWeapons = equippedItems.filter((i) => i.category === "weapon");

    const derived = dnd5e.deriveDnd5eCharacter({
      level: data.level,
      classSlug: data.classSlug,
      attributes: data.attributes,
      // hpMax: o usuário define ao subir nível. Por ora pegamos do
      // characterStats existente; quando ficha viva ganhar editor de
      // hpMax, o valor escolhido vem daqui.
      hpMax: character.stats.maxHp,
      speed: race.speed,
      skillProficiencies: data.skillProficiencies,
      expertiseSkills: data.expertiseSkills,
      savingThrowProficiencies: data.savingThrowProficiencies,
      equippedArmor: equippedArmor
        ? { name: equippedArmor.name, armorClass: equippedArmor.armorClass! }
        : null,
      equippedShield: equippedShield
        ? {
            name: equippedShield.name,
            bonus: equippedShield.armorClass!.base,
          }
        : null,
      equippedWeapons: equippedWeapons.map((w) => ({
        weapon: {
          name: w.name,
          damageDice: w.damageDice ?? "1d4",
          damageType: w.damageType ?? "bludgeoning",
          subcategory: w.subcategory,
          weaponProperties: w.weaponProperties ?? [],
          weaponRange: w.weaponRange,
        },
        proficient: true, // ver TODO no wizard step 10
      })),
    });

    return {
      derived,
      data,
      className: klass.name,
      raceName: race.name,
      spellcastingAbility: dnd5e.getSpellcastingAbility(data.classSlug),
    };
  }, [character]);
}
