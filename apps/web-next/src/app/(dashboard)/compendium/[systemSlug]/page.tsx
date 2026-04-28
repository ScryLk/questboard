"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Search,
  Skull,
  Sparkles,
  Sword,
  Users,
  Wand2,
  AlertTriangle,
} from "lucide-react";
import { getSystem, getSystemCounts } from "@/lib/srd";
import {
  useHomebrewItems,
  useHomebrewMonsters,
  useHomebrewSpells,
} from "@/lib/srd/homebrew-store";
import { useCampaignStore } from "@/lib/campaign-store";

const SECTIONS = [
  { type: "spells", label: "Magias", icon: Sparkles, count: "spells" as const },
  { type: "monsters", label: "Monstros", icon: Skull, count: "monsters" as const },
  { type: "items", label: "Itens", icon: Sword, count: "items" as const },
  { type: "races", label: "Raças", icon: Users, count: "races" as const },
  { type: "classes", label: "Classes", icon: Wand2, count: "classes" as const },
  { type: "conditions", label: "Condições", icon: AlertTriangle, count: "conditions" as const },
];

export default function SystemOverviewPage({
  params,
}: {
  params: Promise<{ systemSlug: string }>;
}) {
  const { systemSlug } = use(params);
  const system = getSystem(systemSlug);
  if (!system) notFound();

  const baseCounts = getSystemCounts(systemSlug);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const homebrewSpells = useHomebrewSpells(activeCampaignId);
  const homebrewMonsters = useHomebrewMonsters(activeCampaignId);
  const homebrewItems = useHomebrewItems(activeCampaignId);

  // Soma SRD oficial + homebrew da campanha ativa pros badges.
  const counts = {
    ...baseCounts,
    spells: baseCounts.spells + homebrewSpells.length,
    monsters: baseCounts.monsters + homebrewMonsters.length,
    items: baseCounts.items + homebrewItems.length,
  };

  const homebrewCounts = {
    spells: homebrewSpells.length,
    monsters: homebrewMonsters.length,
    items: homebrewItems.length,
    races: 0,
    classes: 0,
    conditions: 0,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/compendium"
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Compêndio
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
            <BookOpen className="h-3.5 w-3.5" />
            Sistema
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-white">
            {system.name}
          </h1>
          <p className="mt-1 text-xs text-brand-muted">
            {system.publisher}
            {system.edition && ` · ${system.edition}`} ·{" "}
            {system.licenseType === "CC-BY-4.0" ? "CC-BY 4.0" : "Proprietário"}
          </p>
          <p className="mt-3 max-w-2xl text-sm text-brand-text/90">
            {system.description}
          </p>
        </div>
        {system.hasContent && (
          <Link
            href={`/compendium/${systemSlug}/search`}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-brand-border bg-white/[0.02] px-3 py-2 text-xs text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text sm:inline-flex"
          >
            <Search className="h-3.5 w-3.5" />
            Buscar tudo
          </Link>
        )}
      </div>

      {!system.hasContent && (
        <div className="rounded-md border border-brand-warning/30 bg-brand-warning/5 px-4 py-3 text-xs text-brand-warning">
          Esse sistema não tem SRD aberto. A estrutura está pronta, mas é
          preciso adicionar conteúdo homebrew na sua campanha.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ type, label, icon: Icon, count }) => {
          const total = counts[count];
          const hb = homebrewCounts[count];
          return (
            <Link
              key={type}
              href={`/compendium/${systemSlug}/${type}`}
              className="group flex items-center gap-3 rounded-xl border border-brand-border bg-white/[0.02] p-4 transition-colors hover:border-brand-accent/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-brand-text">{label}</p>
                <p className="text-[11px] text-brand-muted">
                  {total === 0 ? "Sem entradas" : `${total} entrada${total === 1 ? "" : "s"}`}
                  {hb > 0 && (
                    <span className="ml-1 text-purple-300">({hb} homebrew)</span>
                  )}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-brand-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>

      {system.licenseType === "CC-BY-4.0" && (
        <p className="text-[10px] text-brand-muted/70">
          Conteúdo do {system.shortName} licenciado CC-BY 4.0.{" "}
          <Link
            href="/legal/srd-attribution"
            className="text-brand-accent hover:underline"
          >
            Atribuição completa
          </Link>
        </p>
      )}
    </div>
  );
}
