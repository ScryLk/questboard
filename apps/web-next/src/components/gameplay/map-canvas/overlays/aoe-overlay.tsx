"use client";

import { useMemo } from "react";
import type { AOEInstance } from "@/lib/gameplay-mock-data";
import { MOCK_MAP, cellsInRadius } from "@/lib/gameplay-mock-data";

const AOE_COLORS: Record<string, { fill: string; stroke: string }> = {
  red: { fill: "rgba(255, 68, 68, 0.15)", stroke: "rgba(255, 68, 68, 0.6)" },
  blue: { fill: "rgba(68, 136, 255, 0.15)", stroke: "rgba(68, 136, 255, 0.6)" },
  green: { fill: "rgba(0, 184, 148, 0.15)", stroke: "rgba(0, 184, 148, 0.6)" },
  yellow: { fill: "rgba(253, 203, 110, 0.15)", stroke: "rgba(253, 203, 110, 0.6)" },
  purple: { fill: "rgba(108, 92, 231, 0.15)", stroke: "rgba(108, 92, 231, 0.6)" },
  white: { fill: "rgba(255, 255, 255, 0.12)", stroke: "rgba(255, 255, 255, 0.5)" },
};

interface AOEOverlayProps {
  instances: AOEInstance[];
  placing: AOEInstance | null;
  scaledCell: number;
}

function AOECircle({
  aoe,
  scaledCell,
}: {
  aoe: AOEInstance;
  scaledCell: number;
}) {
  const { gridCols, gridRows } = MOCK_MAP;
  const radiusCells = aoe.radius ?? 0;
  const colors = AOE_COLORS[aoe.color] ?? AOE_COLORS.red;

  const cells = useMemo(
    () => cellsInRadius(aoe.originX, aoe.originY, radiusCells, gridCols, gridRows),
    [aoe.originX, aoe.originY, radiusCells, gridCols, gridRows],
  );

  if (radiusCells <= 0) return null;

  return (
    <>
      {cells.map((c) => (
        <div
          key={`aoe_c_${c.x}_${c.y}`}
          className="pointer-events-none absolute"
          style={{
            left: c.x * scaledCell,
            top: c.y * scaledCell,
            width: scaledCell,
            height: scaledCell,
            backgroundColor: colors.fill,
            border: `1px solid ${colors.stroke}`,
          }}
        />
      ))}
      {/* Origin marker */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{
          left: aoe.originX * scaledCell,
          top: aoe.originY * scaledCell,
          width: scaledCell,
          height: scaledCell,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: scaledCell * 0.3,
            height: scaledCell * 0.3,
            backgroundColor: colors.stroke,
          }}
        />
      </div>
      {/* Label */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: aoe.originX * scaledCell + scaledCell + 4,
          top: aoe.originY * scaledCell - 2,
        }}
      >
        <span
          className="rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow"
          style={{ backgroundColor: colors.stroke }}
        >
          {radiusCells * MOCK_MAP.cellSizeFt}ft
        </span>
      </div>
    </>
  );
}

function AOECone({
  aoe,
  scaledCell,
}: {
  aoe: AOEInstance;
  scaledCell: number;
}) {
  const colors = AOE_COLORS[aoe.color] ?? AOE_COLORS.red;
  const endX = aoe.endX ?? aoe.originX;
  const endY = aoe.endY ?? aoe.originY;

  const dx = endX - aoe.originX;
  const dy = endY - aoe.originY;
  if (dx === 0 && dy === 0) return null;

  const length = Math.max(Math.abs(dx), Math.abs(dy));
  const angle = Math.atan2(dy, dx);
  const spread = Math.PI / 4; // 90-degree cone = 45 each side

  // Compute cone cells
  const cells: { x: number; y: number }[] = [];
  const { gridCols, gridRows } = MOCK_MAP;
  for (let r = 1; r <= length; r++) {
    const width = r;
    for (let cx = -width; cx <= width; cx++) {
      for (let cy = -width; cy <= width; cy++) {
        const nx = aoe.originX + cx;
        const ny = aoe.originY + cy;
        if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
        const cellAngle = Math.atan2(cy, cx);
        let diff = Math.abs(cellAngle - angle);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        const dist = Math.max(Math.abs(cx), Math.abs(cy));
        if (dist >= 1 && dist <= length && diff <= spread) {
          if (!cells.some((c) => c.x === nx && c.y === ny)) {
            cells.push({ x: nx, y: ny });
          }
        }
      }
    }
  }

  return (
    <>
      {cells.map((c) => (
        <div
          key={`aoe_cone_${c.x}_${c.y}`}
          className="pointer-events-none absolute"
          style={{
            left: c.x * scaledCell,
            top: c.y * scaledCell,
            width: scaledCell,
            height: scaledCell,
            backgroundColor: colors.fill,
            border: `1px solid ${colors.stroke}`,
          }}
        />
      ))}
      {/* Origin marker */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{
          left: aoe.originX * scaledCell,
          top: aoe.originY * scaledCell,
          width: scaledCell,
          height: scaledCell,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: scaledCell * 0.3,
            height: scaledCell * 0.3,
            backgroundColor: colors.stroke,
          }}
        />
      </div>
      {/* Label */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: aoe.originX * scaledCell + scaledCell + 4,
          top: aoe.originY * scaledCell - 2,
        }}
      >
        <span
          className="rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow"
          style={{ backgroundColor: colors.stroke }}
        >
          Cone {length * MOCK_MAP.cellSizeFt}ft
        </span>
      </div>
    </>
  );
}

function AOELine({
  aoe,
  scaledCell,
}: {
  aoe: AOEInstance;
  scaledCell: number;
}) {
  const colors = AOE_COLORS[aoe.color] ?? AOE_COLORS.red;
  const endX = aoe.endX ?? aoe.originX;
  const endY = aoe.endY ?? aoe.originY;
  const dx = endX - aoe.originX;
  const dy = endY - aoe.originY;
  if (dx === 0 && dy === 0) return null;

  // Bresenham-like line cells with 1-cell width
  const cells: { x: number; y: number }[] = [];
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  const { gridCols, gridRows } = MOCK_MAP;
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const cx = Math.round(aoe.originX + dx * t);
    const cy = Math.round(aoe.originY + dy * t);
    if (cx >= 0 && cy >= 0 && cx < gridCols && cy < gridRows) {
      if (!cells.some((c) => c.x === cx && c.y === cy)) {
        cells.push({ x: cx, y: cy });
      }
    }
  }

  return (
    <>
      {cells.map((c) => (
        <div
          key={`aoe_line_${c.x}_${c.y}`}
          className="pointer-events-none absolute"
          style={{
            left: c.x * scaledCell,
            top: c.y * scaledCell,
            width: scaledCell,
            height: scaledCell,
            backgroundColor: colors.fill,
            border: `1px solid ${colors.stroke}`,
          }}
        />
      ))}
      {/* SVG line on top */}
      <svg className="pointer-events-none absolute inset-0" style={{ overflow: "visible" }}>
        <line
          x1={aoe.originX * scaledCell + scaledCell / 2}
          y1={aoe.originY * scaledCell + scaledCell / 2}
          x2={endX * scaledCell + scaledCell / 2}
          y2={endY * scaledCell + scaledCell / 2}
          stroke={colors.stroke}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
      </svg>
      {/* Label */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: endX * scaledCell + scaledCell + 4,
          top: endY * scaledCell - 2,
        }}
      >
        <span
          className="rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow"
          style={{ backgroundColor: colors.stroke }}
        >
          Linha {steps * MOCK_MAP.cellSizeFt}ft
        </span>
      </div>
    </>
  );
}

function AOECube({
  aoe,
  scaledCell,
}: {
  aoe: AOEInstance;
  scaledCell: number;
}) {
  const colors = AOE_COLORS[aoe.color] ?? AOE_COLORS.red;
  const side = aoe.radius ?? 0;
  const { gridCols, gridRows } = MOCK_MAP;

  if (side <= 0) return null;

  const cells: { x: number; y: number }[] = [];
  const half = Math.floor(side / 2);
  for (let dx = -half; dx <= half; dx++) {
    for (let dy = -half; dy <= half; dy++) {
      const nx = aoe.originX + dx;
      const ny = aoe.originY + dy;
      if (nx >= 0 && ny >= 0 && nx < gridCols && ny < gridRows) {
        cells.push({ x: nx, y: ny });
      }
    }
  }

  return (
    <>
      {cells.map((c) => (
        <div
          key={`aoe_cube_${c.x}_${c.y}`}
          className="pointer-events-none absolute"
          style={{
            left: c.x * scaledCell,
            top: c.y * scaledCell,
            width: scaledCell,
            height: scaledCell,
            backgroundColor: colors.fill,
            border: `1px solid ${colors.stroke}`,
          }}
        />
      ))}
      {/* Origin marker */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{
          left: aoe.originX * scaledCell,
          top: aoe.originY * scaledCell,
          width: scaledCell,
          height: scaledCell,
        }}
      >
        <div
          className="rounded-sm"
          style={{
            width: scaledCell * 0.3,
            height: scaledCell * 0.3,
            backgroundColor: colors.stroke,
          }}
        />
      </div>
      {/* Label */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: aoe.originX * scaledCell + scaledCell + 4,
          top: aoe.originY * scaledCell - 2,
        }}
      >
        <span
          className="rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow"
          style={{ backgroundColor: colors.stroke }}
        >
          Cubo {(side * 2 + 1) * MOCK_MAP.cellSizeFt}ft
        </span>
      </div>
    </>
  );
}

function SingleAOE({ aoe, scaledCell }: { aoe: AOEInstance; scaledCell: number }) {
  switch (aoe.shape) {
    case "circle":
      return <AOECircle aoe={aoe} scaledCell={scaledCell} />;
    case "cone":
      return <AOECone aoe={aoe} scaledCell={scaledCell} />;
    case "line":
      return <AOELine aoe={aoe} scaledCell={scaledCell} />;
    case "cube":
      return <AOECube aoe={aoe} scaledCell={scaledCell} />;
    default:
      return null;
  }
}

export function AOEOverlay({ instances, placing, scaledCell }: AOEOverlayProps) {
  return (
    <>
      {instances.map((aoe) => (
        <SingleAOE key={aoe.id} aoe={aoe} scaledCell={scaledCell} />
      ))}
      {placing && <SingleAOE aoe={placing} scaledCell={scaledCell} />}
    </>
  );
}
