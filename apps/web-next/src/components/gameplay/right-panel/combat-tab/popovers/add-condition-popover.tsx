"use client";

// Popover de adicionar condição. Mostra a metadata + radio "Até remover"
// vs "N rodadas". CUSTOM mostra input de rótulo adicional.

import { useEffect, useRef, useState } from "react";
import {
  COMBAT_CONDITIONS,
  type CombatConditionId,
} from "@questboard/constants";
import { PopoverShell } from "./popover-shell";

interface Props {
  conditionId: CombatConditionId;
  onApply: (input: {
    durationRounds: number | null;
    customLabel?: string;
  }) => void;
  onClose: () => void;
}

export function AddConditionPopover({
  conditionId,
  onApply,
  onClose,
}: Props) {
  const meta = COMBAT_CONDITIONS[conditionId];
  const isCustom = conditionId === "custom";

  const [mode, setMode] = useState<"infinite" | "rounds">(
    meta.defaultDurationRounds === null ? "infinite" : "rounds",
  );
  const [rounds, setRounds] = useState<string>(
    String(meta.defaultDurationRounds ?? 3),
  );
  const [customLabel, setCustomLabel] = useState<string>("");
  const labelRef = useRef<HTMLInputElement>(null);
  const roundsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCustom) labelRef.current?.focus();
    else if (mode === "rounds") roundsRef.current?.focus();
  }, [isCustom, mode]);

  const commit = () => {
    if (isCustom && customLabel.trim().length === 0) return;
    let durationRounds: number | null = null;
    if (mode === "rounds") {
      const n = parseInt(rounds, 10);
      if (!Number.isFinite(n) || n <= 0) return;
      durationRounds = n;
    }
    onApply({
      durationRounds,
      customLabel: isCustom ? customLabel.trim() : undefined,
    });
    onClose();
  };

  return (
    <PopoverShell
      title={`Adicionar: ${meta.label}`}
      subtitle={meta.description}
      onClose={onClose}
    >
      {isCustom && (
        <div className="mb-3">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-brand-muted">
            Rótulo
          </label>
          <input
            ref={labelRef}
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            maxLength={40}
            className="w-full rounded-md border border-brand-border bg-brand-surface-light px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-accent"
            placeholder="Ex: Marcado pelo arqueiro"
            aria-label="Rótulo da condição"
          />
        </div>
      )}

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
          disabled={isCustom && customLabel.trim().length === 0}
          className="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </PopoverShell>
  );
}
