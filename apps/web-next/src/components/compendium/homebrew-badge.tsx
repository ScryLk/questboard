"use client";

import { Sparkles } from "lucide-react";

interface Props {
  className?: string;
}

/** Badge "Homebrew" que aparece em cards/cards de detalhe de conteúdo
 *  customizado pela campanha. Diferencia visualmente de SRD oficial. */
export function HomebrewBadge({ className }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-purple-300 ${className ?? ""}`}
      title="Conteúdo customizado da campanha (homebrew)"
    >
      <Sparkles className="h-2.5 w-2.5" />
      Homebrew
    </span>
  );
}
