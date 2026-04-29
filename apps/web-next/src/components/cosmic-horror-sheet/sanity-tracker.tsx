"use client";

// SanityTracker — componente de destaque na ficha cosmic-horror.
// Mostra SAN atual / máxima, barra com zonas, marcador de 1/5 (limiar
// de loucura indefinida) e estado de loucura ativo. Cor muda conforme
// proximidade do limite.

import { Brain } from "lucide-react";
import type { CosmicHorrorSheetContext } from "@/hooks/use-cosmic-horror-derived";

const MADNESS_LABEL: Record<string, string> = {
  SANE: "Sã",
  TEMPORARY: "Loucura Temporária",
  INDEFINITE: "Loucura Indefinida",
  PERMANENT: "Loucura Permanente",
};

interface Props {
  ctx: CosmicHorrorSheetContext;
  /** Quando true, exibe controles de edição direto (GM/jogador dono). */
  editable?: boolean;
  onApplyLoss?: () => void;
  onRestore?: () => void;
}

export function SanityTracker({ ctx, editable, onApplyLoss, onRestore }: Props) {
  const { sanityCurrent, sanityMax, sanityStartingMax, mythosKnowledge, madness } =
    ctx.data;

  const pct = sanityMax > 0 ? (sanityCurrent / sanityMax) * 100 : 0;
  const indefiniteThresholdPct = sanityMax > 0
    ? Math.floor(sanityMax / 5) / sanityMax * 100
    : 0;

  const colorClass =
    pct > 60
      ? "text-emerald-400"
      : pct > 30
        ? "text-amber-400"
        : pct > 0
          ? "text-rose-400"
          : "text-purple-500 animate-pulse";

  const barColor =
    pct > 60
      ? "bg-emerald-400"
      : pct > 30
        ? "bg-amber-400"
        : pct > 0
          ? "bg-rose-400"
          : "bg-purple-500";

  const insane = madness !== "SANE";

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/[0.04] p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
          <Brain className="h-3.5 w-3.5" />
          Sanidade
        </h3>
        <span className={`font-syne text-2xl font-bold ${colorClass}`}>
          {sanityCurrent} / {sanityMax}
        </span>
      </div>

      <div className="relative mb-2 h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className={`h-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
        {indefiniteThresholdPct > 0 && (
          <div
            className="absolute top-0 h-full w-px bg-amber-300/60"
            style={{ left: `${indefiniteThresholdPct}%` }}
            title="Limiar 1/5 — perda igual ou maior em 24h dispara loucura indefinida."
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-brand-muted">
        <div>
          <p className="uppercase tracking-wider">Inicial</p>
          <p className="font-syne text-sm font-bold text-brand-text">
            {sanityStartingMax}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider">Mythos</p>
          <p className="font-syne text-sm font-bold text-brand-text">
            {mythosKnowledge}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider">Teto</p>
          <p className="font-syne text-sm font-bold text-brand-text">
            {ctx.derived.oneToOneSanityCeiling}
          </p>
        </div>
      </div>

      {insane && (
        <div className="mt-3 rounded-md border border-purple-500/40 bg-purple-500/10 p-2 text-[11px] text-purple-200">
          <strong className="text-purple-300">{MADNESS_LABEL[madness]}</strong>{" "}
          — investigador apresenta sintomas. Perda de SAN adicional pode
          escalar o quadro.
        </div>
      )}

      {editable && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={onApplyLoss}
            className="flex-1 rounded-md border border-purple-500/40 bg-purple-500/10 px-2 py-1.5 text-[11px] font-medium text-purple-300 transition-colors hover:bg-purple-500/20"
          >
            Aplicar perda
          </button>
          <button
            onClick={onRestore}
            className="flex-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 text-[11px] font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            Restaurar
          </button>
        </div>
      )}
    </div>
  );
}
