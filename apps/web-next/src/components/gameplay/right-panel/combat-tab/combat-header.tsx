"use client";

import { Dices, Square, Clock, Eye, AlertTriangle } from "lucide-react";
import { COMBAT_TURN_TIMERS } from "@questboard/constants";
import type { CombatConfig } from "@questboard/types";

interface Props {
  round: number;
  config: CombatConfig;
  turnStartedAt: number | null;
  mock: boolean;
  onRollAll: () => void;
  onEnd: () => void;
  onToggleShowEnemyHp: () => void;
  onCycleTurnTimer: () => void;
}

export function CombatHeader({
  round,
  config,
  turnStartedAt,
  mock,
  onRollAll,
  onEnd,
  onToggleShowEnemyHp,
  onCycleTurnTimer,
}: Props) {
  const timerLabel =
    COMBAT_TURN_TIMERS.find((t) => t.value === config.turnTimerSec)?.label ??
    "Sem limite";

  // Tempo decorrido — refresh implícito via prop drive do parent.
  const elapsed =
    turnStartedAt && config.turnTimerSec > 0
      ? Math.max(
          0,
          config.turnTimerSec - Math.floor((Date.now() - turnStartedAt) / 1000),
        )
      : null;

  return (
    <div className="shrink-0 border-b border-brand-border px-3 py-2">
      {/* Linha 1: chip MOCK opcional + Rodada */}
      <div className="flex items-center gap-2">
        {mock && (
          <span
            className="flex items-center gap-1 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-gold"
            title="Modo mock — sem backend, mudanças ficam locais"
          >
            <AlertTriangle className="h-2.5 w-2.5" />
            Mock
          </span>
        )}
        <span className="ml-auto text-[11px] text-brand-muted">
          Rodada <span className="font-bold text-brand-text">{round}</span>
        </span>
      </div>

      {/* Linha 2: controles compactos. Wrap permitido se o painel for muito
          estreito; ícone-only nos botões secundários (timer, HP toggle). */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        <button
          onClick={onCycleTurnTimer}
          className="flex shrink-0 items-center gap-1 rounded-md border border-brand-border px-2 py-1 text-[10px] text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
          title={`Timer de turno: ${timerLabel}`}
        >
          <Clock className="h-3 w-3" />
          {elapsed !== null
            ? `${elapsed}s`
            : config.turnTimerSec === 0
              ? "—"
              : `${config.turnTimerSec}s`}
        </button>

        <button
          onClick={onRollAll}
          className="flex shrink-0 items-center gap-1 rounded-md bg-brand-accent/10 px-2 py-1 text-[10px] font-semibold text-brand-accent transition-colors hover:bg-brand-accent/20"
          title="Rolar iniciativa para todos (I)"
        >
          <Dices className="h-3 w-3" />
          Rolar
        </button>

        <button
          onClick={onToggleShowEnemyHp}
          className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md border transition-colors ${
            config.showEnemyHp
              ? "border-brand-accent/60 bg-brand-accent/10 text-brand-accent"
              : "border-brand-border text-brand-muted hover:text-brand-text"
          }`}
          title={
            config.showEnemyHp
              ? "Players veem HP exato dos inimigos (clique para ocultar)"
              : "Players veem HP por faixa (clique para mostrar exato)"
          }
        >
          <Eye className="h-3 w-3" />
        </button>

        <button
          onClick={onEnd}
          className="ml-auto flex shrink-0 items-center gap-1 rounded-md bg-brand-danger/10 px-2 py-1 text-[10px] font-semibold text-brand-danger transition-colors hover:bg-brand-danger/20"
          title="Encerrar combate (R)"
        >
          <Square className="h-3 w-3" />
          Encerrar
        </button>
      </div>
    </div>
  );
}
