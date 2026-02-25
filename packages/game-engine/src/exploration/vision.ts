/**
 * Vision system for individual token sight with raycasting.
 * Respects walls, doors (closed block vision), and light state.
 */

export interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  blocksVision: boolean;
  blocksMovement: boolean;
  blocksLight: boolean;
  isDoor: boolean;
  doorState: string;
}

export interface LightMap {
  cells: Map<string, number>; // "x,y" → brightness (0-1)
}

export interface VisibleCells {
  currentlyVisible: Set<string>;
  brightCells: Set<string>;
  dimCells: Set<string>;
  darkCells: Set<string>;
}

export interface FogGeometry {
  shapeType: string;
  [key: string]: unknown;
}

/**
 * Computes all cells visible from a token position using raycasting.
 * Walls and closed doors block vision.
 */
export function computeTokenVision(
  tokenPos: { x: number; y: number },
  visionRadius: number,
  walls: WallSegment[],
  doors: Array<{ wallId: string; state: string }>,
  gridType: string,
  options?: {
    hasDarkvision?: boolean;
    darkvisionRadius?: number;
    lightMap?: LightMap;
  }
): VisibleCells {
  const currentlyVisible = new Set<string>();
  const brightCells = new Set<string>();
  const dimCells = new Set<string>();
  const darkCells = new Set<string>();

  // Build effective wall list (closed doors block, open doors don't)
  const openDoors = new Set(
    doors.filter((d) => d.state === "OPEN").map((d) => d.wallId)
  );

  const effectiveWalls = walls.filter((w) => {
    if (!w.blocksVision) return false;
    if (w.isDoor && openDoors.has(`${w.x1},${w.y1},${w.x2},${w.y2}`)) return false;
    return true;
  });

  const cx = Math.floor(tokenPos.x);
  const cy = Math.floor(tokenPos.y);
  const radius = Math.ceil(visionRadius);

  // Cast rays in 360 directions
  const rayCount = Math.max(72, radius * 8);
  const angleStep = (2 * Math.PI) / rayCount;

  for (let i = 0; i < rayCount; i++) {
    const angle = i * angleStep;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    // Step along the ray
    for (let step = 0; step <= radius; step += 0.5) {
      const rx = tokenPos.x + dx * step;
      const ry = tokenPos.y + dy * step;
      const cellX = Math.floor(rx);
      const cellY = Math.floor(ry);
      const key = `${cellX},${cellY}`;

      // Check if ray is blocked by any wall
      if (step > 0 && isRayBlockedByWalls(tokenPos.x, tokenPos.y, rx, ry, effectiveWalls)) {
        break;
      }

      currentlyVisible.add(key);

      // Classify by brightness
      const brightness = options?.lightMap?.cells.get(key) ?? 1.0;
      if (brightness > 0.6) {
        brightCells.add(key);
      } else if (brightness > 0.2) {
        dimCells.add(key);
      } else {
        if (options?.hasDarkvision) {
          const dvRadius = options.darkvisionRadius ?? visionRadius;
          const dist = Math.sqrt((cellX - cx) ** 2 + (cellY - cy) ** 2);
          if (dist <= dvRadius) {
            darkCells.add(key);
          }
        }
      }
    }
  }

  return { currentlyVisible, brightCells, dimCells, darkCells };
}

/**
 * Combines multiple players' visions into a shared vision (union).
 */
export function computeSharedVision(
  playerVisions: Map<string, VisibleCells>
): VisibleCells {
  const currentlyVisible = new Set<string>();
  const brightCells = new Set<string>();
  const dimCells = new Set<string>();
  const darkCells = new Set<string>();

  for (const vision of playerVisions.values()) {
    for (const cell of vision.currentlyVisible) currentlyVisible.add(cell);
    for (const cell of vision.brightCells) brightCells.add(cell);
    for (const cell of vision.dimCells) dimCells.add(cell);
    for (const cell of vision.darkCells) darkCells.add(cell);
  }

  return { currentlyVisible, brightCells, dimCells, darkCells };
}

/**
 * Determines which fog areas should be revealed based on visible cells.
 */
export function computeFogReveal(
  visibleCells: Set<string>,
  fogAreas: Array<{ id: string; isRevealed: boolean; geometry: Record<string, unknown> }>,
  revealThreshold: number = 0.3
): { toReveal: string[]; toExplore: string[] } {
  const toReveal: string[] = [];
  const toExplore: string[] = [];

  for (const area of fogAreas) {
    if (area.isRevealed) continue;

    const areaCells = getFogAreaCells(area.geometry);
    if (areaCells.length === 0) continue;

    let visibleCount = 0;
    for (const cell of areaCells) {
      if (visibleCells.has(cell)) visibleCount++;
    }

    const overlap = visibleCount / areaCells.length;
    if (overlap >= revealThreshold) {
      toReveal.push(area.id);
    } else if (overlap > 0) {
      toExplore.push(area.id);
    }
  }

  return { toReveal, toExplore };
}

function isRayBlockedByWalls(
  ox: number, oy: number, tx: number, ty: number,
  walls: WallSegment[]
): boolean {
  for (const wall of walls) {
    if (segmentsIntersect(ox, oy, tx, ty, wall.x1, wall.y1, wall.x2, wall.y2)) {
      return true;
    }
  }
  return false;
}

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
  return false;
}

function direction(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function getFogAreaCells(geometry: Record<string, unknown>): string[] {
  const cells: string[] = [];
  const shapeType = geometry.shapeType ?? geometry.type ?? "rectangle";

  if (shapeType === "rectangle" || shapeType === "RECTANGLE") {
    const x = (geometry.x as number) ?? 0;
    const y = (geometry.y as number) ?? 0;
    const w = (geometry.width as number) ?? 1;
    const h = (geometry.height as number) ?? 1;
    for (let cx = x; cx < x + w; cx++) {
      for (let cy = y; cy < y + h; cy++) {
        cells.push(`${cx},${cy}`);
      }
    }
  } else if (shapeType === "circle" || shapeType === "CIRCLE") {
    const centerX = (geometry.centerX ?? geometry.cx) as number ?? 0;
    const centerY = (geometry.centerY ?? geometry.cy) as number ?? 0;
    const radius = (geometry.radius as number) ?? 1;
    for (let cx = Math.floor(centerX - radius); cx <= Math.ceil(centerX + radius); cx++) {
      for (let cy = Math.floor(centerY - radius); cy <= Math.ceil(centerY + radius); cy++) {
        if ((cx - centerX) ** 2 + (cy - centerY) ** 2 <= radius ** 2) {
          cells.push(`${cx},${cy}`);
        }
      }
    }
  }

  return cells;
}
