"use client";

import { CELL_SIZE } from "@questboard/constants";
import { useCameraStore } from "@/lib/camera-store";
import { useMapScale } from "@/lib/map-scale-store";
import { formatDistance } from "@/lib/map-scale";

/**
 * Barra visual de escala — canto inferior esquerdo. Mostra quanto vale
 * um trecho horizontal do mapa em unidades do mundo.
 *
 * Adapta a quantidade de células representadas pelo zoom atual pra
 * manter o tamanho da barra entre ~48-160px, sempre legível.
 */
interface ScaleBarProps {
  /** Override do zoom atual — útil quando o canvas não usa `useCameraStore`
   *  (ex: PlayerCanvas, que é scroll HTML sem zoom). Default: camera store. */
  zoomOverride?: number;
}

export function ScaleBar({ zoomOverride }: ScaleBarProps = {}) {
  const storeZoom = useCameraStore((s) => s.zoom);
  const zoom = zoomOverride ?? storeZoom;
  const unitSystem = useMapScale((s) => s.unitSystem);
  const unitsPerCell = useMapScale((s) => s.unitsPerCell);

  const cellPx = CELL_SIZE * zoom;
  const { cells, widthPx } = chooseCellCount(cellPx);
  const label = formatDistance(cells, unitsPerCell, unitSystem);

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-40 flex items-center gap-2 rounded-md bg-[#0D0D12]/75 px-2.5 py-1.5 backdrop-blur-sm">
      <div className="flex h-3 items-center" style={{ width: widthPx }}>
        {/* Tick esquerdo */}
        <div className="h-full w-px bg-brand-accent/80" />
        {/* Linha central */}
        <div className="h-px flex-1 bg-brand-accent/60" />
        {/* Tick direito */}
        <div className="h-full w-px bg-brand-accent/80" />
      </div>
      <span className="font-mono text-[10px] tabular-nums text-brand-text">
        {label}
      </span>
    </div>
  );
}

/**
 * Escolhe quantas células representar conforme o tamanho delas em
 * pixels no viewport. Alvo: barra entre 48-160px.
 */
function chooseCellCount(cellPx: number): {
  cells: number;
  widthPx: number;
} {
  // Escala muito grande — subdivide (½ célula)
  if (cellPx >= 200) return { cells: 0.5, widthPx: cellPx * 0.5 };
  // Escala confortável — 1 célula
  if (cellPx >= 48) return { cells: 1, widthPx: cellPx };
  // Célula pequena — agrupa 5
  if (cellPx * 5 >= 48) return { cells: 5, widthPx: cellPx * 5 };
  // Muito zoom out — agrupa 10
  return { cells: 10, widthPx: Math.max(24, cellPx * 10) };
}
