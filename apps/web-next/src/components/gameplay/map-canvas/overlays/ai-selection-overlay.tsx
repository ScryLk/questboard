"use client";

import { useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";
import { MOCK_MAP } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { AISelection } from "@/lib/gameplay-store";
import { useCameraStore } from "@/lib/camera-store";
import { CELL_SIZE } from "@/lib/gameplay/constants";

interface AISelectionOverlayProps {
  selection: AISelection;
  scaledCell: number;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

const HANDLE_SIZE = 8;
const { cellSizeFt } = MOCK_MAP;

export function AISelectionOverlay({
  selection,
  scaledCell,
  viewportRef,
}: AISelectionOverlayProps) {
  const handleDragRef = useRef(false);
  const aiGenerationStatus = useGameplayStore((s) => s.aiGenerationStatus);

  const minX = Math.min(selection.x1, selection.x2);
  const minY = Math.min(selection.y1, selection.y2);
  const maxX = Math.max(selection.x1, selection.x2);
  const maxY = Math.max(selection.y1, selection.y2);

  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;

  const left = minX * scaledCell;
  const top = minY * scaledCell;
  const width = cols * scaledCell;
  const height = rows * scaledCell;

  const widthFt = cols * cellSizeFt;
  const heightFt = rows * cellSizeFt;

  const isGenerating = aiGenerationStatus === "generating";

  const getGridCellFromEvent = useCallback(
    (ev: MouseEvent) => {
      if (!viewportRef.current) return null;
      const rect = viewportRef.current.getBoundingClientRect();
      const cam = useCameraStore.getState();
      const worldX = (ev.clientX - rect.left - cam.panX) / cam.zoom;
      const worldY = (ev.clientY - rect.top - cam.panY) / cam.zoom;
      return {
        x: Math.floor(worldX / CELL_SIZE),
        y: Math.floor(worldY / CELL_SIZE),
      };
    },
    [viewportRef],
  );

  const handleHandleMouseDown = useCallback(
    (e: React.MouseEvent, corner: "tl" | "tr" | "bl" | "br") => {
      if (isGenerating) return;
      e.stopPropagation();
      e.preventDefault();
      handleDragRef.current = true;

      function onMove(ev: MouseEvent) {
        const cell = getGridCellFromEvent(ev);
        if (!cell) return;
        const current = useGameplayStore.getState().aiSelection;
        if (!current) return;
        const update = { ...current };
        if (corner === "tl") { update.x1 = cell.x; update.y1 = cell.y; }
        if (corner === "tr") { update.x2 = cell.x; update.y1 = cell.y; }
        if (corner === "bl") { update.x1 = cell.x; update.y2 = cell.y; }
        if (corner === "br") { update.x2 = cell.x; update.y2 = cell.y; }
        useGameplayStore.getState().setAISelection(update);
      }

      function onUp() {
        handleDragRef.current = false;
        useGameplayStore.getState().finalizeAISelection();
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [getGridCellFromEvent, isGenerating],
  );

  const handleBodyMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (handleDragRef.current || isGenerating) return;
      if (!selection.finalized) return;
      e.stopPropagation();
      e.preventDefault();

      const startCell = getGridCellFromEvent(e.nativeEvent);
      if (!startCell) return;

      function onMove(ev: MouseEvent) {
        const cell = getGridCellFromEvent(ev);
        if (!cell || !startCell) return;
        const current = useGameplayStore.getState().aiSelection;
        if (!current) return;
        const dx = cell.x - startCell.x;
        const dy = cell.y - startCell.y;
        if (dx === 0 && dy === 0) return;
        startCell.x = cell.x;
        startCell.y = cell.y;
        useGameplayStore.getState().setAISelection({
          x1: current.x1 + dx,
          y1: current.y1 + dy,
          x2: current.x2 + dx,
          y2: current.y2 + dy,
          finalized: true,
        });
      }

      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [selection.finalized, getGridCellFromEvent, isGenerating],
  );

  const half = HANDLE_SIZE / 2;

  return (
    <>
      {/* Marching ants + shimmer CSS */}
      <style>{`
        @keyframes marchingAntsAI {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -20; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Selection rectangle */}
      <svg
        className="pointer-events-none absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <rect
          x={left}
          y={top}
          width={width}
          height={height}
          fill="rgba(245, 158, 11, 0.08)"
          stroke="#F59E0B"
          strokeWidth={2}
          strokeDasharray="6 4"
          style={{ animation: "marchingAntsAI 0.5s linear infinite" }}
        />
      </svg>

      {/* Central label */}
      <div
        className="pointer-events-none absolute flex flex-col items-center justify-center gap-1"
        style={{ left, top, width, height }}
      >
        {isGenerating ? (
          <>
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 overflow-hidden rounded"
              style={{ left: 0, top: 0, width: "100%", height: "100%" }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
                style={{ animation: "shimmer 1.5s ease-in-out infinite" }}
              />
            </div>
            <Sparkles className="h-5 w-5 animate-pulse text-amber-400" />
            <span className="text-xs font-medium text-amber-400">
              Gerando textura...
            </span>
          </>
        ) : (
          cols * rows > 4 && (
            <>
              <Sparkles className="h-4 w-4 text-amber-400/70" />
              <span className="text-xs font-semibold text-amber-400">
                {cols}×{rows}
              </span>
              <span className="text-[10px] text-amber-400/60">
                {widthFt}×{heightFt}ft
              </span>
            </>
          )
        )}
      </div>

      {/* Interactive layer — only when finalized and not generating */}
      {selection.finalized && !isGenerating && (
        <>
          {/* Move body */}
          <div
            className="absolute cursor-move"
            style={{ left, top, width, height }}
            onMouseDown={handleBodyMouseDown}
          />

          {/* Corner handles */}
          {([
            { cx: left - half, cy: top - half, corner: "tl" as const, cursor: "nwse-resize" },
            { cx: left + width - half, cy: top - half, corner: "tr" as const, cursor: "nesw-resize" },
            { cx: left - half, cy: top + height - half, corner: "bl" as const, cursor: "nesw-resize" },
            { cx: left + width - half, cy: top + height - half, corner: "br" as const, cursor: "nwse-resize" },
          ]).map(({ cx, cy, corner, cursor }) => (
            <div
              key={corner}
              className="absolute z-10 rounded-sm border border-white bg-amber-500"
              style={{
                left: cx,
                top: cy,
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                cursor,
              }}
              onMouseDown={(e) => handleHandleMouseDown(e, corner)}
            />
          ))}
        </>
      )}
    </>
  );
}
