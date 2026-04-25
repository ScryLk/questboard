"use client";

// Editar duração de condição já ativa. Mesmo radio do AddConditionPopover.

import { useEffect, useRef, useState } from "react";
import {
  COMBAT_CONDITIONS,
  type CombatConditionId,
} from "@questboard/constants";
import { PopoverShell } from "./popover-shell";

interface Props {
  conditionId: CombatConditionId;
  customLabel?: string;
  currentDurationRounds: number | null;
  onApply: (durationRounds: number | null) => void;
  onClose: () => void;
}

export function EditConditionPopover({
  conditionId,
  customLabel,
  currentDurationRounds,
  onApply,
  onClose,
}: Props) {
  const meta = COMBAT_CONDITIONS[conditionId];
  const display = customLabel ?? meta.label;

  const [mode, setMode] = useState<"infinite" | "rounds">(
    currentDurationRounds === null ? "infinite" : "rounds",
  );
  const [rounds, setRounds] = useState<string>(
    String(currentDurationRounds ?? 3),
  );
  const roundsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "rounds") roundsRef.current?.focus();
  }, [mode]);

  const commit = () => {
    let durationRounds: number | null = null;
    if (mode === "rounds") {
      const n = parseInt(rounds, 10);
      if (!Number.isFinite(n) || n <= 0) return;
      durationRounds = n;
    }
    onApply(durationRounds);
    onClose();
  };

  return (
    <PopoverShell title={`Editar: ${display}`} onClose={onClose}>
      <p className="mb-1.5 text-[10px] uppercase tracking-wider text-brand-muted">
        Duração
      </p>
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="duration"
            checked={mode === "infinite"}
            onChange={() => setMode("infinite")}
            className="accent-brand-accent"
          />
          <span className="text-xs text-brand-text">Até remover</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="duration"
            checked={mode === "rounds"}
            onChange={() => setMode("rounds")}
            className="accent-brand-accent"
          />
          <input
            ref={roundsRef}
            type="number"
            inputMode="numeric"
            min={1}
            value={rounds}
            onFocus={() => setMode("rounds")}
            onChange={(e) => setRounds(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            className="w-16 rounded border border-brand-border bg-brand-surface-light px-2 py-1 text-right text-xs tabular-nums text-brand-text outline-none focus:border-brand-accent"
            aria-label="Rodadas"
          />
          <span className="text-xs text-brand-text">rodadas</span>
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={commit}
          className="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
        >
          Salvar
        </button>
      </div>
    </PopoverShell>
  );
}
