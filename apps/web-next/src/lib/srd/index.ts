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

export * from "./attribution";
export { SEED_SPELLS, SEED_MONSTERS, SEED_ITEMS, SEED_RACES, SEED_CLASSES, SEED_CONDITIONS };

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
  {
    slug: "cthulhu",
    name: "Call of Cthulhu",
    shortName: "CoC",
    publisher: "Chaosium",
    licenseType: "PROPRIETARY",
    hasContent: false,
    description:
      "RPG de horror lovecraftiano. Sem SRD aberto — adicione conteúdo homebrew na sua campanha.",
  },
];

export function getSystem(slug: string): SrdSystem | null {
  return SRD_SYSTEMS.find((s) => s.slug === slug) ?? null;
}

// ── Lookups por sistema ──
//
// Nesta fatia só `dnd5e` tem dados; outros sistemas retornam vazio.

const DND5E_DATA = {
  spells: SEED_SPELLS,
  monsters: SEED_MONSTERS,
  items: SEED_ITEMS,
  races: SEED_RACES,
  classes: SEED_CLASSES,
  conditions: SEED_CONDITIONS,
} as const;

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

export function getSystemCounts(systemSlug: string) {
  if (systemSlug !== "dnd5e") {
    return { spells: 0, monsters: 0, items: 0, races: 0, classes: 0, conditions: 0 };
  }
  return {
    spells: DND5E_DATA.spells.length,
    monsters: DND5E_DATA.monsters.length,
    items: DND5E_DATA.items.length,
    races: DND5E_DATA.races.length,
    classes: DND5E_DATA.classes.length,
    conditions: DND5E_DATA.conditions.length,
  };
}
