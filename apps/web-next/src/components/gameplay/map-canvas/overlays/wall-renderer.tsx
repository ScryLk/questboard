"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import type { WallSegment, WallSide, WallMaterial, DoorState } from "@/lib/gameplay-mock-data";

interface WallRendererProps {
  scaledCell: number;
  canvasW: number;
  canvasH: number;
  hoverWall: { x: number; y: number; side: WallSide } | null;
}

function getWallLine(
  w: { x: number; y: number; side: WallSide },
  cell: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const left = w.x * cell;
  const top = w.y * cell;
  const right = left + cell;
  const bottom = top + cell;

  switch (w.side) {
    case "top":
      return { x1: left, y1: top, x2: right, y2: top };
    case "bottom":
      return { x1: left, y1: bottom, x2: right, y2: bottom };
    case "left":
      return { x1: left, y1: top, x2: left, y2: bottom };
    case "right":
      return { x1: right, y1: top, x2: right, y2: bottom };
  }
}

const WALL_COLORS: Record<WallMaterial, string> = {
  stone: "#8B7355",
  wood: "#A0764D",
  iron: "#7A8B99",
  magic: "#9B6CE7",
};

const DOOR_COLORS: Record<DoorState, string> = {
  none: "#8B7355",
  open: "#6A8B4D",
  closed: "#C0A060",
  locked: "#CC4444",
  secret: "#888888",
};

function getWallColor(wall: WallSegment): string {
  if (wall.isDoor) {
    const state = wall.doorState ?? (wall.doorOpen ? "open" : "closed");
    return DOOR_COLORS[state] ?? DOOR_COLORS.closed;
  }
  return WALL_COLORS[wall.wallType ?? "stone"];
}

function getWallWidth(wall: WallSegment): number {
  if (wall.isDoor) {
    const state = wall.doorState ?? (wall.doorOpen ? "open" : "closed");
    if (state === "open") return 1.5;
    return 3;
  }
  if (wall.wallType === "iron") return 4;
  return 3;
}

function getWallDash(wall: WallSegment): string | undefined {
  if (wall.isDoor) {
    const state = wall.doorState ?? (wall.doorOpen ? "open" : "closed");
    if (state === "secret") return "2,4";
    if (state === "locked") return "6,3";
    return "6,4";
  }
  if (wall.wallType === "magic") return "4,4";
  return undefined;
}

function getDoorIcon(wall: WallSegment, cell: number): { cx: number; cy: number; text: string } | null {
  if (!wall.isDoor) return null;
  const state = wall.doorState ?? (wall.doorOpen ? "open" : "closed");
  const line = getWallLine(wall, cell);
  const cx = (line.x1 + line.x2) / 2;
  const cy = (line.y1 + line.y2) / 2;

  switch (state) {
    case "open": return { cx, cy, text: "○" };
    case "locked": return { cx, cy, text: "🔒" };
    case "secret": return { cx, cy, text: "?" };
    default: return null;
  }
}

export function WallRenderer({
  scaledCell,
  canvasW,
  canvasH,
  hoverWall,
}: WallRendererProps) {
  const walls = useGameplayStore((s) => s.walls);
  const activeTool = useGameplayStore((s) => s.activeTool);
  const activeWallType = useGameplayStore((s) => s.activeWallType);

  if (walls.length === 0 && !hoverWall) return null;

  const hoverColor = WALL_COLORS[activeWallType] ?? "#FDCB6E";

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={canvasW}
      height={canvasH}
      style={{ zIndex: 5 }}
    >
      {walls.map((wall, i) => {
        const line = getWallLine(wall, scaledCell);
        const icon = getDoorIcon(wall, scaledCell);
        return (
          <g key={`wall-${i}`}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={getWallColor(wall)}
              strokeWidth={getWallWidth(wall)}
              strokeDasharray={getWallDash(wall)}
              strokeLinecap="round"
              opacity={wall.isDoor && wall.doorOpen ? 0.5 : 1}
            />
            {icon && scaledCell >= 20 && (
              <text
                x={icon.cx}
                y={icon.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={Math.max(8, scaledCell * 0.25)}
                opacity={0.7}
              >
                {icon.text}
              </text>
            )}
          </g>
        );
      })}

      {/* Hover preview when wall tool is active */}
      {hoverWall && activeTool === "wall" && (
        <line
          {...getWallLine(hoverWall, scaledCell)}
          stroke={hoverColor}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.6}
        />
      )}
    </svg>
  );
}
