"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Wand2 } from "lucide-react";
import { getSystem, listClasses } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

export default function ClassesPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();
  const classes = listClasses(systemSlug);

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
          <Wand2 className="h-3.5 w-3.5" />
          Classes
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Classes do {system.shortName}
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {classes.map((c) => (
          <article
            key={c.slug}
            className="rounded-xl border border-brand-border bg-white/[0.02] p-4"
          >
            <header className="mb-2">
              <h2 className="font-cinzel text-base font-semibold text-brand-text">
                {c.name}
              </h2>
              <p className="text-[10px] italic text-brand-muted">{c.nameEn}</p>
            </header>
            <div className="mb-2 flex flex-wrap gap-1.5 text-[10px]">
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-brand-muted">
                d{c.hitDie} HP
              </span>
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-brand-muted">
                Atrib: {c.primaryAbility.map((a) => a.toUpperCase()).join("/")}
              </span>
              {c.spellcastingAbility && (
                <span className="rounded bg-brand-accent/15 px-2 py-0.5 font-medium text-brand-accent">
                  Conjurador ({c.spellcastingAbility.toUpperCase()})
                </span>
              )}
            </div>
            {c.description && (
              <p className="text-sm text-brand-text/90">{c.description}</p>
            )}
            <p className="mt-2 text-[11px] text-brand-muted">
              <span className="font-semibold text-brand-text/80">
                Resistências:
              </span>{" "}
              {c.savingThrowProficiencies.map((s) => s.toUpperCase()).join(", ")}
            </p>
            <p className="text-[11px] text-brand-muted">
              <span className="font-semibold text-brand-text/80">
                Perícias:
              </span>{" "}
              escolha {c.skillChoiceCount} de {c.skillChoices.length}
            </p>
            <div className="mt-3">
              <SrdAttributionFooter attribution={c.attribution} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
