"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import type { WallSegment, WallSide } from "@/lib/gameplay-mock-data";

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

export function WallRenderer({
  scaledCell,
  canvasW,
  canvasH,
  hoverWall,
}: WallRendererProps) {
  const walls = useGameplayStore((s) => s.walls);
  const activeTool = useGameplayStore((s) => s.activeTool);

  if (walls.length === 0 && !hoverWall) return null;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={canvasW}
      height={canvasH}
      style={{ zIndex: 5 }}
    >
      {walls.map((wall, i) => {
        const line = getWallLine(wall, scaledCell);
        return (
          <line
            key={`wall-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={getWallColor(wall)}
            strokeWidth={getWallWidth(wall)}
            strokeDasharray={getWallDash(wall)}
            strokeLinecap="round"
            opacity={wall.isDoor && wall.doorOpen ? 0.4 : 1}
          />
        );
      })}

      {/* Hover preview when wall tool is active */}
      {hoverWall && activeTool === "wall" && (
        <line
          {...getWallLine(hoverWall, scaledCell)}
          stroke="#FDCB6E"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.6}
        />
      )}
    </svg>
  );
}

function getWallColor(wall: WallSegment): string {
  if (wall.isDoor) return "#C0A060";
  return "#8B7355";
}

function getWallWidth(wall: WallSegment): number {
  if (wall.isDoor && wall.doorOpen) return 1;
  return 3;
}

function getWallDash(wall: WallSegment): string | undefined {
  if (wall.isDoor) return "6,4";
  return undefined;
}
