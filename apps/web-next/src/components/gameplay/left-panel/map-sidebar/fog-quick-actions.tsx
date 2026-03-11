"use client";

import { useState } from "react";
import { Cloud, Sun, Target } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { MOCK_MAP } from "@/lib/gameplay-mock-data";
import { FOG_STYLE_LABELS, FOG_COLOR_LABELS } from "@/lib/map-sidebar-types";
import type { QuickFogStyle, QuickFogColor } from "@/lib/map-sidebar-types";

export function FogQuickActions() {
  const fogCells = useGameplayStore((s) => s.fogCells);
  const addFogCells = useGameplayStore((s) => s.addFogCells);
  const clearFog = useGameplayStore((s) => s.clearFog);
  const removeFogCells = useGameplayStore((s) => s.removeFogCells);
  const tokens = useGameplayStore((s) => s.tokens);
  const fogSettings = useGameplayStore((s) => s.fogSettings);
  const setFogSettings = useGameplayStore((s) => s.setFogSettings);

  const [revealRadius, setRevealRadius] = useState(3);

  function handleCoverAll() {
    const cells: { x: number; y: number }[] = [];
    for (let y = 0; y < MOCK_MAP.gridRows; y++) {
      for (let x = 0; x < MOCK_MAP.gridCols; x++) {
        cells.push({ x, y });
      }
    }
    addFogCells(cells);
  }

  function handleRevealAroundPlayers() {
    const playerTokens = tokens.filter(
      (t) => t.onMap && t.alignment === "player",
    );
    const cellsToReveal: { x: number; y: number }[] = [];

    playerTokens.forEach((token) => {
      for (let dy = -revealRadius; dy <= revealRadius; dy++) {
        for (let dx = -revealRadius; dx <= revealRadius; dx++) {
          if (Math.sqrt(dx * dx + dy * dy) <= revealRadius) {
            const nx = token.x + dx;
            const ny = token.y + dy;
            if (
              nx >= 0 &&
              nx < MOCK_MAP.gridCols &&
              ny >= 0 &&
              ny < MOCK_MAP.gridRows
            ) {
              cellsToReveal.push({ x: nx, y: ny });
            }
          }
        }
      }
    });

    if (cellsToReveal.length > 0) {
      removeFogCells(cellsToReveal);
    }
  }

  // Map fogSettings.style to our QuickFogStyle
  const currentStyle: QuickFogStyle =
    fogSettings.style === "fog"
      ? "mist"
      : fogSettings.style === "shadows"
        ? "shadow"
        : "solid";

  const currentColor: QuickFogColor =
    (fogSettings.color as QuickFogColor) || "gray";

  function handleStyleChange(style: QuickFogStyle) {
    const mapped =
      style === "mist" ? "fog" : style === "shadow" ? "shadows" : "solid";
    setFogSettings({ style: mapped as "fog" | "shadows" | "solid" });
  }

  return (
    <div className="space-y-2">
      {/* Quick buttons */}
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={handleCoverAll}
          className="flex items-center justify-center gap-1 rounded-md bg-white/[0.04] py-1.5 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
        >
          <Cloud className="h-3 w-3" />
          Cobrir Tudo
        </button>
        <button
          onClick={clearFog}
          className="flex items-center justify-center gap-1 rounded-md bg-white/[0.04] py-1.5 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.08] hover:text-brand-text"
        >
          <Sun className="h-3 w-3" />
          Revelar Tudo
        </button>
      </div>

      {/* Reveal around players */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleRevealAroundPlayers}
          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-brand-accent/10 py-1.5 text-[9px] text-brand-accent transition-colors hover:bg-brand-accent/20"
        >
          <Target className="h-3 w-3" />
          Revelar ao Redor
        </button>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-brand-muted">Raio:</span>
          <select
            value={revealRadius}
            onChange={(e) => setRevealRadius(parseInt(e.target.value))}
            className="h-5 w-10 rounded border border-brand-border bg-brand-primary px-0.5 text-center text-[9px] text-brand-text outline-none focus:border-brand-accent/40"
          >
            {[1, 2, 3, 4, 5, 6].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Style & Color */}
      <div className="flex gap-2">
        <div className="flex-1">
          <span className="mb-1 block text-[8px] text-brand-muted">Estilo</span>
          <select
            value={currentStyle}
            onChange={(e) => handleStyleChange(e.target.value as QuickFogStyle)}
            className="h-5 w-full rounded border border-brand-border bg-brand-primary px-1 text-[9px] text-brand-text outline-none focus:border-brand-accent/40"
          >
            {Object.entries(FOG_STYLE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <span className="mb-1 block text-[8px] text-brand-muted">Cor</span>
          <select
            value={currentColor}
            onChange={(e) =>
              setFogSettings({ color: e.target.value as "gray" | "blue" | "red" | "green" })
            }
            className="h-5 w-full rounded border border-brand-border bg-brand-primary px-1 text-[9px] text-brand-text outline-none focus:border-brand-accent/40"
          >
            {Object.entries(FOG_COLOR_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fog coverage info */}
      <div className="text-[8px] text-brand-muted">
        {fogCells.size} células com fog (
        {Math.round(
          (fogCells.size / (MOCK_MAP.gridCols * MOCK_MAP.gridRows)) * 100,
        )}
        %)
      </div>
    </div>
  );
}
