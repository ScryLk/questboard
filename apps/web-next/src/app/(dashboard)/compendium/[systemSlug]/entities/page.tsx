"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Search } from "lucide-react";
import { getSystem, listCosmicHorrorEntities } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";
import type {
  CosmicHorrorDread,
  CosmicHorrorEntityCategory,
} from "@/types/cosmic-horror-srd";

const CATEGORY_LABELS: Record<CosmicHorrorEntityCategory, string> = {
  GREAT_OLD_ONE: "Grande Antigo",
  OUTER_GOD: "Outro Deus",
  ALIEN_RACE: "Raça Alienígena",
  DREAM_LANDS: "Reino dos Sonhos",
  LESSER_SERVITOR: "Servidor Menor",
  ANOMALY: "Anomalia",
  HUMAN: "Humano",
  HUMAN_CORRUPTED: "Humano Corrompido",
  ANIMAL: "Animal",
};

const DREAD_LABELS: Record<CosmicHorrorDread, string> = {
  MUNDANE: "Mundano",
  UNNATURAL: "Antinatural",
  TERRIFYING: "Aterrorizante",
  ELDRITCH: "Eldritch",
  INCOMPREHENSIBLE: "Incompreensível",
};

const DREAD_COLORS: Record<CosmicHorrorDread, string> = {
  MUNDANE: "#94a3b8",
  UNNATURAL: "#a78bfa",
  TERRIFYING: "#f472b6",
  ELDRITCH: "#a855f7",
  INCOMPREHENSIBLE: "#7c3aed",
};

type CategoryFilter = CosmicHorrorEntityCategory | "all";
type DreadFilter = CosmicHorrorDread | "all";

export default function EntitiesPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();

  const entities = listCosmicHorrorEntities(systemSlug);
  if (entities.length === 0) notFound();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [dreadFilter, setDreadFilter] = useState<DreadFilter>("all");

  const filtered = useMemo(() => {
    return entities.filter((e) => {
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (dreadFilter !== "all" && e.dread !== dreadFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.nameEn.toLowerCase().includes(q) &&
          !e.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [entities, search, categoryFilter, dreadFilter]);

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
          <Eye className="h-3.5 w-3.5" />
          Entidades do Mythos
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Bestiário Lovecraftiano
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          {filtered.length} de {entities.length} entidades
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          className="h-9 rounded-lg border border-brand-border bg-brand-primary px-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        >
          <option value="all">Todas as categorias</option>
          {(Object.keys(CATEGORY_LABELS) as CosmicHorrorEntityCategory[]).map(
            (c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ),
          )}
        </select>

        <select
          value={dreadFilter}
          onChange={(e) => setDreadFilter(e.target.value as DreadFilter)}
          className="h-9 rounded-lg border border-brand-border bg-brand-primary px-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        >
          <option value="all">Todos os pavores</option>
          {(Object.keys(DREAD_LABELS) as CosmicHorrorDread[]).map((d) => (
            <option key={d} value={d}>
              {DREAD_LABELS[d]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-brand-border text-sm text-brand-muted">
          Nenhuma entidade encontrada com esses filtros.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((e) => {
            const dreadColor = DREAD_COLORS[e.dread];
            return (
              <article
                key={e.slug}
                className="rounded-xl border border-brand-border bg-white/[0.02] p-4"
              >
                <header className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-cinzel text-base font-semibold text-brand-text">
                      {e.name}
                    </h2>
                    <p className="text-[10px] italic text-brand-muted">
                      {e.nameEn}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
                    style={{
                      backgroundColor: dreadColor + "20",
                      color: dreadColor,
                      border: `1px solid ${dreadColor}40`,
                    }}
                  >
                    {DREAD_LABELS[e.dread]}
                  </span>
                </header>

                <div className="mb-2 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="rounded bg-white/[0.06] px-2 py-0.5 text-brand-muted">
                    {CATEGORY_LABELS[e.category]}
                  </span>
                  {e.hitPoints !== undefined && e.hitPoints > 0 && (
                    <span className="rounded bg-white/[0.06] px-2 py-0.5 text-brand-muted">
                      HP {e.hitPoints}
                    </span>
                  )}
                  {e.moveRate !== undefined && e.moveRate > 0 && (
                    <span className="rounded bg-white/[0.06] px-2 py-0.5 text-brand-muted">
                      MOV {e.moveRate}
                    </span>
                  )}
                  <span className="rounded bg-purple-500/15 px-2 py-0.5 font-semibold text-purple-300">
                    SAN {e.sanityCost}
                  </span>
                </div>

                <p className="line-clamp-3 text-sm text-brand-text/90">
                  {e.description}
                </p>

                {e.weapons && e.weapons.length > 0 && (
                  <div className="mt-2 text-[11px] text-brand-muted">
                    <span className="font-semibold text-brand-text/80">
                      Ataques:
                    </span>{" "}
                    {e.weapons
                      .map((w) => `${w.name} (${w.skill}%, ${w.damage})`)
                      .join("; ")}
                  </div>
                )}

                <p className="mt-2 text-[10px] italic text-brand-muted/70">
                  {e.source}
                </p>

                <div className="mt-3">
                  <SrdAttributionFooter attribution={e.attribution} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-brand-muted/70">
        Inspirado em obras de H.P. Lovecraft (1890–1937), em domínio público.
        Sistema &quot;Horror Investigativo&quot; do QuestBoard, não afiliado a
        Chaosium Inc. ou Call of Cthulhu®.
      </p>
    </div>
  );
}
