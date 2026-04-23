"use client";

import { Swords } from "lucide-react";
import { Block } from "../block";

/**
 * Slot sistema-específico. No futuro, receberá componentes de ataques por
 * sistema de RPG (ver PR #4 D&D 5e e PR #6 CoC 7e do prompt "HUD + Ficha
 * Completa Multi-Sistema"). Hoje renderiza placeholder até haver backend +
 * campo `campaign.gameSystem`.
 */
export function AttacksBlock() {
  return (
    <Block id="attacks" icon={Swords} title="Ataques Rápidos" defaultOpen={false}>
      <div className="rounded-md border border-dashed border-brand-border bg-brand-primary/50 p-3 text-center">
        <p className="text-[11px] text-brand-muted">
          Ataques aparecem quando a campanha tiver sistema de RPG configurado.
        </p>
        <p className="mt-1 text-[9px] text-brand-muted/60">
          Disponível após suporte a D&amp;D 5e / CoC 7e.
        </p>
      </div>
    </Block>
  );
}
