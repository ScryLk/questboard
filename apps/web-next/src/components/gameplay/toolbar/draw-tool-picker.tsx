"use client";

import { Eraser, Minus, Pen, Square, Trash2, Undo2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { DrawingTool, TerrainType } from "@/lib/gameplay-mock-data";
import { TERRAIN_TYPES } from "@/lib/gameplay-mock-data";

const DRAW_TOOLS: { tool: DrawingTool; icon: typeof Pen; label: string }[] = [
  { tool: "freehand", icon: Pen, label: "Livre" },
  { tool: "line", icon: Minus, label: "Linha" },
  { tool: "rect", icon: Square, label: "Retangulo" },
  { tool: "eraser", icon: Eraser, label: "Apagar" },
];

const COLORS = ["#FF4444", "#4488FF", "#00B894", "#FDCB6E", "#6C5CE7", "#FFFFFF"];

export function DrawToolPicker() {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const drawingTool = useGameplayStore((s) => s.drawingTool);
  const drawColor = useGameplayStore((s) => s.drawColor);
  const setDrawingTool = useGameplayStore((s) => s.setDrawingTool);
  const setDrawColor = useGameplayStore((s) => s.setDrawColor);
  const undoStroke = useGameplayStore((s) => s.undoStroke);
  const clearStrokes = useGameplayStore((s) => s.clearStrokes);
  const activeTerrainType = useGameplayStore((s) => s.activeTerrainType);
  const setActiveTerrainType = useGameplayStore((s) => s.setActiveTerrainType);
  const clearTerrain = useGameplayStore((s) => s.clearTerrain);

  if (activeTool !== "draw") return null;

  return (
    <div className="absolute left-1/2 top-14 z-40 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-brand-border bg-[#111116] px-3 py-2 shadow-xl">
      {/* Draw tools */}
      <div className="flex items-center gap-1">
        {DRAW_TOOLS.map(({ tool, icon: Icon, label }) => (
          <button
            key={tool}
            title={label}
            onClick={() => setDrawingTool(tool)}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              drawingTool === tool
                ? "bg-brand-accent text-white"
                : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Colors */}
      <div className="flex items-center gap-1">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setDrawColor(color)}
            className={`h-5 w-5 rounded-full transition-shadow ${
              drawColor === color ? "ring-2 ring-white/40" : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Terrain */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-brand-muted">Terreno:</span>
        <select
          value={activeTerrainType}
          onChange={(e) => setActiveTerrainType(e.target.value as TerrainType)}
          className="h-6 rounded border border-brand-border bg-brand-primary px-1 text-[10px] text-brand-text outline-none"
        >
          {TERRAIN_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Actions */}
      <button
        onClick={undoStroke}
        title="Desfazer"
        className="flex h-7 w-7 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => { clearStrokes(); clearTerrain(); }}
        title="Limpar tudo"
        className="flex h-7 w-7 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
