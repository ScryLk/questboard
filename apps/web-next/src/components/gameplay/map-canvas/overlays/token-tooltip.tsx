"use client";

import type { GameToken } from "@/lib/gameplay-mock-data";
import { getAlignmentColor, getHpPercent } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";

interface TokenTooltipProps {
  token: GameToken;
  x: number;
  y: number;
}

export function TokenTooltip({ token, x, y }: TokenTooltipProps) {
  const combat = useGameplayStore((s) => s.combat);
  const hpPct = getHpPercent(token.hp, token.maxHp);
  const color = getAlignmentColor(token.alignment);

  const isTurn =
    combat.active &&
    combat.order[combat.turnIndex]?.tokenId === token.id;

  return (
    <div
      className="pointer-events-none fixed z-40 rounded-lg border border-brand-border bg-[#16161D] px-3 py-2 shadow-xl"
      style={{ left: x + 12, top: y - 8 }}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-semibold text-brand-text">
          {token.name}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-3 text-[10px] text-brand-muted">
        <span>
          HP {token.hp}/{token.maxHp}{" "}
          <span
            style={{
              color:
                hpPct > 50 ? "#00B894" : hpPct > 25 ? "#FDCB6E" : "#FF6B6B",
            }}
          >
            ({Math.round(hpPct)}%)
          </span>
        </span>
        <span>CA {token.ac}</span>
      </div>
      {token.conditions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {token.conditions.map((c) => (
            <span
              key={c}
              className="rounded bg-white/10 px-1 py-0.5 text-[9px] capitalize text-brand-muted"
            >
              {c}
            </span>
          ))}
        </div>
      )}
      {isTurn && (
        <div className="mt-1 text-[10px] font-medium text-brand-accent">
          Turno Atual
        </div>
      )}
    </div>
  );
}
