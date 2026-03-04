"use client";

import { Star, Clock, User } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";

export function TurnBanner() {
  const combat = usePlayerViewStore((s) => s.combat);
  const isMyTurn = usePlayerViewStore((s) => s.isMyTurn);
  const movementUsedFt = usePlayerViewStore((s) => s.movementUsedFt);
  const movementMaxFt = usePlayerViewStore((s) => s.movementMaxFt);

  if (!combat?.active) return null;

  if (isMyTurn) {
    return (
      <div
        className="relative z-20 flex items-center gap-3 border-b border-brand-accent/30 px-4 py-2"
        style={{
          flexShrink: 0,
          background: "linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(108,92,231,0.05) 100%)",
        }}
      >
        {/* Accent glow line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent" />

        <Star className="h-5 w-5 text-brand-accent" />
        <span className="text-sm font-bold text-brand-accent">
          SEU TURNO!
        </span>

        <div className="mx-2 h-4 w-px bg-brand-border" />

        <span className="text-xs text-brand-muted">
          Movimento:{" "}
          <span className="font-bold tabular-nums text-brand-text">
            {movementUsedFt}/{movementMaxFt}ft
          </span>
        </span>

        <span className="text-xs text-brand-muted">
          Acao:{" "}
          <span className="font-medium text-brand-success">Disponivel</span>
        </span>

        <span className="ml-auto text-xs text-brand-muted">
          Rodada {combat.round}
        </span>
      </div>
    );
  }

  // Not my turn
  const isEnemyTurn = combat.participants.find(
    (p) => p.tokenId === combat.currentTurnTokenId,
  )?.type === "hostile";

  return (
    <div
      className="z-20 flex items-center gap-3 border-b border-brand-border px-4 py-1.5"
      style={{
        flexShrink: 0,
        background: isEnemyTurn
          ? "rgba(255, 68, 68, 0.05)"
          : "rgba(255,255,255,0.02)",
      }}
    >
      {isEnemyTurn ? (
        <Clock className="h-4 w-4 text-brand-danger/60" />
      ) : (
        <User className="h-4 w-4 text-brand-muted" />
      )}
      <span className="text-xs text-brand-muted">
        Turno de:{" "}
        <span
          className={`font-semibold ${
            isEnemyTurn ? "text-brand-danger" : "text-brand-text"
          }`}
        >
          {combat.currentTurnName}
        </span>
      </span>
      <span className="ml-auto text-[11px] text-brand-muted">
        Rodada {combat.round}
      </span>
    </div>
  );
}
