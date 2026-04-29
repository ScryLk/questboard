"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Coins } from "lucide-react";
import { getSystem, listCosmicHorrorOccupations } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

export default function OccupationsPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();

  const occupations = listCosmicHorrorOccupations(systemSlug);
  if (occupations.length === 0) notFound();

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
          <Briefcase className="h-3.5 w-3.5" />
          Ocupações
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Ocupações de Investigador
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          {occupations.length} ocupação{occupations.length === 1 ? "" : "es"}{" "}
          disponíveis
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {occupations.map((o) => (
          <article
            key={o.slug}
            className="rounded-xl border border-brand-border bg-white/[0.02] p-4"
          >
            <header className="mb-2">
              <h2 className="font-cinzel text-base font-semibold text-brand-text">
                {o.name}
              </h2>
            </header>

            <p className="mb-3 text-sm text-brand-text/90">{o.description}</p>

            <div className="mb-3 grid gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-text/80">
                  Pontos de skill:
                </span>
                <span className="text-brand-muted">{o.skillPointsFormula}</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-3 w-3 text-amber-300" />
                <span className="font-semibold text-brand-text/80">
                  Status financeiro:
                </span>
                <span className="text-brand-muted">
                  {o.creditRating.min}–{o.creditRating.max}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-text/80">
                  Atributos chave:
                </span>{" "}
                <span className="text-brand-muted">
                  {o.recommendedAttributes.join(", ")}
                </span>
              </div>
            </div>

            <div className="mb-2 text-[11px]">
              <p className="mb-1 font-semibold text-brand-text/80">
                Skills da ocupação ({o.skills.length} fixas + {o.optionalSkillsCount}{" "}
                à escolha)
              </p>
              <div className="flex flex-wrap gap-1">
                {o.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] text-brand-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <SrdAttributionFooter attribution={o.attribution} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
