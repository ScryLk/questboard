"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import type { WallType, WallStyle, WallData } from "@/lib/gameplay-mock-data";
import { getWallRenderLine, type NearestEdge } from "@/lib/wall-helpers";

interface WallRendererProps {
  scaledCell: number;
  canvasW: number;
  canvasH: number;
  hoverEdge: NearestEdge | null;
}

// ── Visual config per wall type ──

interface WallVisual {
  color: string;
  thickness: number;
  dash?: string;
  alpha: number;
  doorIcon?: string;
}

const WALL_TYPE_VISUALS: Record<WallType, WallVisual> = {
  "wall":        { color: "#888888", thickness: 4, alpha: 1.0 },
  "door-closed": { color: "#C8A050", thickness: 4, alpha: 1.0, doorIcon: "▯" },
  "door-open":   { color: "#C8A050", thickness: 2, dash: "4,4", alpha: 0.5, doorIcon: "○" },
  "door-locked": { color: "#C8A050", thickness: 4, alpha: 1.0, doorIcon: "🔒" },
  "window":      { color: "#6BB8E0", thickness: 3, dash: "6,3", alpha: 0.8 },
  "half-wall":   { color: "#888888", thickness: 3, dash: "8,2", alpha: 0.8 },
  "secret":      { color: "#AA55CC", thickness: 2, dash: "3,5", alpha: 0.4 },
  "illusory":    { color: "#CC55AA", thickness: 2, dash: "2,4", alpha: 0.3 },
  "portcullis":  { color: "#999999", thickness: 3, dash: "2,2", alpha: 0.9 },
};

// ── Style colors (material) ──

const WALL_STYLE_COLORS: Record<WallStyle, string> = {
  stone:   "#777780",
  wood:    "#8B6040",
  metal:   "#A0A0B0",
  magic:   "#8855DD",
  natural: "#666660",
  brick:   "#995533",
};

function getEdgeColor(data: WallData): string {
  // Wall and half-wall use the style color; others use the type-specific color
  if (data.type === "wall" || data.type === "half-wall") {
    return WALL_STYLE_COLORS[data.style];
  }
  return WALL_TYPE_VISUALS[data.type].color;
}

function getEdgeVisual(data: WallData): WallVisual {
  const visual = WALL_TYPE_VISUALS[data.type];
  return { ...visual, color: getEdgeColor(data) };
}

export function WallRenderer({
  scaledCell,
  canvasW,
  canvasH,
  hoverEdge,
}: WallRendererProps) {
  const wallEdges = useGameplayStore((s) => s.wallEdges);
  const activeTool = useGameplayStore((s) => s.activeTool);
  const activeWallEdgeType = useGameplayStore((s) => s.activeWallEdgeType);
  const activeWallStyle = useGameplayStore((s) => s.activeWallStyle);
  const wallDrawMode = useGameplayStore((s) => s.wallDrawMode);

  const entries = Object.entries(wallEdges);

  if (entries.length === 0 && !hoverEdge) return null;

  const hoverColor = activeWallEdgeType === "wall" || activeWallEdgeType === "half-wall"
    ? WALL_STYLE_COLORS[activeWallStyle]
    : WALL_TYPE_VISUALS[activeWallEdgeType].color;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={canvasW}
      height={canvasH}
      style={{ zIndex: 5 }}
    >
      {entries.map(([key, data]) => {
        const line = getWallRenderLine(key, scaledCell);
        const visual = getEdgeVisual(data);
        const midX = (line.x1 + line.x2) / 2;
        const midY = (line.y1 + line.y2) / 2;

        return (
          <g key={key}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={visual.color}
              strokeWidth={visual.thickness}
              strokeDasharray={visual.dash}
              strokeLinecap="round"
              opacity={visual.alpha}
            />
            {/* Junction dots at endpoints for thick walls */}
            {visual.thickness >= 3 && (
              <>
                <circle cx={line.x1} cy={line.y1} r={visual.thickness / 2} fill={visual.color} opacity={visual.alpha} />
                <circle cx={line.x2} cy={line.y2} r={visual.thickness / 2} fill={visual.color} opacity={visual.alpha} />
              </>
            )}
            {/* Door icon */}
            {visual.doorIcon && scaledCell >= 20 && (
              <>
                <circle cx={midX} cy={midY} r={scaledCell * 0.15} fill="#1A1A24" opacity={0.9} />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={Math.max(8, scaledCell * 0.22)}
                  opacity={0.8}
                >
                  {visual.doorIcon}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Hover preview */}
      {hoverEdge && activeTool === "wall" && (
        <line
          x1={hoverEdge.renderX}
          y1={hoverEdge.renderY}
          x2={hoverEdge.renderEndX}
          y2={hoverEdge.renderEndY}
          stroke={wallDrawMode === "erase" ? "#FF4444" : hoverColor}
          strokeWidth={wallDrawMode === "erase" ? 2 : 4}
          strokeLinecap="round"
          strokeDasharray={wallDrawMode === "erase" ? "4,4" : undefined}
          opacity={0.6}
        />
      )}
    </svg>
  );
}
