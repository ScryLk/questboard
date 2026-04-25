"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { COMBAT_CONDITIONS, COMBAT_CONDITION_IDS } from "@questboard/constants";
import type { CombatConditionId, CombatCondition } from "@questboard/types";

interface Props {
  active: CombatCondition[];
  onToggle: (conditionId: CombatConditionId) => void;
}

/** Popover com a grade das 15 conditions (+ custom).
 *  Click alterna entre aplicar/remover. */
export function ConditionPopover({ active, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeIds = new Set(active.map((c) => c.conditionId));

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-brand-border text-brand-muted transition-colors hover:border-brand-accent hover:text-brand-accent"
        title="Adicionar condição"
      >
        <Plus className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-6 z-20 w-60 rounded-md border border-brand-border bg-brand-surface p-2 shadow-xl">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Condições
          </div>
          <div className="grid grid-cols-4 gap-1">
            {COMBAT_CONDITION_IDS.map((id) => {
              const meta = COMBAT_CONDITIONS[id];
              const isActive = activeIds.has(id);
              return (
                <button
                  key={id}
                  onClick={() => onToggle(id)}
                  className={`flex flex-col items-center gap-0.5 rounded-md p-1.5 transition-colors ${
                    isActive
                      ? "bg-brand-accent/20 ring-1 ring-brand-accent"
                      : "hover:bg-white/5"
                  }`}
                  title={meta.description}
                >
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{
                      backgroundColor: meta.color + "30",
                      color: meta.color,
                    }}
                  >
                    {meta.label[0]}
                  </div>
                  <span className="truncate text-[8px] text-brand-muted">
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
