import { Minus, Plus, Grid3x3, Magnet } from "lucide-react";
import { useEditorStore } from "../../lib/editor-store";

export function BottomBar() {
  const {
    viewport,
    gridVisible,
    snapToGrid,
    mapWidth,
    mapHeight,
    gridScale,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleGrid,
    toggleSnap,
  } = useEditorStore();

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <div className="h-8 bg-bg-panel border-t border-border flex items-center px-4 text-xs text-text-muted gap-4 shrink-0">
      {/* Zoom */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-secondary font-medium">Zoom:</span>
        <button
          onClick={zoomOut}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-border/50 hover:text-text-primary"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={resetZoom}
          className="px-1.5 hover:text-text-primary"
        >
          {zoomPercent}%
        </button>
        <button
          onClick={zoomIn}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-border/50 hover:text-text-primary"
        >
          <Plus size={12} />
        </button>
      </div>

      <div className="w-px h-3.5 bg-border" />

      {/* Grid toggle */}
      <button
        onClick={toggleGrid}
        className={`flex items-center gap-1 hover:text-text-primary ${
          gridVisible ? "text-text-secondary" : "text-text-muted"
        }`}
      >
        <Grid3x3 size={12} />
        Grid: {gridVisible ? "ON" : "OFF"}
      </button>

      <div className="w-px h-3.5 bg-border" />

      {/* Snap toggle */}
      <button
        onClick={toggleSnap}
        className={`flex items-center gap-1 hover:text-text-primary ${
          snapToGrid ? "text-text-secondary" : "text-text-muted"
        }`}
      >
        <Magnet size={12} />
        Snap: {snapToGrid ? "ON" : "OFF"}
      </button>

      <div className="w-px h-3.5 bg-border" />

      {/* Map size */}
      <span className="text-text-secondary">
        {mapWidth}×{mapHeight}
      </span>

      <div className="w-px h-3.5 bg-border" />

      {/* Grid scale */}
      <span>{gridScale}</span>
    </div>
  );
}
