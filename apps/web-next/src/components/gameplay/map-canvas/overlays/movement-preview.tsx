"use client";

import { useMemo } from "react";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { MOCK_MAP, cellsInRadius } from "@/lib/gameplay-mock-data";

interface MovementPreviewProps {
  token: GameToken;
  scaledCell: number;
  movementUsedFt: number;
}

export function MovementPreview({
  token,
  scaledCell,
  movementUsedFt,
}: MovementPreviewProps) {
  const { gridCols, gridRows, cellSizeFt } = MOCK_MAP;
  const remainingFt = Math.max(0, token.speed - movementUsedFt);
  const radiusCells = Math.floor(remainingFt / cellSizeFt);

  const cells = useMemo(
    () => cellsInRadius(token.x, token.y, radiusCells, gridCols, gridRows),
    [token.x, token.y, radiusCells, gridCols, gridRows],
  );

  const limitCells = useMemo(
    () => {
      if (radiusCells <= 0) return [];
      return cellsInRadius(token.x, token.y, radiusCells, gridCols, gridRows).filter(
        (c) => {
          const dist = Math.max(Math.abs(c.x - token.x), Math.abs(c.y - token.y));
          return dist === radiusCells;
        },
      );
    },
    [token.x, token.y, radiusCells, gridCols, gridRows],
  );

  if (radiusCells <= 0) return null;

  return (
    <>
      {cells.map((c) => {
        const isLimit = limitCells.some((l) => l.x === c.x && l.y === c.y);
        return (
          <div
            key={`mv_${c.x}_${c.y}`}
            className="pointer-events-none absolute"
            style={{
              left: c.x * scaledCell,
              top: c.y * scaledCell,
              width: scaledCell,
              height: scaledCell,
              backgroundColor: isLimit
                ? "rgba(253, 203, 110, 0.08)"
                : "rgba(0, 184, 148, 0.08)",
            }}
          />
        );
      })}
    </>
  );
}
