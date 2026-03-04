"use client";

import { useEffect } from "react";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { getAlignmentColor, gridDistance, MOCK_MAP } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";

interface AttackLineOverlayProps {
  attackerId: string;
  targetId: string;
  roll: number | null;
  damage: number | null;
  tokens: GameToken[];
  scaledCell: number;
}

export function AttackLineOverlay({
  attackerId,
  targetId,
  roll,
  damage,
  tokens,
  scaledCell,
}: AttackLineOverlayProps) {
  const clearAttackLine = useGameplayStore((s) => s.clearAttackLine);
  const attacker = tokens.find((t) => t.id === attackerId);
  const target = tokens.find((t) => t.id === targetId);

  // Auto-clear after 4 seconds
  useEffect(() => {
    const timer = setTimeout(clearAttackLine, 4000);
    return () => clearTimeout(timer);
  }, [clearAttackLine]);

  if (!attacker || !target) return null;

  const x1 = attacker.x * scaledCell + scaledCell / 2;
  const y1 = attacker.y * scaledCell + scaledCell / 2;
  const x2 = target.x * scaledCell + scaledCell / 2;
  const y2 = target.y * scaledCell + scaledCell / 2;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dist = gridDistance(attacker.x, attacker.y, target.x, target.y, MOCK_MAP.cellSizeFt);
  const color = getAlignmentColor(attacker.alignment);
  const isHit = roll !== null && target.ac !== undefined && roll >= target.ac;

  return (
    <>
      {/* Attack line SVG */}
      <svg className="pointer-events-none absolute inset-0" style={{ overflow: "visible" }}>
        {/* Glow */}
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={isHit ? "#FF4444" : "#6C5CE7"}
          strokeWidth={4}
          strokeOpacity={0.3}
        />
        {/* Main line */}
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={isHit ? "#FF4444" : "#6C5CE7"}
          strokeWidth={2}
          strokeDasharray="6 3"
          strokeOpacity={0.8}
        />
        {/* Attacker indicator */}
        <circle cx={x1} cy={y1} r={6} fill={color} stroke="white" strokeWidth={1} />
        {/* Target indicator */}
        <circle cx={x2} cy={y2} r={6} fill="none" stroke={isHit ? "#FF4444" : "#6C5CE7"} strokeWidth={2} />
        {/* Arrow head */}
        {(() => {
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLen = 10;
          const p1x = x2 - headLen * Math.cos(angle - Math.PI / 6);
          const p1y = y2 - headLen * Math.sin(angle - Math.PI / 6);
          const p2x = x2 - headLen * Math.cos(angle + Math.PI / 6);
          const p2y = y2 - headLen * Math.sin(angle + Math.PI / 6);
          return (
            <polygon
              points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`}
              fill={isHit ? "#FF4444" : "#6C5CE7"}
              opacity={0.8}
            />
          );
        })()}
      </svg>

      {/* Popover at midpoint */}
      <div
        className="pointer-events-none absolute z-30"
        style={{ left: midX - 60, top: midY - 40 }}
      >
        <div className="rounded-lg border border-brand-border bg-[#111116] px-3 py-2 shadow-xl">
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-brand-muted">Dist:</span>
              <span className="font-semibold tabular-nums text-brand-text">{dist}ft</span>
            </div>
            {roll !== null && (
              <div className="flex items-center gap-1">
                <span className="text-brand-muted">Ataque:</span>
                <span className={`font-bold tabular-nums ${isHit ? "text-brand-success" : "text-brand-danger"}`}>
                  {roll}
                </span>
                <span className="text-brand-muted">vs CA {target.ac}</span>
              </div>
            )}
          </div>
          {damage !== null && isHit && (
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span className="text-brand-muted">Dano:</span>
              <span className="font-bold tabular-nums text-brand-danger">{damage}</span>
            </div>
          )}
          {roll !== null && (
            <div className="mt-1 text-center">
              <span className={`text-[10px] font-semibold ${isHit ? "text-brand-success" : "text-brand-danger"}`}>
                {isHit ? "ACERTOU" : "ERROU"}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
