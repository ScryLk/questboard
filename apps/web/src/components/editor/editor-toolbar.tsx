import { useState } from "react";
import { useMapEditorStore } from "../../lib/map-editor-store.js";

export function EditorToolbar() {
  const {
    mapName,
    setMapName,
    isDirty,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useMapEditorStore();

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#111116] px-4">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white"
          title="Voltar"
        >
          ←
        </button>

        {isEditing ? (
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            autoFocus
            className="rounded bg-[#0F0F12] px-2 py-1 text-sm font-semibold text-white outline-none ring-1 ring-brand-accent"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-semibold text-white hover:text-brand-accent"
          >
            {mapName}
          </button>
        )}

        {isDirty && (
          <span className="text-xs text-yellow-500">Alterações não salvas</span>
        )}
      </div>

      {/* Center section - Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
          title="Desfazer (Ctrl+Z)"
        >
          ↺ Desfazer
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
          title="Refazer (Ctrl+Shift+Z)"
        >
          ↻ Refazer
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button className="rounded bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10">
          Preview
        </button>
        <button className="rounded bg-brand-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-accent/80">
          Salvar
        </button>
      </div>
    </div>
  );
}

export function EditorBottomBar() {
  const { zoom, setZoom, gridVisible, setGridVisible, snapToGrid, setSnapToGrid, mapWidth, mapHeight, gridScale } =
    useMapEditorStore();

  return (
    <div className="flex h-8 items-center justify-between border-t border-white/10 bg-[#111116] px-4 text-xs text-gray-500">
      <div className="flex items-center gap-4">
        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <span>Zoom:</span>
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="rounded px-1 hover:bg-white/5 hover:text-white"
          >
            −
          </button>
          <span className="w-10 text-center text-gray-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="rounded px-1 hover:bg-white/5 hover:text-white"
          >
            +
          </button>
        </div>

        {/* Grid toggle */}
        <button
          onClick={() => setGridVisible(!gridVisible)}
          className={`rounded px-2 py-0.5 ${
            gridVisible ? "bg-white/10 text-gray-300" : "text-gray-600"
          }`}
        >
          Grid: {gridVisible ? "ON" : "OFF"}
        </button>

        {/* Snap toggle */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`rounded px-2 py-0.5 ${
            snapToGrid ? "bg-white/10 text-gray-300" : "text-gray-600"
          }`}
        >
          Snap: {snapToGrid ? "ON" : "OFF"}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span>
          {mapWidth}×{mapHeight}
        </span>
        <span>Tile: {gridScale}</span>
      </div>
    </div>
  );
}
