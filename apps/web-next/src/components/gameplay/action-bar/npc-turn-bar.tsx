"use client";

import { Brain, Flag, Footprints, Loader2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useTacticalAI } from "@/hooks/use-tactical-ai";
import { TacticalSuggestion } from "./tactical-suggestion";
import type { GameToken, CombatState } from "@/lib/gameplay-mock-data";

interface NPCTurnBarProps {
  token: GameToken;
  combat: CombatState;
}

export function NPCTurnBar({ token, combat }: NPCTurnBarProps) {
  const nextTurn = useGameplayStore((s) => s.nextTurn);
  const { suggest, isLoading, suggestion, error, dismiss } = useTacticalAI();

  function handleSuggest() {
    suggest(token, combat.round);
  }

  function handleEndTurn() {
    dismiss();
    nextTurn();
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2">
      {/* Tactical suggestion */}
      {suggestion && (
        <TacticalSuggestion suggestion={suggestion} onDismiss={dismiss} />
      )}

      {/* Error */}
      {error && (
        <div className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Main bar */}
      <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-[#111116]/95 px-4 py-2.5 shadow-2xl backdrop-blur-sm">
        {/* NPC info */}
        <div className="flex items-center gap-2 border-r border-brand-border pr-3">
          <span className="text-xs font-bold text-red-400">{token.name}</span>
          <span className="text-[10px] tabular-nums text-brand-muted">
            HP {token.hp}/{token.maxHp}
          </span>
          <span className="text-[10px] text-brand-muted">R{combat.round}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Tactical AI */}
          <button
            onClick={handleSuggest}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg bg-brand-accent/20 px-2.5 py-1.5 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/30 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Brain className="h-3 w-3" />
            )}
            Sugestao IA
          </button>

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-brand-border" />

          {/* End Turn */}
          <button
            onClick={handleEndTurn}
            className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:bg-white/[0.08]"
          >
            <Flag className="h-3 w-3" />
            Proximo Turno
          </button>
        </div>
      </div>
    </div>
  );
}
