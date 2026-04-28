"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Search, Sword } from "lucide-react";
import { getSystem, listItems } from "@/lib/srd";
import type { ItemCategory } from "@/types/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

const CATEGORY_LABELS: Record<ItemCategory | "all", string> = {
  all: "Todos",
  weapon: "Armas",
  armor: "Armaduras",
  "adventuring-gear": "Aventura",
  "magic-item": "Mágicos",
  tool: "Ferramentas",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  "very-rare": "Muito raro",
  legendary: "Lendário",
  artifact: "Artefato",
};

const RARITY_COLORS: Record<string, string> = {
  common: "#94a3b8",
  uncommon: "#34d399",
  rare: "#60a5fa",
  "very-rare": "#a78bfa",
  legendary: "#fbbf24",
  artifact: "#f87171",
};

export default function ItemsListPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();
  const all = listItems(systemSlug);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ItemCategory | "all">("all");

  const filtered = useMemo(() => {
    return all.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !i.name.toLowerCase().includes(q) &&
          !i.nameEn.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [all, search, category]);

  return (
    <div className="space-y-5">
      <Link
        href={`/compendium/${systemSlug}`}
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {system.shortName}
      </Link>

      <div>
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
          <Sword className="h-3.5 w-3.5" />
          Itens
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Itens do {system.shortName}
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          {filtered.length} de {all.length} itens
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-brand-border p-0.5">
          {(Object.keys(CATEGORY_LABELS) as Array<ItemCategory | "all">).map(
            (key) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  category === key
                    ? "bg-brand-accent/15 text-brand-accent"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                {CATEGORY_LABELS[key]}
              </button>
            ),
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-brand-border text-sm text-brand-muted">
          Nenhum item.
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((it) => {
            const rarity = it.rarity ?? null;
            const rarityColor = rarity ? RARITY_COLORS[rarity] : "#64748b";
            return (
              <Link
                key={it.slug}
                href={`/compendium/${systemSlug}/items/${it.slug}`}
                className="group flex items-start gap-3 rounded-lg border border-brand-border bg-white/[0.02] p-3 transition-colors hover:border-brand-accent/40"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: rarityColor + "20",
                    color: rarityColor,
                    border: `1px solid ${rarityColor}40`,
                  }}
                >
                  <Sword className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-brand-text">
                      {it.name}
                    </p>
                    {rarity && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                        style={{
                          backgroundColor: rarityColor + "20",
                          color: rarityColor,
                        }}
                      >
                        {RARITY_LABELS[rarity]}
                      </span>
                    )}
                    {it.requiresAttunement && (
                      <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-purple-300">
                        Sintonia
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-brand-muted">
                    {CATEGORY_LABELS[it.category]}
                    {it.subcategory && ` · ${it.subcategory}`}
                    {it.weight && ` · ${it.weight} kg`}
                    {it.cost && ` · ${it.cost.quantity} ${it.cost.unit}`}
                  </p>
                  {it.description && (
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-brand-text/70">
                      {it.description}
                    </p>
                  )}
                </div>
                <SrdAttributionFooter
                  attribution={it.attribution}
                  className="self-end"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
