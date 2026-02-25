/**
 * Lighting computation for dynamic lighting system.
 * Pure functions — no dependencies on DB or network.
 */

export interface LightInput {
  x: number;
  y: number;
  brightRadius: number;
  dimRadius: number;
  color: string;
  intensity: number;
  type: "POINT" | "CONE" | "AMBIENT";
  coneAngle?: number;
  coneDirection?: number;
}

export interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  blocksLight: boolean;
}

export type LightMap = Map<string, { brightness: number; color: string }>;

/**
 * Compute a full light map for the grid.
 * Each cell gets a brightness (0-1) and a color.
 */
export function computeLightMap(
  lights: LightInput[],
  walls: WallSegment[],
  ambientLight: number,
  gridWidth: number,
  gridHeight: number
): LightMap {
  const map: LightMap = new Map();
  const lightWalls = walls.filter((w) => w.blocksLight);

  // Initialize all cells with ambient light
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      map.set(`${x},${y}`, { brightness: ambientLight, color: "#FFFFFF" });
    }
  }

  // Apply each light source
  for (const light of lights) {
    if (light.type === "AMBIENT") {
      // Ambient light affects everything
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          const key = `${x},${y}`;
          const existing = map.get(key)!;
          map.set(key, {
            brightness: Math.min(1, existing.brightness + light.intensity),
            color: blendColors(existing.color, light.color, light.intensity),
          });
        }
      }
      continue;
    }

    const maxRadius = light.dimRadius;
    const minX = Math.max(0, Math.floor(light.x - maxRadius));
    const maxX = Math.min(gridWidth - 1, Math.ceil(light.x + maxRadius));
    const minY = Math.max(0, Math.floor(light.y - maxRadius));
    const maxY = Math.min(gridHeight - 1, Math.ceil(light.y + maxRadius));

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const dx = x - light.x;
        const dy = y - light.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxRadius) continue;

        // Cone check
        if (light.type === "CONE" && light.coneAngle !== undefined && light.coneDirection !== undefined) {
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const halfAngle = light.coneAngle / 2;
          let diff = Math.abs(angle - light.coneDirection);
          if (diff > 180) diff = 360 - diff;
          if (diff > halfAngle) continue;
        }

        // Wall occlusion check
        if (isBlockedByWall(light.x, light.y, x + 0.5, y + 0.5, lightWalls)) {
          continue;
        }

        // Calculate brightness based on distance
        let brightness: number;
        if (dist <= light.brightRadius) {
          brightness = light.intensity;
        } else {
          // Linear falloff from bright to dim
          const t = (dist - light.brightRadius) / (light.dimRadius - light.brightRadius);
          brightness = light.intensity * (1 - t) * 0.5;
        }

        const key = `${x},${y}`;
        const existing = map.get(key)!;
        map.set(key, {
          brightness: Math.min(1, existing.brightness + brightness),
          color: blendColors(existing.color, light.color, brightness),
        });
      }
    }
  }

  return map;
}

/**
 * Simplified light map (no wall occlusion). For mobile or low-end devices.
 */
export function computeLightMapSimple(
  lights: LightInput[],
  ambientLight: number,
  gridWidth: number,
  gridHeight: number
): LightMap {
  return computeLightMap(lights, [], ambientLight, gridWidth, gridHeight);
}

/**
 * Check if a line from (x1,y1) to (x2,y2) intersects any wall segment.
 */
export function isBlockedByWall(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  walls: WallSegment[]
): boolean {
  for (const wall of walls) {
    if (segmentsIntersect(x1, y1, x2, y2, wall.x1, wall.y1, wall.x2, wall.y2)) {
      return true;
    }
  }
  return false;
}

/**
 * Check line-of-sight between two points using wall segments.
 */
export function hasLineOfSightSegments(
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  walls: WallSegment[]
): boolean {
  const visionWalls = walls.filter((w) => w.blocksLight);
  return !isBlockedByWall(originX, originY, targetX, targetY, visionWalls);
}

/**
 * Get all cells visible from an origin point, considering wall segments.
 */
export function getVisibleCells(
  origin: { x: number; y: number },
  maxRadius: number,
  walls: WallSegment[],
  gridWidth: number,
  gridHeight: number
): Set<string> {
  const visible = new Set<string>();
  const visionWalls = walls.filter((w) => w.blocksLight);

  const minX = Math.max(0, Math.floor(origin.x - maxRadius));
  const maxX = Math.min(gridWidth - 1, Math.ceil(origin.x + maxRadius));
  const minY = Math.max(0, Math.floor(origin.y - maxRadius));
  const maxY = Math.min(gridHeight - 1, Math.ceil(origin.y + maxRadius));

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const dist = Math.sqrt((x - origin.x) ** 2 + (y - origin.y) ** 2);
      if (dist > maxRadius) continue;

      if (!isBlockedByWall(origin.x, origin.y, x + 0.5, y + 0.5, visionWalls)) {
        visible.add(`${x},${y}`);
      }
    }
  }

  return visible;
}

// ── Utility functions ──

function segmentsIntersect(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): boolean {
  const d1 = direction(bx1, by1, bx2, by2, ax1, ay1);
  const d2 = direction(bx1, by1, bx2, by2, ax2, ay2);
  const d3 = direction(ax1, ay1, ax2, ay2, bx1, by1);
  const d4 = direction(ax1, ay1, ax2, ay2, bx2, by2);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  if (d1 === 0 && onSegment(bx1, by1, bx2, by2, ax1, ay1)) return true;
  if (d2 === 0 && onSegment(bx1, by1, bx2, by2, ax2, ay2)) return true;
  if (d3 === 0 && onSegment(ax1, ay1, ax2, ay2, bx1, by1)) return true;
  if (d4 === 0 && onSegment(ax1, ay1, ax2, ay2, bx2, by2)) return true;

  return false;
}

function direction(
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function onSegment(
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): boolean {
  return (
    Math.min(ax, bx) <= cx && cx <= Math.max(ax, bx) &&
    Math.min(ay, by) <= cy && cy <= Math.max(ay, by)
  );
}

function blendColors(base: string, overlay: string, factor: number): string {
  // Simple additive color blend — in practice the client handles rendering
  if (factor >= 0.5) return overlay;
  return base;
}
