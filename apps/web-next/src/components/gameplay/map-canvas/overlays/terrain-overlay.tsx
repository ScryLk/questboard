"use client";

import type { TerrainCell } from "@/lib/gameplay-mock-data";
import { TERRAIN_CATALOG } from "@/lib/terrain-catalog";
import { getTerrainCSSPattern } from "@/components/gameplay/map-canvas/terrain-patterns";
import { hasProceduralTexture } from "@/lib/terrain-texture-generator";
import { PixiTerrainLayer } from "@/components/gameplay/map-canvas/pixi-terrain-layer";

// Legacy type mapping for backward compat
const LEGACY_MAP: Record<string, string> = {
  difficult: "mud",
  water: "water_shallow",
};

interface TerrainOverlayProps {
  cells: TerrainCell[];
  scaledCell: number;
  gridCols: number;
  gridRows: number;
}

export function TerrainOverlay({ cells, scaledCell, gridCols, gridRows }: TerrainOverlayProps) {
  if (cells.length === 0) return null;

  // Separate cells: procedural (Pixi.js) vs CSS fallback
  const pixiCells: TerrainCell[] = [];
  const fallbackCells: TerrainCell[] = [];

  for (const cell of cells) {
    const mappedType = LEGACY_MAP[cell.type] ?? cell.type;
    if (hasProceduralTexture(mappedType)) {
      pixiCells.push(mappedType !== cell.type ? { ...cell, type: mappedType as TerrainCell["type"] } : cell);
    } else {
      fallbackCells.push(cell);
    }
  }

  return (
    <>
      {pixiCells.length > 0 && (
        <PixiTerrainLayer
          cells={pixiCells}
          scaledCell={scaledCell}
          gridCols={gridCols}
          gridRows={gridRows}
        />
      )}
      {fallbackCells.map((cell) => {
        const mappedType = LEGACY_MAP[cell.type] ?? cell.type;
        const info = TERRAIN_CATALOG[mappedType];

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
