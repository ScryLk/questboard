"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { getSystem, listRaces } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

const ABILITY_LABEL: Record<string, string> = {
  str: "Força",
  dex: "Destreza",
  con: "Constituição",
  int: "Inteligência",
  wis: "Sabedoria",
  cha: "Carisma",
};

export default function RacesPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();
  const races = listRaces(systemSlug);

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
          <Users className="h-3.5 w-3.5" />
          Raças
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Raças do {system.shortName}
        </h1>
      </div>

      <div className="space-y-3">
        {races.map((race) => (
          <article
            key={race.slug}
            className="rounded-xl border border-brand-border bg-white/[0.02] p-5"
          >
            <header className="mb-3">
              <h2 className="font-cinzel text-lg font-semibold text-brand-text">
                {race.name}
              </h2>
              <p className="text-xs italic text-brand-muted">{race.nameEn}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                <span className="rounded bg-white/[0.06] px-2 py-0.5 text-brand-muted">
                  {race.size === "small" ? "Pequeno" : "Médio"}
                </span>
                <span className="rounded bg-white/[0.06] px-2 py-0.5 text-brand-muted">
                  Velocidade {race.speed}m
                </span>
                {Object.entries(race.abilityBonuses).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded bg-brand-accent/15 px-2 py-0.5 font-medium text-brand-accent"
                  >
                    {ABILITY_LABEL[k]} +{v}
                  </span>
                ))}
              </div>
            </header>
            {race.description && (
              <p className="mb-3 text-sm text-brand-text/90">
                {race.description}
              </p>
            )}
            <div className="space-y-2">
              {race.traits.map((t) => (
                <div key={t.name}>
                  <p className="text-xs font-semibold text-brand-text">
                    {t.name}
                  </p>
                  <p className="text-xs leading-relaxed text-brand-muted">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <SrdAttributionFooter attribution={race.attribution} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
