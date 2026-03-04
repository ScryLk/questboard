"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import { TERRAIN_CATALOG } from "@/lib/terrain-catalog";

interface TerrainBrushPreviewProps {
  scaledCell: number;
  gridCols: number;
  gridRows: number;
}

export function getBrushCells(
  cx: number,
  cy: number,
  size: number,
  maxCols: number,
  maxRows: number,
): { x: number; y: number }[] {
  const offset = Math.floor(size / 2);
  const cells: { x: number; y: number }[] = [];
  for (let dx = 0; dx < size; dx++) {
    for (let dy = 0; dy < size; dy++) {
      const x = cx - offset + dx;
      const y = cy - offset + dy;
      if (x >= 0 && y >= 0 && x < maxCols && y < maxRows) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

export function TerrainBrushPreview({
  scaledCell,
  gridCols,
  gridRows,
}: TerrainBrushPreviewProps) {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const editorTool = useGameplayStore((s) => s.terrainEditorTool);
  const brushSize = useGameplayStore((s) => s.terrainBrushSize);
  const hoverCell = useGameplayStore((s) => s.hoverCell);
  const activeTerrainType = useGameplayStore((s) => s.activeTerrainType);

  if (activeTool !== "terrain") return null;
  if (!hoverCell) return null;
  if (editorTool !== "brush" && editorTool !== "eraser") return null;

  const cells = getBrushCells(hoverCell.x, hoverCell.y, brushSize, gridCols, gridRows);
  const isEraser = editorTool === "eraser";
  const info = TERRAIN_CATALOG[activeTerrainType];
  const color = isEraser ? "rgba(255,60,60,0.15)" : (info?.color ?? "rgba(255,255,255,0.1)");

  return (
    <>
      {cells.map((c) => (
        <div
          key={`brush_${c.x}_${c.y}`}
          className="pointer-events-none absolute"
          style={{
            left: c.x * scaledCell,
            top: c.y * scaledCell,
            width: scaledCell,
            height: scaledCell,
            backgroundColor: color,
            opacity: 0.5,
            border: isEraser ? "1px dashed rgba(255,60,60,0.4)" : "1px solid rgba(255,255,255,0.15)",
          }}
        />
      ))}
    </>
  );
}
