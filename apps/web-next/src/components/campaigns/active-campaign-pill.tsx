"use client";

// Pílula no header com a campanha ativa do usuário. Click → abre quick
// modal pra ver dados / trocar / abrir overview. Quando não há ativa,
// mostra CTA discreto "Selecionar campanha".

import Link from "next/link";
import { Castle, ChevronDown, Star } from "lucide-react";
import { useCampaignStore } from "@/lib/campaign-store";
import { useCampaignModalsStore } from "@/lib/campaign-modals-store";

export function ActiveCampaignPill() {
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const campaigns = useCampaignStore((s) => s.campaigns);
  const openPreview = useCampaignModalsStore((s) => s.openPreview);

  const active = activeCampaignId
    ? campaigns.find((c) => c.id === activeCampaignId) ?? null
    : null;

  if (!active) {
    return (
      <Link
        href="/campaigns"
        className="hidden items-center gap-2 rounded-md border border-dashed border-brand-border px-3 py-1.5 text-xs text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text md:flex"
        title="Nenhuma campanha ativa — selecionar uma"
      >
        <Star className="h-3.5 w-3.5" />
        <span>Selecionar campanha</span>
      </Link>
    );
  }

  return (
    <button
      onClick={() => openPreview(active.id)}
      className="flex items-center gap-2 rounded-md border border-brand-gold/30 bg-brand-gold/5 px-3 py-1.5 text-xs text-brand-text transition-colors hover:bg-brand-gold/10"
      title={`Campanha ativa: ${active.name}`}
    >
      <Castle className="h-3.5 w-3.5 text-brand-gold" />
      <span className="hidden max-w-[180px] truncate font-medium md:inline">
        {active.name}
      </span>
      <ChevronDown className="h-3 w-3 text-brand-muted" />
    </button>
  );
}
