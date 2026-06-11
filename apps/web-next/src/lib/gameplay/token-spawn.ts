// ── Helpers de spawn de token no mapa ──
//
// Usado pelos popovers "Adicionar ao Mapa" (token library e NPCs) pra
// evitar dois bugs comuns:
//
// 1. Spawn em coordenada chumbada (5,5) que ignora pan/zoom da câmera
//    e cai fora do viewport visível.
// 2. N tokens adicionados de uma vez empilham no mesmo (x,y), ficando
//    sobrepostos.
//
// Fluxo do caller:
//   const cells = pickFreeSpawnCells(count, gridCols, gridRows, occupied);
//   for (let i = 0; i < cells.length; i++) addToken({ ..., x: cells[i].x, y: cells[i].y });
//
// O ponto de origem é o centro do viewport (no espaço de grid) — assim
// o user vê o token aparecer onde está olhando. Se a célula central
// (ou as vizinhas em espiral) estiver ocupada, varre até achar livre.

import { useCameraStore } from "../camera-store";
import { CELL_SIZE } from "./constants";

/** Célula do grid sob o centro do viewport, com clamp pra dentro dos
 *  limites do mapa. Lê o estado atual da câmera (não reativo). */
export function getViewportCenterCell(
  gridCols: number,
  gridRows: number,
): { x: number; y: number } {
  const cam = useCameraStore.getState();
  // Fallback defensivo: viewport ainda não medido (primeiro render).
  // Usa o centro geométrico do mapa em vez de cair em (0,0).
  if (cam.viewportWidth <= 0 || cam.viewportHeight <= 0) {
    return {
      x: Math.floor(gridCols / 2),
      y: Math.floor(gridRows / 2),
    };
  }
  const worldX = (cam.viewportWidth / 2 - cam.panX) / cam.zoom;
  const worldY = (cam.viewportHeight / 2 - cam.panY) / cam.zoom;
  return clampCell(
    { x: Math.floor(worldX / CELL_SIZE), y: Math.floor(worldY / CELL_SIZE) },
    gridCols,
    gridRows,
  );
}

function clampCell(
  c: { x: number; y: number },
  gridCols: number,
  gridRows: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(gridCols - 1, c.x)),
    y: Math.max(0, Math.min(gridRows - 1, c.y)),
  };
}

/** Encontra `count` células livres a partir de `start`, varrendo em
 *  espiral quadrada. Pula células já ocupadas (segundo `occupied`) e
 *  células fora dos limites do grid. Se o grid for todo ocupado ou
 *  muito pequeno, retorna o que conseguiu (lista pode ser menor que
 *  `count` — caller decide se cai fora ou empilha).
 *
 *  Espiral começa em `start`, vai 1× pra direita, 1× pra baixo, 2×
 *  pra esquerda, 2× pra cima, 3× pra direita, 3× pra baixo... clássico
 *  padrão 1,1,2,2,3,3,4,4,... de viradas. Cobre todas as células
 *  alcançáveis sem repetição. */
export function spiralFreeCells(
  start: { x: number; y: number },
  count: number,
  occupied: ReadonlySet<string>,
  gridCols: number,
  gridRows: number,
): Array<{ x: number; y: number }> {
  if (count <= 0) return [];
  if (gridCols <= 0 || gridRows <= 0) return [];

  const taken = new Set<string>(occupied);
  const out: Array<{ x: number; y: number }> = [];

  let x = start.x;
  let y = start.y;
  let dx = 1;
  let dy = 0;
  let stepsInDir = 1;
  let stepsTaken = 0;
  let dirChanges = 0;
  // Backstop: nunca itera mais que (cols*rows) + algumas viradas iniciais.
  const maxIters = gridCols * gridRows + 8;

  for (let i = 0; i < maxIters; i++) {
    if (out.length >= count) break;

    const inBounds = x >= 0 && y >= 0 && x < gridCols && y < gridRows;
    const key = `${x},${y}`;
    if (inBounds && !taken.has(key)) {
      out.push({ x, y });
      taken.add(key);
    }

    // Avança 1 passo na direção atual.
    x += dx;
    y += dy;
    stepsTaken++;

    if (stepsTaken === stepsInDir) {
      stepsTaken = 0;
      // Vira 90° no sentido horário: (dx,dy) → (-dy, dx).
      const ndx = -dy;
      const ndy = dx;
      dx = ndx;
      dy = ndy;
      dirChanges++;
      // A cada 2 viradas o tamanho do passo aumenta (espiral quadrada).
      if (dirChanges % 2 === 0) stepsInDir++;
    }
  }

  return out;
}

/** Convenience: gera `count` células de spawn começando do centro do
 *  viewport, dispersando em espiral pra não empilhar com `existing`.
 *  Caller passa a lista de tokens já no mapa pra construir o set
 *  de ocupação. */
export function pickFreeSpawnCells(
  count: number,
  gridCols: number,
  gridRows: number,
  existing: ReadonlyArray<{ x: number; y: number }>,
): Array<{ x: number; y: number }> {
  const start = getViewportCenterCell(gridCols, gridRows);
  const occupied = new Set<string>();
  for (const t of existing) {
    occupied.add(`${t.x},${t.y}`);
  }
  return spiralFreeCells(start, count, occupied, gridCols, gridRows);
}
