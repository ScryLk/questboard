"use client";

import { useMemo } from "react";
import { getOAThreateningTokens } from "@/lib/reactions";
import type { GameToken } from "@/lib/gameplay-mock-data";

interface OAPreviewOverlayProps {
  draggedTokenId: string;
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
  tokens: GameToken[];
  reactionUsedMap: Record<string, boolean>;
  isDisengaging: boolean;
  scaledCell: number;
  cellSizeFt: number;
}

export function OAPreviewOverlay({
  draggedTokenId,
  originX,
  originY,
  currentX,
  currentY,
  tokens,
  reactionUsedMap,
  isDisengaging,
  scaledCell,
  cellSizeFt,
}: OAPreviewOverlayProps) {
  const threateningIds = useMemo(
    () =>
      getOAThreateningTokens(
        draggedTokenId,
        originX,
        originY,
        currentX,
        currentY,
        tokens,
        reactionUsedMap,
        isDisengaging,
        cellSizeFt,
      ),
    [draggedTokenId, originX, originY, currentX, currentY, tokens, reactionUsedMap, isDisengaging, cellSizeFt],
  );

  if (threateningIds.length === 0) return null;

  const half = scaledCell / 2;

  return (
    <svg className="pointer-events-none absolute inset-0" style={{ overflow: "visible" }}>
      {threateningIds.map((reactorId) => {
        const reactor = tokens.find((t) => t.id === reactorId);
        if (!reactor) return null;

        const rx = reactor.x * scaledCell + half;
        const ry = reactor.y * scaledCell + half;
        const ox = originX * scaledCell + half;
        const oy = originY * scaledCell + half;

        return (
          <g key={reactorId}>
            {/* Dashed line from reactor to origin */}
            <line
              x1={rx}
              y1={ry}
              x2={ox}
              y2={oy}
              stroke="#EF4444"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={0.6}
            />

            {/* Red ring around reactor */}
            <circle
              cx={rx}
              cy={ry}
              r={half * 0.55}
              fill="none"
              stroke="#EF4444"
              strokeWidth={2}
              opacity={0.7}
            >
              <animate
                attributeName="opacity"
                values="0.7;0.3;0.7"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* "AO!" label */}
            <text
              x={rx}
              y={ry - half * 0.7}
              textAnchor="middle"
              fontSize={Math.max(9, scaledCell * 0.22)}
              fontWeight="bold"
              fill="#EF4444"
              opacity={0.9}
            >
              AO!
            </text>
          </g>
        );
      })}
    </svg>
  );
}
