"use client";

import { Trash2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { WallMaterial } from "@/lib/gameplay-mock-data";

const WALL_TYPES: { type: WallMaterial; label: string; color: string }[] = [
  { type: "stone", label: "Pedra", color: "#8B7355" },
  { type: "wood", label: "Madeira", color: "#A0764D" },
  { type: "iron", label: "Ferro", color: "#7A8B99" },
  { type: "magic", label: "Magica", color: "#9B6CE7" },
];

export function WallToolPicker() {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const activeWallType = useGameplayStore((s) => s.activeWallType);
  const setActiveWallType = useGameplayStore((s) => s.setActiveWallType);
  const clearWalls = useGameplayStore((s) => s.clearWalls);

  if (activeTool !== "wall") return null;

  return (
    <div className="absolute left-1/2 top-14 z-40 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-brand-border bg-[#111116] px-3 py-2 shadow-xl">
      {/* Wall type */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-brand-muted">Tipo:</span>
        {WALL_TYPES.map(({ type, label, color }) => (
          <button
            key={type}
            title={label}
            onClick={() => setActiveWallType(type)}
            className={`flex h-6 items-center gap-1 rounded px-2 text-[10px] transition-colors ${
              activeWallType === type
                ? "bg-white/10 font-semibold text-brand-text"
                : "text-brand-muted hover:bg-white/[0.04] hover:text-brand-text"
            }`}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: color }}
            />
            {label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Instructions */}
      <div className="flex flex-col text-[9px] text-brand-muted">
        <span>Click: parede | Shift+Click: porta</span>
        <span>Click na porta: abrir/fechar</span>
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Clear */}
      <button
        onClick={clearWalls}
        title="Limpar paredes"
        className="flex h-7 w-7 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
