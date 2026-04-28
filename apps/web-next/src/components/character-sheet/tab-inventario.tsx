"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Package,
  Plus,
  Search,
  Shield,
  Sword,
  Trash2,
} from "lucide-react";
import type { Dnd5eSheetContext } from "@/hooks/use-dnd5e-derived";
import { listItems } from "@/lib/srd";
import { useCharacterStore } from "@/stores/characterStore";

interface Props {
  characterId: string;
  ctx: Dnd5eSheetContext | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  weapon: "Arma",
  armor: "Armadura",
  "adventuring-gear": "Equipamento",
  "magic-item": "Mágico",
  tool: "Ferramenta",
};

export function TabInventario({ characterId, ctx }: Props) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const characters = useCharacterStore((s) => s.characters);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  if (!ctx) {
    return (
      <p className="text-[11px] italic text-brand-muted">
        Inventário detalhado disponível só pra fichas criadas pelo wizard 5e.
      </p>
    );
  }

  const items = listItems("dnd5e");
  const inventory = ctx.data.equipment.map((entry) => ({
    entry,
    item: items.find((i) => i.slug === entry.itemSlug),
  })).filter((x): x is { entry: typeof x.entry; item: NonNullable<typeof x.item> } =>
    Boolean(x.item),
  );

  function toggleEquipped(slug: string) {
    const character = characters.find((c) => c.id === characterId);
    if (!character?.dnd5eData) return;
    const nextEquipment = character.dnd5eData.equipment.map((e) =>
      e.itemSlug === slug ? { ...e, equipped: !e.equipped } : e,
    );
    updateCharacter(characterId, {
      dnd5eData: { ...character.dnd5eData, equipment: nextEquipment },
    });
  }

  function addItem(slug: string) {
    const character = characters.find((c) => c.id === characterId);
    if (!character?.dnd5eData) return;
    if (character.dnd5eData.equipment.some((e) => e.itemSlug === slug)) {
      // Já tem — incrementa quantidade.
      updateCharacter(characterId, {
        dnd5eData: {
          ...character.dnd5eData,
          equipment: character.dnd5eData.equipment.map((e) =>
            e.itemSlug === slug
              ? { ...e, quantity: (e.quantity ?? 1) + 1 }
              : e,
          ),
        },
      });
      return;
    }
    updateCharacter(characterId, {
      dnd5eData: {
        ...character.dnd5eData,
        equipment: [
          ...character.dnd5eData.equipment,
          { itemSlug: slug, equipped: false, quantity: 1 },
        ],
      },
    });
  }

  function removeItem(slug: string) {
    const character = characters.find((c) => c.id === characterId);
    if (!character?.dnd5eData) return;
    updateCharacter(characterId, {
      dnd5eData: {
        ...character.dnd5eData,
        equipment: character.dnd5eData.equipment.filter(
          (e) => e.itemSlug !== slug,
        ),
      },
    });
  }

  const equippedCount = inventory.filter((x) => x.entry.equipped).length;

  const carriedSlugs = new Set(inventory.map((x) => x.item.slug));
  const pickList = useMemo(
    () =>
      items
        .filter((i) => !carriedSlugs.has(i.slug))
        .filter(
          (i) =>
            !search.trim() ||
            i.name.toLowerCase().includes(search.toLowerCase()),
        ),
    [items, carriedSlugs, search],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-brand-muted">
        <span>
          {inventory.length} itens · {equippedCount} equipados
        </span>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-[11px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
        >
          <Plus className="h-3 w-3" />
          Adicionar item
        </button>
      </div>

      {adding && (
        <div className="rounded-lg border border-brand-accent/30 bg-brand-accent/5 p-3">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar item no compêndio..."
              className="h-8 w-full rounded-md border border-brand-border bg-brand-primary pl-8 pr-3 text-xs text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
            />
          </div>
          <div className="grid max-h-60 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
            {pickList.slice(0, 30).map((it) => (
              <button
                key={it.slug}
                onClick={() => {
                  addItem(it.slug);
                  setSearch("");
                }}
                className="flex items-center gap-2 rounded-md border border-brand-border bg-white/[0.02] px-2 py-1.5 text-left text-xs hover:border-brand-accent/40"
              >
                <Plus className="h-3 w-3 shrink-0 text-brand-accent" />
                <span className="truncate text-brand-text">{it.name}</span>
                <span className="ml-auto shrink-0 text-[10px] text-brand-muted">
                  {CATEGORY_LABELS[it.category]}
                </span>
              </button>
            ))}
          </div>
          {pickList.length > 30 && (
            <p className="mt-2 text-[10px] text-brand-muted">
              Mostrando 30 de {pickList.length}. Refine a busca.
            </p>
          )}
        </div>
      )}

      {inventory.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border p-8 text-center text-sm text-brand-muted">
          Sem itens no inventário.
        </div>
      ) : (
        <div className="grid gap-2">
          {inventory.map(({ entry, item }) => {
            const Icon =
              item.category === "weapon"
                ? Sword
                : item.category === "armor"
                  ? Shield
                  : Package;
            return (
              <div
                key={item.slug}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  entry.equipped
                    ? "border-brand-accent/40 bg-brand-accent/5"
                    : "border-brand-border bg-white/[0.02]"
                }`}
              >
                <button
                  onClick={() => toggleEquipped(item.slug)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    entry.equipped
                      ? "border-brand-accent bg-brand-accent"
                      : "border-brand-border hover:border-brand-accent/40"
                  }`}
                  title={entry.equipped ? "Desequipar" : "Equipar"}
                >
                  {entry.equipped && <Check className="h-3 w-3 text-white" />}
                </button>
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    entry.equipped ? "text-brand-accent" : "text-brand-muted"
                  }`}
                />
                <Link
                  href={`/compendium/dnd5e/items/${item.slug}`}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-medium text-brand-text">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-brand-muted">
                    {CATEGORY_LABELS[item.category]}
                    {item.subcategory && ` · ${item.subcategory}`}
                    {item.weight !== undefined && ` · ${item.weight} kg`}
                    {item.damageDice && ` · ${item.damageDice} ${item.damageType}`}
                    {item.armorClass && ` · CA ${item.armorClass.base}${item.armorClass.dexBonus ? "+Des" : ""}`}
                  </p>
                </Link>
                {(entry.quantity ?? 1) > 1 && (
                  <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-brand-muted">
                    ×{entry.quantity}
                  </span>
                )}
                <button
                  onClick={() => removeItem(item.slug)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-brand-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="Remover do inventário"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
