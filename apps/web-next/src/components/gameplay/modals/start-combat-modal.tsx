"use client";

import { useState } from "react";
import { GripVertical, Swords, Trash2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { usePhaseStore } from "@/stores/phaseStore";
import { getAlignmentColor } from "@/lib/gameplay-mock-data";
import { ModalShell } from "./modal-shell";

interface StartCombatModalProps {
  onClose: () => void;
}

interface CombatEntry {
  tokenId: string;
  name: string;
  initiative: number;
  color: string;
}

export function StartCombatModal({ onClose }: StartCombatModalProps) {
  const tokens = useGameplayStore((s) => s.tokens);
  const onMapTokens = tokens.filter((t) => t.onMap);

  const [entries, setEntries] = useState<CombatEntry[]>(() =>
    onMapTokens.map((t) => ({
      tokenId: t.id,
      name: t.name,
      initiative: Math.floor(Math.random() * 20) + 1,
      color: getAlignmentColor(t.alignment),
    })),
  );

  const sorted = [...entries].sort((a, b) => b.initiative - a.initiative);

  function updateInitiative(tokenId: string, value: number) {
    setEntries((prev) =>
      prev.map((e) => (e.tokenId === tokenId ? { ...e, initiative: value } : e)),
    );
  }

  function removeEntry(tokenId: string) {
    setEntries((prev) => prev.filter((e) => e.tokenId !== tokenId));
  }

  function rollAll() {
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        initiative: Math.floor(Math.random() * 20) + 1,
      })),
    );
  }

  return (
    <ModalShell title="Iniciar Combate" maxWidth={480} onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-brand-muted">
          {entries.length} combatentes no mapa
        </p>
        <button
          onClick={rollAll}
          className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-brand-text transition-colors hover:bg-white/[0.08]"
        >
          <Swords className="h-3 w-3" />
          Rolar Todas
        </button>
      </div>

      {/* Initiative list */}
      <div className="mb-4 max-h-[300px] space-y-1 overflow-y-auto">
        {sorted.map((entry) => (
          <div
            key={entry.tokenId}
            className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-primary p-2"
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-brand-muted/50" />
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: entry.color + "25",
                color: entry.color,
                border: `1.5px solid ${entry.color}`,
              }}
            >
              {entry.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-brand-text">
              {entry.name}
            </span>
            <input
              type="number"
              value={entry.initiative}
              onChange={(e) =>
                updateInitiative(entry.tokenId, Number(e.target.value))
              }
              className="h-7 w-12 rounded border border-brand-border bg-[#0A0A0F] text-center text-xs tabular-nums text-brand-text focus:border-brand-accent focus:outline-none"
            />
            <button
              onClick={() => removeEntry(entry.tokenId)}
              className="text-brand-muted transition-colors hover:text-brand-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-9 rounded-lg border border-brand-border px-4 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            usePhaseStore.getState().transitionTo("combat", "Combate");
            onClose();
          }}
          className="h-9 rounded-lg bg-brand-accent px-4 text-xs font-medium text-white transition-colors hover:bg-brand-accent/90"
        >
          Iniciar Combate
        </button>
      </div>
    </ModalShell>
  );
}
