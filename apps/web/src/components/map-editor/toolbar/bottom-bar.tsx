import { useMapEditorStore } from "../../../stores/map-editor-store.js";

export function BottomBar() {
  const {
    viewport,
    setViewport,
    gridVisible,
    toggleGrid,
    snapToGrid,
    toggleSnap,
    width,
    height,
    gridScale,
    history,
    historyIndex,
    undo,
    redo,
  } = useMapEditorStore();

  const zoomPercent = Math.round(viewport.zoom * 100);

  const handleZoomIn = () => {
    setViewport({ zoom: Math.min(4, viewport.zoom * 1.2) });
  };

  const handleZoomOut = () => {
    setViewport({ zoom: Math.max(0.2, viewport.zoom / 1.2) });
  };

  const handleResetZoom = () => {
    setViewport({ zoom: 1, x: 0, y: 0 });
  };

  return (
    <div className="flex h-8 items-center justify-between border-t border-white/10 bg-[#111116] px-4">
      {/* Left: Zoom controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-white/5 hover:text-white"
          >
            -
          </button>
          <button
            onClick={handleResetZoom}
            className="min-w-[40px] rounded px-1 text-center text-[10px] text-gray-300 hover:bg-white/5"
          >
            {zoomPercent}%
          </button>
          <button
            onClick={handleZoomIn}
            className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-gray-400 hover:bg-white/5 hover:text-white"
          >
            +
          </button>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <button
          onClick={toggleGrid}
          className={`rounded px-2 py-0.5 text-[10px] ${
            gridVisible ? "text-brand-accent" : "text-gray-500"
          } hover:bg-white/5`}
        >
          Grid: {gridVisible ? "ON" : "OFF"}
        </button>

        <div className="h-3 w-px bg-white/10" />

        <button
          onClick={toggleSnap}
          className={`rounded px-2 py-0.5 text-[10px] ${
            snapToGrid ? "text-brand-accent" : "text-gray-500"
          } hover:bg-white/5`}
        >
          Snap: {snapToGrid ? "ON" : "OFF"}
        </button>
      </div>

      {/* Center: Map info */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <span>
          {width}x{height}
        </span>
        <div className="h-3 w-px bg-white/10" />
        <span>{gridScale}</span>
      </div>

      {/* Right: Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="flex h-5 items-center gap-1 rounded px-2 text-[10px] text-gray-400 hover:bg-white/5 disabled:opacity-30"
          title="Ctrl+Z"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Desfazer
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="flex h-5 items-center gap-1 rounded px-2 text-[10px] text-gray-400 hover:bg-white/5 disabled:opacity-30"
          title="Ctrl+Shift+Z"
        >
          Refazer
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
