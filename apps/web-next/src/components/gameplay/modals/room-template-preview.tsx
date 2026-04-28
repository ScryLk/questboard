"use client";

// Mini preview de RoomTemplate — SVG escalado pra caber numa thumb.
// Renderiza terreno (cor do TERRAIN_CATALOG), paredes (linhas) e
// objetos (pontos), tudo proporcional pra qualquer tamanho de template.

import type { RoomTemplate } from "@/lib/room-templates";
import { TERRAIN_CATALOG } from "@/lib/terrain-catalog";

interface Props {
  template: RoomTemplate;
  width?: number;
  height?: number;
  className?: string;
}

function boostAlpha(color: string, minAlpha = 0.85): string {
  const m = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
  );
  if (!m) return color;
  const [, r, g, b, a] = m;
  const alpha = Math.max(Number(a ?? 1), minAlpha);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function RoomTemplatePreview({
  template,
  width = 96,
  height = 72,
  className,
}: Props) {
  const pad = 4;
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;
  const cell = Math.min(usableW / template.width, usableH / template.height);
  const offsetX = (width - template.width * cell) / 2;
  const offsetY = (height - template.height * cell) / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {/* Background */}
      <rect width={width} height={height} fill="#0A0A0F" rx={4} />

      <g transform={`translate(${offsetX} ${offsetY})`}>
        {/* Terrain */}
        {template.terrain.map((t, i) => {
          const info = TERRAIN_CATALOG[t.type];
          const fill = info ? boostAlpha(info.color) : "rgba(80,80,90,0.6)";
          return (
            <rect
              key={`t${i}`}
              x={t.dx * cell}
              y={t.dy * cell}
              width={cell}
              height={cell}
              fill={fill}
            />
          );
        })}

        {/* Walls — uma linha por edge (top/right/bottom/left). Portas ficam
         *  douradas pra destacar entradas. */}
        {template.walls.map((w, i) => {
          const x = w.dx * cell;
          const y = w.dy * cell;
          let x1 = x;
          let y1 = y;
          let x2 = x;
          let y2 = y;
          switch (w.side) {
            case "top":
              x2 = x + cell;
              break;
            case "bottom":
              y1 = y + cell;
              x2 = x + cell;
              y2 = y + cell;
              break;
            case "left":
              y2 = y + cell;
              break;
            case "right":
              x1 = x + cell;
              x2 = x + cell;
              y2 = y + cell;
              break;
          }
          const stroke = w.isDoor
            ? w.doorState === "open"
              ? "rgba(110, 200, 130, 0.95)"
              : "rgba(220, 180, 90, 0.95)"
            : "rgba(180, 180, 195, 0.85)";
          return (
            <line
              key={`w${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={Math.max(1, cell * 0.18)}
              strokeLinecap="round"
            />
          );
        })}

        {/* Objects — pontinho central por célula */}
        {template.objects.map((o, i) => (
          <circle
            key={`o${i}`}
            cx={o.dx * cell + cell / 2}
            cy={o.dy * cell + cell / 2}
            r={Math.max(1, cell * 0.18)}
            fill="rgba(165, 243, 252, 0.75)"
          />
        ))}
      </g>
    </svg>
  );
}
