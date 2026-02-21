export interface FogAreaData {
  id: string;
  type: "polygon" | "rectangle" | "circle";
  points: number[][];
  revealed: boolean;
}

export interface FogState {
  areas: FogAreaData[];
}

/**
 * Create an empty fog state.
 */
export function createFogState(): FogState {
  return { areas: [] };
}

/**
 * Add a fog area.
 */
export function addFogArea(
  state: FogState,
  area: FogAreaData
): FogState {
  return {
    areas: [...state.areas, area],
  };
}

/**
 * Remove a fog area by ID.
 */
export function removeFogArea(
  state: FogState,
  areaId: string
): FogState {
  return {
    areas: state.areas.filter((a) => a.id !== areaId),
  };
}

/**
 * Reveal a fog area.
 */
export function revealFogArea(
  state: FogState,
  areaId: string
): FogState {
  return {
    areas: state.areas.map((a) =>
      a.id === areaId ? { ...a, revealed: true } : a
    ),
  };
}

/**
 * Hide a fog area.
 */
export function hideFogArea(
  state: FogState,
  areaId: string
): FogState {
  return {
    areas: state.areas.map((a) =>
      a.id === areaId ? { ...a, revealed: false } : a
    ),
  };
}

/**
 * Check if a point is inside a fog area (unrevealed).
 */
export function isPointFogged(
  state: FogState,
  x: number,
  y: number
): boolean {
  for (const area of state.areas) {
    if (area.revealed) continue;
    if (isPointInArea(x, y, area)) {
      return true;
    }
  }
  return false;
}

function isPointInArea(x: number, y: number, area: FogAreaData): boolean {
  switch (area.type) {
    case "rectangle": {
      const [topLeft, bottomRight] = area.points;
      if (!topLeft || !bottomRight) return false;
      return (
        x >= topLeft[0]! &&
        x <= bottomRight[0]! &&
        y >= topLeft[1]! &&
        y <= bottomRight[1]!
      );
    }
    case "circle": {
      const [center] = area.points;
      const radius = area.points[1]?.[0];
      if (!center || radius === undefined) return false;
      const dx = x - center[0]!;
      const dy = y - center[1]!;
      return dx * dx + dy * dy <= radius * radius;
    }
    case "polygon":
      return isPointInPolygon(x, y, area.points);
  }
}

function isPointInPolygon(x: number, y: number, points: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i]![0]!;
    const yi = points[i]![1]!;
    const xj = points[j]![0]!;
    const yj = points[j]![1]!;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
