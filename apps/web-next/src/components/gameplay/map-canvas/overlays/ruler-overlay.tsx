"use client";

import type { RulerPoint } from "@/lib/gameplay-mock-data";
import { MOCK_MAP, gridDistance } from "@/lib/gameplay-mock-data";

interface RulerOverlayProps {
  points: RulerPoint[];
  mousePoint?: RulerPoint | null;
  scaledCell: number;
}

export function RulerOverlay({ points, mousePoint, scaledCell }: RulerOverlayProps) {
  const { cellSizeFt } = MOCK_MAP;
  const allPoints = [...points, ...(mousePoint ? [mousePoint] : [])];

  if (allPoints.length < 2) return null;

  let totalDist = 0;
  const segments: { x1: number; y1: number; x2: number; y2: number; dist: number }[] = [];

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

  const last = segments[segments.length - 1];
  const totalCells = Math.round(totalDist / cellSizeFt);

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
              strokeDasharray="8 4"
              strokeOpacity={0.8}
            />
            {/* Waypoint circles */}
            {i > 0 && (
              <circle
                cx={seg.x1}
                cy={seg.y1}
                r={4}
                fill="#6C5CE7"
                fillOpacity={0.7}
              />
            )}
          </g>
        ))}
        {/* Start circle */}
        <circle
          cx={segments[0].x1}
          cy={segments[0].y1}
          r={5}
          fill="#6C5CE7"
          stroke="white"
          strokeWidth={1}
        />
        {/* End circle */}
        <circle
          cx={last.x2}
          cy={last.y2}
          r={5}
          fill="#6C5CE7"
          stroke="white"
          strokeWidth={1}
        />
      </svg>
      {/* Total distance label at last point */}
      <div
        className="pointer-events-none absolute"
        style={{ left: last.x2 + 8, top: last.y2 - 10 }}
      >
        <span className="rounded bg-brand-accent/90 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white shadow">
          {totalDist}ft ({totalCells} cel.)
        </span>
      </div>
    </>
  );
}
