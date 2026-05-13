"use client";

// Card que substitui o CharacterXpCard quando o viewer é GM ou CO_GM.
// Mostra stats de gestão: sessões conduzidas, NPCs criados, mapas em
// uso. CTA pra abrir o painel admin.

import Link from "next/link";
import { Crown, Map, ScrollText, Users2 } from "lucide-react";
import type { DashboardDto } from "@questboard/validators";

interface Props {
  stats: NonNullable<DashboardDto["gmPanel"]>;
  campaignId: string;
}

export function GmPanelCard({ stats, campaignId }: Props) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <Crown className="h-5 w-5 text-brand-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
          Painel do Mestre
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatBlock
          icon={ScrollText}
          label="Sessões conduzidas"
          value={stats.sessionsHosted}
        />
        <StatBlock
          icon={Users2}
          label="NPCs criados"
          value={stats.npcsCreated}
        />
        <StatBlock icon={Map} label="Mapas em uso" value={stats.mapsUsed} />
      </div>

      <Link
        href={`/campaigns/${campaignId}`}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-accent hover:underline"
      >
        Abrir gerenciamento da campanha →
      </Link>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <Icon className="mb-2 h-4 w-4 text-brand-muted" />
      <p className="text-xl font-bold text-brand-text">{value}</p>
      <p className="mt-0.5 text-[11px] text-brand-muted">{label}</p>
    </div>
  );
}
