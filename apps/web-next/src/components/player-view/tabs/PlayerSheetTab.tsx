"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Shield,
  Zap,
  Footprints,
  AlertTriangle,
  ExternalLink,
  UserX,
  X,
} from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { getHpPercent, getHpColor } from "@/lib/gameplay-mock-data";
import { MOCK_PLAYERS } from "@/lib/gameplay-mock-data";
import { ALL_CONDITIONS } from "@/lib/gameplay-mock-data";
import { EmptyState } from "@/components/shared/empty-state";
import { PlayerTargetTab } from "./PlayerTargetTab";

export function PlayerSheetTab() {
  const myToken = usePlayerViewStore((s) => s.myToken);
  const playerId = usePlayerViewStore((s) => s.playerId);
  const targetTokenId = usePlayerViewStore((s) => s.targetTokenId);
  const visibleTokens = usePlayerViewStore((s) => s.visibleTokens);
  const setTargetTokenId = usePlayerViewStore((s) => s.setTargetTokenId);

  // Sub-toggle "Eu | Alvo" só aparece quando há um alvo selecionado
  const target = targetTokenId
    ? visibleTokens.find((t) => t.id === targetTokenId) ?? null
    : null;
  const [view, setView] = useState<"self" | "target">(
    target ? "target" : "self",
  );
  // Quando seta um alvo novo, muda auto pro view dele
  useEffect(() => {
    if (target) setView("target");
    else setView("self");
  }, [target?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const player = MOCK_PLAYERS.find((p) => p.id === playerId);

  if (!myToken || !player) {
    return (
      <EmptyState
        icon={UserX}
        title="Sem personagem atribuído"
        description={
          <>
            O mestre ainda não te conectou a um personagem. Enquanto isso,
            você pode assistir a sessão e usar o chat.
          </>
        }
      />
    );
  }

  // Se há alvo + toggle em "target", renderiza a view do alvo
  if (target && view === "target") {
    return (
      <div className="flex h-full flex-col">
        <SubToggle
          view={view}
          onSelf={() => setView("self")}
          targetName={target.name}
          onTarget={() => setView("target")}
          onClear={() => {
            setTargetTokenId(null);
            setView("self");
          }}
        />
        <div className="flex-1 overflow-hidden">
          <PlayerTargetTab />
        </div>
      </div>
    );
  }

  const hpPercent = getHpPercent(myToken.hp ?? 0, myToken.maxHp ?? 1);
  const hpColor = getHpColor(hpPercent);

  return (
    <div className="flex h-full flex-col">
      {target && (
        <SubToggle
          view="self"
          onSelf={() => setView("self")}
          targetName={target.name}
          onTarget={() => setView("target")}
          onClear={() => {
            setTargetTokenId(null);
            setView("self");
          }}
        />
      )}
      <div className="flex-1 overflow-y-auto">
        {/* Character header */}
      <div className="border-b border-brand-border p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: player.color + "30", color: player.color }}
          >
            {player.avatarInitials}
          </div>
          <div>
            <h2 className="text-sm font-bold text-brand-text">{myToken.name}</h2>
            <p className="text-xs text-brand-muted">
              {player.class} — Nivel {player.level}
            </p>
          </div>
        </div>
      </div>

      {/* HP Section */}
      <div className="border-b border-brand-border p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4" style={{ color: hpColor }} />
          <span className="text-xs font-medium uppercase tracking-wider text-brand-muted">
            Pontos de Vida
          </span>
        </div>

        {/* HP bar */}
        <div className="mt-2 overflow-hidden rounded-full bg-white/10" style={{ height: 8 }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${hpPercent}%`, backgroundColor: hpColor }}
          />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-lg font-bold tabular-nums text-brand-text">
            {myToken.hp}
            <span className="text-sm text-brand-muted">/{myToken.maxHp}</span>
          </span>
          <span className="text-[10px] text-brand-muted">
            {Math.round(hpPercent)}%
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px border-b border-brand-border bg-brand-border">
        <StatBox
          icon={<Shield className="h-3.5 w-3.5 text-brand-info" />}
          label="CA"
          value={myToken.ac?.toString() ?? "—"}
        />
        <StatBox
          icon={<Footprints className="h-3.5 w-3.5 text-brand-success" />}
          label="Velocidade"
          value={`${myToken.speed ?? 30}ft`}
        />
      </div>

      {/* Conditions */}
      <div className="border-b border-brand-border p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-brand-warning" />
          <span className="text-xs font-medium uppercase tracking-wider text-brand-muted">
            Condições
          </span>
        </div>
        {myToken.conditions.length === 0 ? (
          <p className="mt-2 text-xs text-brand-muted/60">
            Nenhuma condição ativa
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {myToken.conditions.map((cond) => {
              const label =
                ALL_CONDITIONS.find((c) => c.key === cond)?.label ?? cond;
              return (
                <span
                  key={cond}
                  className="rounded-full bg-brand-warning/10 px-2 py-0.5 text-[10px] font-medium text-brand-warning"
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Iniciativa + atalhos — placeholder honesto.
          Backend de stats completos e ataques favoritos ainda não existe;
          ver prompt "HUD + Ficha Completa Multi-Sistema" (PRs #3-#6).
          TODO: conectar quando houver sistema de ficha por RPG. */}
      <div className="border-b border-brand-border p-4">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-brand-warning" />
          <span className="text-xs font-medium uppercase tracking-wider text-brand-muted">
            Iniciativa e ataques
          </span>
        </div>
        <p className="mt-2 text-xs text-brand-muted/60">
          Disponível quando o sistema de ficha específico (D&amp;D 5e / CoC
          7e) for conectado. Por enquanto, use dados físicos ou a aba
          &quot;Dados&quot;.
        </p>
      </div>

      {/* CTA ficha completa — modal ainda é mock; botão fica desabilitado
          até o modal real por sistema existir (PR #4 do prompt multi-sistema). */}
      <div className="mt-auto border-t border-brand-border p-3">
        <button
          disabled
          title="Em breve: ficha completa por sistema de RPG"
          className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-brand-border py-2 text-xs font-medium text-brand-muted opacity-50"
        >
          <ExternalLink className="h-3 w-3" />
          Ver ficha completa
        </button>
      </div>
      </div>
    </div>
  );
}

/**
 * Toggle "Eu | {targetName}" — aparece quando há um alvo selecionado.
 * Botão X limpa o alvo e volta pra view do próprio personagem.
 */
function SubToggle({
  view,
  targetName,
  onSelf,
  onTarget,
  onClear,
}: {
  view: "self" | "target";
  targetName: string;
  onSelf: () => void;
  onTarget: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-brand-border bg-[#0D0D12]/60 px-2 py-1.5">
      <button
        type="button"
        onClick={onSelf}
        className={`flex-1 cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
          view === "self"
            ? "bg-brand-accent/15 text-brand-accent"
            : "text-brand-muted hover:bg-white/[0.04] hover:text-brand-text"
        }`}
      >
        Eu
      </button>
      <button
        type="button"
        onClick={onTarget}
        className={`flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
          view === "target"
            ? "bg-brand-accent/15 text-brand-accent"
            : "text-brand-muted hover:bg-white/[0.04] hover:text-brand-text"
        }`}
      >
        <span className="truncate">{targetName}</span>
      </button>
      <button
        type="button"
        onClick={onClear}
        title="Limpar alvo"
        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[#111116] py-3">
      {icon}
      <span className="text-xs font-bold tabular-nums text-brand-text">
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>
    </div>
  );
}
