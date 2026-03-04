"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MOCK_MAP,
  getAlignmentColor,
  getHpPercent,
  getHpColor,
  gridDistance,
} from "@/lib/gameplay-mock-data";
import type { RulerPoint, WallSide } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { TokenContextMenu } from "./menus/token-context-menu";
import { CellContextMenu } from "./menus/cell-context-menu";
import { CanvasContextMenu } from "./menus/canvas-context-menu";
import { TokenTooltip } from "./overlays/token-tooltip";
import { MovementPreview } from "./overlays/movement-preview";
import { SelectionBoxOverlay } from "./overlays/selection-box-overlay";
import { DragTrail } from "./overlays/drag-trail";
import { TurnIndicator } from "./overlays/turn-indicator";
import { RulerOverlay } from "./overlays/ruler-overlay";
import { PingOverlay } from "./overlays/ping-overlay";
import { DamageFloatOverlay } from "./overlays/damage-float-overlay";
import { AOEOverlay } from "./overlays/aoe-overlay";
import { DrawOverlay } from "./overlays/draw-overlay";
import { TerrainOverlay } from "./overlays/terrain-overlay";
import { AttackLineOverlay } from "./overlays/attack-line-overlay";
import { FogOverlay } from "./overlays/fog-overlay";
import { RegionSelectOverlay } from "./overlays/region-select-overlay";
import { MarkersOverlay } from "./overlays/markers-overlay";
import { NotesOverlay } from "./overlays/notes-overlay";
import { ToastOverlay } from "./overlays/toast-overlay";
import { VisionOverlay } from "./overlays/vision-overlay";
import { WallRenderer } from "./overlays/wall-renderer";
import { LightSourceOverlay } from "./overlays/light-source-overlay";
import { MiniMap } from "./overlays/mini-map";

export function MapCanvas() {
  const gridVisible = useGameplayStore((s) => s.gridVisible);
  const tokens = useGameplayStore((s) => s.tokens);
  const selectedTokenIds = useGameplayStore((s) => s.selectedTokenIds);
  const hoveredTokenId = useGameplayStore((s) => s.hoveredTokenId);
  const selectToken = useGameplayStore((s) => s.selectToken);
  const toggleTokenSelection = useGameplayStore((s) => s.toggleTokenSelection);
  const clearSelection = useGameplayStore((s) => s.clearSelection);
  const setHoveredToken = useGameplayStore((s) => s.setHoveredToken);
  const moveToken = useGameplayStore((s) => s.moveToken);
  const pushMovementHistory = useGameplayStore((s) => s.pushMovementHistory);
  const addMovementFt = useGameplayStore((s) => s.addMovementFt);
  const movementUsedFt = useGameplayStore((s) => s.movementUsedFt);
  const contextMenu = useGameplayStore((s) => s.contextMenu);
  const openTokenContextMenu = useGameplayStore((s) => s.openTokenContextMenu);
  const openCellContextMenu = useGameplayStore((s) => s.openCellContextMenu);
  const openCanvasContextMenu = useGameplayStore((s) => s.openCanvasContextMenu);
  const closeContextMenu = useGameplayStore((s) => s.closeContextMenu);
  const selectionBox = useGameplayStore((s) => s.selectionBox);
  const setSelectionBox = useGameplayStore((s) => s.setSelectionBox);
  const activeTool = useGameplayStore((s) => s.activeTool);
  const combat = useGameplayStore((s) => s.combat);
  const rulerPoints = useGameplayStore((s) => s.rulerPoints);
  const rulerActive = useGameplayStore((s) => s.rulerActive);
  const addRulerPoint = useGameplayStore((s) => s.addRulerPoint);
  const clearRuler = useGameplayStore((s) => s.clearRuler);
  const setRulerActive = useGameplayStore((s) => s.setRulerActive);
  const pings = useGameplayStore((s) => s.pings);
  const addPing = useGameplayStore((s) => s.addPing);
  const damageFloats = useGameplayStore((s) => s.damageFloats);
  const aoeInstances = useGameplayStore((s) => s.aoeInstances);
  const aoePlacing = useGameplayStore((s) => s.aoePlacing);
  const aoeShape = useGameplayStore((s) => s.aoeShape);
  const aoeColor = useGameplayStore((s) => s.aoeColor);
  const setAoePlacing = useGameplayStore((s) => s.setAoePlacing);
  const addAoe = useGameplayStore((s) => s.addAoe);
  const drawStrokes = useGameplayStore((s) => s.drawStrokes);
  const activeStroke = useGameplayStore((s) => s.activeStroke);
  const drawingTool = useGameplayStore((s) => s.drawingTool);
  const drawColor = useGameplayStore((s) => s.drawColor);
  const drawWidth = useGameplayStore((s) => s.drawWidth);
  const terrainCells = useGameplayStore((s) => s.terrainCells);
  const attackLine = useGameplayStore((s) => s.attackLine);
  const dragWaypoints = useGameplayStore((s) => s.dragWaypoints);
  const fogCells = useGameplayStore((s) => s.fogCells);
  const regionSelection = useGameplayStore((s) => s.regionSelection);
  const clearRegion = useGameplayStore((s) => s.clearRegion);
  const markers = useGameplayStore((s) => s.markers);
  const notes = useGameplayStore((s) => s.notes);

  const { gridCols, gridRows, cellSize, cellSizeFt, name } = MOCK_MAP;
  const scaledCell = cellSize;
  const canvasW = gridCols * scaledCell;
  const canvasH = gridRows * scaledCell;
  const onMapTokens = tokens.filter((t) => t.onMap);

  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragRef = useRef<{
    tokenId: string;
    originX: number;
    originY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);

  // Tooltip
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ruler mouse
  const [rulerMouse, setRulerMouse] = useState<RulerPoint | null>(null);

  // Viewport tracking for mini-map
  const [viewport, setViewport] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // AOE placement
  const aoeOriginRef = useRef<{ x: number; y: number } | null>(null);

  // Selection box ref
  const selBoxRef = useRef<{ startPxX: number; startPxY: number } | null>(null);

  // Wall tool hover
  const [hoverWall, setHoverWall] = useState<{ x: number; y: number; side: WallSide } | null>(null);

  // Space pan
  const [spaceHeld, setSpaceHeld] = useState(false);
  const panRef = useRef<{ lastX: number; lastY: number } | null>(null);

  // Current turn
  const currentTurnTokenId =
    combat.active && combat.order[combat.turnIndex]
      ? combat.order[combat.turnIndex].tokenId
      : null;
  const currentTurnToken = currentTurnTokenId
    ? tokens.find((t) => t.id === currentTurnTokenId)
    : null;

  const getGridCell = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const sLeft = scrollRef.current?.scrollLeft ?? 0;
      const sTop = scrollRef.current?.scrollTop ?? 0;
      const px = e.clientX - rect.left + sLeft;
      const py = e.clientY - rect.top + sTop;
      return {
        x: Math.max(0, Math.min(gridCols - 1, Math.floor(px / scaledCell))),
        y: Math.max(0, Math.min(gridRows - 1, Math.floor(py / scaledCell))),
      };
    },
    [scaledCell, gridCols, gridRows],
  );

  // Get closest wall side from mouse position
  const getClosestWallSide = useCallback(
    (e: MouseEvent | React.MouseEvent): { x: number; y: number; side: WallSide } | null => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const sLeft = scrollRef.current?.scrollLeft ?? 0;
      const sTop = scrollRef.current?.scrollTop ?? 0;
      const px = e.clientX - rect.left + sLeft;
      const py = e.clientY - rect.top + sTop;

      const cellX = Math.floor(px / scaledCell);
      const cellY = Math.floor(py / scaledCell);
      if (cellX < 0 || cellX >= gridCols || cellY < 0 || cellY >= gridRows) return null;

      const localX = (px / scaledCell) - cellX;
      const localY = (py / scaledCell) - cellY;

      const distTop = localY;
      const distBottom = 1 - localY;
      const distLeft = localX;
      const distRight = 1 - localX;

      const min = Math.min(distTop, distBottom, distLeft, distRight);
      let side: WallSide;
      if (min === distTop) side = "top";
      else if (min === distBottom) side = "bottom";
      else if (min === distLeft) side = "left";
      else side = "right";

      return { x: cellX, y: cellY, side };
    },
    [scaledCell, gridCols, gridRows],
  );

  // Region drag
  const startRegionDrag = useCallback(
    (startCell: { x: number; y: number }) => {
      clearRegion();
      useGameplayStore.getState().setRegionSelection({
        x1: startCell.x,
        y1: startCell.y,
        x2: startCell.x,
        y2: startCell.y,
        finalized: false,
      });

      function onMove(ev: MouseEvent) {
        const cell = getGridCell(ev);
        if (!cell) return;
        const current = useGameplayStore.getState().regionSelection;
        if (!current) return;
        if (cell.x !== current.x2 || cell.y !== current.y2) {
          useGameplayStore.getState().setRegionSelection({
            ...current,
            x2: cell.x,
            y2: cell.y,
          });
        }
      }

      function onUp() {
        const current = useGameplayStore.getState().regionSelection;
        if (current) {
          if (current.x1 !== current.x2 || current.y1 !== current.y2) {
            useGameplayStore.getState().finalizeRegion();
          } else {
            useGameplayStore.getState().clearRegion();
          }
        }
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [clearRegion, getGridCell],
  );

  // Hover
  const handleTokenMouseEnter = useCallback(
    (e: React.MouseEvent, tokenId: string) => {
      setHoveredToken(tokenId);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(() => {
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }, 500);
    },
    [setHoveredToken],
  );
  const handleTokenMouseLeave = useCallback(() => {
    setHoveredToken(null);
    setTooltipPos(null);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, [setHoveredToken]);

  // Token drag
  const handleTokenMouseDown = useCallback(
    (e: React.MouseEvent, tokenId: string) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      closeContextMenu();
      setTooltipPos(null);

      if (e.ctrlKey || e.metaKey) { toggleTokenSelection(tokenId); return; }
      selectToken(tokenId);

      const token = tokens.find((t) => t.id === tokenId);
      if (!token || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const sLeft = scrollRef.current?.scrollLeft ?? 0;
      const sTop = scrollRef.current?.scrollTop ?? 0;

      dragRef.current = {
        tokenId,
        originX: token.x,
        originY: token.y,
        offsetX: e.clientX - rect.left + sLeft - token.x * scaledCell,
        offsetY: e.clientY - rect.top + sTop - token.y * scaledCell,
      };

      // Clear waypoints at drag start
      useGameplayStore.getState().clearDragWaypoints();

      // Track last grid pos to avoid redundant vision recalcs
      let lastDragGridKey = `${token.x},${token.y}`;

      function onMove(ev: MouseEvent) {
        if (!dragRef.current || !canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        const sl = scrollRef.current?.scrollLeft ?? 0;
        const st = scrollRef.current?.scrollTop ?? 0;
        const gx = Math.max(0, Math.min(gridCols - 1, Math.round((ev.clientX - r.left + sl - dragRef.current.offsetX) / scaledCell)));
        const gy = Math.max(0, Math.min(gridRows - 1, Math.round((ev.clientY - r.top + st - dragRef.current.offsetY) / scaledCell)));
        setDragPos({ id: dragRef.current.tokenId, x: gx, y: gy });

        // Track grid position changes for waypoints
        const gridKey = `${gx},${gy}`;
        if (gridKey !== lastDragGridKey) {
          lastDragGridKey = gridKey;
        }

        // Shift+click during drag = add waypoint
        if (ev.shiftKey) {
          const state = useGameplayStore.getState();
          const wps = state.dragWaypoints;
          const lastWp = wps.length > 0 ? wps[wps.length - 1] : { x: dragRef.current.originX, y: dragRef.current.originY };
          if (gx !== lastWp.x || gy !== lastWp.y) {
            state.addDragWaypoint(gx, gy);
          }
        }
      }

      function commit(ev: MouseEvent) {
        if (!dragRef.current || !canvasRef.current) { done(); return; }
        const r = canvasRef.current.getBoundingClientRect();
        const sl = scrollRef.current?.scrollLeft ?? 0;
        const st = scrollRef.current?.scrollTop ?? 0;
        const gx = Math.max(0, Math.min(gridCols - 1, Math.round((ev.clientX - r.left + sl - dragRef.current.offsetX) / scaledCell)));
        const gy = Math.max(0, Math.min(gridRows - 1, Math.round((ev.clientY - r.top + st - dragRef.current.offsetY) / scaledCell)));
        const orig = dragRef.current;
        if (gx !== orig.originX || gy !== orig.originY) {
          pushMovementHistory(orig.tokenId, orig.originX, orig.originY);
          // Calculate total distance along waypoints
          const wps = useGameplayStore.getState().dragWaypoints;
          const allPts = [
            { x: orig.originX, y: orig.originY },
            ...wps,
            { x: gx, y: gy },
          ];
          let totalDist = 0;
          for (let i = 1; i < allPts.length; i++) {
            totalDist += gridDistance(allPts[i - 1].x, allPts[i - 1].y, allPts[i].x, allPts[i].y, cellSizeFt);
          }
          addMovementFt(totalDist);
          moveToken(orig.tokenId, gx, gy);
        }
        dragRef.current = null;
        setDragPos(null);
        useGameplayStore.getState().clearDragWaypoints();
        done();
      }

      function done() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", commit);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", commit);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    },
    [tokens, scaledCell, gridCols, gridRows, cellSizeFt, selectToken, toggleTokenSelection, moveToken, pushMovementHistory, addMovementFt, closeContextMenu],
  );

  // Canvas mousedown (selection box, ruler, ping, pan)
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      closeContextMenu();

      // Click-outside dismisses finalized region
      if (regionSelection?.finalized) {
        const cell = getGridCell(e);
        if (cell) {
          const rMinX = Math.min(regionSelection.x1, regionSelection.x2);
          const rMinY = Math.min(regionSelection.y1, regionSelection.y2);
          const rMaxX = Math.max(regionSelection.x1, regionSelection.x2);
          const rMaxY = Math.max(regionSelection.y1, regionSelection.y2);
          if (cell.x < rMinX || cell.x > rMaxX || cell.y < rMinY || cell.y > rMaxY) {
            clearRegion();
          }
        }
      }

      // Wall tool
      if (activeTool === "wall") {
        const wallInfo = getClosestWallSide(e);
        if (!wallInfo) return;
        const st = useGameplayStore.getState();

        if (e.shiftKey) {
          // Shift+click: create/toggle door
          const existing = st.walls.find(
            (w) => w.x === wallInfo.x && w.y === wallInfo.y && w.side === wallInfo.side,
          );
          if (existing) {
            if (existing.isDoor) {
              st.toggleDoor(wallInfo.x, wallInfo.y, wallInfo.side);
            } else {
              // Convert wall to door
              st.removeWall(wallInfo.x, wallInfo.y, wallInfo.side);
              st.addWall({ ...wallInfo, isDoor: true, doorOpen: false });
            }
          } else {
            st.addWall({ ...wallInfo, isDoor: true, doorOpen: false });
          }
        } else {
          // Normal click: toggle wall
          const existing = st.walls.find(
            (w) => w.x === wallInfo.x && w.y === wallInfo.y && w.side === wallInfo.side,
          );
          if (existing) {
            st.removeWall(wallInfo.x, wallInfo.y, wallInfo.side);
          } else {
            st.addWall({ ...wallInfo, isDoor: false, doorOpen: false });
          }
        }

        // Drag to add multiple walls
        const paintedWalls = new Set<string>([`${wallInfo.x},${wallInfo.y},${wallInfo.side}`]);
        function onWallMove(ev: MouseEvent) {
          const wi = getClosestWallSide(ev);
          if (!wi) return;
          const key = `${wi.x},${wi.y},${wi.side}`;
          if (paintedWalls.has(key)) return;
          paintedWalls.add(key);
          const s = useGameplayStore.getState();
          const exists = s.walls.find(
            (w) => w.x === wi.x && w.y === wi.y && w.side === wi.side,
          );
          if (!exists) {
            s.addWall({ ...wi, isDoor: false, doorOpen: false });
          }
        }
        function onWallUp() {
          document.removeEventListener("mousemove", onWallMove);
          document.removeEventListener("mouseup", onWallUp);
        }
        document.addEventListener("mousemove", onWallMove);
        document.addEventListener("mouseup", onWallUp);
        return;
      }

      // Region tool
      if (activeTool === "region") {
        const cell = getGridCell(e);
        if (cell) startRegionDrag(cell);
        return;
      }

      // Shift+pointer = region select
      if (activeTool === "pointer" && e.shiftKey) {
        const cell = getGridCell(e);
        if (cell) startRegionDrag(cell);
        return;
      }

      // Ctrl+Click = ping
      if ((e.ctrlKey || e.metaKey) && activeTool === "pointer") {
        const cell = getGridCell(e);
        if (cell) addPing(cell.x, cell.y);
        return;
      }

      // Ruler
      if (activeTool === "ruler") {
        const cell = getGridCell(e);
        if (!cell) return;
        if (e.detail === 2) { clearRuler(); return; }
        addRulerPoint(cell);
        setRulerActive(true);
        return;
      }

      // AOE
      if (activeTool === "aoe") {
        const cell = getGridCell(e);
        if (!cell) return;
        aoeOriginRef.current = { x: cell.x, y: cell.y };
        const placing: import("@/lib/gameplay-mock-data").AOEInstance = {
          id: `aoe_${Date.now()}`,
          shape: aoeShape,
          color: aoeColor,
          originX: cell.x,
          originY: cell.y,
          radius: aoeShape === "circle" || aoeShape === "cube" ? 0 : undefined,
          endX: aoeShape === "cone" || aoeShape === "line" ? cell.x : undefined,
          endY: aoeShape === "cone" || aoeShape === "line" ? cell.y : undefined,
          fixed: false,
        };
        setAoePlacing(placing);

        function onAoeMove(ev: MouseEvent) {
          if (!aoeOriginRef.current) return;
          const c = getGridCell(ev);
          if (!c) return;
          const origin = aoeOriginRef.current;
          const st = useGameplayStore.getState();
          const currentPlacing = st.aoePlacing;
          if (!currentPlacing) return;

          if (currentPlacing.shape === "circle" || currentPlacing.shape === "cube") {
            const radius = Math.max(Math.abs(c.x - origin.x), Math.abs(c.y - origin.y));
            st.setAoePlacing({ ...currentPlacing, radius });
          } else {
            st.setAoePlacing({ ...currentPlacing, endX: c.x, endY: c.y });
          }
        }

        function onAoeUp() {
          const st = useGameplayStore.getState();
          if (st.aoePlacing) {
            const aoe = { ...st.aoePlacing, fixed: true };
            const hasSize =
              (aoe.shape === "circle" || aoe.shape === "cube") ? (aoe.radius ?? 0) > 0
              : (aoe.endX !== aoe.originX || aoe.endY !== aoe.originY);
            if (hasSize) {
              st.addAoe(aoe);
            } else {
              st.setAoePlacing(null);
            }
          }
          aoeOriginRef.current = null;
          document.removeEventListener("mousemove", onAoeMove);
          document.removeEventListener("mouseup", onAoeUp);
        }

        document.addEventListener("mousemove", onAoeMove);
        document.addEventListener("mouseup", onAoeUp);
        return;
      }

      // Draw
      if (activeTool === "draw") {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const sLeft = scrollRef.current?.scrollLeft ?? 0;
        const sTop = scrollRef.current?.scrollTop ?? 0;
        const px = e.clientX - rect.left + sLeft;
        const py = e.clientY - rect.top + sTop;

        // If Shift+click, paint terrain instead
        if (e.shiftKey) {
          const cell = getGridCell(e);
          if (cell) useGameplayStore.getState().paintTerrain(cell.x, cell.y);
          return;
        }

        const stroke: import("@/lib/gameplay-mock-data").DrawStroke = {
          id: `draw_${Date.now()}`,
          tool: drawingTool,
          color: drawColor,
          width: drawWidth,
          points: [{ x: px, y: py }],
        };
        useGameplayStore.getState().setActiveStroke(stroke);

        function onDrawMove(ev: MouseEvent) {
          if (!canvasRef.current) return;
          const r = canvasRef.current.getBoundingClientRect();
          const sl = scrollRef.current?.scrollLeft ?? 0;
          const st = scrollRef.current?.scrollTop ?? 0;
          const mx = ev.clientX - r.left + sl;
          const my = ev.clientY - r.top + st;
          const state = useGameplayStore.getState();
          if (!state.activeStroke) return;
          const newPoints = [...state.activeStroke.points, { x: mx, y: my }];
          state.setActiveStroke({ ...state.activeStroke, points: newPoints });
        }

        function onDrawUp() {
          const state = useGameplayStore.getState();
          if (state.activeStroke && state.activeStroke.points.length >= 2) {
            state.addStroke(state.activeStroke);
          } else {
            state.setActiveStroke(null);
          }
          document.removeEventListener("mousemove", onDrawMove);
          document.removeEventListener("mouseup", onDrawUp);
        }

        document.addEventListener("mousemove", onDrawMove);
        document.addEventListener("mouseup", onDrawUp);
        return;
      }

      // Fog
      if (activeTool === "fog") {
        const cell = getGridCell(e);
        if (!cell) return;
        useGameplayStore.getState().toggleFogCell(cell.x, cell.y);
        // After toggle: if cell is now in fog → paint mode is "add", otherwise "remove"
        const paintMode = useGameplayStore.getState().fogCells.has(`${cell.x},${cell.y}`) ? "add" : "remove";
        const painted = new Set<string>([`${cell.x},${cell.y}`]);

        function onFogMove(ev: MouseEvent) {
          const c = getGridCell(ev);
          if (!c) return;
          const key = `${c.x},${c.y}`;
          if (painted.has(key)) return;
          painted.add(key);
          const state = useGameplayStore.getState();
          if (paintMode === "add" && !state.fogCells.has(key)) {
            state.addFogCells([{ x: c.x, y: c.y }]);
          } else if (paintMode === "remove" && state.fogCells.has(key)) {
            state.removeFogCells([{ x: c.x, y: c.y }]);
          }
        }

        function onFogUp() {
          document.removeEventListener("mousemove", onFogMove);
          document.removeEventListener("mouseup", onFogUp);
        }

        document.addEventListener("mousemove", onFogMove);
        document.addEventListener("mouseup", onFogUp);
        return;
      }

      // Pan
      if (activeTool === "pan" || spaceHeld) {
        panRef.current = { lastX: e.clientX, lastY: e.clientY };
        function onPanMove(ev: MouseEvent) {
          if (!panRef.current || !scrollRef.current) return;
          scrollRef.current.scrollLeft -= ev.clientX - panRef.current.lastX;
          scrollRef.current.scrollTop -= ev.clientY - panRef.current.lastY;
          panRef.current = { lastX: ev.clientX, lastY: ev.clientY };
        }
        function onPanUp() {
          panRef.current = null;
          document.removeEventListener("mousemove", onPanMove);
          document.removeEventListener("mouseup", onPanUp);
          document.body.style.cursor = "";
        }
        document.addEventListener("mousemove", onPanMove);
        document.addEventListener("mouseup", onPanUp);
        document.body.style.cursor = "grabbing";
        return;
      }

      // Selection box (pointer)
      if (activeTool === "pointer" && !canvasRef.current) return;
      if (activeTool !== "pointer") return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const sLeft = scrollRef.current?.scrollLeft ?? 0;
      const sTop = scrollRef.current?.scrollTop ?? 0;
      const px = e.clientX - rect.left + sLeft;
      const py = e.clientY - rect.top + sTop;
      selBoxRef.current = { startPxX: px, startPxY: py };

      function onMove(ev: MouseEvent) {
        if (!selBoxRef.current || !canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        const sl = scrollRef.current?.scrollLeft ?? 0;
        const st = scrollRef.current?.scrollTop ?? 0;
        setSelectionBox({
          startX: selBoxRef.current.startPxX,
          startY: selBoxRef.current.startPxY,
          endX: ev.clientX - r.left + sl,
          endY: ev.clientY - r.top + st,
        });
      }

      function onUp() {
        const box = useGameplayStore.getState().selectionBox;
        if (box) {
          const minX = Math.min(box.startX, box.endX);
          const maxX = Math.max(box.startX, box.endX);
          const minY = Math.min(box.startY, box.endY);
          const maxY = Math.max(box.startY, box.endY);
          if (maxX - minX > 8 || maxY - minY > 8) {
            const sel = onMapTokens
              .filter((t) => {
                const tx = t.x * scaledCell + (t.size * scaledCell) / 2;
                const ty = t.y * scaledCell + (t.size * scaledCell) / 2;
                return tx >= minX && tx <= maxX && ty >= minY && ty <= maxY;
              })
              .map((t) => t.id);
            useGameplayStore.setState({
              selectedTokenIds: sel.length > 0 ? sel : [],
            });
          } else {
            clearSelection();
          }
        } else {
          clearSelection();
        }
        setSelectionBox(null);
        selBoxRef.current = null;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [activeTool, spaceHeld, scaledCell, onMapTokens, getGridCell, closeContextMenu, clearSelection, setSelectionBox, addRulerPoint, setRulerActive, clearRuler, addPing, aoeShape, aoeColor, setAoePlacing, addAoe, drawingTool, drawColor, drawWidth, regionSelection, clearRegion, startRegionDrag],
  );

  // Canvas right-click
  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const cell = getGridCell(e);
      if (!cell) return;
      const hit = onMapTokens.find(
        (t) => cell.x >= t.x && cell.x < t.x + t.size && cell.y >= t.y && cell.y < t.y + t.size,
      );
      if (hit) {
        selectToken(hit.id);
        openTokenContextMenu(hit.id, e.clientX, e.clientY);
      } else {
        openCellContextMenu(cell.x, cell.y, e.clientX, e.clientY);
      }
    },
    [getGridCell, onMapTokens, selectToken, openTokenContextMenu, openCellContextMenu],
  );

  // Canvas mouse move (ruler, wall hover)
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === "ruler" && rulerActive) {
        const cell = getGridCell(e);
        if (cell) setRulerMouse(cell);
      }
      if (activeTool === "wall") {
        const wallInfo = getClosestWallSide(e);
        setHoverWall(wallInfo);
      } else if (hoverWall) {
        setHoverWall(null);
      }
    },
    [activeTool, rulerActive, getGridCell, getClosestWallSide, hoverWall],
  );

  // Keyboard
  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " ") { e.preventDefault(); setSpaceHeld(true); return; }

      // Region shortcuts — when region is finalized, intercept before other handlers
      const regionState = useGameplayStore.getState().regionSelection;
      if (regionState?.finalized) {
        const k = e.key.toUpperCase();
        if (k === "F" && !e.shiftKey) { useGameplayStore.getState().regionFog(); return; }
        if (k === "F" && e.shiftKey) { useGameplayStore.getState().regionReveal(); return; }
        if (k === "T") { useGameplayStore.getState().regionPaintTerrain(); return; }
        if (e.key === "Delete" || e.key === "Backspace") { useGameplayStore.getState().regionClear(); return; }
        if (e.key === "Escape") { clearRegion(); return; }
      }

      if (e.key === "Escape") {
        clearSelection();
        closeContextMenu();
        if (rulerActive) clearRuler();
        const st = useGameplayStore.getState();
        st.setAoePlacing(null);
        st.clearAttackLine();
        st.setActiveStroke(null);
        clearRegion();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        useGameplayStore.getState().selectedTokenIds.forEach((id) =>
          useGameplayStore.getState().removeToken(id),
        );
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") { e.preventDefault(); useGameplayStore.getState().selectAllTokens(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        const st = useGameplayStore.getState();
        if (st.activeTool === "draw") {
          st.undoStroke();
        } else {
          const ids = st.selectedTokenIds;
          if (ids.length === 1) st.undoMovement(ids[0]);
        }
        return;
      }
      const key = e.key.toUpperCase();
      if (key === "N" && !e.shiftKey) { useGameplayStore.getState().nextTurn(); return; }
      if (key === "N" && e.shiftKey) { useGameplayStore.getState().prevTurn(); return; }
      if (key === "D") {
        const ids = useGameplayStore.getState().selectedTokenIds;
        if (ids.length === 1) useGameplayStore.getState().duplicateToken(ids[0]);
        return;
      }
      if (key === "C" && !e.ctrlKey && !e.metaKey) {
        const ids = useGameplayStore.getState().selectedTokenIds;
        if (ids.length === 1) {
          const tok = useGameplayStore.getState().tokens.find((t) => t.id === ids[0]);
          if (tok && scrollRef.current) {
            scrollRef.current.scrollTo({
              left: tok.x * scaledCell + scaledCell / 2 - scrollRef.current.clientWidth / 2,
              top: tok.y * scaledCell + scaledCell / 2 - scrollRef.current.clientHeight / 2,
              behavior: "smooth",
            });
          }
        }
        return;
      }
      if (key === "H" && !e.ctrlKey && !e.metaKey) {
        const ids = useGameplayStore.getState().selectedTokenIds;
        if (ids.length === 1) {
          useGameplayStore.getState().setHpAdjustTarget(ids[0]);
          useGameplayStore.getState().openModal("hpAdjust");
        }
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const st = useGameplayStore.getState();
        if (st.rightTab === "sheet") st.setRightTab("chat");
        else st.setRightTab("sheet");
        if (!st.rightPanelOpen) st.toggleRightPanel();
        return;
      }
      if (key === "[") { useGameplayStore.getState().toggleLeftPanel(); return; }
      if (key === "]") { useGameplayStore.getState().toggleRightPanel(); return; }
      if (key === "/") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("[data-chat-input]")?.focus();
      }
    }
    function onUp(e: KeyboardEvent) {
      if (e.key === " ") setSpaceHeld(false);
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, [scaledCell, rulerActive, clearSelection, closeContextMenu, clearRuler, clearRegion]);

  // Track viewport for mini-map + store
  const setMapViewport = useGameplayStore((s) => s.setMapViewport);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      setViewport({
        x: el.scrollLeft,
        y: el.scrollTop,
        w: el.clientWidth,
        h: el.clientHeight,
      });
      setMapViewport({
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
        viewportW: el.clientWidth,
        viewportH: el.clientHeight,
        cellSize: scaledCell,
      });
    }
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [canvasW, canvasH, scaledCell, setMapViewport]);

  const handleMiniMapNavigate = useCallback(
    (x: number, y: number) => {
      scrollRef.current?.scrollTo({ left: x, top: y, behavior: "smooth" });
    },
    [],
  );

  const primarySelected = selectedTokenIds.length === 1
    ? tokens.find((t) => t.id === selectedTokenIds[0])
    : null;
  const hoveredToken = hoveredTokenId ? tokens.find((t) => t.id === hoveredTokenId) : null;
  const contextToken = contextMenu.open && contextMenu.type === "token"
    ? tokens.find((t) => t.id === contextMenu.tokenId)
    : null;

  const cursorClass =
    activeTool === "pan" || spaceHeld ? "cursor-grab"
    : activeTool === "ruler" || activeTool === "aoe" || activeTool === "region" ? "cursor-crosshair"
    : activeTool === "draw" || activeTool === "wall" ? "cursor-crosshair"
    : "cursor-default";

  return (
    <div className={`relative bg-[#0F0F12] ${cursorClass}`} style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
      <div ref={scrollRef} className="scrollbar-hidden h-full w-full overflow-auto">
        <div
          ref={canvasRef}
          className="relative"
          style={{ width: canvasW, height: canvasH }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onContextMenu={handleCanvasContextMenu}
        >
          {/* Grid */}
          {gridVisible && (
            <svg className="pointer-events-none absolute inset-0" width={canvasW} height={canvasH}>
              {Array.from({ length: gridCols + 1 }).map((_, i) => (
                <line key={`v${i}`} x1={i * scaledCell} y1={0} x2={i * scaledCell} y2={canvasH} stroke="#1E1E2A" strokeWidth={1} />
              ))}
              {Array.from({ length: gridRows + 1 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={i * scaledCell} x2={canvasW} y2={i * scaledCell} stroke="#1E1E2A" strokeWidth={1} />
              ))}
            </svg>
          )}

          {/* Terrain */}
          <TerrainOverlay cells={terrainCells} scaledCell={scaledCell} />

          {/* Walls */}
          <WallRenderer scaledCell={scaledCell} canvasW={canvasW} canvasH={canvasH} hoverWall={hoverWall} />

          {/* Vision circle (selected token only) */}
          <VisionOverlay
            scaledCell={scaledCell}
            canvasW={canvasW}
            canvasH={canvasH}
            dragTokenId={dragPos?.id}
            dragX={dragPos?.x}
            dragY={dragPos?.y}
          />

          {/* Markers & Notes */}
          <MarkersOverlay markers={markers} scaledCell={scaledCell} />
          <NotesOverlay notes={notes} scaledCell={scaledCell} />
          <LightSourceOverlay scaledCell={scaledCell} />

          {/* Fog */}
          <FogOverlay
            canvasW={canvasW}
            canvasH={canvasH}
            scaledCell={scaledCell}
            scrollLeft={viewport.x}
            scrollTop={viewport.y}
            viewportW={viewport.w}
            viewportH={viewport.h}
          />

          {/* Movement preview */}
          {currentTurnToken?.onMap && (
            <MovementPreview token={currentTurnToken} scaledCell={scaledCell} movementUsedFt={movementUsedFt} />
          )}

          {/* Turn indicator */}
          {currentTurnToken?.onMap && (
            <TurnIndicator token={currentTurnToken} scaledCell={scaledCell} movementUsedFt={movementUsedFt} />
          )}

          {/* Drag ghost + trail */}
          {dragPos && (
            <>
              <div
                className="pointer-events-none absolute rounded-full border-2 border-dashed border-brand-accent/50 bg-brand-accent/10"
                style={{ left: dragPos.x * scaledCell, top: dragPos.y * scaledCell, width: scaledCell, height: scaledCell }}
              />
              {dragRef.current && (
                <DragTrail originX={dragRef.current.originX} originY={dragRef.current.originY} destX={dragPos.x} destY={dragPos.y} scaledCell={scaledCell} waypoints={dragWaypoints} />
              )}
            </>
          )}

          {/* Selection box */}
          {selectionBox && <SelectionBoxOverlay box={selectionBox} />}

          {/* Region selection */}
          {regionSelection && (
            <RegionSelectOverlay
              region={regionSelection}
              scaledCell={scaledCell}
              canvasRef={canvasRef}
              scrollRef={scrollRef}
            />
          )}

          {/* Ruler */}
          {rulerPoints.length > 0 && (
            <RulerOverlay points={rulerPoints} mousePoint={rulerActive ? rulerMouse : null} scaledCell={scaledCell} />
          )}

          {/* AOE */}
          <AOEOverlay instances={aoeInstances} placing={aoePlacing} scaledCell={scaledCell} />

          {/* Pings */}
          <PingOverlay pings={pings} scaledCell={scaledCell} />

          {/* Damage floats */}
          <DamageFloatOverlay floats={damageFloats} tokens={onMapTokens} scaledCell={scaledCell} />

          {/* Drawings */}
          <DrawOverlay strokes={drawStrokes} activeStroke={activeStroke} canvasW={canvasW} canvasH={canvasH} />

          {/* Attack line */}
          {attackLine && (
            <AttackLineOverlay
              attackerId={attackLine.attackerId}
              targetId={attackLine.targetId}
              roll={attackLine.roll}
              damage={attackLine.damage}
              tokens={onMapTokens}
              scaledCell={scaledCell}
            />
          )}

          {/* Tokens */}
          {onMapTokens.map((token) => {
            const color = getAlignmentColor(token.alignment);
            const hpPct = getHpPercent(token.hp, token.maxHp);
            const hpColor = getHpColor(hpPct);
            const isDead = token.hp <= 0;
            const isSelected = selectedTokenIds.includes(token.id);
            const isHovered = hoveredTokenId === token.id;
            const isDragging = dragPos?.id === token.id;
            const isInvisible = token.visibility === "invisible";
            const isHidden = token.visibility === "hidden";
            const size = token.size * scaledCell;
            const dx = isDragging ? dragPos.x * scaledCell : token.x * scaledCell;
            const dy = isDragging ? dragPos.y * scaledCell : token.y * scaledCell;

            return (
              <div
                key={token.id}
                className={`absolute flex cursor-grab flex-col items-center justify-center ${isDead ? "opacity-30" : ""} ${isDragging ? "z-30 opacity-70" : ""} ${isHidden ? "opacity-40" : ""}`}
                style={{
                  left: dx, top: dy, width: size, height: size,
                  transition: isDragging ? "none" : "left 200ms ease-out, top 200ms ease-out",
                }}
                onMouseDown={(e) => handleTokenMouseDown(e, token.id)}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); selectToken(token.id); openTokenContextMenu(token.id, e.clientX, e.clientY); }}
                onMouseEnter={(e) => handleTokenMouseEnter(e, token.id)}
                onMouseLeave={handleTokenMouseLeave}
              >
                <div
                  className="flex items-center justify-center rounded-full transition-shadow"
                  style={{
                    width: size * 0.8, height: size * 0.8,
                    backgroundColor: isInvisible ? "transparent" : color + "25",
                    border: isInvisible ? `2px dashed ${color}60` : `2px solid ${color}`,
                    boxShadow: isSelected ? `0 0 12px ${color}60, 0 0 4px ${color}40` : isHovered ? `0 0 6px ${color}30` : undefined,
                    outline: isHovered && !isSelected ? "1px solid rgba(255,255,255,0.3)" : undefined,
                  }}
                >
                  <span className="font-bold" style={{ fontSize: Math.max(8, scaledCell * 0.3), color }}>
                    {token.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                {scaledCell >= 30 && (
                  <div className="mt-px flex flex-col items-center" style={{ width: size }}>
                    <span className="truncate text-center font-medium text-white" style={{ fontSize: Math.max(7, scaledCell * 0.2) }}>
                      {token.name}
                    </span>
                    <div className="mt-px overflow-hidden rounded-full bg-white/15" style={{ width: size * 0.7, height: 2 }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${hpPct}%`, backgroundColor: hpColor }} />
                    </div>
                  </div>
                )}

                {token.conditions.length > 0 && scaledCell >= 30 && (
                  <div className="absolute -top-1 right-0 flex gap-0.5">
                    {token.conditions.slice(0, 3).map((cond) => (
                      <span key={cond} className="rounded bg-black/70 px-0.5 text-white" style={{ fontSize: Math.max(6, scaledCell * 0.15) }} title={cond}>
                        {cond.slice(0, 1).toUpperCase()}
                      </span>
                    ))}
                    {token.conditions.length > 3 && (
                      <span className="rounded bg-black/70 px-0.5 text-brand-muted" style={{ fontSize: Math.max(6, scaledCell * 0.15) }}>
                        +{token.conditions.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {isDead && scaledCell >= 30 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ fontSize: size * 0.4, filter: "grayscale(1)" }}>☠</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredToken && tooltipPos && !contextMenu.open && !dragPos && (
        <TokenTooltip token={hoveredToken} x={tooltipPos.x} y={tooltipPos.y} />
      )}

      {/* Context menus */}
      {contextMenu.open && contextMenu.type === "token" && contextToken && (
        <TokenContextMenu token={contextToken} x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}
      {contextMenu.open && contextMenu.type === "cell" && (
        <CellContextMenu cellX={contextMenu.cellX} cellY={contextMenu.cellY} x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}
      {contextMenu.open && contextMenu.type === "canvas" && (
        <CanvasContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}

      {/* Mini-map */}
      <MiniMap
        tokens={tokens}
        viewportX={viewport.x}
        viewportY={viewport.y}
        viewportW={viewport.w}
        viewportH={viewport.h}
        canvasW={canvasW}
        canvasH={canvasH}
        onNavigate={handleMiniMapNavigate}
      />


      {/* Status bar */}
      <div className="absolute bottom-14 left-3 flex items-center gap-3 rounded-lg border border-brand-border bg-[#111116] px-3 py-1.5">
        {primarySelected ? (
          <>
            <span className="text-[10px] font-medium text-brand-text">{primarySelected.name}</span>
            <span className="text-[10px] tabular-nums text-brand-muted">({primarySelected.x}, {primarySelected.y})</span>
            <span className="text-[10px] tabular-nums text-brand-muted">HP {primarySelected.hp}/{primarySelected.maxHp}</span>
            <span className="text-[10px] tabular-nums text-brand-muted">CA {primarySelected.ac}</span>
          </>
        ) : (
          <>
            <span className="text-[10px] text-brand-muted">{name}</span>
            <span className="text-[10px] tabular-nums text-brand-muted">{gridCols}x{gridRows}</span>
          </>
        )}
      </div>

      {/* Toasts */}
      <ToastOverlay />
    </div>
  );
}
