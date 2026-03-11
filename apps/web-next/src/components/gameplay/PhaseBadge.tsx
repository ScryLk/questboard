"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { usePhaseStore } from "@/stores/phaseStore";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { PHASE_META } from "@/constants/phaseTransitions";

export function PhaseBadge() {
  const current = usePhaseStore((s) => s.current);
  const openModal = usePhaseStore((s) => s.openModal);
  const getElapsedMinutes = usePhaseStore((s) => s.getElapsedMinutes);

  const [elapsed, setElapsed] = useState(getElapsedMinutes());

  useEffect(() => {
    setElapsed(getElapsedMinutes());
    const interval = setInterval(() => {
      setElapsed(getElapsedMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, [getElapsedMinutes]);

  const meta = PHASE_META[current.type];
  const Icon = meta.icon;
  const isCombat = current.type === "combat";

  return (
    <GameTooltip label="Fase Narrativa" description="Clique para trocar de fase" side="bottom">
      <button
        onClick={openModal}
        className={`flex items-center gap-1.5 rounded-lg border border-current/30 px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-current/60 ${meta.color} ${meta.bgColor}`}
      >
        {isCombat && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        )}
        <Icon className="h-3.5 w-3.5" />
        <span>{current.label}</span>
        <span className="opacity-50">·</span>
        <span className="tabular-nums opacity-70">{elapsed}min</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>
    </GameTooltip>
  );
}
