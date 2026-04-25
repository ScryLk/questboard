"use client";

import { Swords, Play, AlertTriangle } from "lucide-react";

interface Props {
  onStartWithVisibleTokens: () => void;
  onStartEmpty: () => void;
  visibleTokensCount: number;
  mock: boolean;
}

export function CombatEmptyState({
  onStartWithVisibleTokens,
  onStartEmpty,
  visibleTokensCount,
  mock,
}: Props) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 py-8 text-center">
      {mock && (
        <span
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-gold"
          title="Modo mock — sem backend, mudanças ficam locais"
        >
          <AlertTriangle className="h-2.5 w-2.5" />
          Mock
        </span>
      )}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-accent/10">
        <Swords className="h-7 w-7 text-brand-accent" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-brand-text">
          Nenhum combate ativo
        </h3>
        <p className="max-w-[240px] text-xs text-brand-muted">
          Inicie um combate para rastrear iniciativa, turnos e condições.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <button
          onClick={onStartWithVisibleTokens}
          disabled={visibleTokensCount === 0}
          className="flex items-center justify-center gap-1.5 rounded-md bg-brand-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5" />
          Iniciar com tokens visíveis
          {visibleTokensCount > 0 && (
            <span className="opacity-70">({visibleTokensCount})</span>
          )}
        </button>
        <button
          onClick={onStartEmpty}
          className="rounded-md border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
        >
          Iniciar vazio
        </button>
      </div>
    </div>
  );
}
