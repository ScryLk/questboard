import { createNoise2D } from "simplex-noise";
import type { FogColor } from "./gameplay-mock-data";
import { FOG_COLOR_THEMES } from "./gameplay-mock-data";

// ── Noise Texture ─────────────────────────────────────

const NOISE_SIZE = 256;

/**
 * Generates a tileable smoke noise texture (ImageData 256x256) using
 * multi-octave simplex noise. Uses the LIGHTER smoke accent color (sr/sg/sb)
 * so it contrasts visibly against the dark base fill when composited
 * via `source-atop`.
 */
export function generateNoiseTexture(color: FogColor): ImageData {
  const noise2D = createNoise2D();
  const theme = FOG_COLOR_THEMES[color];
  const data = new Uint8ClampedArray(NOISE_SIZE * NOISE_SIZE * 4);

  for (let y = 0; y < NOISE_SIZE; y++) {
    for (let x = 0; x < NOISE_SIZE; x++) {
      const nx = x / NOISE_SIZE;
      const ny = y / NOISE_SIZE;

      // 4 octaves: large billowy clouds → fine smoke detail
      let val =
        0.40 * noise2D(nx * 3, ny * 3) +
        0.30 * noise2D(nx * 6, ny * 6) +
        0.20 * noise2D(nx * 12, ny * 12) +
        0.10 * noise2D(nx * 24, ny * 24);

      // Normalize [-1, 1] → [0, 1]
      val = (val + 1) / 2;
      // Contrast curve — darker darks, brighter brights
      val = val * val;

      const idx = (y * NOISE_SIZE + x) * 4;
      // Smoke accent color (lighter than base)
      data[idx] = theme.sr;
      data[idx + 1] = theme.sg;
      data[idx + 2] = theme.sb;
      // High alpha range for dramatic smoke wisps (25–230)
      data[idx + 3] = Math.floor(val * 205 + 25);
    }
  }

  return new ImageData(data, NOISE_SIZE, NOISE_SIZE);
}

// ── Edge Detection ────────────────────────────────────

export interface CellEdgeInfo {
  /** True if all 4 cardinal neighbors are also fog */
  isCenter: boolean;
  /** Which sides are exposed (neighbor is NOT fog) */
  exposedTop: boolean;
  exposedBottom: boolean;
  exposedLeft: boolean;
  exposedRight: boolean;
}

const NEIGHBOR_OFFSETS = [
  { dx: 0, dy: -1, side: "exposedTop" as const },
  { dx: 0, dy: 1, side: "exposedBottom" as const },
  { dx: -1, dy: 0, side: "exposedLeft" as const },
  { dx: 1, dy: 0, side: "exposedRight" as const },
];

/**
 * Checks the 4 cardinal neighbors of a fog cell to determine which edges
 * are exposed (bordering non-fog). Used to render soft gradient edges.
 */
export function getCellEdgeInfo(
  x: number,
  y: number,
  fogCells: Set<string>,
): CellEdgeInfo {
  const info: CellEdgeInfo = {
    isCenter: true,
    exposedTop: false,
    exposedBottom: false,
    exposedLeft: false,
    exposedRight: false,
  };

  for (const { dx, dy, side } of NEIGHBOR_OFFSETS) {
    if (!fogCells.has(`${x + dx},${y + dy}`)) {
      info[side] = true;
      info.isCenter = false;
    }
  }

  return info;
}

// ── Viewport Culling ──────────────────────────────────

/**
 * Filters fog cells to only those visible in the current viewport,
 * with 1 cell of padding for smooth gradient edges at the viewport border.
 */
export function getVisibleCells(
  fogCells: Set<string>,
  scrollLeft: number,
  scrollTop: number,
  viewportW: number,
  viewportH: number,
  scaledCell: number,
): string[] {
  if (scaledCell <= 0) return [];

  // If viewport not yet measured, return all cells
  if (viewportW <= 0 || viewportH <= 0) return Array.from(fogCells);

  const startCol = Math.floor(scrollLeft / scaledCell) - 1;
  const startRow = Math.floor(scrollTop / scaledCell) - 1;
  const endCol = Math.ceil((scrollLeft + viewportW) / scaledCell) + 1;
  const endRow = Math.ceil((scrollTop + viewportH) / scaledCell) + 1;

  const visible: string[] = [];
  for (const key of fogCells) {
    const commaIdx = key.indexOf(",");
    const cx = parseInt(key.substring(0, commaIdx), 10);
    const cy = parseInt(key.substring(commaIdx + 1), 10);
    if (cx >= startCol && cx <= endCol && cy >= startRow && cy <= endRow) {
      visible.push(key);
    }
  }

  return visible;
}

// ── Particle System ───────────────────────────────────

export interface FogParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  radius: number;
  life: number;
  maxLife: number;
  /** "reveal" particles rise up; "cover" particles drift down */
  type: "reveal" | "cover";
}

const MAX_PARTICLES = 50;

/**
 * Spawns 5 particles when a cell is revealed or covered.
 * Reveal particles drift upward; cover particles drift downward.
 */
export function spawnParticles(
  cellX: number,
  cellY: number,
  scaledCell: number,
  existing: FogParticle[],
  type: "reveal" | "cover",
): FogParticle[] {
  // Cap total particles
  if (existing.length >= MAX_PARTICLES) return existing;

  const centerX = cellX * scaledCell + scaledCell / 2;
  const centerY = cellY * scaledCell + scaledCell / 2;
  const count = Math.min(5, MAX_PARTICLES - existing.length);
  const newParticles: FogParticle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spread = Math.random() * scaledCell * 0.3;
    const life = 1.5 + Math.random() * 1.0; // 1.5–2.5s

    newParticles.push({
      x: centerX + Math.cos(angle) * spread,
      y: centerY + Math.sin(angle) * spread,
      vx: (Math.random() - 0.5) * 15,
      vy: type === "reveal" ? -(20 + Math.random() * 20) : 10 + Math.random() * 15,
      alpha: 0.6 + Math.random() * 0.3,
      radius: 2 + Math.random() * 3,
      life,
      maxLife: life,
      type,
    });
  }

  return [...existing, ...newParticles];
}

/**
 * Updates particle positions and fades them out over their lifetime.
 * Returns only particles that are still alive.
 */
export function updateParticles(
  particles: FogParticle[],
  dt: number,
): FogParticle[] {
  const alive: FogParticle[] = [];

  for (const p of particles) {
    p.life -= dt;
    if (p.life <= 0) continue;

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    // Fade out as life decreases
    p.alpha = (p.life / p.maxLife) * 0.7;
    // Slow down
    p.vx *= 0.98;
    p.vy *= 0.98;

    alive.push(p);
  }

  return alive;
}

// ── Parse cell key ────────────────────────────────────

export function parseCellKey(key: string): { x: number; y: number } {
  const commaIdx = key.indexOf(",");
  return {
    x: parseInt(key.substring(0, commaIdx), 10),
    y: parseInt(key.substring(commaIdx + 1), 10),
  };
}
