"use client";

// Submenu de condições. Aberto à direita por hover de "Condições ▸".
// Lista catálogo (clique → AddConditionPopover) + ativas com remover/editar.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";
import {
  COMBAT_CONDITIONS,
  COMBAT_CONDITION_IDS,
  type CombatConditionId,
} from "@questboard/constants";
import type { CombatCondition } from "@questboard/types";

interface Props {
  /** Condições já aplicadas no participante. */
  active: CombatCondition[];
  onAdd: (id: CombatConditionId) => void;
  onEdit: (id: CombatConditionId) => void;
  onRemove: (id: CombatConditionId) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ConditionSubmenu({
  active,
  onAdd,
  onEdit,
  onRemove,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Altura clampada ao espaço disponível abaixo do top do submenu —
  // evita corte invisível atrás do viewport quando "Condições" está
  // baixo na lista do menu pai.
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  // Foca o primeiro item ao abrir.
  useEffect(() => {
    const first = ref.current?.querySelector<HTMLButtonElement>("button");
    first?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    function recompute() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const padding = 16;
      const available = window.innerHeight - rect.top - padding;
      // Mínimo de 160px pra sempre aparecer algo, mesmo perto da borda.
      setMaxHeight(Math.max(160, available));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  const activeIds = new Set(active.map((c) => c.conditionId));

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Condições"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="w-56 overflow-y-auto rounded-md border border-brand-border bg-brand-surface py-1 shadow-2xl"
      style={{ maxHeight }}
    >
      <div className="px-2 pt-1 text-[9px] font-bold uppercase tracking-wider text-brand-muted">
        Adicionar
      </div>
      {COMBAT_CONDITION_IDS.map((id) => {
        const meta = COMBAT_CONDITIONS[id];
        const isActive = activeIds.has(id);
        if (isActive && id !== "custom") return null;
        return (
          <button
            key={id}
            onClick={() => onAdd(id)}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-brand-text transition-colors hover:bg-white/5"
          >
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
              style={{
                backgroundColor: meta.color + "30",
                color: meta.color,
              }}
              aria-hidden
            >
              {meta.label[0]}
            </span>
            <span className="flex-1 truncate">{meta.label}</span>
            <span className="text-[9px] tabular-nums text-brand-muted">
              {meta.defaultDurationRounds === null
                ? "∞"
                : `${meta.defaultDurationRounds}r`}
            </span>
          </button>
        );
      })}

      {active.length > 0 && (
        <>
          <div className="mt-1 border-t border-brand-border/50" />
          <div className="px-2 pt-1 text-[9px] font-bold uppercase tracking-wider text-brand-muted">
            Ativas
          </div>
          {active.map((c) => {
            const meta = COMBAT_CONDITIONS[c.conditionId];
            const display = c.customLabel ?? meta.label;
            return (
              <div
                key={c.conditionId}
                className="flex items-center gap-1 px-2 py-1 text-xs"
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{
                    backgroundColor: meta.color + "30",
                    color: meta.color,
                  }}
                  aria-hidden
                >
                  {meta.label[0]}
                </span>
                <span className="flex-1 truncate text-brand-text">
                  {display}
                </span>
                <span className="text-[9px] tabular-nums text-brand-muted">
                  {c.durationRounds === null ? "∞" : `${c.durationRounds}r`}
                </span>
                <button
                  onClick={() => onEdit(c.conditionId)}
                  className="flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
                  aria-label={`Editar ${display}`}
                  title="Editar duração"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onRemove(c.conditionId)}
                  className="flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-brand-danger/10 hover:text-brand-danger"
                  aria-label={`Remover ${display}`}
                  title="Remover condição"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
