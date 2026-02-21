export interface GridPosition {
  x: number;
  y: number;
}

export interface GridConfig {
  type: "SQUARE" | "HEX";
  cellSize: number;
  width: number;
  height: number;
}

/**
 * Snap pixel coordinates to the nearest grid cell center.
 */
export function snapToGrid(
  pixelX: number,
  pixelY: number,
  config: GridConfig
): GridPosition {
  if (config.type === "HEX") {
    return snapToHexGrid(pixelX, pixelY, config.cellSize);
  }
  return {
    x: Math.round(pixelX / config.cellSize),
    y: Math.round(pixelY / config.cellSize),
  };
}

/**
 * Convert grid position to pixel coordinates (center of cell).
 */
export function gridToPixel(
  gridX: number,
  gridY: number,
  config: GridConfig
): { pixelX: number; pixelY: number } {
  if (config.type === "HEX") {
    return hexToPixel(gridX, gridY, config.cellSize);
  }
  return {
    pixelX: gridX * config.cellSize + config.cellSize / 2,
    pixelY: gridY * config.cellSize + config.cellSize / 2,
  };
}

/**
 * Check if a grid position is within bounds.
 */
export function isInBounds(
  x: number,
  y: number,
  config: GridConfig
): boolean {
  return x >= 0 && x < config.width && y >= 0 && y < config.height;
}

/**
 * Get all adjacent cell positions (4-directional for square, 6 for hex).
 */
export function getNeighbors(
  x: number,
  y: number,
  config: GridConfig
): GridPosition[] {
  if (config.type === "HEX") {
    return getHexNeighbors(x, y).filter((pos) =>
      isInBounds(pos.x, pos.y, config)
    );
  }
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
  return directions
    .map((d) => ({ x: x + d.x, y: y + d.y }))
    .filter((pos) => isInBounds(pos.x, pos.y, config));
}

function snapToHexGrid(
  pixelX: number,
  pixelY: number,
  cellSize: number
): GridPosition {
  const q = ((2 / 3) * pixelX) / cellSize;
  const r = ((-1 / 3) * pixelX + (Math.sqrt(3) / 3) * pixelY) / cellSize;
  return hexRound(q, r);
}

function hexToPixel(
  q: number,
  r: number,
  cellSize: number
): { pixelX: number; pixelY: number } {
  return {
    pixelX: cellSize * (3 / 2) * q,
    pixelY: cellSize * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r),
  };
}

function hexRound(q: number, r: number): GridPosition {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);

  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }

  return { x: rq, y: rr };
}

function getHexNeighbors(q: number, r: number): GridPosition[] {
  const directions = [
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
  ];
  return directions.map((d) => ({ x: q + d.x, y: r + d.y }));
}
