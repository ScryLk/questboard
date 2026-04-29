"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Brain } from "lucide-react";
import { getSystem, listCosmicHorrorMadness } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";
import type { CosmicHorrorMadness } from "@/types/cosmic-horror-srd";

const CATEGORY_LABELS: Record<CosmicHorrorMadness["category"], string> = {
  BOUT: "Surto",
  PHOBIA: "Fobia",
  MANIA: "Mania",
  INDEFINITE: "Indefinida",
  PERMANENT: "Permanente",
};

const CATEGORY_COLORS: Record<CosmicHorrorMadness["category"], string> = {
  BOUT: "#fbbf24",
  PHOBIA: "#f472b6",
  MANIA: "#a78bfa",
  INDEFINITE: "#a855f7",
  PERMANENT: "#7c3aed",
};

type CategoryFilter = CosmicHorrorMadness["category"] | "all";

export default function MadnessPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();

  const states = listCosmicHorrorMadness(systemSlug);
  if (states.length === 0) notFound();

  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return states;
    return states.filter((s) => s.category === filter);
  }, [states, filter]);

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
          <Brain className="h-3.5 w-3.5" />
          Estados de Loucura
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Surtos, Fobias e Manias
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          {filtered.length} de {states.length} estados — referência para o GM
          quando perda de SAN dispara surto.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-brand-border p-0.5">
        {(["all", "BOUT", "PHOBIA", "MANIA", "INDEFINITE", "PERMANENT"] as const).map(
          (key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-md px-3 py-1 text-[11px] font-medium transition-colors ${
                filter === key
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {key === "all" ? "Todos" : CATEGORY_LABELS[key]}
            </button>
          ),
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((s) => {
          const color = CATEGORY_COLORS[s.category];
          return (
            <article
              key={s.slug}
              className="rounded-xl border border-brand-border bg-white/[0.02] p-4"
            >
              <header className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-cinzel text-base font-semibold text-brand-text">
                  {s.name}
                </h2>
                <span
                  className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
                  style={{
                    backgroundColor: color + "20",
                    color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {CATEGORY_LABELS[s.category]}
                </span>
              </header>

              {s.duration && (
                <p className="mb-2 text-[11px] text-brand-muted">
                  <span className="font-semibold text-brand-text/80">
                    Duração:
                  </span>{" "}
                  {s.duration}
                </p>
              )}

              <p className="text-sm text-brand-text/90">{s.description}</p>

              <div className="mt-3">
                <SrdAttributionFooter attribution={s.attribution} />
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-[10px] text-brand-muted/70">
        Tabela canônica original do QuestBoard. Não copia conteúdo de produtos
        comerciais.
      </p>
    </div>
  );
}
