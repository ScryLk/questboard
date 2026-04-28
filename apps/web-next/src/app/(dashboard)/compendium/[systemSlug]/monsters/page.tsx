"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Search, Skull } from "lucide-react";
import { getSystem, listMonsters } from "@/lib/srd";
import { addMonsterToSession } from "@/lib/srd/monster-to-token";
import { useHomebrewMonsters } from "@/lib/srd/homebrew-store";
import { useCampaignStore } from "@/lib/campaign-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";
import { HomebrewBadge } from "@/components/compendium/homebrew-badge";
import { HomebrewMonsterModal } from "@/components/compendium/homebrew-monster-modal";

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
  const srdMonsters = listMonsters(systemSlug);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const homebrewMonsters = useHomebrewMonsters(activeCampaignId);
  const isGM = useGameplayStore((s) => s.currentUserIsGM);

  const all = useMemo(
    () => [...homebrewMonsters, ...srdMonsters],
    [homebrewMonsters, srdMonsters],
  );
  const homebrewSlugs = useMemo(
    () => new Set(homebrewMonsters.map((m) => m.slug)),
    [homebrewMonsters],
  );

  const [search, setSearch] = useState("");
  const [crBucket, setCrBucket] = useState("all");
  const [creating, setCreating] = useState(false);

  const canCreateHomebrew = isGM && Boolean(activeCampaignId);

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

      <div className="flex items-start justify-between gap-3">
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
            {homebrewMonsters.length > 0 && (
              <span className="ml-1 text-purple-300">
                ({homebrewMonsters.length} homebrew)
              </span>
            )}
          </p>
        </div>
        {canCreateHomebrew && (
          <button
            onClick={() => setCreating(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo monstro homebrew
          </button>
        )}
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
            <div
              key={m.slug}
              className="group flex items-start gap-3 rounded-lg border border-brand-border bg-white/[0.02] p-3 transition-colors hover:border-brand-accent/40"
            >
              <Link
                href={`/compendium/${systemSlug}/monsters/${m.slug}`}
                className="flex min-w-0 flex-1 items-start gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-400">
                  <Skull className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-brand-text">
                      {m.name}
                    </p>
                    {homebrewSlugs.has(m.slug) && <HomebrewBadge />}
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
              </Link>
              {isGM && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addMonsterToSession(m);
                  }}
                  className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 text-[10px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
                  title="Adicionar à sessão"
                >
                  <Plus className="h-3 w-3" />
                  Sessão
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {creating && activeCampaignId && (
        <HomebrewMonsterModal
          campaignId={activeCampaignId}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
