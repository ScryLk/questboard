"use client";

// Hook que deriva stats da ficha cosmic-horror em tempo real a partir
// de `CampaignCharacter.cosmicHorrorData`. O motor (`@questboard/game-engine`)
// recalcula HP, MP, dodge, dmg bonus, build, move e máximas de SAN.

import { useMemo } from "react";
import { cosmicHorror } from "@questboard/game-engine";
import {
  COSMIC_HORROR_OCCUPATIONS,
  COSMIC_HORROR_SKILLS,
  type CosmicHorrorSkill,
} from "@questboard/constants";
import type { CampaignCharacter } from "@/types/character";

export interface CosmicHorrorDerived {
  hpMax: number;
  mpMax: number;
  damageBonus: string;
  build: number;
  moveRate: number;
  dodgeBase: number;
  /** Teto absoluto: min(startingMax, 99 - mythos). */
  effectiveSanityCeiling: number;
  /** Teto 1:1 (startingMax - mythos). */
  oneToOneSanityCeiling: number;
}

export interface CosmicHorrorSheetContext {
  /** Dados persistidos do personagem. */
  data: NonNullable<CampaignCharacter["cosmicHorrorData"]>;
  occupation: (typeof COSMIC_HORROR_OCCUPATIONS)[number] | null;
  derived: CosmicHorrorDerived;
  /** Skill resolvido com base + value persistido. */
  skillEntries: Array<
    CosmicHorrorSkill & { value: number; halfValue: number; extremeValue: number }
  >;
}

function deriveBase(
  skill: CosmicHorrorSkill,
  attrs: Record<string, number>,
): number {
  if (skill.derivesFrom) {
    const v = attrs[skill.derivesFrom.attr] ?? 0;
    return Math.floor(v / skill.derivesFrom.divisor);
  }
  return skill.base;
}

export function useCosmicHorrorDerived(
  character?: CampaignCharacter,
): CosmicHorrorSheetContext | null {
  return useMemo(() => {
    if (!character?.cosmicHorrorData) return null;
    const data = character.cosmicHorrorData;

    const occupation =
      COSMIC_HORROR_OCCUPATIONS.find((o) => o.slug === data.occupation) ?? null;

    const derived: CosmicHorrorDerived = {
      hpMax: cosmicHorror.calculateHitPoints({
        con: data.attributes.con,
        tam: data.attributes.tam,
      }),
      mpMax: cosmicHorror.calculateMagicPoints(data.attributes.pod),
      damageBonus: cosmicHorror.calculateDamageBonus({
        for: data.attributes.for,
        tam: data.attributes.tam,
      }),
      build: cosmicHorror.calculateBuild({
        for: data.attributes.for,
        tam: data.attributes.tam,
      }),
      moveRate: cosmicHorror.calculateMoveRate({
        attrs: data.attributes,
        age: data.age,
      }),
      dodgeBase: cosmicHorror.calculateDodgeBase(data.attributes.des),
      effectiveSanityCeiling: cosmicHorror.effectiveMaxSanity(
        data.sanityStartingMax,
        data.mythosKnowledge,
      ),
      oneToOneSanityCeiling: Math.max(
        0,
        data.sanityStartingMax - data.mythosKnowledge,
      ),
    };

    const skillEntries = COSMIC_HORROR_SKILLS.map((skill) => {
      const base = deriveBase(skill, data.attributes);
      const value = data.skills[skill.slug] ?? base;
      return {
        ...skill,
        value,
        halfValue: Math.floor(value / 2),
        extremeValue: Math.floor(value / 5),
      };
    });

    return {
      data,
      occupation,
      derived,
      skillEntries,
    };
  }, [character]);
}
