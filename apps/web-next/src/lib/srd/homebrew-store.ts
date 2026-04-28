"use client";

// ── Homebrew CRUD store ──
//
// Conteúdo customizado do compêndio (HOMEBREW_CAMPAIGN, do prompt
// §4.2). Cada entry é dona de um `campaignId` — só aparece nas listas
// quando essa campanha está ativa. GM/CO_GM da campanha cria, edita
// e remove. Quando o backend existir, isso vira fetch contra
// `/campaigns/:id/homebrew` e o store local some.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SrdItem, SrdMonster, SrdSpell } from "@/types/srd";

type HomebrewKind = "spell" | "monster" | "item";

interface HomebrewState {
  /** Spells por campaignId. */
  spellsByCampaign: Record<string, SrdSpell[]>;
  monstersByCampaign: Record<string, SrdMonster[]>;
  itemsByCampaign: Record<string, SrdItem[]>;

  // Spells
  addSpell: (campaignId: string, spell: SrdSpell) => void;
  updateSpell: (campaignId: string, slug: string, patch: Partial<SrdSpell>) => void;
  deleteSpell: (campaignId: string, slug: string) => void;
  getSpell: (campaignId: string, slug: string) => SrdSpell | null;

  // Monsters
  addMonster: (campaignId: string, monster: SrdMonster) => void;
  updateMonster: (campaignId: string, slug: string, patch: Partial<SrdMonster>) => void;
  deleteMonster: (campaignId: string, slug: string) => void;
  getMonster: (campaignId: string, slug: string) => SrdMonster | null;

  // Items
  addItem: (campaignId: string, item: SrdItem) => void;
  updateItem: (campaignId: string, slug: string, patch: Partial<SrdItem>) => void;
  deleteItem: (campaignId: string, slug: string) => void;
  getItem: (campaignId: string, slug: string) => SrdItem | null;

  /** Helper genérico — usado pra exibir badges em listas. */
  isHomebrew: (kind: HomebrewKind, campaignId: string, slug: string) => boolean;
}

function pushUnique<T extends { slug: string }>(arr: T[] | undefined, item: T): T[] {
  const list = arr ?? [];
  if (list.some((x) => x.slug === item.slug)) {
    // Atualiza in-place se slug já existe (caller pode ter sobrescrito).
    return list.map((x) => (x.slug === item.slug ? item : x));
  }
  return [item, ...list];
}

function patchInList<T extends { slug: string }>(
  arr: T[] | undefined,
  slug: string,
  patch: Partial<T>,
): T[] {
  return (arr ?? []).map((x) => (x.slug === slug ? { ...x, ...patch } : x));
}

function removeFromList<T extends { slug: string }>(
  arr: T[] | undefined,
  slug: string,
): T[] {
  return (arr ?? []).filter((x) => x.slug !== slug);
}

export const useHomebrewStore = create<HomebrewState>()(
  persist(
    (set, get) => ({
      spellsByCampaign: {},
      monstersByCampaign: {},
      itemsByCampaign: {},

      addSpell: (campaignId, spell) =>
        set((s) => ({
          spellsByCampaign: {
            ...s.spellsByCampaign,
            [campaignId]: pushUnique(s.spellsByCampaign[campaignId], spell),
          },
        })),
      updateSpell: (campaignId, slug, patch) =>
        set((s) => ({
          spellsByCampaign: {
            ...s.spellsByCampaign,
            [campaignId]: patchInList(s.spellsByCampaign[campaignId], slug, patch),
          },
        })),
      deleteSpell: (campaignId, slug) =>
        set((s) => ({
          spellsByCampaign: {
            ...s.spellsByCampaign,
            [campaignId]: removeFromList(s.spellsByCampaign[campaignId], slug),
          },
        })),
      getSpell: (campaignId, slug) =>
        get().spellsByCampaign[campaignId]?.find((s) => s.slug === slug) ?? null,

      addMonster: (campaignId, monster) =>
        set((s) => ({
          monstersByCampaign: {
            ...s.monstersByCampaign,
            [campaignId]: pushUnique(s.monstersByCampaign[campaignId], monster),
          },
        })),
      updateMonster: (campaignId, slug, patch) =>
        set((s) => ({
          monstersByCampaign: {
            ...s.monstersByCampaign,
            [campaignId]: patchInList(s.monstersByCampaign[campaignId], slug, patch),
          },
        })),
      deleteMonster: (campaignId, slug) =>
        set((s) => ({
          monstersByCampaign: {
            ...s.monstersByCampaign,
            [campaignId]: removeFromList(s.monstersByCampaign[campaignId], slug),
          },
        })),
      getMonster: (campaignId, slug) =>
        get().monstersByCampaign[campaignId]?.find((m) => m.slug === slug) ?? null,

      addItem: (campaignId, item) =>
        set((s) => ({
          itemsByCampaign: {
            ...s.itemsByCampaign,
            [campaignId]: pushUnique(s.itemsByCampaign[campaignId], item),
          },
        })),
      updateItem: (campaignId, slug, patch) =>
        set((s) => ({
          itemsByCampaign: {
            ...s.itemsByCampaign,
            [campaignId]: patchInList(s.itemsByCampaign[campaignId], slug, patch),
          },
        })),
      deleteItem: (campaignId, slug) =>
        set((s) => ({
          itemsByCampaign: {
            ...s.itemsByCampaign,
            [campaignId]: removeFromList(s.itemsByCampaign[campaignId], slug),
          },
        })),
      getItem: (campaignId, slug) =>
        get().itemsByCampaign[campaignId]?.find((i) => i.slug === slug) ?? null,

      isHomebrew: (kind, campaignId, slug) => {
        const state = get();
        const list =
          kind === "spell"
            ? state.spellsByCampaign[campaignId]
            : kind === "monster"
              ? state.monstersByCampaign[campaignId]
              : state.itemsByCampaign[campaignId];
        return Boolean(list?.some((x) => x.slug === slug));
      },
    }),
    {
      name: "questboard-homebrew",
      version: 1,
    },
  ),
);

// ── Selectors agnósticos de campanha ──
//
// Usados pelas list/detail pages do compêndio. Quando `campaignId` é
// null, retornam vazio — homebrew só existe no contexto de campanha.

export function useHomebrewSpells(campaignId: string | null): SrdSpell[] {
  return useHomebrewStore((s) =>
    campaignId ? s.spellsByCampaign[campaignId] ?? [] : [],
  );
}

export function useHomebrewMonsters(campaignId: string | null): SrdMonster[] {
  return useHomebrewStore((s) =>
    campaignId ? s.monstersByCampaign[campaignId] ?? [] : [],
  );
}

export function useHomebrewItems(campaignId: string | null): SrdItem[] {
  return useHomebrewStore((s) =>
    campaignId ? s.itemsByCampaign[campaignId] ?? [] : [],
  );
}
