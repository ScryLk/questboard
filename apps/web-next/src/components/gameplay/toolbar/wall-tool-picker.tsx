"use client";

import { Minus, RectangleHorizontal, Eraser, Trash2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { WallType, WallStyle, WallDrawMode } from "@/lib/gameplay-mock-data";

const WALL_TYPES: { type: WallType; label: string; shortLabel: string }[] = [
  { type: "wall", label: "Parede solida", shortLabel: "Parede" },
  { type: "door-closed", label: "Porta fechada", shortLabel: "Porta" },
  { type: "window", label: "Janela (bloqueia movimento, nao visao)", shortLabel: "Janela" },
  { type: "half-wall", label: "Meia-parede (bloqueia movimento, visao parcial)", shortLabel: "Meia" },
  { type: "secret", label: "Passagem secreta (so GM ve)", shortLabel: "Secreta" },
  { type: "portcullis", label: "Grade (bloqueia movimento, nao visao)", shortLabel: "Grade" },
];

const WALL_STYLES: { style: WallStyle; label: string; color: string }[] = [
  { style: "stone", label: "Pedra", color: "#777780" },
  { style: "wood", label: "Madeira", color: "#8B6040" },
  { style: "metal", label: "Metal", color: "#A0A0B0" },
  { style: "magic", label: "Magica", color: "#8855DD" },
  { style: "natural", label: "Natural", color: "#666660" },
  { style: "brick", label: "Tijolo", color: "#995533" },
];

const DRAW_MODES: { mode: WallDrawMode; icon: typeof Minus; label: string }[] = [
  { mode: "line", icon: Minus, label: "Linha" },
  { mode: "rectangle", icon: RectangleHorizontal, label: "Retangulo" },
  { mode: "erase", icon: Eraser, label: "Apagar" },
];

export function WallToolPicker() {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const activeWallEdgeType = useGameplayStore((s) => s.activeWallEdgeType);
  const activeWallStyle = useGameplayStore((s) => s.activeWallStyle);
  const wallDrawMode = useGameplayStore((s) => s.wallDrawMode);
  const setActiveWallEdgeType = useGameplayStore((s) => s.setActiveWallEdgeType);
  const setActiveWallStyle = useGameplayStore((s) => s.setActiveWallStyle);
  const setWallDrawMode = useGameplayStore((s) => s.setWallDrawMode);
  const clearWallEdges = useGameplayStore((s) => s.clearWallEdges);

  if (activeTool !== "wall") return null;

  return (
    <div className="absolute left-1/2 top-14 z-40 flex w-[420px] -translate-x-1/2 flex-col gap-2 rounded-lg border border-brand-border bg-[#111116] p-3 shadow-xl">
      {/* Wall types */}
      <div className="flex items-center gap-1">
        {WALL_TYPES.map(({ type, label, shortLabel }) => (
          <button
            key={type}
            title={label}
            onClick={() => setActiveWallEdgeType(type)}
            className={`flex h-6 flex-1 items-center justify-center rounded px-1 text-[9px] transition-colors ${
              activeWallEdgeType === type
                ? "bg-brand-accent text-white font-semibold"
                : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
            }`}
          >
            {shortLabel}
          </button>
        ))}
      </div>

      <div className="h-px bg-brand-border" />

      {/* Draw mode + Style */}
      <div className="flex items-center gap-2">
        {/* Draw modes */}
        <div className="flex items-center gap-1">
          {DRAW_MODES.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              title={label}
              onClick={() => setWallDrawMode(mode)}
              className={`flex h-6 items-center gap-1 rounded px-2 text-[9px] transition-colors ${
                wallDrawMode === mode
                  ? "bg-brand-accent text-white"
                  : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-brand-border" />

        {/* Wall style */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-brand-muted">Estilo:</span>
          {WALL_STYLES.map(({ style, label, color }) => (
            <button
              key={style}
              title={label}
              onClick={() => setActiveWallStyle(style)}
              className={`flex h-5 w-5 items-center justify-center rounded-sm transition-colors ${
                activeWallStyle === style
                  ? "ring-1 ring-brand-accent ring-offset-1 ring-offset-[#111116]"
                  : "hover:ring-1 hover:ring-brand-border"
              }`}
            >
              <span
                className="block h-3 w-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-brand-border" />

      {/* Instructions + Clear */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-[8px] text-brand-muted">
          <span>Click: colocar | Click em existente: remover</span>
          <span>Shift+Click: criar porta | Double-click porta: abrir/fechar</span>
        </div>
        <button
          onClick={clearWallEdges}
          title="Limpar todas as paredes"
          className="flex h-6 w-6 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
