"use client";

import { Circle, Triangle, Minus, Square } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { AOEShape, AOEColor } from "@/lib/gameplay-mock-data";

const SHAPES: { shape: AOEShape; icon: typeof Circle; label: string }[] = [
  { shape: "circle", icon: Circle, label: "Circulo" },
  { shape: "cone", icon: Triangle, label: "Cone" },
  { shape: "line", icon: Minus, label: "Linha" },
  { shape: "cube", icon: Square, label: "Cubo" },
];

const COLORS: { color: AOEColor; hex: string }[] = [
  { color: "red", hex: "#FF4444" },
  { color: "blue", hex: "#4488FF" },
  { color: "green", hex: "#00B894" },
  { color: "yellow", hex: "#FDCB6E" },
  { color: "purple", hex: "#6C5CE7" },
  { color: "white", hex: "#FFFFFF" },
];

export function AoeShapePicker() {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const aoeShape = useGameplayStore((s) => s.aoeShape);
  const aoeColor = useGameplayStore((s) => s.aoeColor);
  const setAoeShape = useGameplayStore((s) => s.setAoeShape);
  const setAoeColor = useGameplayStore((s) => s.setAoeColor);
  const clearAoe = useGameplayStore((s) => s.clearAoe);

  if (activeTool !== "aoe") return null;

  return (
    <div className="absolute left-1/2 top-14 z-40 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-brand-border bg-[#111116] px-3 py-2 shadow-xl">
      {/* Shapes */}
      <div className="flex items-center gap-1">
        {SHAPES.map(({ shape, icon: Icon, label }) => (
          <button
            key={shape}
            title={label}
            onClick={() => setAoeShape(shape)}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              aoeShape === shape
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
        {COLORS.map(({ color, hex }) => (
          <button
            key={color}
            title={color}
            onClick={() => setAoeColor(color)}
            className={`flex h-5 w-5 items-center justify-center rounded-full transition-shadow ${
              aoeColor === color ? "ring-2 ring-white/40" : ""
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      <div className="h-5 w-px bg-brand-border" />

      {/* Clear all */}
      <button
        onClick={clearAoe}
        className="rounded-md px-2 py-1 text-[10px] font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
      >
        Limpar
      </button>
    </div>
  );
}
