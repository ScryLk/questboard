"use client";

import { useState, useEffect } from "react";
import { usePhaseStore } from "@/stores/phaseStore";
import { PHASE_META } from "@/constants/phaseTransitions";

export function PhaseSelector() {
  const current = usePhaseStore((s) => s.current);
  const getSuggestions = usePhaseStore((s) => s.getSuggestions);
  const getElapsedMinutes = usePhaseStore((s) => s.getElapsedMinutes);
  const transitionTo = usePhaseStore((s) => s.transitionTo);

  const [elapsed, setElapsed] = useState(getElapsedMinutes());

  useEffect(() => {
    setElapsed(getElapsedMinutes());
    const id = setInterval(() => setElapsed(getElapsedMinutes()), 60_000);
    return () => clearInterval(id);
  }, [getElapsedMinutes]);

  const meta = PHASE_META[current.type];
  const Icon = meta.icon;
  const suggestions = getSuggestions();

  return (
    <div className="space-y-2 p-3">
      <span className="text-xs font-medium text-brand-text">Fase Atual</span>

      {/* Current phase */}
      <div
        className={`flex items-center gap-2 rounded-lg border border-current/20 px-3 py-2 ${meta.color} ${meta.bgColor}`}
      >
        <Icon className="h-4 w-4" />
        <div className="flex flex-col">
          <span className="text-xs font-medium">{current.label}</span>
          <span className="text-[10px] opacity-60">
            {elapsed}min decorridos
          </span>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] text-brand-muted">Transicionar para:</span>
          <div className="flex gap-1.5">
            {suggestions.map((phaseType) => {
              const s = PHASE_META[phaseType];
              const SIcon = s.icon;
              return (
                <button
                  key={phaseType}
                  onClick={() => transitionTo(phaseType)}
                  className={`flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-[11px] transition-colors hover:border-current/30 ${s.color} ${s.bgColor}`}
                >
                  <SIcon className="h-3 w-3" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
