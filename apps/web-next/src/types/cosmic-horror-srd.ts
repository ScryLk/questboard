// ── Frontend cosmic-horror content types ──
//
// Bestiário, ocupações, feitiços do Mythos e estados de loucura
// servidos pelo compêndio do sistema "Horror Investigativo (d100)".
//
// Mythos Lovecraftiano é domínio público (Lovecraft †1937). Sistema
// não afiliado a Chaosium Inc. ou Call of Cthulhu®.

import type { SrdAttribution } from "./srd";

export type CosmicHorrorEntityCategory =
  | "GREAT_OLD_ONE"
  | "OUTER_GOD"
  | "ALIEN_RACE"
  | "DREAM_LANDS"
  | "LESSER_SERVITOR"
  | "ANOMALY"
  | "HUMAN"
  | "HUMAN_CORRUPTED"
  | "ANIMAL";

/** Nível de pavor — afeta perda de SAN e reação narrativa. */
export type CosmicHorrorDread =
  | "MUNDANE"
  | "UNNATURAL"
  | "TERRIFYING"
  | "ELDRITCH"
  | "INCOMPREHENSIBLE";

export interface CosmicHorrorEntityWeapon {
  name: string;
  /** Skill % usada pra ataque (ex: 65 = 65%). */
  skill: number;
  /** Notação de dano d100 — pode incluir damage bonus (ex: "1d6+1d4"). */
  damage: string;
  notes?: string;
}

export interface CosmicHorrorEntityAbility {
  name: string;
  description: string;
}

export interface CosmicHorrorEntity {
  slug: string;
  name: string;
  nameEn: string;
  category: CosmicHorrorEntityCategory;
  dread: CosmicHorrorDread;
  /** Notação tipo "1d6/1d20" — perda no sucesso/fracasso. */
  sanityCost: string;
  description: string;
  /** Origem narrativa (autor, obra, ano). */
  source: string;
  attributes: {
    for?: number;
    con?: number;
    tam?: number;
    des?: number;
    int?: number;
    pod?: number;
  };
  hitPoints?: number;
  moveRate?: number;
  damageBonus?: string;
  build?: number;
  /** Skill % de ataque corpo-a-corpo. */
  fightingSkill?: number;
  /** Skill % de esquiva ativa. */
  dodgeSkill?: number;
  /** Pontos de armadura natural (subtraídos do dano). */
  armor?: number;
  weapons?: CosmicHorrorEntityWeapon[];
  abilities?: CosmicHorrorEntityAbility[];
  /** Slugs de feitiços conhecidos (apontam pra mythos-spells). */
  spells?: string[];
  attribution: SrdAttribution;
}

export interface CosmicHorrorOccupationEntry {
  slug: string;
  name: string;
  description: string;
  /** Fórmula textual ex: "EDU × 4" ou "EDU × 2 + (DES ou FOR) × 2". */
  skillPointsFormula: string;
  creditRating: { min: number; max: number };
  /** Skills fixas da ocupação (slugs). */
  skills: string[];
  /** Quantas skills extras o jogador escolhe livremente. */
  optionalSkillsCount: number;
  /** Atributos canônicos pra ocupação. */
  recommendedAttributes: string[];
  attribution: SrdAttribution;
}

export interface CosmicHorrorMythosSpell {
  slug: string;
  name: string;
  /** Notação MP, ex: "1d6" ou "5". */
  mpCost: string;
  /** Notação perda de SAN, ex: "1d6". */
  sanityCost: string;
  /** Custo opcional em HP. */
  hpCost?: string;
  castingTime: string;
  description: string;
  /** Requisitos materiais ou prévios. */
  requirements?: string[];
  /** Conto/obra de origem ou genérico. */
  source: string;
  attribution: SrdAttribution;
}

export interface CosmicHorrorMadness {
  slug: string;
  name: string;
  category: "BOUT" | "PHOBIA" | "MANIA" | "INDEFINITE" | "PERMANENT";
  description: string;
  /** Duração narrativa, ex: "1d10 horas" ou "permanente". */
  duration?: string;
  attribution: SrdAttribution;
}
