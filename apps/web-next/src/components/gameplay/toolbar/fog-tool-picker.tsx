"use client";

import { Cloud, Eye, Square, Trash2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { FogStyle, FogColor } from "@/lib/gameplay-mock-data";
import { FOG_COLOR_THEMES } from "@/lib/gameplay-mock-data";

const STYLES: { style: FogStyle; icon: typeof Cloud; label: string }[] = [
  { style: "fog", icon: Cloud, label: "Nevoa" },
  { style: "shadows", icon: Eye, label: "Sombras" },
  { style: "solid", icon: Square, label: "Solido" },
];

const COLORS: { color: FogColor; hex: string }[] = [
  { color: "gray", hex: FOG_COLOR_THEMES.gray.accent },
  { color: "blue", hex: FOG_COLOR_THEMES.blue.accent },
  { color: "red", hex: FOG_COLOR_THEMES.red.accent },
  { color: "green", hex: FOG_COLOR_THEMES.green.accent },
];

export function FogToolPicker() {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const fogSettings = useGameplayStore((s) => s.fogSettings);
  const setFogSettings = useGameplayStore((s) => s.setFogSettings);
  const clearFog = useGameplayStore((s) => s.clearFog);

  if (activeTool !== "fog") return null;

  return (
    <div className="absolute left-1/2 top-14 z-40 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-brand-border bg-[#111116] px-3 py-2 shadow-xl">
      {/* Style */}
      <div className="flex items-center gap-1">
        {STYLES.map(({ style, icon: Icon, label }) => (
          <button
            key={style}
            title={label}
            onClick={() => setFogSettings({ style })}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              fogSettings.style === style
                ? "bg-brand-accent text-white"
                : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Color */}
      <div className="flex items-center gap-1">
        {COLORS.map(({ color, hex }) => (
          <button
            key={color}
            title={color}
            onClick={() => setFogSettings({ color })}
            className={`h-5 w-5 rounded-full transition-shadow ${
              fogSettings.color === color ? "ring-2 ring-white/40" : ""
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Density slider */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-brand-muted">Densidade</span>
        <input
          type="range"
          min={30}
          max={100}
          value={Math.round(fogSettings.density * 100)}
          onChange={(e) => setFogSettings({ density: Number(e.target.value) / 100 })}
          className="h-1 w-14 cursor-pointer accent-brand-accent"
        />
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Speed slider */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-brand-muted">Velocidade</span>
        <input
          type="range"
          min={0}
          max={200}
          value={Math.round(fogSettings.speed * 100)}
          onChange={(e) => setFogSettings({ speed: Number(e.target.value) / 100 })}
          className="h-1 w-14 cursor-pointer accent-brand-accent"
        />
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Toggles */}
      <label className="flex cursor-pointer items-center gap-1">
        <input
          type="checkbox"
          checked={fogSettings.softEdges}
          onChange={(e) => setFogSettings({ softEdges: e.target.checked })}
          className="h-3 w-3 accent-brand-accent"
        />
        <span className="text-[10px] text-brand-muted">Bordas</span>
      </label>
      <label className="flex cursor-pointer items-center gap-1">
        <input
          type="checkbox"
          checked={fogSettings.revealAnimation}
          onChange={(e) => setFogSettings({ revealAnimation: e.target.checked })}
          className="h-3 w-3 accent-brand-accent"
        />
        <span className="text-[10px] text-brand-muted">Animacao</span>
      </label>

      <div className="h-5 w-px bg-brand-border" />

      {/* Clear */}
      <button
        onClick={clearFog}
        title="Limpar fog"
        className="flex h-7 w-7 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
