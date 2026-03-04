"use client";

import {
  ChevronDown,
  ChevronRight,
  SkipForward,
  Square,
  Swords,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { getAlignmentColor } from "@/lib/gameplay-mock-data";
import { HPBar } from "../shared/hp-bar";

export function InitiativeTracker() {
  const combat = useGameplayStore((s) => s.combat);
  const tokens = useGameplayStore((s) => s.tokens);
  const nextTurn = useGameplayStore((s) => s.nextTurn);
  const endCombat = useGameplayStore((s) => s.endCombat);
  const selectToken = useGameplayStore((s) => s.selectToken);
  const collapsed = useGameplayStore((s) => s.collapsedSections["initiative"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);

  if (!combat.active) return null;

  const currentCombatant = combat.order[combat.turnIndex];
  const currentToken = currentCombatant
    ? tokens.find((t) => t.id === currentCombatant.tokenId)
    : null;

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <button
        onClick={() => toggleSection("initiative")}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.02]"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
        )}
        <Swords className="h-3.5 w-3.5 text-brand-accent" />
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
          Combate
        </span>
        <span className="text-[11px] text-brand-muted">
          Rodada {combat.round}
        </span>
      </button>

      {!collapsed && (
        <>
          {/* Current turn */}
          {currentToken && (
            <div className="mx-2 mb-1.5 rounded-md bg-brand-accent/10 px-2.5 py-1">
              <span className="text-[10px] text-brand-muted">Turno: </span>
              <span className="text-[10px] font-semibold text-brand-accent">
                {currentToken.name}
              </span>
            </div>
          )}

          {/* Order list */}
          <div className="px-1 pb-1.5">
            {combat.order.map((c, i) => {
              const token = tokens.find((t) => t.id === c.tokenId);
              if (!token) return null;
              const isCurrent = i === combat.turnIndex;
              const isDead = c.status === "dead";
              const borderColor = getAlignmentColor(token.alignment);

              return (
                <button
                  key={c.tokenId}
                  onClick={() => selectToken(token.id)}
                  className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors hover:bg-white/[0.03] ${
                    isCurrent ? "bg-brand-accent/[0.08]" : ""
                  } ${isDead ? "opacity-30" : ""}`}
                  style={{
                    borderLeft: isCurrent
                      ? `2px solid ${borderColor}`
                      : "2px solid transparent",
                  }}
                >
                  <span className="w-4 text-center text-[10px] tabular-nums text-brand-muted">
                    {i + 1}
                  </span>
                  {/* Avatar */}
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{ backgroundColor: borderColor + "30", color: borderColor }}
                  >
                    {token.name.slice(0, 2).toUpperCase()}
                  </div>
                  {/* Name + HP */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[11px] font-medium text-brand-text ${
                        isDead ? "line-through" : ""
                      }`}
                    >
                      {token.name}
                    </p>
                    <HPBar hp={token.hp} maxHp={token.maxHp} height={3} />
                  </div>
                  {/* Init + HP text */}
                  <span className="text-[10px] tabular-nums text-brand-muted">
                    {c.initiative}
                  </span>
                  <span className="w-9 text-right text-[10px] tabular-nums text-brand-muted">
                    {token.hp}/{token.maxHp}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 px-2 pb-2">
            <button
              onClick={nextTurn}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-accent px-2 py-1 text-[11px] font-medium text-white transition-colors hover:bg-brand-accent-hover"
            >
              <SkipForward className="h-3 w-3" />
              Proximo Turno
            </button>
            <button
              onClick={endCombat}
              className="flex items-center justify-center gap-1 rounded-md border border-brand-border px-2 py-1 text-[11px] font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              <Square className="h-3 w-3" />
              Encerrar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
