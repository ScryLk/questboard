"use client";

import { Swords, CheckCircle, Target, Clock } from "lucide-react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { getAlignmentColor, getHpPercent, getHpColor } from "@/lib/gameplay-mock-data";
import { getHPDescriptionColor } from "@/lib/visibility-filter";
import { broadcastSend } from "@/lib/broadcast-sync";

export function PlayerCombatTab() {
  const combat = usePlayerViewStore((s) => s.combat);
  const isMyTurn = usePlayerViewStore((s) => s.isMyTurn);
  const movementUsedFt = usePlayerViewStore((s) => s.movementUsedFt);
  const movementMaxFt = usePlayerViewStore((s) => s.movementMaxFt);
  const endTurn = usePlayerViewStore((s) => s.endTurn);

  if (!combat?.active) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
        <Swords className="h-8 w-8 text-brand-muted/30" />
        <p className="text-center text-sm text-brand-muted">
          Nenhum combate ativo
        </p>
        <p className="text-center text-xs text-brand-muted/60">
          O combate sera iniciado pelo GM quando necessario
        </p>
      </div>
    );
  }

  const handleEndTurn = () => {
    endTurn();
    broadcastSend("player:end-turn", {}, "player");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Combat header */}
      <div className="border-b border-brand-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Swords className="h-3.5 w-3.5 text-brand-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-text">
            Combate
          </span>
          <span className="ml-auto text-[11px] text-brand-muted">
            Rodada {combat.round}
          </span>
        </div>
      </div>

      {/* My turn actions */}
      {isMyTurn && (
        <div className="border-b border-brand-accent/20 bg-brand-accent/[0.06] p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-brand-accent" />
            <span className="text-sm font-bold text-brand-accent">
              Seu Turno!
            </span>
          </div>

          {/* Movement tracker */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-brand-muted">Movimento:</span>
            <div className="flex-1 overflow-hidden rounded-full bg-white/10" style={{ height: 4 }}>
              <div
                className="h-full rounded-full bg-brand-success transition-all"
                style={{
                  width: `${Math.max(0, ((movementMaxFt - movementUsedFt) / movementMaxFt) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-brand-muted">
              {movementUsedFt}/{movementMaxFt}ft
            </span>
          </div>

          {/* End turn button */}
          <button
            onClick={handleEndTurn}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-accent py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-accent-hover"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Finalizar Turno
          </button>
        </div>
      )}

      {/* Not my turn */}
      {!isMyTurn && (
        <div className="border-b border-brand-border bg-white/[0.02] px-3 py-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-brand-muted" />
            <span className="text-xs text-brand-muted">
              Turno de:{" "}
              <span className="font-semibold text-brand-text">
                {combat.currentTurnName}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Initiative order */}
      <div className="flex-1 overflow-y-auto px-1 py-1.5">
        {combat.participants.map((p) => {
          const borderColor = getAlignmentColor(p.type);
          const isCurrent = combat.currentTurnTokenId === p.tokenId;

          return (
            <div
              key={p.tokenId}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                isCurrent ? "bg-brand-accent/[0.08]" : ""
              } ${p.isDead ? "opacity-30" : ""}`}
              style={{
                borderLeft: isCurrent
                  ? `2px solid ${borderColor}`
                  : "2px solid transparent",
              }}
            >
              {/* Avatar */}
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                style={{
                  backgroundColor: borderColor + "30",
                  color: borderColor,
                }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Name + info */}
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-[11px] font-medium text-brand-text ${
                    p.isDead ? "line-through" : ""
                  } ${p.isMe ? "font-bold" : ""}`}
                >
                  {p.name}
                  {p.isMe && (
                    <span className="ml-1 text-[9px] text-brand-accent">(voce)</span>
                  )}
                </p>

                {/* HP info — varies by type */}
                {p.hp !== undefined && p.maxHp !== undefined && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <div
                      className="overflow-hidden rounded-full bg-white/10"
                      style={{ height: 3, flex: 1 }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${getHpPercent(p.hp, p.maxHp)}%`,
                          backgroundColor: getHpColor(getHpPercent(p.hp, p.maxHp)),
                        }}
                      />
                    </div>
                    <span className="text-[9px] tabular-nums text-brand-muted">
                      {p.hp}/{p.maxHp}
                    </span>
                  </div>
                )}

                {/* Enemy HP description (no numbers) */}
                {p.hpDescription && (
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: getHPDescriptionColor(p.hpDescription) }}
                  >
                    {p.hpDescription}
                  </span>
                )}
              </div>

              {/* Initiative */}
              <span className="text-[10px] tabular-nums text-brand-muted">
                {p.initiative}
              </span>

              {/* Conditions */}
              {p.conditions.length > 0 && (
                <div className="flex gap-0.5">
                  {p.conditions.slice(0, 2).map((cond) => (
                    <div
                      key={cond}
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-warning/20 text-[6px] font-bold text-brand-warning"
                      title={cond}
                    >
                      {cond[0].toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
