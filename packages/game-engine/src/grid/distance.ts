export type DistanceMethod = "euclidean" | "manhattan" | "chebyshev" | "hex";

/**
 * Calculate distance between two grid positions.
 */
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  method: DistanceMethod = "euclidean"
): number {
  switch (method) {
    case "euclidean":
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    case "manhattan":
      return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    case "chebyshev":
      return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    case "hex":
      return hexDistance(x1, y1, x2, y2);
  }
}

/**
 * Hex distance using cube coordinates.
 */
function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
  const s1 = -q1 - r1;
  const s2 = -q2 - r2;
  return Math.max(
    Math.abs(q2 - q1),
    Math.abs(r2 - r1),
    Math.abs(s2 - s1)
  );
}

/**
 * Convert grid distance to feet (D&D standard: 1 cell = 5ft).
 */
export function distanceToFeet(
  gridDistance: number,
  feetPerCell = 5
): number {
  return Math.round(gridDistance) * feetPerCell;
}
