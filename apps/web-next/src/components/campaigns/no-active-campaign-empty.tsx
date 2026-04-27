"use client";

// Empty state genérico pra páginas que filtram por campanha ativa.
// Usado quando `activeCampaignId === null`. Convida o usuário a escolher
// uma campanha pra começar.
//
// Uso:
//   const activeId = useCampaignStore(s => s.activeCampaignId);
//   if (!activeId) return <NoActiveCampaignEmpty entityLabel="personagens" />;

import Link from "next/link";
import { Castle, Star } from "lucide-react";

interface Props {
  /** Nome da entidade no plural lowercase (ex: "personagens", "mapas"). */
  entityLabel: string;
}

export function NoActiveCampaignEmpty({ entityLabel }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-brand-border bg-brand-surface/40 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent/10">
        <Castle className="h-7 w-7 text-brand-accent" />
      </div>
      <div>
        <h2 className="font-cinzel text-base font-semibold text-brand-text">
          Nenhuma campanha ativa
        </h2>
        <p className="mt-1 max-w-sm text-xs text-brand-muted">
          Selecione uma campanha pra ver os {entityLabel} dela. Você pode
          alternar a qualquer momento clicando no nome no header.
        </p>
      </div>
      <Link
        href="/campaigns"
        className="flex items-center gap-1.5 rounded-md bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
      >
        <Star className="h-3.5 w-3.5" />
        Escolher campanha
      </Link>
    </div>
  );
}
