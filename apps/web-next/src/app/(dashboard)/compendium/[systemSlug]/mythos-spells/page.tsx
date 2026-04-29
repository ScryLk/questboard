"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Brain, Droplet, Heart, Sparkles } from "lucide-react";
import { getSystem, listCosmicHorrorMythosSpells } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

export default function MythosSpellsPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();

  const spells = listCosmicHorrorMythosSpells(systemSlug);
  if (spells.length === 0) notFound();

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
          Feitiços do Mythos
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Magia Cósmica
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          {spells.length} feitiço{spells.length === 1 ? "" : "s"} — todo poder cobra
          preço alto.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {spells.map((s) => (
          <article
            key={s.slug}
            className="rounded-xl border border-brand-border bg-white/[0.02] p-4"
          >
            <header className="mb-2">
              <h2 className="font-cinzel text-base font-semibold text-brand-text">
                {s.name}
              </h2>
              <p className="text-[11px] text-brand-muted">{s.castingTime}</p>
            </header>

            <div className="mb-3 flex flex-wrap gap-1.5 text-[10px]">
              <span className="flex items-center gap-1 rounded bg-blue-500/15 px-2 py-0.5 font-semibold text-blue-300">
                <Droplet className="h-2.5 w-2.5" />
                MP {s.mpCost}
              </span>
              <span className="flex items-center gap-1 rounded bg-purple-500/15 px-2 py-0.5 font-semibold text-purple-300">
                <Brain className="h-2.5 w-2.5" />
                SAN {s.sanityCost}
              </span>
              {s.hpCost && (
                <span className="flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 font-semibold text-rose-300">
                  <Heart className="h-2.5 w-2.5" />
                  HP {s.hpCost}
                </span>
              )}
            </div>

            <p className="text-sm text-brand-text/90">{s.description}</p>

            {s.requirements && s.requirements.length > 0 && (
              <div className="mt-2 text-[11px]">
                <span className="font-semibold text-brand-text/80">
                  Requisitos:
                </span>{" "}
                <span className="text-brand-muted">
                  {s.requirements.join("; ")}
                </span>
              </div>
            )}

            <p className="mt-2 text-[10px] italic text-brand-muted/70">
              {s.source}
            </p>

            <div className="mt-3">
              <SrdAttributionFooter attribution={s.attribution} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
