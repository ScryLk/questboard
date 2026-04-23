import type { UnitSystem } from "./map-scale-store";

// Níveis discretos de zoom — 7 níveis conforme spec.
export const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0] as const;
export const DEFAULT_ZOOM_INDEX = 3; // 100%

export function getZoomInLevel(currentZoom: number): number {
  // Pega o primeiro nível estritamente maior que o atual.
  const next = ZOOM_LEVELS.find((z) => z > currentZoom + 1e-6);
  return next ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
}

export function getZoomOutLevel(currentZoom: number): number {
  // Pega o último nível estritamente menor que o atual.
  const reversed = [...ZOOM_LEVELS].reverse();
  const prev = reversed.find((z) => z < currentZoom - 1e-6);
  return prev ?? ZOOM_LEVELS[0];
}

export function snapToNearestZoom(zoom: number): number {
  return ZOOM_LEVELS.reduce((best, curr) =>
    Math.abs(curr - zoom) < Math.abs(best - zoom) ? curr : best,
  );
}

/**
 * Formata uma distância em células como string amigável, baseado no
 * sistema de unidade da campanha.
 *
 *   IMPERIAL + unitsPerCell=5 + cells=3 → "15 ft"
 *   METRIC   + unitsPerCell=1.5 + cells=4 → "6 m"
 *   ABSTRACT + cells=3 → "3 células"
 */
export function formatDistance(
  cells: number,
  unitsPerCell: number,
  unitSystem: UnitSystem,
): string {
  if (unitSystem === "ABSTRACT") {
    const rounded = Math.round(cells * 10) / 10;
    const label = rounded === 1 ? "célula" : "células";
    return `${formatNumber(rounded)} ${label}`;
  }

  const total = cells * unitsPerCell;
  const unit = unitSystem === "IMPERIAL" ? "ft" : "m";
  return `${formatNumber(total)} ${unit}`;
}

function formatNumber(n: number): string {
  // Sem decimais quando inteiro, 1 casa quando fracionário.
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(/\.0$/, "");
}

export function unitSystemLabel(unitSystem: UnitSystem): string {
  switch (unitSystem) {
    case "IMPERIAL":
      return "Imperial (ft)";
    case "METRIC":
      return "Métrico (m)";
    case "ABSTRACT":
      return "Abstrato (célula)";
  }
}
