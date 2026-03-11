"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import { Move, Eye, Trash2 } from "lucide-react";

export function GridAlignmentPanel() {
  const mapBackgroundImage = useGameplayStore((s) => s.mapBackgroundImage);
  const mapBackgroundOpacity = useGameplayStore((s) => s.mapBackgroundOpacity);
  const mapGridOffsetX = useGameplayStore((s) => s.mapGridOffsetX);
  const mapGridOffsetY = useGameplayStore((s) => s.mapGridOffsetY);
  const setMapBackgroundOpacity = useGameplayStore((s) => s.setMapBackgroundOpacity);
  const setMapGridOffset = useGameplayStore((s) => s.setMapGridOffset);
  const setMapBackgroundImage = useGameplayStore((s) => s.setMapBackgroundImage);

  if (!mapBackgroundImage) return null;

  return (
    <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-brand-surface/95 px-4 py-2.5 shadow-xl backdrop-blur-sm">
      {/* Offset controls */}
      <div className="flex items-center gap-2">
        <Move className="h-3.5 w-3.5 text-brand-muted" />
        <label className="text-[10px] text-brand-muted">X</label>
        <input
          type="number"
          value={mapGridOffsetX}
          onChange={(e) => setMapGridOffset(Number(e.target.value), mapGridOffsetY)}
          className="h-7 w-14 rounded border border-brand-border bg-brand-primary px-1.5 text-center text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        />
        <label className="text-[10px] text-brand-muted">Y</label>
        <input
          type="number"
          value={mapGridOffsetY}
          onChange={(e) => setMapGridOffset(mapGridOffsetX, Number(e.target.value))}
          className="h-7 w-14 rounded border border-brand-border bg-brand-primary px-1.5 text-center text-xs text-brand-text focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10" />

      {/* Opacity slider */}
      <div className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 text-brand-muted" />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(mapBackgroundOpacity * 100)}
          onChange={(e) => setMapBackgroundOpacity(Number(e.target.value) / 100)}
          className="h-1 w-20 cursor-pointer accent-brand-accent"
        />
        <span className="w-8 text-right text-[10px] text-brand-muted">
          {Math.round(mapBackgroundOpacity * 100)}%
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10" />

      {/* Remove */}
      <button
        onClick={() => setMapBackgroundImage(null)}
        className="flex h-7 items-center gap-1 rounded px-2 text-[10px] text-red-400 transition-colors hover:bg-red-500/10"
        title="Remover imagem de fundo"
      >
        <Trash2 className="h-3 w-3" />
        Remover
      </button>
    </div>
  );
}
