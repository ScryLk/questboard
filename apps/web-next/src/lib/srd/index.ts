// ── @/lib/srd: catálogo SRD frontend ──
//
// Por enquanto serve dados mock seed dos arquivos vizinhos. Quando o
// importador/backend existir, esta camada vira fetcher (`useSWR` ou
// React Query) contra os endpoints `/systems/dnd5e/...`.

import type { SrdSystem } from "@/types/srd";
import { SEED_SPELLS } from "./seed-spells";
import { SEED_MONSTERS } from "./seed-monsters";
import { SEED_ITEMS } from "./seed-items";
import { SEED_RACES } from "./seed-races";
import { SEED_CLASSES } from "./seed-classes";
import { SEED_CONDITIONS } from "./seed-conditions";
import { SEED_COSMIC_HORROR_ENTITIES } from "./seed-cosmic-horror-entities";
import { SEED_COSMIC_HORROR_OCCUPATIONS } from "./seed-cosmic-horror-occupations";
import { SEED_COSMIC_HORROR_MYTHOS_SPELLS } from "./seed-cosmic-horror-spells";
import { SEED_COSMIC_HORROR_MADNESS } from "./seed-cosmic-horror-madness";

export * from "./attribution";
export * from "./cosmic-horror-attribution";
export {
  SEED_SPELLS,
  SEED_MONSTERS,
  SEED_ITEMS,
  SEED_RACES,
  SEED_CLASSES,
  SEED_CONDITIONS,
  SEED_COSMIC_HORROR_ENTITIES,
  SEED_COSMIC_HORROR_OCCUPATIONS,
  SEED_COSMIC_HORROR_MYTHOS_SPELLS,
  SEED_COSMIC_HORROR_MADNESS,
};

export const SRD_SYSTEMS: SrdSystem[] = [
  {
    slug: "dnd5e",
    name: "Dungeons & Dragons 5ª Edição",
    shortName: "D&D 5e",
    edition: "5.1 SRD",
    publisher: "Wizards of the Coast",
    licenseType: "CC-BY-4.0",
    hasContent: true,
    description:
      "Conteúdo completo do System Reference Document 5.1 em português. Magias, monstros, itens, raças, classes e condições oficiais sob CC-BY 4.0.",
  },
  {
    slug: "cosmic-horror",
    name: "Horror Investigativo (d100)",
    shortName: "Horror d100",
    edition: "MVP",
    publisher: "QuestBoard",
    licenseType: "NONE",
    hasContent: true,
    description:
      "Sistema próprio de investigação cósmica em pt-BR. Sanidade, ocupações, feitiços do Mythos e bestiário Lovecraftiano em domínio público. Não afiliado a Chaosium ou Call of Cthulhu®.",
  },
  {
    slug: "tormenta20",
    name: "Tormenta20",
    shortName: "T20",
    publisher: "Jambô Editora",
    licenseType: "PROPRIETARY",
    hasContent: false,
    description:
      "Sistema brasileiro publicado pela Jambô. Sem SRD aberto — adicione conteúdo homebrew na sua campanha.",
  },
  {
    slug: "ordem-paranormal",
    name: "Ordem Paranormal",
    shortName: "OP",
    publisher: "Jambô Editora",
    licenseType: "PROPRIETARY",
    hasContent: false,
    description:
      "RPG de horror moderno. Sem SRD aberto — adicione conteúdo homebrew na sua campanha.",
  },
];

export function getSystem(slug: string): SrdSystem | null {
  return SRD_SYSTEMS.find((s) => s.slug === slug) ?? null;
}

// ── Lookups por sistema ──
//
// dnd5e: spells/monsters/items/races/classes/conditions.
// cosmic-horror: entities/occupations/mythos-spells/madness.

export function listSpells(systemSlug: string) {
  return systemSlug === "dnd5e" ? SEED_SPELLS : [];
}
export function listMonsters(systemSlug: string) {
  return systemSlug === "dnd5e" ? SEED_MONSTERS : [];
}
export function listItems(systemSlug: string) {
  return systemSlug === "dnd5e" ? SEED_ITEMS : [];
}
export function listRaces(systemSlug: string) {
  return systemSlug === "dnd5e" ? SEED_RACES : [];
}
export function listClasses(systemSlug: string) {
  return systemSlug === "dnd5e" ? SEED_CLASSES : [];
}
export function listConditions(systemSlug: string) {
  return systemSlug === "dnd5e" ? SEED_CONDITIONS : [];
}

export function getSpell(systemSlug: string, slug: string) {
  return listSpells(systemSlug).find((s) => s.slug === slug) ?? null;
}
export function getMonster(systemSlug: string, slug: string) {
  return listMonsters(systemSlug).find((s) => s.slug === slug) ?? null;
}
export function getItem(systemSlug: string, slug: string) {
  return listItems(systemSlug).find((s) => s.slug === slug) ?? null;
}
export function getRace(systemSlug: string, slug: string) {
  return listRaces(systemSlug).find((s) => s.slug === slug) ?? null;
}
export function getClass(systemSlug: string, slug: string) {
  return listClasses(systemSlug).find((s) => s.slug === slug) ?? null;
}
export function getCondition(systemSlug: string, slug: string) {
  return listConditions(systemSlug).find((s) => s.slug === slug) ?? null;
}

// ── Cosmic horror lookups ──
export function listCosmicHorrorEntities(systemSlug: string) {
  return systemSlug === "cosmic-horror" ? SEED_COSMIC_HORROR_ENTITIES : [];
}
export function listCosmicHorrorOccupations(systemSlug: string) {
  return systemSlug === "cosmic-horror" ? SEED_COSMIC_HORROR_OCCUPATIONS : [];
}
export function listCosmicHorrorMythosSpells(systemSlug: string) {
  return systemSlug === "cosmic-horror" ? SEED_COSMIC_HORROR_MYTHOS_SPELLS : [];
}
export function listCosmicHorrorMadness(systemSlug: string) {
  return systemSlug === "cosmic-horror" ? SEED_COSMIC_HORROR_MADNESS : [];
}

export function getCosmicHorrorEntity(systemSlug: string, slug: string) {
  return listCosmicHorrorEntities(systemSlug).find((e) => e.slug === slug) ?? null;
}
export function getCosmicHorrorOccupation(systemSlug: string, slug: string) {
  return listCosmicHorrorOccupations(systemSlug).find((o) => o.slug === slug) ?? null;
}
export function getCosmicHorrorMythosSpell(systemSlug: string, slug: string) {
  return listCosmicHorrorMythosSpells(systemSlug).find((s) => s.slug === slug) ?? null;
}
export function getCosmicHorrorMadness(systemSlug: string, slug: string) {
  return listCosmicHorrorMadness(systemSlug).find((m) => m.slug === slug) ?? null;
}

export interface SystemCounts {
  // dnd5e
  spells: number;
  monsters: number;
  items: number;
  races: number;
  classes: number;
  conditions: number;
  // cosmic-horror
  entities: number;
  occupations: number;
  mythosSpells: number;
  madness: number;
}

const EMPTY_COUNTS: SystemCounts = {
  spells: 0,
  monsters: 0,
  items: 0,
  races: 0,
  classes: 0,
  conditions: 0,
  entities: 0,
  occupations: 0,
  mythosSpells: 0,
  madness: 0,
};

export function getSystemCounts(systemSlug: string): SystemCounts {
  if (systemSlug === "dnd5e") {
    return {
      ...EMPTY_COUNTS,
      spells: SEED_SPELLS.length,
      monsters: SEED_MONSTERS.length,
      items: SEED_ITEMS.length,
      races: SEED_RACES.length,
      classes: SEED_CLASSES.length,
      conditions: SEED_CONDITIONS.length,
    };
  }
  if (systemSlug === "cosmic-horror") {
    return {
      ...EMPTY_COUNTS,
      entities: SEED_COSMIC_HORROR_ENTITIES.length,
      occupations: SEED_COSMIC_HORROR_OCCUPATIONS.length,
      mythosSpells: SEED_COSMIC_HORROR_MYTHOS_SPELLS.length,
      madness: SEED_COSMIC_HORROR_MADNESS.length,
    };
  }
  return EMPTY_COUNTS;
}
