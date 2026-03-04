"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import { TERRAIN_CATALOG } from "@/lib/terrain-catalog";

interface TerrainRectPreviewProps {
  scaledCell: number;
}

export function TerrainRectPreview({ scaledCell }: TerrainRectPreviewProps) {
  const preview = useGameplayStore((s) => s.terrainRectPreview);
  const activeTerrainType = useGameplayStore((s) => s.activeTerrainType);

  if (!preview) return null;

  const info = TERRAIN_CATALOG[activeTerrainType];
  const color = info?.color ?? "rgba(255,255,255,0.1)";

  const minX = Math.min(preview.x1, preview.x2);
  const minY = Math.min(preview.y1, preview.y2);
  const maxX = Math.max(preview.x1, preview.x2);
  const maxY = Math.max(preview.y1, preview.y2);

  return (
    <div
      className="pointer-events-none absolute border-2 border-dashed border-white/40"
      style={{
        left: minX * scaledCell,
        top: minY * scaledCell,
        width: (maxX - minX + 1) * scaledCell,
        height: (maxY - minY + 1) * scaledCell,
        backgroundColor: color,
        opacity: 0.5,
      }}
    />
  );
}
