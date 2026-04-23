"use client";

import { useEffect } from "react";
import { Check, Footprints, X } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { gridDistance } from "@/lib/gameplay-mock-data";

/**
 * Modal que aparece pro GM quando um jogador pede aprovação de
 * movimento. Esc rejeita (seguro como default — não move o token sem
 * confirmação explícita).
 */
export function MoveApprovalDialog() {
  const req = useGameplayStore((s) => s.pendingPlayerMove);
  const approve = useGameplayStore((s) => s.approvePendingMove);
  const reject = useGameplayStore((s) => s.rejectPendingMove);

  useEffect(() => {
    if (!req) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") reject();
      if (e.key === "Enter") approve();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [req, approve, reject]);

  if (!req) return null;

  // Distância em pés — usa gridDistance (assume 5ft por célula default).
  const distanceFt = gridDistance(req.fromX, req.fromY, req.toX, req.toY, 5);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={reject}
    >
      <div
        className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-brand-border bg-[#0D0D12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-brand-border px-4 py-3">
          <Footprints className="h-4 w-4 text-brand-accent" />
          <h2 className="text-sm font-semibold text-brand-text">
            Pedido de movimento
          </h2>
        </div>

        <div className="px-4 py-4">
          <p className="text-xs text-brand-muted">
            <span className="font-semibold text-brand-text">
              {req.playerName}
            </span>{" "}
            quer mover o token
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 rounded-lg border border-brand-border bg-white/[0.03] py-3">
            <span className="font-mono tabular-nums text-brand-muted">
              ({req.fromX}, {req.fromY})
            </span>
            <span className="text-brand-accent">→</span>
            <span className="font-mono text-sm font-bold tabular-nums text-brand-text">
              ({req.toX}, {req.toY})
            </span>
          </div>
          <p className="mt-2 text-center text-[10px] text-brand-muted">
            Distância: {distanceFt}ft
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-brand-border px-4 py-3">
          <button
            type="button"
            onClick={reject}
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-brand-border px-3 py-1.5 text-xs text-brand-text transition-colors hover:bg-white/5"
          >
            <X className="h-3 w-3" />
            Rejeitar
            <span className="ml-1 text-[9px] text-brand-muted">Esc</span>
          </button>
          <button
            type="button"
            onClick={approve}
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent-hover"
          >
            <Check className="h-3 w-3" />
            Aprovar
            <span className="ml-1 text-[9px] text-white/60">Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
