/**
 * Recursive shadowcasting algorithm (8 octants).
 * Returns a Set of "x,y" keys for all visible cells from origin within radius.
 */

// Octant multipliers: [xx, xy, yx, yy]
const OCTANTS: [number, number, number, number][] = [
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [0, -1, 1, 0],
  [-1, 0, 0, 1],
  [-1, 0, 0, -1],
  [0, -1, -1, 0],
  [0, 1, -1, 0],
  [1, 0, 0, -1],
];

function castOctant(
  ox: number,
  oy: number,
  radius: number,
  blocked: Set<string>,
  mapW: number,
  mapH: number,
  result: Set<string>,
  xx: number,
  xy: number,
  yx: number,
  yy: number,
  row: number,
  startSlope: number,
  endSlope: number,
) {
  if (startSlope < endSlope) return;

  let nextStart = startSlope;

  for (let i = row; i <= radius; i++) {
    let blockedThisRow = false;

    for (let dx = -i; dx <= 0; dx++) {
      const dy = i;

      // Map octant coordinates to real coordinates
      const mx = ox + dx * xx + dy * xy;
      const my = oy + dx * yx + dy * yy;

      // col = -dx = column offset within octant (0 at axis, i at diagonal)
      const col = -dx;
      const leftSlope = (col + 0.5) / (dy - 0.5);
      const rightSlope = (col - 0.5) / (dy + 0.5);

      if (startSlope < rightSlope) continue;
      if (endSlope > leftSlope) break;

      // Check within map bounds
      if (mx < 0 || mx >= mapW || my < 0 || my >= mapH) continue;

      // Check within radius (Chebyshev distance for D&D grid)
      const adx = Math.abs(mx - ox);
      const ady = Math.abs(my - oy);
      if (Math.max(adx, ady) <= radius) {
        result.add(`${mx},${my}`);
      }

      const key = `${mx},${my}`;
      if (blockedThisRow) {
        if (blocked.has(key)) {
          nextStart = rightSlope;
          continue;
        } else {
          blockedThisRow = false;
          startSlope = nextStart;
        }
      } else if (blocked.has(key) && i < radius) {
        blockedThisRow = true;
        castOctant(
          ox, oy, radius, blocked, mapW, mapH, result,
          xx, xy, yx, yy,
          i + 1, startSlope, leftSlope,
        );
        nextStart = rightSlope;
      }
    }

    if (blockedThisRow) break;
  }
}

export function shadowCast(
  ox: number,
  oy: number,
  radius: number,
  blocked: Set<string>,
  mapW: number,
  mapH: number,
): Set<string> {
  const result = new Set<string>();

  // Origin is always visible
  result.add(`${ox},${oy}`);

  if (radius <= 0) return result;

  for (const [xx, xy, yx, yy] of OCTANTS) {
    castOctant(ox, oy, radius, blocked, mapW, mapH, result, xx, xy, yx, yy, 1, 1.0, 0.0);
  }

  return result;
}

/**
 * Build a blocked-cells Set from WallSegments.
 * V1 simplification: a cell with any non-open-door wall blocks LOS through it.
 */
export function buildBlockedSet(
  walls: { x: number; y: number; side: string; isDoor: boolean; doorOpen: boolean }[],
): Set<string> {
  const blocked = new Set<string>();

  for (const w of walls) {
    // Open doors don't block
    if (w.isDoor && w.doorOpen) continue;

    // The cell that has the wall blocks LOS
    blocked.add(`${w.x},${w.y}`);

    // Also block the adjacent cell on the other side of the wall
    switch (w.side) {
      case "top":
        if (w.y > 0) blocked.add(`${w.x},${w.y - 1}`);
        break;
      case "bottom":
        blocked.add(`${w.x},${w.y + 1}`);
        break;
      case "left":
        if (w.x > 0) blocked.add(`${w.x - 1},${w.y}`);
        break;
      case "right":
        blocked.add(`${w.x + 1},${w.y}`);
        break;
    }
  }

  return blocked;
}
