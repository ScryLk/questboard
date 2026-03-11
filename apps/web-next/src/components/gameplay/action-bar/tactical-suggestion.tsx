"use client";

import { Brain, MapPin, Swords, X } from "lucide-react";
import type { TacticalResponse } from "@/lib/ai-types";

interface TacticalSuggestionProps {
  suggestion: TacticalResponse;
  onDismiss: () => void;
}

export function TacticalSuggestion({ suggestion, onDismiss }: TacticalSuggestionProps) {
  return (
    <div className="mb-2 w-80 rounded-xl border border-brand-accent/30 bg-[#111116]/95 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-brand-accent" />
          <span className="text-xs font-medium text-brand-text">
            Sugestao Tatica
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-brand-muted transition-colors hover:text-brand-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2 px-3 py-2.5">
        {/* Action */}
        <div className="flex items-start gap-2">
          <Swords className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
          <div>
            <div className="text-[10px] font-medium uppercase text-brand-muted">Acao</div>
            <div className="text-xs text-brand-text">{suggestion.action}</div>
          </div>
        </div>

        {/* Target */}
        {suggestion.target && (
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full border border-red-400" />
            <div>
              <div className="text-[10px] font-medium uppercase text-brand-muted">Alvo</div>
              <div className="text-xs text-brand-text">{suggestion.target}</div>
            </div>
          </div>
        )}

        {/* Movement */}
        {suggestion.movement && (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
            <div>
              <div className="text-[10px] font-medium uppercase text-brand-muted">Movimento</div>
              <div className="text-xs text-brand-text">
                Mover para ({suggestion.movement.x}, {suggestion.movement.y})
              </div>
            </div>
          </div>
        )}

        {/* Secondary action */}
        {suggestion.secondaryAction && (
          <div className="flex items-start gap-2">
            <Swords className="mt-0.5 h-3 w-3 shrink-0 text-yellow-400" />
            <div>
              <div className="text-[10px] font-medium uppercase text-brand-muted">Bonus</div>
              <div className="text-xs text-brand-text">{suggestion.secondaryAction}</div>
            </div>
          </div>
        )}

        {/* Reasoning */}
        <div className="rounded-lg bg-white/[0.03] px-2.5 py-2">
          <div className="text-[10px] text-brand-muted italic">
            {suggestion.reasoning}
          </div>
        </div>
      </div>

      {/* Dismiss */}
      <div className="border-t border-brand-border px-3 py-2">
        <button
          onClick={onDismiss}
          className="w-full rounded-lg bg-white/[0.05] py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/[0.08]"
        >
          Dispensar
        </button>
      </div>
    </div>
  );
}
