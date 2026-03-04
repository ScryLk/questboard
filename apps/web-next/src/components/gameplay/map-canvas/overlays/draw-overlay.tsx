"use client";

import type { DrawStroke } from "@/lib/gameplay-mock-data";

interface DrawOverlayProps {
  strokes: DrawStroke[];
  activeStroke: DrawStroke | null;
  canvasW: number;
  canvasH: number;
}

function strokeToPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(" ")}`;
}

function renderStroke(stroke: DrawStroke) {
  if (stroke.tool === "eraser") {
    return (
      <path
        key={stroke.id}
        d={strokeToPath(stroke.points)}
        fill="none"
        stroke="#0F0F12"
        strokeWidth={stroke.width * 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  if (stroke.tool === "line" && stroke.points.length >= 2) {
    const first = stroke.points[0];
    const last = stroke.points[stroke.points.length - 1];
    return (
      <line
        key={stroke.id}
        x1={first.x}
        y1={first.y}
        x2={last.x}
        y2={last.y}
        stroke={stroke.color}
        strokeWidth={stroke.width}
        strokeLinecap="round"
      />
    );
  }

  if (stroke.tool === "rect" && stroke.points.length >= 2) {
    const first = stroke.points[0];
    const last = stroke.points[stroke.points.length - 1];
    const x = Math.min(first.x, last.x);
    const y = Math.min(first.y, last.y);
    const w = Math.abs(last.x - first.x);
    const h = Math.abs(last.y - first.y);
    return (
      <rect
        key={stroke.id}
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={stroke.color}
        strokeWidth={stroke.width}
        strokeLinejoin="round"
      />
    );
  }

  // freehand
  return (
    <path
      key={stroke.id}
      d={strokeToPath(stroke.points)}
      fill="none"
      stroke={stroke.color}
      strokeWidth={stroke.width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.8}
    />
  );
}

export function DrawOverlay({ strokes, activeStroke, canvasW, canvasH }: DrawOverlayProps) {
  if (strokes.length === 0 && !activeStroke) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={canvasW}
      height={canvasH}
      style={{ overflow: "visible" }}
    >
      {strokes.map(renderStroke)}
      {activeStroke && renderStroke(activeStroke)}
    </svg>
  );
}
