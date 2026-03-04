"use client";

import { useCallback, useRef } from "react";
import { MOCK_MAP } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { RegionSelection } from "@/lib/gameplay-store";
import { RegionToolbar } from "./region-toolbar";

interface RegionSelectOverlayProps {
  region: RegionSelection;
  scaledCell: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const HANDLE_SIZE = 8;
const { cellSizeFt } = MOCK_MAP;

export function RegionSelectOverlay({
  region,
  scaledCell,
  canvasRef,
  scrollRef,
}: RegionSelectOverlayProps) {
  const handleDragRef = useRef(false);

  const minX = Math.min(region.x1, region.x2);
  const minY = Math.min(region.y1, region.y2);
  const maxX = Math.max(region.x1, region.x2);
  const maxY = Math.max(region.y1, region.y2);

  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;
  const cellCount = cols * rows;

  const left = minX * scaledCell;
  const top = minY * scaledCell;
  const width = cols * scaledCell;
  const height = rows * scaledCell;

  const widthFt = cols * cellSizeFt;
  const heightFt = rows * cellSizeFt;

  // Convert mouse event to grid cell
  const getGridCellFromEvent = useCallback(
    (ev: MouseEvent) => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const sl = scrollRef.current?.scrollLeft ?? 0;
      const st = scrollRef.current?.scrollTop ?? 0;
      const px = ev.clientX - rect.left + sl;
      const py = ev.clientY - rect.top + st;
      return {
        x: Math.floor(px / scaledCell),
        y: Math.floor(py / scaledCell),
      };
    },
    [scaledCell, canvasRef, scrollRef],
  );

  // Handle corner resize drag
  const handleHandleMouseDown = useCallback(
    (e: React.MouseEvent, corner: "tl" | "tr" | "bl" | "br") => {
      e.stopPropagation();
      e.preventDefault();
      handleDragRef.current = true;

      function onMove(ev: MouseEvent) {
        const cell = getGridCellFromEvent(ev);
        if (!cell) return;
        const current = useGameplayStore.getState().regionSelection;
        if (!current) return;
        const update = { ...current };
        if (corner === "tl") { update.x1 = cell.x; update.y1 = cell.y; }
        if (corner === "tr") { update.x2 = cell.x; update.y1 = cell.y; }
        if (corner === "bl") { update.x1 = cell.x; update.y2 = cell.y; }
        if (corner === "br") { update.x2 = cell.x; update.y2 = cell.y; }
        useGameplayStore.getState().setRegionSelection(update);
      }

      function onUp() {
        handleDragRef.current = false;
        useGameplayStore.getState().finalizeRegion();
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [getGridCellFromEvent],
  );

  // Handle center drag (move entire region)
  const handleBodyMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (handleDragRef.current) return;
      if (!region.finalized) return;
      e.stopPropagation();
      e.preventDefault();

      const startCell = getGridCellFromEvent(e.nativeEvent);
      if (!startCell) return;

      function onMove(ev: MouseEvent) {
        const cell = getGridCellFromEvent(ev);
        if (!cell || !startCell) return;
        const current = useGameplayStore.getState().regionSelection;
        if (!current) return;
        const dx = cell.x - startCell.x;
        const dy = cell.y - startCell.y;
        if (dx === 0 && dy === 0) return;
        startCell.x = cell.x;
        startCell.y = cell.y;
        useGameplayStore.getState().setRegionSelection({
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
    [region.finalized, getGridCellFromEvent],
  );

  const half = HANDLE_SIZE / 2;

  return (
    <>
      {/* Marching ants CSS */}
      <style>{`
        @keyframes marchingAnts {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -20; }
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
          fill="rgba(108, 92, 231, 0.08)"
          stroke="#6C5CE7"
          strokeWidth={2}
          strokeDasharray="6 4"
          style={{ animation: "marchingAnts 0.5s linear infinite" }}
        />
      </svg>

      {/* Central label */}
      {cellCount > 4 && (
        <div
          className="pointer-events-none absolute flex flex-col items-center justify-center"
          style={{ left, top, width, height }}
        >
          <span className="text-xs font-semibold text-brand-accent">
            {cellCount} celulas
          </span>
          <span className="text-[10px] text-brand-accent/70">
            {cols}x{rows} ({widthFt}x{heightFt}ft)
          </span>
        </div>
      )}

      {/* Interactive layer (handles + move) — only when finalized */}
      {region.finalized && (
        <>
          {/* Move body */}
          <div
            className="absolute cursor-move"
            style={{ left, top, width, height }}
            onMouseDown={handleBodyMouseDown}
          />

          {/* Corner handles */}
          {[
            { cx: left - half, cy: top - half, corner: "tl" as const, cursor: "nwse-resize" },
            { cx: left + width - half, cy: top - half, corner: "tr" as const, cursor: "nesw-resize" },
            { cx: left - half, cy: top + height - half, corner: "bl" as const, cursor: "nesw-resize" },
            { cx: left + width - half, cy: top + height - half, corner: "br" as const, cursor: "nwse-resize" },
          ].map(({ cx, cy, corner, cursor }) => (
            <div
              key={corner}
              className="absolute z-10 rounded-sm border border-white bg-brand-accent"
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

          {/* Floating toolbar */}
          <RegionToolbar
            left={left}
            top={top}
            width={width}
            region={region}
            scaledCell={scaledCell}
          />
        </>
      )}
    </>
  );
}
