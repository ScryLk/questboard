"use client";

import { Heart, Shield, Zap, Footprints, AlertTriangle } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { getHpPercent, getHpColor } from "@/lib/gameplay-mock-data";
import { MOCK_PLAYERS } from "@/lib/gameplay-mock-data";
import { ALL_CONDITIONS } from "@/lib/gameplay-mock-data";

export function PlayerSheetTab() {
  const myToken = usePlayerViewStore((s) => s.myToken);
  const playerId = usePlayerViewStore((s) => s.playerId);

  // Get player data from mock
  const player = MOCK_PLAYERS.find((p) => p.id === playerId);

  if (!myToken || !player) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-brand-muted">Nenhum personagem atribuido</p>
      </div>
    );
  }

  const hpPercent = getHpPercent(myToken.hp ?? 0, myToken.maxHp ?? 1);
  const hpColor = getHpColor(hpPercent);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
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
      <div className="grid grid-cols-3 gap-px border-b border-brand-border bg-brand-border">
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
        <StatBox
          icon={<Zap className="h-3.5 w-3.5 text-brand-warning" />}
          label="Iniciativa"
          value="+3"
        />
      </div>

      {/* Conditions */}
      <div className="border-b border-brand-border p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-brand-warning" />
          <span className="text-xs font-medium uppercase tracking-wider text-brand-muted">
            Condicoes
          </span>
        </div>
        {myToken.conditions.length === 0 ? (
          <p className="mt-2 text-xs text-brand-muted/60">Nenhuma condicao ativa</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {myToken.conditions.map((cond) => {
              const label = ALL_CONDITIONS.find((c) => c.key === cond)?.label ?? cond;
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

      {/* Quick reference */}
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-brand-muted">
          Atalhos
        </span>
        <div className="mt-2 space-y-1.5">
          <QuickRef label="Ataque Corpo a Corpo" value="+5 (1d8+3)" />
          <QuickRef label="Bola de Fogo" value="8d6 dano de fogo" />
          <QuickRef label="Escudo Arcano" value="+5 CA (reacao)" />
        </div>
      </div>
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
      <span className="text-xs font-bold tabular-nums text-brand-text">{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-brand-muted">{label}</span>
    </div>
  );
}

function QuickRef({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/[0.03] px-2.5 py-1.5">
      <p className="text-[11px] font-medium text-brand-text">{label}</p>
      <p className="text-[10px] text-brand-muted">{value}</p>
    </div>
  );
}
