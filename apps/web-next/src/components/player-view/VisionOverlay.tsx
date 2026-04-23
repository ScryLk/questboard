"use client";

import { usePlayerSettings } from "@/lib/player-settings-store";

/** Default sem ficha: ~30ft (6 células) — alcance tipo tocha D&D 5e. */
const DEFAULT_VISION_CELLS = 6;
/** Alcance de ação default: 60ft (12 células) — move completo + ataque
 *  médio. Quando ficha existir, trocar por `speed + reach`. */
const DEFAULT_ACTION_CELLS = 12;

interface Props {
  tokenX: number;
  tokenY: number;
  gridCols: number;
  gridRows: number;
  cellSize: number;
}

/**
 * Overlay com 2 zonas concêntricas (Chebyshev):
 *   - Inner (visão): fundo amarelo com degradê que diminui com a
 *     distância. Representa onde o jogador VÊ claramente.
 *   - Outer (ação): anel accent do sistema. Representa onde o jogador
 *     AINDA consegue agir (ataque com alcance, movimento extra).
 *   - Fora: escurecido opaco.
 *
 * Quando a ficha existir: trocar `DEFAULT_VISION_CELLS` por
 * `character.vision.normal` e `DEFAULT_ACTION_CELLS` por
 * `character.speed + character.reach` (ou sistema equivalente).
 */
export function VisionOverlay({
  tokenX,
  tokenY,
  gridCols,
  gridRows,
  cellSize,
}: Props) {
  const visionCells = DEFAULT_VISION_CELLS;
  const actionCells = Math.max(DEFAULT_ACTION_CELLS, visionCells + 1);

  // Reusa a flag do grid como toggle — evita inflar o store por ora.
  const showVision = usePlayerSettings((s) => s.showGrid);
  if (!showVision) return null;

  const canvasW = gridCols * cellSize;
  const canvasH = gridRows * cellSize;

  // Bounds do quadrado Chebyshev de cada zona
  const visionLeft = Math.max(0, tokenX - visionCells) * cellSize;
  const visionTop = Math.max(0, tokenY - visionCells) * cellSize;
  const visionRight =
    Math.min(gridCols, tokenX + visionCells + 1) * cellSize;
  const visionBottom =
    Math.min(gridRows, tokenY + visionCells + 1) * cellSize;
  const visionW = visionRight - visionLeft;
  const visionH = visionBottom - visionTop;

  const actionLeft = Math.max(0, tokenX - actionCells) * cellSize;
  const actionTop = Math.max(0, tokenY - actionCells) * cellSize;
  const actionRight =
    Math.min(gridCols, tokenX + actionCells + 1) * cellSize;
  const actionBottom =
    Math.min(gridRows, tokenY + actionCells + 1) * cellSize;
  const actionW = actionRight - actionLeft;
  const actionH = actionBottom - actionTop;

  const cx = (tokenX + 0.5) * cellSize;
  const cy = (tokenY + 0.5) * cellSize;
  const visionRadius = (visionCells + 0.5) * cellSize;
  const actionRadius = (actionCells + 0.5) * cellSize;

  // IDs únicos por instância (evita conflito se múltiplos overlays)
  const uid = `${tokenX}-${tokenY}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={canvasW}
      height={canvasH}
      aria-hidden
    >
      <defs>
        {/* Fade radial amarelo: opaco no centro, transparente na borda
            da visão. Cria a sensação "vejo forte perto, fraco longe". */}
        <radialGradient
          id={`qb-vision-fade-${uid}`}
          cx={cx}
          cy={cy}
          r={visionRadius}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="rgba(250, 204, 21, 0.28)" />
          <stop offset="60%" stopColor="rgba(250, 204, 21, 0.14)" />
          <stop offset="100%" stopColor="rgba(250, 204, 21, 0)" />
        </radialGradient>

        {/* Máscara que define "clareiro total" dentro do alcance de ação
            (com borda suave). Usada pra recortar o escurecimento fora. */}
        <mask id={`qb-action-mask-${uid}`}>
          <rect width={canvasW} height={canvasH} fill="white" />
          <radialGradient
            id={`qb-action-edge-${uid}`}
            cx={cx}
            cy={cy}
            r={actionRadius}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="75%" stopColor="black" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>
          <rect
            x={actionLeft}
            y={actionTop}
            width={actionW}
            height={actionH}
            fill={`url(#qb-action-edge-${uid})`}
          />
        </mask>

        {/* Fade radial accent do sistema — mais forte perto da borda da
            visão, some ao chegar no limite de ação. Dá o "anel" visual. */}
        <radialGradient
          id={`qb-action-ring-${uid}`}
          cx={cx}
          cy={cy}
          r={actionRadius}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="rgba(108, 92, 231, 0)" />
          <stop
            offset={`${Math.round((visionRadius / actionRadius) * 100)}%`}
            stopColor="rgba(108, 92, 231, 0)"
          />
          <stop offset="75%" stopColor="rgba(108, 92, 231, 0.18)" />
          <stop offset="100%" stopColor="rgba(108, 92, 231, 0.04)" />
        </radialGradient>
      </defs>

      {/* Escurecimento fora do alcance de ação */}
      <rect
        width={canvasW}
        height={canvasH}
        fill="rgba(10, 10, 15, 0.72)"
        mask={`url(#qb-action-mask-${uid})`}
      />

      {/* Anel accent (alcance de ação) */}
      <rect
        x={actionLeft}
        y={actionTop}
        width={actionW}
        height={actionH}
        fill={`url(#qb-action-ring-${uid})`}
      />

      {/* Gradiente amarelo da visão (dentro do anel) */}
      <rect
        x={visionLeft}
        y={visionTop}
        width={visionW}
        height={visionH}
        fill={`url(#qb-vision-fade-${uid})`}
      />

      {/* Borda tracejada amarela no limite de visão */}
      <rect
        x={visionLeft}
        y={visionTop}
        width={visionW}
        height={visionH}
        fill="none"
        stroke="rgba(250, 204, 21, 0.40)"
        strokeWidth={1}
        strokeDasharray="5 4"
      />

      {/* Borda tracejada accent no limite de ação */}
      <rect
        x={actionLeft}
        y={actionTop}
        width={actionW}
        height={actionH}
        fill="none"
        stroke="rgba(108, 92, 231, 0.35)"
        strokeWidth={1}
        strokeDasharray="8 5"
      />
    </svg>
  );
}
