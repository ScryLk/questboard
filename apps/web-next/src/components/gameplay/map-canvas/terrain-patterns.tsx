// ── Terrain CSS Pattern Generators ──
// Creates inline SVG data URIs for terrain cell background patterns

import type { TerrainPatternType } from "@/lib/terrain-catalog";

export interface CSSPattern {
  backgroundImage: string;
  backgroundSize: string;
}

function svgDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function createBricksPattern(color: string, size: number): CSSPattern {
  const h = Math.round(size / 3);
  const half = Math.round(size / 2);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <line x1='0' y1='${h}' x2='${size}' y2='${h}' stroke='${color}' stroke-width='0.8'/>
    <line x1='0' y1='${h * 2}' x2='${size}' y2='${h * 2}' stroke='${color}' stroke-width='0.8'/>
    <line x1='${half}' y1='0' x2='${half}' y2='${h}' stroke='${color}' stroke-width='0.8'/>
    <line x1='0' y1='${h}' x2='0' y2='${h * 2}' stroke='${color}' stroke-width='0.8'/>
    <line x1='${size}' y1='${h}' x2='${size}' y2='${h * 2}' stroke='${color}' stroke-width='0.8'/>
    <line x1='${half}' y1='${h * 2}' x2='${half}' y2='${size}' stroke='${color}' stroke-width='0.8'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

function createWavesPattern(color: string, size: number): CSSPattern {
  const h = Math.round(size / 3);
  const q = Math.round(size / 4);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <path d='M0,${h} Q${q},${h - 4} ${size / 2},${h} Q${size * 3 / 4},${h + 4} ${size},${h}' fill='none' stroke='${color}' stroke-width='1'/>
    <path d='M0,${h * 2} Q${q},${h * 2 - 4} ${size / 2},${h * 2} Q${size * 3 / 4},${h * 2 + 4} ${size},${h * 2}' fill='none' stroke='${color}' stroke-width='1'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

function createDotsPattern(color: string, size: number): CSSPattern {
  const r = Math.max(1, Math.round(size * 0.04));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <circle cx='${size * 0.2}' cy='${size * 0.3}' r='${r}' fill='${color}'/>
    <circle cx='${size * 0.7}' cy='${size * 0.15}' r='${r * 0.8}' fill='${color}'/>
    <circle cx='${size * 0.45}' cy='${size * 0.6}' r='${r}' fill='${color}'/>
    <circle cx='${size * 0.85}' cy='${size * 0.75}' r='${r * 0.7}' fill='${color}'/>
    <circle cx='${size * 0.15}' cy='${size * 0.85}' r='${r * 0.9}' fill='${color}'/>
    <circle cx='${size * 0.6}' cy='${size * 0.9}' r='${r * 0.6}' fill='${color}'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

function createLinesPattern(color: string, size: number): CSSPattern {
  const gap = Math.round(size / 4);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <line x1='0' y1='${gap}' x2='${gap}' y2='0' stroke='${color}' stroke-width='0.8'/>
    <line x1='0' y1='${gap * 2}' x2='${gap * 2}' y2='0' stroke='${color}' stroke-width='0.8'/>
    <line x1='0' y1='${gap * 3}' x2='${gap * 3}' y2='0' stroke='${color}' stroke-width='0.8'/>
    <line x1='0' y1='${size}' x2='${size}' y2='0' stroke='${color}' stroke-width='0.8'/>
    <line x1='${gap}' y1='${size}' x2='${size}' y2='${gap}' stroke='${color}' stroke-width='0.8'/>
    <line x1='${gap * 2}' y1='${size}' x2='${size}' y2='${gap * 2}' stroke='${color}' stroke-width='0.8'/>
    <line x1='${gap * 3}' y1='${size}' x2='${size}' y2='${gap * 3}' stroke='${color}' stroke-width='0.8'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

function createPlanksPattern(color: string, size: number): CSSPattern {
  const gap = Math.round(size / 4);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <line x1='1' y1='${gap}' x2='${size - 1}' y2='${gap}' stroke='${color}' stroke-width='0.6'/>
    <line x1='1' y1='${gap * 2}' x2='${size - 1}' y2='${gap * 2}' stroke='${color}' stroke-width='0.6'/>
    <line x1='1' y1='${gap * 3}' x2='${size - 1}' y2='${gap * 3}' stroke='${color}' stroke-width='0.6'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

function createDiamondsPattern(color: string, size: number): CSSPattern {
  const half = Math.round(size / 2);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <polygon points='${half},0 ${size},${half} ${half},${size} 0,${half}' fill='none' stroke='${color}' stroke-width='0.6'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

function createGrassPattern(color: string, size: number): CSSPattern {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <line x1='${size * 0.2}' y1='${size * 0.8}' x2='${size * 0.22}' y2='${size * 0.45}' stroke='${color}' stroke-width='0.8' stroke-linecap='round'/>
    <line x1='${size * 0.25}' y1='${size * 0.8}' x2='${size * 0.3}' y2='${size * 0.5}' stroke='${color}' stroke-width='0.8' stroke-linecap='round'/>
    <line x1='${size * 0.6}' y1='${size * 0.9}' x2='${size * 0.58}' y2='${size * 0.55}' stroke='${color}' stroke-width='0.8' stroke-linecap='round'/>
    <line x1='${size * 0.65}' y1='${size * 0.9}' x2='${size * 0.7}' y2='${size * 0.6}' stroke='${color}' stroke-width='0.8' stroke-linecap='round'/>
    <line x1='${size * 0.85}' y1='${size * 0.7}' x2='${size * 0.82}' y2='${size * 0.35}' stroke='${color}' stroke-width='0.8' stroke-linecap='round'/>
    <line x1='${size * 0.4}' y1='${size * 0.6}' x2='${size * 0.42}' y2='${size * 0.3}' stroke='${color}' stroke-width='0.7' stroke-linecap='round'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

function createCracksPattern(color: string, size: number): CSSPattern {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <polyline points='${size * 0.1},${size * 0.3} ${size * 0.35},${size * 0.4} ${size * 0.5},${size * 0.25} ${size * 0.7},${size * 0.45}' fill='none' stroke='${color}' stroke-width='0.8'/>
    <polyline points='${size * 0.35},${size * 0.4} ${size * 0.3},${size * 0.7} ${size * 0.55},${size * 0.85}' fill='none' stroke='${color}' stroke-width='0.6'/>
    <polyline points='${size * 0.6},${size * 0.6} ${size * 0.85},${size * 0.75} ${size * 0.9},${size * 0.9}' fill='none' stroke='${color}' stroke-width='0.7'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

function createNoisePattern(color: string, size: number): CSSPattern {
  const r = Math.max(0.8, Math.round(size * 0.03));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <circle cx='${size * 0.15}' cy='${size * 0.2}' r='${r * 1.2}' fill='${color}'/>
    <circle cx='${size * 0.55}' cy='${size * 0.1}' r='${r * 0.8}' fill='${color}'/>
    <circle cx='${size * 0.8}' cy='${size * 0.35}' r='${r * 1.1}' fill='${color}'/>
    <circle cx='${size * 0.3}' cy='${size * 0.55}' r='${r}' fill='${color}'/>
    <circle cx='${size * 0.7}' cy='${size * 0.65}' r='${r * 1.3}' fill='${color}'/>
    <circle cx='${size * 0.1}' cy='${size * 0.8}' r='${r * 0.9}' fill='${color}'/>
    <circle cx='${size * 0.5}' cy='${size * 0.85}' r='${r * 0.7}' fill='${color}'/>
    <circle cx='${size * 0.9}' cy='${size * 0.9}' r='${r}' fill='${color}'/>
  </svg>`;
  return { backgroundImage: svgDataUri(svg), backgroundSize: `${size}px ${size}px` };
}

const PATTERN_GENERATORS: Record<TerrainPatternType, ((color: string, size: number) => CSSPattern) | null> = {
  bricks: createBricksPattern,
  waves: createWavesPattern,
  dots: createDotsPattern,
  lines: createLinesPattern,
  planks: createPlanksPattern,
  diamonds: createDiamondsPattern,
  grass: createGrassPattern,
  cracks: createCracksPattern,
  noise: createNoisePattern,
  none: null,
};

export function getTerrainCSSPattern(
  patternType: TerrainPatternType,
  color: string,
  _opacity: number,
  cellSize: number,
): CSSPattern | null {
  const generator = PATTERN_GENERATORS[patternType];
  if (!generator) return null;
  const size = Math.max(12, Math.round(cellSize));
  return generator(color, size);
}
