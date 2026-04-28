"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Search, Skull } from "lucide-react";
import { getSystem, listMonsters } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

const CR_BUCKETS: Array<{ value: string; label: string; min: number; max: number }> = [
  { value: "all", label: "Todos", min: 0, max: 99 },
  { value: "low", label: "ND 0-1", min: 0, max: 1 },
  { value: "mid", label: "ND 2-5", min: 2, max: 5 },
  { value: "high", label: "ND 6-10", min: 6, max: 10 },
  { value: "epic", label: "ND 11+", min: 11, max: 99 },
];

const SIZE_LABELS: Record<string, string> = {
  tiny: "Minúsculo",
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  huge: "Enorme",
  gargantuan: "Colossal",
};

function formatCr(cr: number): string {
  if (cr === 0.125) return "1/8";
  if (cr === 0.25) return "1/4";
  if (cr === 0.5) return "1/2";
  return String(cr);
}

export default function MonstersListPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();
  const all = listMonsters(systemSlug);

  const [search, setSearch] = useState("");
  const [crBucket, setCrBucket] = useState("all");

  const filtered = useMemo(() => {
    const bucket = CR_BUCKETS.find((b) => b.value === crBucket)!;
    return all.filter((m) => {
      if (m.challengeRating < bucket.min || m.challengeRating > bucket.max)
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.nameEn.toLowerCase().includes(q) &&
          !m.type.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [all, search, crBucket]);

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
          <Skull className="h-3.5 w-3.5" />
          Monstros
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Monstros do {system.shortName}
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          {filtered.length} de {all.length} monstros
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou tipo..."
            className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent focus:outline-none"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-brand-border p-0.5">
          {CR_BUCKETS.map((b) => (
            <button
              key={b.value}
              onClick={() => setCrBucket(b.value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                crBucket === b.value
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-brand-border text-sm text-brand-muted">
          Nenhum monstro com esses filtros.
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((m) => (
            <Link
              key={m.slug}
              href={`/compendium/${systemSlug}/monsters/${m.slug}`}
              className="group flex items-start gap-3 rounded-lg border border-brand-border bg-white/[0.02] p-3 transition-colors hover:border-brand-accent/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-400">
                <Skull className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-brand-text">
                    {m.name}
                  </p>
                  <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-brand-text">
                    ND {formatCr(m.challengeRating)}
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted">
                  {SIZE_LABELS[m.size]} {m.type} · {m.alignment}
                </p>
                <p className="mt-0.5 text-[11px] text-brand-text/70">
                  CA {m.armorClass} · HP {m.hitPoints} ({m.hitDice}) · Vel {m.speed.walk}m
                </p>
              </div>
              <SrdAttributionFooter
                attribution={m.attribution}
                className="self-end"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
