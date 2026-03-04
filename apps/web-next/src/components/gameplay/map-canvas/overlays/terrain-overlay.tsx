"use client";

import type { TerrainCell } from "@/lib/gameplay-mock-data";
import { TERRAIN_TYPES } from "@/lib/gameplay-mock-data";

interface TerrainOverlayProps {
  cells: TerrainCell[];
  scaledCell: number;
}

function getTerrainColor(type: string): string {
  const found = TERRAIN_TYPES.find((t) => t.key === type);
  return found?.color ?? "transparent";
}

function getTerrainPattern(type: string): string | null {
  switch (type) {
    case "difficult":
      return "///";
    case "water":
      return "~~~";
    case "lava":
      return "***";
    case "pit":
      return "XXX";
    case "ice":
      return "...";
    default:
      return null;
  }
}

export function TerrainOverlay({ cells, scaledCell }: TerrainOverlayProps) {
  if (cells.length === 0) return null;

  return (
    <>
      {cells.map((cell) => {
        const color = getTerrainColor(cell.type);
        const pattern = getTerrainPattern(cell.type);
        return (
          <div
            key={`terrain_${cell.x}_${cell.y}`}
            className="pointer-events-none absolute flex items-center justify-center"
            style={{
              left: cell.x * scaledCell,
              top: cell.y * scaledCell,
              width: scaledCell,
              height: scaledCell,
              backgroundColor: color,
            }}
          >
            {pattern && scaledCell >= 24 && (
              <span
                className="select-none font-mono text-white/20"
                style={{ fontSize: Math.max(6, scaledCell * 0.2) }}
              >
                {pattern}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}
