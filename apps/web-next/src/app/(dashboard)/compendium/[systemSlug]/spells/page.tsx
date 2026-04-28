"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Search, Sparkles, Zap } from "lucide-react";
import { getSystem, listSpells } from "@/lib/srd";
import type { SpellSchool } from "@/types/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

const SCHOOL_LABELS: Record<SpellSchool, string> = {
  abjuration: "Abjuração",
  conjuration: "Conjuração",
  divination: "Adivinhação",
  enchantment: "Encantamento",
  evocation: "Evocação",
  illusion: "Ilusão",
  necromancy: "Necromancia",
  transmutation: "Transmutação",
};

const SCHOOL_COLORS: Record<SpellSchool, string> = {
  abjuration: "#60a5fa",
  conjuration: "#fbbf24",
  divination: "#c4b5fd",
  enchantment: "#f472b6",
  evocation: "#f87171",
  illusion: "#a78bfa",
  necromancy: "#cbd5e1",
  transmutation: "#34d399",
};

const LEVELS: Array<{ value: number | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: 0, label: "Truques" },
  { value: 1, label: "1º" },
  { value: 2, label: "2º" },
  { value: 3, label: "3º" },
  { value: 4, label: "4º" },
  { value: 5, label: "5º" },
];

export default function SpellsListPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();

  const allSpells = listSpells(systemSlug);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | "all">("all");
  const [schoolFilter, setSchoolFilter] = useState<SpellSchool | "all">("all");

  const filtered = useMemo(() => {
    return allSpells.filter((s) => {
      if (levelFilter !== "all" && s.level !== levelFilter) return false;
      if (schoolFilter !== "all" && s.school !== schoolFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !s.nameEn.toLowerCase().includes(q) &&
          !s.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allSpells, search, levelFilter, schoolFilter]);

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
          <Sparkles className="h-3.5 w-3.5" />
          Magias
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Magias do {system.shortName}
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          {filtered.length} de {allSpells.length} magias
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, descrição..."
            className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-brand-border p-0.5">
          {LEVELS.map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => setLevelFilter(value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                levelFilter === value
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={schoolFilter}
          onChange={(e) =>
            setSchoolFilter(e.target.value as SpellSchool | "all")
          }
          className="h-9 rounded-lg border border-brand-border bg-brand-primary px-3 text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        >
          <option value="all">Todas as escolas</option>
          {(Object.keys(SCHOOL_LABELS) as SpellSchool[]).map((s) => (
            <option key={s} value={s}>
              {SCHOOL_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-brand-border text-sm text-brand-muted">
          Nenhuma magia encontrada com esses filtros.
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((spell) => {
            const color = SCHOOL_COLORS[spell.school];
            return (
              <Link
                key={spell.slug}
                href={`/compendium/${systemSlug}/spells/${spell.slug}`}
                className="group flex items-start gap-3 rounded-lg border border-brand-border bg-white/[0.02] p-3 transition-colors hover:border-brand-accent/40"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                  style={{
                    backgroundColor: color + "20",
                    color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {spell.level === 0 ? "T" : spell.level}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-brand-text">
                      {spell.name}
                    </p>
                    {spell.concentration && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-300">
                        Concentr.
                      </span>
                    )}
                    {spell.ritual && (
                      <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-purple-300">
                        Ritual
                      </span>
                    )}
                    {spell.damageType && (
                      <Zap className="h-3 w-3 text-amber-400/80" />
                    )}
                  </div>
                  <p className="text-[11px] text-brand-muted">
                    {SCHOOL_LABELS[spell.school]} · {spell.castingTime} ·{" "}
                    {spell.range}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-brand-text/70">
                    {spell.description}
                  </p>
                </div>
                <SrdAttributionFooter
                  attribution={spell.attribution}
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
