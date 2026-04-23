"use client";

import { useState } from "react";
import {
  Check,
  Heart,
  Move,
  RotateCcw,
  Sparkles,
  Swords,
  Trash2,
  Copy,
  Zap,
  Dices,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  REVERT_WINDOW_MS,
  useActionFeedStore,
  type ActionType,
  type FeedEntry,
} from "@/lib/action-feed-store";

const TYPE_ICON: Record<ActionType, LucideIcon> = {
  TOKEN_MOVED: Move,
  TOKEN_REMOVED: Trash2,
  TOKEN_DUPLICATED: Copy,
  HP_CHANGED: Heart,
  CONDITION_ADDED: Sparkles,
  CONDITION_REMOVED: Zap,
  DICE_ROLLED: Dices,
};

// Tempo relativo curto em pt-BR ("agora", "12s", "2m").
function relativeTime(from: number, now: number): string {
  const diff = Math.max(0, now - from);
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "agora";
  if (sec < 60) return `${sec}s atrás`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m atrás`;
  const h = Math.floor(min / 60);
  return `${h}h atrás`;
}

export function ActionFeedEntry({ entry }: { entry: FeedEntry }) {
  const revertEntry = useActionFeedStore((s) => s.revertEntry);
  const discardEntry = useActionFeedStore((s) => s.discardEntry);
  const now = useActionFeedStore((s) => s.tick);
  const [confirming, setConfirming] = useState(false);

  const Icon = TYPE_ICON[entry.type] ?? Swords;
  const msLeft = entry.revertedAt ? 0 : Math.max(0, entry.expiresAt - now);
  const secLeft = Math.ceil(msLeft / 1000);
  const isExpired = msLeft <= 0;
  const isReverted = !!entry.revertedAt;
  const isDiceDiscardable = entry.type === "DICE_ROLLED" && !isReverted;

  // Barra de progresso — vai de 100% (recém-aplicada) até 0% (expirou).
  const progressPct =
    entry.revertedAt || isExpired
      ? 0
      : Math.round((msLeft / REVERT_WINDOW_MS) * 100);

  function handleRevert() {
    if (entry.revertible) revertEntry(entry.id);
    else discardEntry(entry.id);
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-brand-border bg-[#111116] p-2.5 transition-opacity ${
        isReverted ? "opacity-60" : ""
      }`}
    >
      {/* Linha principal: icone + summary */}
      <div className="flex items-start gap-2">
        <div
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
            isReverted
              ? "bg-white/[0.04] text-brand-muted"
              : "bg-brand-accent/10 text-brand-accent"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 text-[10px] text-brand-muted">
            <span className="font-medium text-brand-text/80">
              {entry.actorName}
            </span>
            <span>·</span>
            <span>{relativeTime(entry.appliedAt, now)}</span>
            {entry.actorRole === "GM" && (
              <span className="rounded bg-brand-accent/15 px-1 text-[8px] font-semibold uppercase tracking-wider text-brand-accent">
                GM
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-brand-text">
            {entry.summary}
          </p>
        </div>
      </div>

      {/* Estado: revertido, consolidado ou ativo */}
      {isReverted ? (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-muted">
          <RotateCcw className="h-3 w-3" />
          {entry.revertReason === "Descartado"
            ? "Descartada"
            : `Revertida${entry.revertedBy ? ` por ${entry.revertedBy}` : ""}`}
          {entry.revertReason && entry.revertReason !== "Descartado" && (
            <span className="italic"> · &ldquo;{entry.revertReason}&rdquo;</span>
          )}
        </div>
      ) : isExpired ? (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-muted">
          <Check className="h-3 w-3 text-brand-success/70" />
          Consolidada
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-brand-border bg-brand-primary px-2 py-0.5 text-[10px] font-medium text-brand-text transition-colors hover:border-brand-accent/40 hover:bg-brand-accent/10"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              {isDiceDiscardable ? "Descartar" : "Reverter"}
              <span className="tabular-nums text-brand-muted">{secLeft}s</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleRevert}
                className="cursor-pointer rounded-md bg-brand-accent px-2 py-0.5 text-[10px] font-medium text-white transition-colors hover:bg-brand-accent-hover"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="cursor-pointer rounded-md border border-brand-border px-2 py-0.5 text-[10px] text-brand-muted transition-colors hover:bg-white/5"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      )}

      {/* Barra de progresso no rodapé (só quando ativa) */}
      {!isReverted && !isExpired && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/[0.03]">
          <div
            className="h-full bg-brand-accent/40 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}
