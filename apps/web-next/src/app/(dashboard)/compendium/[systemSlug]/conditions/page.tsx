"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { getSystem, listConditions } from "@/lib/srd";
import { SrdAttributionFooter } from "@/components/compendium/srd-attribution-footer";

export default function ConditionsPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();
  const conditions = listConditions(systemSlug);

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
          <AlertTriangle className="h-3.5 w-3.5" />
          Condições
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-white">
          Condições do {system.shortName}
        </h1>
        <p className="mt-1 text-xs text-brand-muted">
          {conditions.length} condições padrão
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {conditions.map((c) => (
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
            <p className="text-sm leading-relaxed text-brand-text/90">
              {c.description}
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
