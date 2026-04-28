"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, Globe, Lock } from "lucide-react";
import { SRD_SYSTEMS, getSystemCounts } from "@/lib/srd";

export default function CompendiumLandingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
            <BookOpen className="h-3.5 w-3.5" />
            Compêndio
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-white">
            Sistemas e regras
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Pesquise magias, monstros, itens e regras dos sistemas suportados.
            D&amp;D 5e SRD está aberto sob CC-BY 4.0; outros sistemas aceitam
            conteúdo homebrew.
          </p>
        </div>
        <Link
          href="/legal/srd-attribution"
          className="hidden items-center gap-1 rounded-md border border-brand-border px-3 py-1.5 text-[11px] text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text sm:inline-flex"
        >
          Atribuição CC-BY
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {SRD_SYSTEMS.map((sys) => {
          const counts = getSystemCounts(sys.slug);
          const total =
            counts.spells +
            counts.monsters +
            counts.items +
            counts.races +
            counts.classes +
            counts.conditions;

          return (
            <Link
              key={sys.slug}
              href={`/compendium/${sys.slug}`}
              className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                sys.hasContent
                  ? "border-brand-border bg-white/[0.02] hover:border-brand-accent/40"
                  : "border-brand-border/40 bg-white/[0.01] hover:border-brand-border"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${
                  sys.hasContent
                    ? "bg-brand-accent/15 text-brand-accent"
                    : "bg-white/[0.04] text-brand-muted"
                }`}
              >
                {sys.shortName.slice(0, 3).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="truncate font-cinzel text-base font-semibold text-brand-text">
                    {sys.name}
                  </h2>
                  {sys.licenseType === "CC-BY-4.0" ? (
                    <Globe className="h-3 w-3 text-brand-success" />
                  ) : (
                    <Lock className="h-3 w-3 text-brand-muted/60" />
                  )}
                </div>
                <p className="mt-1 text-[11px] text-brand-muted/80">
                  {sys.publisher}
                  {sys.edition && ` · ${sys.edition}`}
                  {" · "}
                  {sys.licenseType === "CC-BY-4.0" ? "CC-BY 4.0" : "Proprietário"}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-brand-muted">
                  {sys.description}
                </p>
                {sys.hasContent ? (
                  <p className="mt-2 text-[10px] text-brand-accent/80">
                    {total} entradas no compêndio
                  </p>
                ) : (
                  <p className="mt-2 text-[10px] text-brand-muted/60">
                    Apenas estrutura. Adicione homebrew na campanha.
                  </p>
                )}
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-brand-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
