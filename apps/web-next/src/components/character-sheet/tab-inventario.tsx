"use client";

import Link from "next/link";
import { Check, Package, Shield, Sword } from "lucide-react";
import type { Dnd5eSheetContext } from "@/hooks/use-dnd5e-derived";
import { listItems } from "@/lib/srd";
import { useCharacterStore } from "@/stores/characterStore";

interface Props {
  ctx: Dnd5eSheetContext | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  weapon: "Arma",
  armor: "Armadura",
  "adventuring-gear": "Equipamento",
  "magic-item": "Mágico",
  tool: "Ferramenta",
};

export function TabInventario({ ctx }: Props) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const characters = useCharacterStore((s) => s.characters);

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
    const character = characters.find((c) => c.dnd5eData?.equipment.some((e) => e.itemSlug === slug));
    if (!character?.dnd5eData) return;
    const nextEquipment = character.dnd5eData.equipment.map((e) =>
      e.itemSlug === slug ? { ...e, equipped: !e.equipped } : e,
    );
    updateCharacter(character.id, {
      dnd5eData: { ...character.dnd5eData, equipment: nextEquipment },
    });
  }

  const equippedCount = inventory.filter((x) => x.entry.equipped).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-brand-muted">
        <span>
          {inventory.length} itens · {equippedCount} equipados
        </span>
        <Link
          href="/compendium/dnd5e/items"
          className="text-brand-accent hover:underline"
        >
          Buscar no compêndio →
        </Link>
      </div>

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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
