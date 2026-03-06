"use client";

import { useGameplayStore } from "@/lib/gameplay-store";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { GRID_TYPE_LABELS } from "@/lib/map-sidebar-types";
import type { GridType } from "@/lib/map-sidebar-types";

export function GridControls() {
  const gridVisible = useGameplayStore((s) => s.gridVisible);
  const toggleGrid = useGameplayStore((s) => s.toggleGrid);
  const mapBackgroundOpacity = useGameplayStore((s) => s.mapBackgroundOpacity);
  const setMapBackgroundOpacity = useGameplayStore(
    (s) => s.setMapBackgroundOpacity,
  );

  const gridType = useMapSidebarStore((s) => s.gridType);
  const gridSnap = useMapSidebarStore((s) => s.gridSnap);
  const gridShowCoordinates = useMapSidebarStore((s) => s.gridShowCoordinates);
  const gridHoverHighlight = useMapSidebarStore((s) => s.gridHoverHighlight);
  const cellSizeFt = useMapSidebarStore((s) => s.cellSizeFt);
  const setGridType = useMapSidebarStore((s) => s.setGridType);
  const setGridSnap = useMapSidebarStore((s) => s.setGridSnap);
  const setGridShowCoordinates = useMapSidebarStore(
    (s) => s.setGridShowCoordinates,
  );
  const setGridHoverHighlight = useMapSidebarStore(
    (s) => s.setGridHoverHighlight,
  );
  const setCellSizeFt = useMapSidebarStore((s) => s.setCellSizeFt);

  return (
    <div className="space-y-2">
      {/* Visible toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-brand-text">Visível</span>
        <button
          onClick={toggleGrid}
          className={`relative h-4 w-7 rounded-full transition-colors ${
            gridVisible ? "bg-brand-accent" : "bg-white/10"
          }`}
        >
          <div
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
              gridVisible ? "translate-x-3.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-brand-muted">Opacidade</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(mapBackgroundOpacity * 100)}
          onChange={(e) =>
            setMapBackgroundOpacity(parseInt(e.target.value) / 100)
          }
          className="h-1 flex-1 accent-brand-accent"
        />
        <span className="w-7 text-right text-[8px] tabular-nums text-brand-muted">
          {Math.round(mapBackgroundOpacity * 100)}%
        </span>
      </div>

      {/* Cell size */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-brand-muted">Escala</span>
        <span className="text-[9px] text-brand-text">1 cel =</span>
        <input
          type="number"
          value={cellSizeFt}
          onChange={(e) => setCellSizeFt(parseInt(e.target.value) || 5)}
          min={1}
          max={100}
          className="h-5 w-10 rounded border border-brand-border bg-brand-primary px-1 text-center text-[9px] text-brand-text outline-none focus:border-brand-accent/40"
        />
        <span className="text-[9px] text-brand-text">ft</span>
      </div>

      {/* Grid type */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-brand-muted">Tipo</span>
        <select
          value={gridType}
          onChange={(e) => setGridType(e.target.value as GridType)}
          className="h-5 flex-1 rounded border border-brand-border bg-brand-primary px-1 text-[9px] text-brand-text outline-none focus:border-brand-accent/40"
        >
          {Object.entries(GRID_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggle options */}
      <div className="space-y-1">
        <ToggleRow
          label="Snap to Grid"
          checked={gridSnap}
          onChange={setGridSnap}
        />
        <ToggleRow
          label="Coordenadas"
          checked={gridShowCoordinates}
          onChange={setGridShowCoordinates}
        />
        <ToggleRow
          label="Hover célula"
          checked={gridHoverHighlight}
          onChange={setGridHoverHighlight}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-[9px] text-brand-muted">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-4 w-7 rounded-full transition-colors ${
          checked ? "bg-brand-accent" : "bg-white/10"
        }`}
      >
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
            checked ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
