import type { WallData } from "./gameplay-mock-data";

// ── Wall Key Utilities ──

/** Create a consistent wall key between two adjacent cells. Always sorted: smaller first. */
export function makeWallKey(x1: number, y1: number, x2: number, y2: number): string {
  if (x1 < x2 || (x1 === x2 && y1 < y2)) {
    return `${x1},${y1}:${x2},${y2}`;
  }
  return `${x2},${y2}:${x1},${y1}`;
}

/** Parse a wall key back into cell coordinates. */
export function parseWallKey(key: string): { x1: number; y1: number; x2: number; y2: number } {
  const [a, b] = key.split(":");
  const [x1, y1] = a.split(",").map(Number);
  const [x2, y2] = b.split(",").map(Number);
  return { x1, y1, x2, y2 };
}

// ── Edge Detection ──

export interface NearestEdge {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation: "horizontal" | "vertical";
  renderX: number;
  renderY: number;
  renderEndX: number;
  renderEndY: number;
}

/**
 * Find the nearest cell edge to the mouse position.
 * Returns null if mouse is in the center of a cell (beyond threshold).
 * mouseX/mouseY are pixel coordinates relative to the canvas origin.
 */
export function getNearestEdge(
  mouseX: number,
  mouseY: number,
  cellSize: number,
  gridCols: number,
  gridRows: number,
): NearestEdge | null {
  const cellX = Math.floor(mouseX / cellSize);
  const cellY = Math.floor(mouseY / cellSize);
  if (cellX < 0 || cellX >= gridCols || cellY < 0 || cellY >= gridRows) return null;

  const localX = mouseX - cellX * cellSize;
  const localY = mouseY - cellY * cellSize;

  const distTop = localY;
  const distBottom = cellSize - localY;
  const distLeft = localX;
  const distRight = cellSize - localX;

  const threshold = cellSize * 0.3;
  const minDist = Math.min(distTop, distBottom, distLeft, distRight);

  if (minDist > threshold) return null;

  let x1: number, y1: number, x2: number, y2: number;
  let orientation: "horizontal" | "vertical";
  let renderX: number, renderY: number, renderEndX: number, renderEndY: number;

  if (minDist === distTop) {
    if (cellY === 0) return null;
    x1 = cellX; y1 = cellY - 1; x2 = cellX; y2 = cellY;
    orientation = "horizontal";
    renderX = cellX * cellSize;
    renderY = cellY * cellSize;
    renderEndX = (cellX + 1) * cellSize;
    renderEndY = cellY * cellSize;
  } else if (minDist === distBottom) {
    if (cellY + 1 >= gridRows) return null;
    x1 = cellX; y1 = cellY; x2 = cellX; y2 = cellY + 1;
    orientation = "horizontal";
    renderX = cellX * cellSize;
    renderY = (cellY + 1) * cellSize;
    renderEndX = (cellX + 1) * cellSize;
    renderEndY = (cellY + 1) * cellSize;
  } else if (minDist === distLeft) {
    if (cellX === 0) return null;
    x1 = cellX - 1; y1 = cellY; x2 = cellX; y2 = cellY;
    orientation = "vertical";
    renderX = cellX * cellSize;
    renderY = cellY * cellSize;
    renderEndX = cellX * cellSize;
    renderEndY = (cellY + 1) * cellSize;
  } else {
    if (cellX + 1 >= gridCols) return null;
    x1 = cellX; y1 = cellY; x2 = cellX + 1; y2 = cellY;
    orientation = "vertical";
    renderX = (cellX + 1) * cellSize;
    renderY = cellY * cellSize;
    renderEndX = (cellX + 1) * cellSize;
    renderEndY = (cellY + 1) * cellSize;
  }

  const key = makeWallKey(x1, y1, x2, y2);
  return { key, x1, y1, x2, y2, orientation, renderX, renderY, renderEndX, renderEndY };
}

// ── Movement / Vision Helpers ──

/** Check if a wall blocks token movement. */
export function wallBlocksMovement(wall: WallData | undefined, isGM = false): boolean {
  if (!wall) return false;
  switch (wall.type) {
    case "wall": return true;
    case "door-closed": return true;
    case "door-locked": return true;
    case "door-open": return false;
    case "window": return true;
    case "half-wall": return true;
    case "secret": return !isGM;
    case "illusory": return false;
    case "portcullis": return true;
    default: return false;
  }
}

/** Check if a wall blocks line of sight / vision. */
export function wallBlocksVision(wall: WallData | undefined): boolean {
  if (!wall) return false;
  switch (wall.type) {
    case "wall": return true;
    case "door-closed": return true;
    case "door-locked": return true;
    case "door-open": return false;
    case "window": return false;
    case "half-wall": return false;
    case "secret": return true;
    case "illusory": return true;
    case "portcullis": return false;
    default: return false;
  }
}

/**
 * Check if a token can move between two adjacent cells, considering wall edges.
 * wallEdges is the Record<string, WallData> from the store.
 */
export function canTokenMove(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  wallEdges: Record<string, WallData>,
  isGM = false,
): { allowed: boolean; reason?: string } {
  const key = makeWallKey(fromX, fromY, toX, toY);
  const wall = wallEdges[key];

  if (!wall) return { allowed: true };

  switch (wall.type) {
    case "wall": return { allowed: false, reason: "Parede bloqueia passagem" };
    case "door-closed": return { allowed: false, reason: "Porta fechada" };
    case "door-locked": return { allowed: false, reason: "Porta trancada" };
    case "door-open": return { allowed: true };
    case "window": return { allowed: false, reason: "Janela bloqueia passagem" };
    case "half-wall": return { allowed: false, reason: "Meia-parede bloqueia passagem" };
    case "secret":
      return isGM
        ? { allowed: true }
        : { allowed: false, reason: "Parede bloqueia passagem" };
    case "illusory": return { allowed: true };
    case "portcullis": return { allowed: false, reason: "Grade bloqueia passagem" };
    default: return { allowed: true };
  }
}

/**
 * Check diagonal movement: requires at least one "L-shaped" path to be clear.
 */
export function canMoveDiagonal(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  wallEdges: Record<string, WallData>,
  isGM = false,
): boolean {
  const dx = toX - fromX;
  const dy = toY - fromY;

  if (Math.abs(dx) !== 1 || Math.abs(dy) !== 1) {
    return canTokenMove(fromX, fromY, toX, toY, wallEdges, isGM).allowed;
  }

  // Path A: horizontal first, then vertical
  const pathA =
    canTokenMove(fromX, fromY, toX, fromY, wallEdges, isGM).allowed &&
    canTokenMove(toX, fromY, toX, toY, wallEdges, isGM).allowed;

  // Path B: vertical first, then horizontal
  const pathB =
    canTokenMove(fromX, fromY, fromX, toY, wallEdges, isGM).allowed &&
    canTokenMove(fromX, toY, toX, toY, wallEdges, isGM).allowed;

  return pathA || pathB;
}

/** Get render line for a wall key (pixel coordinates). */
export function getWallRenderLine(
  key: string,
  cellSize: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const { x1, y1, x2, y2 } = parseWallKey(key);

  if (x1 === x2) {
    // Horizontal edge (same column, adjacent rows)
    const edgeY = Math.max(y1, y2) * cellSize;
    return {
      x1: x1 * cellSize,
      y1: edgeY,
      x2: (x1 + 1) * cellSize,
      y2: edgeY,
    };
  } else {
    // Vertical edge (same row, adjacent columns)
    const edgeX = Math.max(x1, x2) * cellSize;
    return {
      x1: edgeX,
      y1: y1 * cellSize,
      x2: edgeX,
      y2: (y1 + 1) * cellSize,
    };
  }
}

// ── Old format conversion (for room templates) ──

/** Convert old WallSegment side format to new edge-based wall key. */
export function wallSideToEdgeKey(
  x: number,
  y: number,
  side: "top" | "right" | "bottom" | "left",
): string {
  switch (side) {
    case "top": return makeWallKey(x, y - 1, x, y);
    case "bottom": return makeWallKey(x, y, x, y + 1);
    case "left": return makeWallKey(x - 1, y, x, y);
    case "right": return makeWallKey(x, y, x + 1, y);
  }
}

/** Generate wall keys for a rectangle (walls around the perimeter). */
export function rectangleWallKeys(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  gridCols: number,
  gridRows: number,
): string[] {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const keys: string[] = [];

  // Top horizontal edges
  if (minY > 0) {
    for (let x = minX; x <= maxX; x++) {
      keys.push(makeWallKey(x, minY - 1, x, minY));
    }
  }
  // Bottom horizontal edges
  if (maxY + 1 < gridRows) {
    for (let x = minX; x <= maxX; x++) {
      keys.push(makeWallKey(x, maxY, x, maxY + 1));
    }
  }
  // Left vertical edges
  if (minX > 0) {
    for (let y = minY; y <= maxY; y++) {
      keys.push(makeWallKey(minX - 1, y, minX, y));
    }
  }
  // Right vertical edges
  if (maxX + 1 < gridCols) {
    for (let y = minY; y <= maxY; y++) {
      keys.push(makeWallKey(maxX, y, maxX + 1, y));
    }
  }

  return keys;
}
