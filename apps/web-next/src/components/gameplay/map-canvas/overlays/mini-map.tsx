"use client";

import { useCallback, useRef } from "react";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { MOCK_MAP, getAlignmentColor } from "@/lib/gameplay-mock-data";

interface MiniMapProps {
  tokens: GameToken[];
  viewportX: number;
  viewportY: number;
  viewportW: number;
  viewportH: number;
  canvasW: number;
  canvasH: number;
  onNavigate: (x: number, y: number) => void;
}

const MINI_W = 160;

export function MiniMap({
  tokens,
  viewportX,
  viewportY,
  viewportW,
  viewportH,
  canvasW,
  canvasH,
  onNavigate,
}: MiniMapProps) {
  const { gridCols, gridRows } = MOCK_MAP;
  const ratio = canvasH / canvasW;
  const miniH = MINI_W * ratio;
  const scaleX = MINI_W / canvasW;
  const scaleY = miniH / canvasH;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = mx / scaleX - viewportW / 2;
      const cy = my / scaleY - viewportH / 2;
      onNavigate(
        Math.max(0, Math.min(canvasW - viewportW, cx)),
        Math.max(0, Math.min(canvasH - viewportH, cy)),
      );
    },
    [scaleX, scaleY, viewportW, viewportH, canvasW, canvasH, onNavigate],
  );

  return (
    <div
      ref={containerRef}
      className="absolute bottom-12 left-3 z-20 cursor-pointer overflow-hidden rounded-lg border border-brand-border bg-[#0A0A0F]/90 shadow-lg"
      style={{ width: MINI_W, height: miniH }}
      onClick={handleClick}
    >
      {/* Grid lines (simplified) */}
      <svg className="absolute inset-0" width={MINI_W} height={miniH}>
        {/* Simplified grid — just draw every 5th line */}
        {Array.from({ length: Math.ceil(gridCols / 5) + 1 }).map((_, i) => {
          const x = (i * 5 * MINI_W) / gridCols;
          return (
            <line key={`mv${i}`} x1={x} y1={0} x2={x} y2={miniH} stroke="#1E1E2A" strokeWidth={0.5} />
          );
        })}
        {Array.from({ length: Math.ceil(gridRows / 5) + 1 }).map((_, i) => {
          const y = (i * 5 * miniH) / gridRows;
          return (
            <line key={`mh${i}`} x1={0} y1={y} x2={MINI_W} y2={y} stroke="#1E1E2A" strokeWidth={0.5} />
          );
        })}
      </svg>

      {/* Token dots */}
      {tokens
        .filter((t) => t.onMap)
        .map((token) => {
          const color = getAlignmentColor(token.alignment);
          const tx = ((token.x + 0.5) / gridCols) * MINI_W;
          const ty = ((token.y + 0.5) / gridRows) * miniH;
          const isDead = token.hp <= 0;
          return (
            <div
              key={token.id}
              className="absolute rounded-full"
              style={{
                left: tx - 2,
                top: ty - 2,
                width: 4,
                height: 4,
                backgroundColor: isDead ? "#555" : color,
                opacity: isDead ? 0.3 : 1,
              }}
            />
          );
        })}

      {/* Viewport rectangle */}
      <div
        className="absolute border border-brand-accent/60"
        style={{
          left: viewportX * scaleX,
          top: viewportY * scaleY,
          width: Math.min(viewportW * scaleX, MINI_W),
          height: Math.min(viewportH * scaleY, miniH),
          backgroundColor: "rgba(108, 92, 231, 0.06)",
        }}
      />
    </div>
  );
}
