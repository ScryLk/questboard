"use client";

import { useEffect, useState } from "react";
import { Check, Footprints, Loader2, X } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { broadcastSend } from "@/lib/broadcast-sync";
import { MOCK_PLAYERS } from "@/lib/gameplay-mock-data";

// Tempos do timer — pré-confirm mais curto (pressão pra decidir),
// aguardando mais longo (dá tempo pro GM reagir).
const PRE_CONFIRM_SECONDS = 20;
const AWAITING_SECONDS = 30;

/**
 * Alerta central de confirmação de movimento. Antes de confirmar: timer
 * decrescente → auto-cancela ao zerar. Depois de confirmar: countdown de
 * espera pelo GM → auto-cancela se o GM não responder.
 */
export function MoveConfirmBar() {
  const staged = usePlayerViewStore((s) => s.stagedMove);
  const confirm = usePlayerViewStore((s) => s.confirmStagedMove);
  const cancel = usePlayerViewStore((s) => s.clearStagedMove);
  const myToken = usePlayerViewStore((s) => s.myToken);
  const playerId = usePlayerViewStore((s) => s.playerId);
  const playerName = usePlayerViewStore((s) => s.playerName);

  const [now, setNow] = useState(() => Date.now());

  // Tick 1/s pra atualizar o timer
  useEffect(() => {
    if (!staged) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [staged]);

  // Auto-cancel quando o timer zera
  useEffect(() => {
    if (!staged) return;
    const total = staged.awaitingGM ? AWAITING_SECONDS : PRE_CONFIRM_SECONDS;
    const elapsed = (now - staged.stateStartedAt) / 1000;
    if (elapsed >= total) cancel();
  }, [staged, now, cancel]);

  if (!staged || !myToken) return null;

  const total = staged.awaitingGM ? AWAITING_SECONDS : PRE_CONFIRM_SECONDS;
  const elapsed = (now - staged.stateStartedAt) / 1000;
  const remaining = Math.max(0, total - elapsed);
  const progressPct = Math.max(0, Math.min(100, (remaining / total) * 100));
  const secondsLeft = Math.ceil(remaining);

  const handleConfirm = () => {
    confirm();

    const displayName =
      MOCK_PLAYERS.find((p) => p.id === playerId)?.name ||
      playerName ||
      "Jogador";

    const requestId = `mv_${Date.now()}`;
    const payload = {
      requestId,
      tokenId: myToken.id,
      playerId,
      playerName: displayName,
      fromX: myToken.x,
      fromY: myToken.y,
      toX: staged.toX,
      toY: staged.toY,
    };

    useGameplayStore.getState().setPendingPlayerMove(payload);
    broadcastSend("player:move-request", payload, "player");
  };

  const isAwaiting = staged.awaitingGM;
  const accentClass = isAwaiting ? "text-brand-warning" : "text-brand-accent";
  const barColorClass = isAwaiting
    ? "bg-brand-warning"
    : "bg-brand-accent";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[50] flex items-center justify-center p-4"
      aria-live="polite"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-brand-border bg-[#0D0D12]/95 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-brand-border px-4 py-2.5">
          {isAwaiting ? (
            <Loader2 className={`h-4 w-4 animate-spin ${accentClass}`} />
          ) : (
            <Footprints className={`h-4 w-4 ${accentClass}`} />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-text">
            {isAwaiting ? "Aguardando o mestre" : "Confirmar movimento"}
          </span>
          <span
            className={`ml-auto font-mono tabular-nums text-xs ${accentClass}`}
          >
            {secondsLeft}s
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">
              De
            </p>
            <p className="font-mono tabular-nums text-sm text-brand-muted">
              ({myToken.x}, {myToken.y})
            </p>
          </div>
          <div className={accentClass}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">
              Para
            </p>
            <p className="font-mono tabular-nums text-lg font-bold text-brand-text">
              ({staged.toX}, {staged.toY})
            </p>
          </div>
        </div>

        {/* Progress bar — vai diminuindo conforme tempo passa */}
        <div className="h-1 w-full bg-white/[0.04]">
          <div
            className={`h-full transition-all duration-300 ${barColorClass}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3">
          {isAwaiting ? (
            <>
              <p className="flex-1 text-[11px] text-brand-muted">
                Aguarde a resposta do mestre...
              </p>
              <button
                type="button"
                onClick={cancel}
                className="flex cursor-pointer items-center gap-1 rounded-md border border-brand-border px-2.5 py-1 text-[11px] text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
              >
                <X className="h-3 w-3" />
                Cancelar pedido
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={cancel}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand-border py-2 text-xs font-medium text-brand-text transition-colors hover:bg-white/5"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-accent py-2 text-xs font-medium text-white transition-colors hover:bg-brand-accent-hover"
              >
                <Check className="h-3.5 w-3.5" />
                Confirmar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
