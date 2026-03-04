"use client";

import type { GameToken } from "@/lib/gameplay-mock-data";
import { getAlignmentColor } from "@/lib/gameplay-mock-data";

interface TurnIndicatorProps {
  token: GameToken;
  scaledCell: number;
  movementUsedFt: number;
}

export function TurnIndicator({
  token,
  scaledCell,
  movementUsedFt,
}: TurnIndicatorProps) {
  const size = token.size * scaledCell;
  const color = getAlignmentColor(token.alignment);
  const remaining = Math.max(0, token.speed - movementUsedFt);
  const pct = token.speed > 0 ? remaining / token.speed : 0;
  const badgeColor =
    pct > 0.5 ? "#00B894" : pct > 0.25 ? "#FDCB6E" : pct > 0 ? "#FF6B6B" : "#666";

  return (
    <>
      {/* Pulsing ring */}
      <div
        className="pointer-events-none absolute animate-pulse rounded-full"
        style={{
          left: token.x * scaledCell - 3,
          top: token.y * scaledCell - 3,
          width: size + 6,
          height: size + 6,
          border: `2px solid ${color}`,
          boxShadow: `0 0 16px ${color}50, 0 0 8px ${color}30`,
        }}
      />
      {/* Movement badge */}
      {token.speed > 0 && (
        <div
          className="pointer-events-none absolute flex items-center justify-center"
          style={{
            left: token.x * scaledCell + size - 4,
            top: token.y * scaledCell + size - 8,
          }}
        >
          <span
            className="rounded-full px-1 py-0.5 text-[8px] font-bold tabular-nums text-white"
            style={{ backgroundColor: badgeColor }}
          >
            {remaining}/{token.speed}ft
          </span>
        </div>
      )}
    </>
  );
}
