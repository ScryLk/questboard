"use client";

// Popover compartilhado por Aplicar dano, Aplicar cura, Ajustar HP, HP
// temporário e Editar iniciativa. Diferenças vão por props (título,
// preset values, apply label, allow negative, suffix).

import { useEffect, useRef, useState } from "react";
import { PopoverShell } from "./popover-shell";

interface Props {
  title: string;
  subtitle?: string;
  /** Sufixo após o input (ex: "HP", "rodadas"). */
  suffix?: string;
  /** Texto do botão primário. */
  applyLabel: string;
  /** Atalhos numéricos. Sinal preservado (ex: -5 para dano). */
  quickPresets?: number[];
  /** Valor inicial do input. */
  initialValue?: number;
  /** Permitir valores negativos no input. */
  allowNegative?: boolean;
  onApply: (value: number) => void;
  onClose: () => void;
}

export function NumberInputPopover({
  title,
  subtitle,
  suffix,
  applyLabel,
  quickPresets,
  initialValue = 0,
  allowNegative = false,
  onApply,
  onClose,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string>(
    initialValue !== 0 ? String(initialValue) : "",
  );

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return;
    onApply(parsed);
    onClose();
  };

  return (
    <PopoverShell title={title} subtitle={subtitle} onClose={onClose}>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (!allowNegative && v.startsWith("-")) return;
            setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(draft);
            }
          }}
          className="flex-1 rounded-md border border-brand-border bg-brand-surface-light px-3 py-2 text-sm text-brand-text outline-none ring-0 focus:border-brand-accent"
          placeholder="0"
          aria-label={title}
        />
        {suffix && (
          <span className="text-xs uppercase tracking-wider text-brand-muted">
            {suffix}
          </span>
        )}
      </div>

      {quickPresets && quickPresets.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-brand-muted">
            Atalhos rápidos
          </p>
          <div className="flex flex-wrap gap-1">
            {quickPresets.map((n) => (
              <button
                key={n}
                onClick={() => {
                  onApply(n);
                  onClose();
                }}
                className={`rounded-md px-2 py-1 text-[11px] font-bold tabular-nums transition-colors ${
                  n < 0
                    ? "bg-brand-danger/10 text-brand-danger hover:bg-brand-danger/20"
                    : "bg-brand-success/10 text-brand-success hover:bg-brand-success/20"
                }`}
              >
                {n > 0 ? `+${n}` : n}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-md border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={() => commit(draft)}
          className="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
        >
          {applyLabel}
        </button>
      </div>
    </PopoverShell>
  );
}
