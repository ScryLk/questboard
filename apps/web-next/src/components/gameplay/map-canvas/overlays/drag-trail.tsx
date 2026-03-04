"use client";

import { MOCK_MAP, gridDistance } from "@/lib/gameplay-mock-data";

interface DragTrailProps {
  originX: number;
  originY: number;
  destX: number;
  destY: number;
  scaledCell: number;
  waypoints?: { x: number; y: number }[];
}

export function DragTrail({
  originX,
  originY,
  destX,
  destY,
  scaledCell,
  waypoints = [],
}: DragTrailProps) {
  const { cellSizeFt } = MOCK_MAP;

  // Build the full path: origin → waypoints → destination
  const allPoints = [
    { x: originX, y: originY },
    ...waypoints,
    { x: destX, y: destY },
  ];

  // Calculate total distance along the path
  let totalDist = 0;
  const segments: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    dist: number;
  }[] = [];

  for (let i = 1; i < allPoints.length; i++) {
    const p1 = allPoints[i - 1];
    const p2 = allPoints[i];
    const dist = gridDistance(p1.x, p1.y, p2.x, p2.y, cellSizeFt);
    totalDist += dist;
    segments.push({
      x1: p1.x * scaledCell + scaledCell / 2,
      y1: p1.y * scaledCell + scaledCell / 2,
      x2: p2.x * scaledCell + scaledCell / 2,
      y2: p2.y * scaledCell + scaledCell / 2,
      dist,
    });
  }

  const totalCells = Math.round(totalDist / cellSizeFt);
  if (totalCells === 0) return null;

  const last = segments[segments.length - 1];

  return (
    <>
      <svg className="pointer-events-none absolute inset-0" style={{ overflow: "visible" }}>
        {segments.map((seg, i) => (
          <g key={i}>
            <line
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#6C5CE7"
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeOpacity={0.7}
            />
            {/* Waypoint circle */}
            {i > 0 && (
              <circle
                cx={seg.x1}
                cy={seg.y1}
                r={4}
                fill="#6C5CE7"
                fillOpacity={0.7}
                stroke="white"
                strokeWidth={1}
              />
            )}
          </g>
        ))}
        {/* Origin circle */}
        <circle
          cx={segments[0].x1}
          cy={segments[0].y1}
          r={4}
          fill="#6C5CE7"
          fillOpacity={0.5}
        />
      </svg>
      {/* Total distance label at last point */}
      <div
        className="pointer-events-none absolute"
        style={{ left: last.x2 + 8, top: last.y2 - 10 }}
      >
        <span className="rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
          {totalDist}ft ({totalCells} cel.)
        </span>
      </div>
    </>
  );
}
