"use client";

// Card mostrado pra PLAYER que ainda não criou personagem na campanha.

import Link from "next/link";
import { UserPlus } from "lucide-react";

interface Props {
  campaignId: string;
}

export function NoCharacterCard({ campaignId }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface/50 p-5 text-center">
      <UserPlus className="mx-auto mb-2 h-8 w-8 text-brand-muted" />
      <p className="text-sm font-medium text-brand-text">
        Você ainda não tem um personagem nesta campanha.
      </p>
      <p className="mt-1 text-xs text-brand-muted">
        Crie um personagem pra ganhar XP e desbloquear títulos.
      </p>
      <Link
        href={`/campaigns/${campaignId}/characters/new`}
        className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-lg bg-brand-accent/10 px-3 py-1.5 text-sm text-brand-accent hover:bg-brand-accent/20"
      >
        Criar personagem
      </Link>
    </div>
  );
}
