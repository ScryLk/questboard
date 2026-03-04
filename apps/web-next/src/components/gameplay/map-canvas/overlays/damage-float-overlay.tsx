"use client";

import { useEffect } from "react";
import type { DamageFloat } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";

interface DamageFloatOverlayProps {
  floats: DamageFloat[];
  tokens: { id: string; x: number; y: number; size: number }[];
  scaledCell: number;
}

export function DamageFloatOverlay({
  floats,
  tokens,
  scaledCell,
}: DamageFloatOverlayProps) {
  const removeDamageFloat = useGameplayStore((s) => s.removeDamageFloat);

  useEffect(() => {
    if (floats.length === 0) return;
    const timers = floats.map((f) =>
      setTimeout(() => removeDamageFloat(f.id), 1500),
    );
    return () => timers.forEach(clearTimeout);
  }, [floats, removeDamageFloat]);

  return (
    <>
      {floats.map((f) => {
        const tok = tokens.find((t) => t.id === f.tokenId);
        if (!tok) return null;
        const cx = tok.x * scaledCell + (tok.size * scaledCell) / 2;
        const cy = tok.y * scaledCell;
        const elapsed = Date.now() - f.timestamp;
        const progress = Math.min(1, elapsed / 1500);
        const yOff = -40 * progress;
        const opacity = 1 - progress;

        return (
          <div
            key={f.id}
            className="pointer-events-none absolute text-center font-bold"
            style={{
              left: cx - 24,
              top: cy + yOff - 10,
              width: 48,
              opacity,
              fontSize: f.isCrit ? 18 : 14,
              color: f.isHeal ? "#00B894" : f.isCrit ? "#FDCB6E" : "#FF6B6B",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              transition: "transform 100ms linear",
            }}
          >
            {f.isHeal ? "+" : "-"}
            {f.amount}
            {f.isCrit && "!"}
          </div>
        );
      })}
    </>
  );
}
