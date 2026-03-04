"use client";

import type { TerrainCell } from "@/lib/gameplay-mock-data";
import { TERRAIN_CATALOG } from "@/lib/terrain-catalog";
import { getTerrainCSSPattern } from "@/components/gameplay/map-canvas/terrain-patterns";

// Legacy type mapping for backward compat
const LEGACY_MAP: Record<string, string> = {
  difficult: "mud",
  water: "water_shallow",
};

interface TerrainOverlayProps {
  cells: TerrainCell[];
  scaledCell: number;
}

export function TerrainOverlay({ cells, scaledCell }: TerrainOverlayProps) {
  if (cells.length === 0) return null;

  return (
    <>
      {cells.map((cell) => {
        const mappedType = LEGACY_MAP[cell.type] ?? cell.type;
        const info = TERRAIN_CATALOG[mappedType];

        // Fallback for unknown types
        const color = info?.color ?? "rgba(255,255,255,0.05)";
        const borderColor = info?.borderColor ?? "transparent";
        const pattern =
          info?.pattern
            ? getTerrainCSSPattern(
                info.pattern.type,
                info.pattern.color,
                info.pattern.opacity,
                scaledCell,
              )
            : null;

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
              borderRight: `1px solid ${borderColor}`,
              borderBottom: `1px solid ${borderColor}`,
              ...(pattern && {
                backgroundImage: pattern.backgroundImage,
                backgroundSize: pattern.backgroundSize,
              }),
            }}
          >
            {info?.icon && scaledCell >= 28 && (
              <span
                className="pointer-events-none select-none opacity-40"
                style={{ fontSize: Math.max(8, scaledCell * 0.3) }}
              >
                {info.icon}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}
