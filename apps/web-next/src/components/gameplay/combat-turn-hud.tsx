"use client";

// HUD flutuante no topo do canvas que mostra o estado do combate.
// Idle: botão "Iniciar combate" abre o modal de iniciativa.
// Ativo: avatar do combatente atual + nome + round + Próximo / Encerrar.
//
// Vive em map-overlays (canvas), pointer-events-auto pra os botões
// funcionarem mesmo com a camada acima (overflow:hidden no container).

import { Flag, Play, SkipForward, Swords, X } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { getAlignmentColor } from "@/lib/gameplay-mock-data";
import { GameTooltip } from "@/components/ui/game-tooltip";

export function CombatTurnHUD() {
  const combat = useGameplayStore((s) => s.combat);
  const tokens = useGameplayStore((s) => s.tokens);
  const nextTurn = useGameplayStore((s) => s.nextTurn);
  const prevTurn = useGameplayStore((s) => s.prevTurn);
  const endCombat = useGameplayStore((s) => s.endCombat);
  const openModal = useGameplayStore((s) => s.openModal);

  if (!combat.active) {
    return (
      <div className="pointer-events-auto">
        <button
          onClick={() => openModal("startCombat")}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111116]/90 px-3 py-1.5 text-xs text-brand-text backdrop-blur-sm transition-colors hover:border-brand-accent/40 hover:bg-[#111116]"
        >
          <Play className="h-3.5 w-3.5 text-brand-accent" />
          Iniciar combate
        </button>
      </div>
    );
  }

  const current = combat.order[combat.turnIndex];
  const currentToken = current
    ? tokens.find((t) => t.id === current.tokenId)
    : null;

  // Próximo na ordem (pula mortos) só pra mostrar dica visual.
  const upcoming = (() => {
    if (!combat.order.length) return null;
    let i = (combat.turnIndex + 1) % combat.order.length;
    let safety = combat.order.length;
    while (combat.order[i]?.status === "dead" && safety-- > 0) {
      i = (i + 1) % combat.order.length;
    }
    const c = combat.order[i];
    if (!c) return null;
    return tokens.find((t) => t.id === c.tokenId) ?? null;
  })();

  const color = currentToken
    ? getAlignmentColor(currentToken.alignment)
    : "#6C5CE7";
  const initials = currentToken?.name.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-brand-border bg-[#111116]/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
      <Swords className="ml-1 h-3.5 w-3.5 shrink-0 text-brand-accent" />

      {/* Avatar + nome do turno atual */}
      <div className="flex items-center gap-1.5 border-r border-brand-border pr-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
          style={{
            backgroundColor: color + "25",
            color,
            border: `1.5px solid ${color}`,
          }}
        >
          {initials}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold text-brand-text">
            {currentToken?.name ?? "—"}
          </span>
          <span className="text-[9px] text-brand-muted">
            Round {combat.round}
          </span>
        </div>
      </div>

      {/* Próximo na ordem (preview) */}
      {upcoming && (
        <div className="hidden items-center gap-1 border-r border-brand-border pr-2 sm:flex">
          <span className="text-[9px] uppercase tracking-wider text-brand-muted">
            próx.
          </span>
          <span className="max-w-[80px] truncate text-[10px] text-brand-text/80">
            {upcoming.name}
          </span>
        </div>
      )}

      {/* Voltar turno (atalho — útil quando GM passa por engano) */}
      <GameTooltip label="Turno anterior" side="bottom">
        <button
          onClick={prevTurn}
          className="flex h-6 w-6 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          <SkipForward className="h-3 w-3 -scale-x-100" />
        </button>
      </GameTooltip>

      {/* Próximo turno */}
      <button
        onClick={nextTurn}
        className="flex items-center gap-1 rounded-full bg-brand-accent/20 px-2.5 py-1 text-[11px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/30"
      >
        <SkipForward className="h-3 w-3" />
        Próximo
      </button>

      {/* Encerrar combate */}
      <GameTooltip label="Encerrar combate" side="bottom">
        <button
          onClick={endCombat}
          className="flex h-6 w-6 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-red-500/20 hover:text-red-400"
        >
          <Flag className="h-3 w-3" />
        </button>
      </GameTooltip>
    </div>
  );
}
