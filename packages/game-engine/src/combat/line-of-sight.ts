export type WallCheck = (x: number, y: number) => boolean;

/**
 * Check if there is a clear line of sight between two points using Bresenham's algorithm.
 * Returns true if the line is unobstructed.
 */
export function hasLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  isWall: WallCheck
): boolean {
  const points = bresenhamLine(x1, y1, x2, y2);

  // Skip the start point, check all intermediate and end points
  for (let i = 1; i < points.length; i++) {
    const point = points[i]!;
    if (isWall(point.x, point.y)) {
      return false;
    }
  }

  return true;
}

/**
 * Get all points along a line using Bresenham's algorithm.
 */
export function bresenhamLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];

  let dx = Math.abs(x2 - x1);
  let dy = -Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx + dy;

  let x = x1;
  let y = y1;

  while (true) {
    points.push({ x, y });

    if (x === x2 && y === y2) break;

    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }

  return points;
}
