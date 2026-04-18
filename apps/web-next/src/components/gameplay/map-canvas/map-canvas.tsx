"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MOCK_MAP,
  getAlignmentColor,
  getHpPercent,
  getHpColor,
  gridDistance,
} from "@/lib/gameplay-mock-data";
import type { RulerPoint } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { getNearestEdge, rectangleWallKeys, type NearestEdge } from "@/lib/wall-helpers";
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
import { AISelectionOverlay } from "./overlays/ai-selection-overlay";
import { MarkersOverlay } from "./overlays/markers-overlay";
import { NotesOverlay } from "./overlays/notes-overlay";
import { ToastOverlay } from "./overlays/toast-overlay";
import { VisionOverlay } from "./overlays/vision-overlay";
import { WallRenderer } from "./overlays/wall-renderer";
import { LightSourceOverlay } from "./overlays/light-source-overlay";
import { TerrainBrushPreview, getBrushCells } from "./overlays/terrain-brush-preview";
import { TerrainRectPreview } from "./overlays/terrain-rect-preview";
import { ObjectOverlay } from "./overlays/object-overlay";
import { MiniMap } from "./overlays/mini-map";
import { OAPreviewOverlay } from "./overlays/oa-preview-overlay";
import { ReactionPrompt } from "./overlays/reaction-prompt";
import { detectOpportunityAttacks } from "@/lib/reactions";
import { playOAAlertSound } from "@/lib/oa-alert-sound";
import { PixiCanvas } from "./pixi-canvas";
import { executeAttackWithAnimation } from "@/lib/animation/attack-with-animation";
import { PathOverlay } from "./overlays/path-overlay";
import { PathPreviewPanel } from "./overlays/path-preview-panel";
import { findPath } from "@/lib/pathfinding";
import { calculateStepCost, getMaxMovementFt } from "@/lib/movement-cost";
import { detectStepEvents } from "@/lib/path-event-detection";
import type { PathCell } from "@/lib/gameplay-store";
import { useSettingsStore } from "@/lib/settings-store";
import { useNPCStore } from "@/lib/npc-store";
import type { TokenAlignment } from "@/lib/gameplay-mock-data";
import { CREATURE_COMPENDIUM } from "@/lib/creature-data";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import { useTokenLibraryStore } from "@/lib/token-library-store";
import { CreatureSpriteToken } from "./creature-sprite-token";
import { CREATURE_SPRITES } from "@/constants/creature-sprites";
import { useMapSidebarStore } from "@/lib/map-sidebar-store";
import { AMBIENT_LIGHT_CONFIG } from "@/lib/map-sidebar-types";
import type { LayerId } from "@/lib/map-sidebar-types";
import { CELL_SIZE, CELL_SIZE_FT } from "@/lib/gameplay/constants";
import { useCameraStore } from "@/lib/camera-store";
import { useNpcBehaviorStore } from "@/lib/npc-behavior-store";
import { canTokenMoveTo } from "@/lib/collision";

export function MapCanvas() {
  const behaviorRenderStates = useNpcBehaviorStore((s) => s.renderStates);
  const gridVisible = useGameplayStore((s) => s.gridVisible);
  const tokens = useGameplayStore((s) => s.tokens);
  const tokenCreatureMap = useGameplayStore((s) => s.tokenCreatureMap);
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
  const aiSelection = useGameplayStore((s) => s.aiSelection);
  const aiLayers = useGameplayStore((s) => s.aiLayers);
  const markers = useGameplayStore((s) => s.markers);
  const notes = useGameplayStore((s) => s.notes);
  const mapBackgroundImage = useGameplayStore((s) => s.mapBackgroundImage);
  const mapBackgroundOpacity = useGameplayStore((s) => s.mapBackgroundOpacity);
  const mapGridOffsetX = useGameplayStore((s) => s.mapGridOffsetX);
  const mapGridOffsetY = useGameplayStore((s) => s.mapGridOffsetY);
  const turnActions = useGameplayStore((s) => s.turnActions);
  const reactionUsedMap = useGameplayStore((s) => s.reactionUsedMap);
  const pendingReaction = useGameplayStore((s) => s.pendingReaction);
  const pathPlanningActive = useGameplayStore((s) => s.pathPlanningActive);
  const pathPlanningTokenId = useGameplayStore((s) => s.pathPlanningTokenId);
  const plannedPath = useGameplayStore((s) => s.plannedPath);
  const enterPathPlanning = useGameplayStore((s) => s.enterPathPlanning);
  const exitPathPlanning = useGameplayStore((s) => s.exitPathPlanning);
  const addPathCell = useGameplayStore((s) => s.addPathCell);
  const undoPathStep = useGameplayStore((s) => s.undoPathStep);

  // Map sidebar store — layers, lighting, annotations visibility
  const layers = useMapSidebarStore((s) => s.layers);
  const ambientLight = useMapSidebarStore((s) => s.ambientLight);
  const showGMNotes = useMapSidebarStore((s) => s.showGMNotes);
  const showMarkers = useMapSidebarStore((s) => s.showMarkers);

  // Helper: get layer state by id
  const getLayer = useCallback(
    (id: LayerId) => layers.find((l) => l.id === id),
    [layers],
  );

  const { gridCols, gridRows, name } = MOCK_MAP;
  // CELL_SIZE é FIXO (64px) e NUNCA muda — importado de gameplay/constants
  const scaledCell = CELL_SIZE;
  const cellSizeFt = CELL_SIZE_FT;
  const canvasW = gridCols * CELL_SIZE;
  const canvasH = gridRows * CELL_SIZE;
  const onMapTokens = tokens.filter((t) => t.onMap);

  const viewportRef = useRef<HTMLDivElement>(null);
  const reactWorldRef = useRef<HTMLDivElement>(null);

  // Camera state
  const panX = useCameraStore((s) => s.panX);
  const panY = useCameraStore((s) => s.panY);
  const zoom = useCameraStore((s) => s.zoom);

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

  // Wall tool hover (edge-based)
  const [hoverEdge, setHoverEdge] = useState<NearestEdge | null>(null);

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
      if (!viewportRef.current) return null;
      const rect = viewportRef.current.getBoundingClientRect();
      const cam = useCameraStore.getState();
      const worldX = (e.clientX - rect.left - cam.panX) / cam.zoom;
      const worldY = (e.clientY - rect.top - cam.panY) / cam.zoom;
      return {
        x: Math.max(0, Math.min(gridCols - 1, Math.floor(worldX / CELL_SIZE))),
        y: Math.max(0, Math.min(gridRows - 1, Math.floor(worldY / CELL_SIZE))),
      };
    },
    [gridCols, gridRows],
  );

  // Get nearest wall edge from mouse position (edge-based)
  const getMouseEdge = useCallback(
    (e: MouseEvent | React.MouseEvent): NearestEdge | null => {
      if (!viewportRef.current) return null;
      const rect = viewportRef.current.getBoundingClientRect();
      const cam = useCameraStore.getState();
      const px = (e.clientX - rect.left - cam.panX) / cam.zoom;
      const py = (e.clientY - rect.top - cam.panY) / cam.zoom;
      return getNearestEdge(px, py, CELL_SIZE, gridCols, gridRows);
    },
    [gridCols, gridRows],
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

  // AI drag (area selection for AI generation)
  const startAIDrag = useCallback(
    (startCell: { x: number; y: number }) => {
      useGameplayStore.getState().clearAISelection();
      useGameplayStore.getState().setAISelection({
        x1: startCell.x,
        y1: startCell.y,
        x2: startCell.x,
        y2: startCell.y,
        finalized: false,
      });

      function onMove(ev: MouseEvent) {
        const cell = getGridCell(ev);
        if (!cell) return;
        const current = useGameplayStore.getState().aiSelection;
        if (!current) return;
        if (cell.x !== current.x2 || cell.y !== current.y2) {
          useGameplayStore.getState().setAISelection({
            ...current,
            x2: cell.x,
            y2: cell.y,
          });
        }
      }

      function onUp() {
        const current = useGameplayStore.getState().aiSelection;
        if (current) {
          if (current.x1 !== current.x2 || current.y1 !== current.y2) {
            useGameplayStore.getState().finalizeAISelection();
          } else {
            useGameplayStore.getState().clearAISelection();
          }
        }
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [getGridCell],
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

      // Path planning: clicking own token during combat turn enters planning mode
      if (combat.active && currentTurnTokenId === tokenId && !pathPlanningActive) {
        enterPathPlanning(tokenId);
        return;
      }

      // If path planning is active, don't start drag
      if (pathPlanningActive) return;

      const token = tokens.find((t) => t.id === tokenId);
      if (!token || !viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const cam = useCameraStore.getState();
      const worldX = (e.clientX - rect.left - cam.panX) / cam.zoom;
      const worldY = (e.clientY - rect.top - cam.panY) / cam.zoom;

      dragRef.current = {
        tokenId,
        originX: token.x,
        originY: token.y,
        offsetX: worldX - token.x * CELL_SIZE,
        offsetY: worldY - token.y * CELL_SIZE,
      };

      // Clear waypoints at drag start
      useGameplayStore.getState().clearDragWaypoints();

      // Track last grid pos to avoid redundant vision recalcs
      let lastDragGridKey = `${token.x},${token.y}`;

      function onMove(ev: MouseEvent) {
        if (!dragRef.current || !viewportRef.current) return;
        const r = viewportRef.current.getBoundingClientRect();
        const cam = useCameraStore.getState();
        const wx = (ev.clientX - r.left - cam.panX) / cam.zoom;
        const wy = (ev.clientY - r.top - cam.panY) / cam.zoom;
        const gx = Math.max(0, Math.min(gridCols - 1, Math.round((wx - dragRef.current.offsetX) / CELL_SIZE)));
        const gy = Math.max(0, Math.min(gridRows - 1, Math.round((wy - dragRef.current.offsetY) / CELL_SIZE)));
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
        if (!dragRef.current || !viewportRef.current) { done(); return; }
        const r = viewportRef.current.getBoundingClientRect();
        const cam = useCameraStore.getState();
        const wx = (ev.clientX - r.left - cam.panX) / cam.zoom;
        const wy = (ev.clientY - r.top - cam.panY) / cam.zoom;
        const gx = Math.max(0, Math.min(gridCols - 1, Math.round((wx - dragRef.current.offsetX) / CELL_SIZE)));
        const gy = Math.max(0, Math.min(gridRows - 1, Math.round((wy - dragRef.current.offsetY) / CELL_SIZE)));
        const orig = dragRef.current;
        if (gx !== orig.originX || gy !== orig.originY) {
          // Wall collision check — validate move against wall edges
          const dragStoreState = useGameplayStore.getState();
          const wallCheck = canTokenMoveTo(
            orig.originX, orig.originY, gx, gy,
            gridCols, gridRows, dragStoreState.wallEdges,
          );
          if (!wallCheck.allowed) {
            const el = document.querySelector(`[data-token-id="${orig.tokenId}"]`) as HTMLElement | null;
            if (el) { el.classList.add("token-bump"); setTimeout(() => el.classList.remove("token-bump"), 200); }
            if ("message" in wallCheck) dragStoreState.addToast(wallCheck.message);
            dragRef.current = null;
            setDragPos(null);
            useGameplayStore.getState().clearDragWaypoints();
            done();
            return;
          }

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

          // Determine if this is the current turn's token
          const dragState = useGameplayStore.getState();
          const dragCombatOrder = dragState.combat.order;
          const dragCurrentTurnTokenId = dragState.combat.active && dragCombatOrder[dragState.combat.turnIndex]
            ? dragCombatOrder[dragState.combat.turnIndex].tokenId
            : null;
          const isCurrentTurnToken = orig.tokenId === dragCurrentTurnTokenId;

          // Enforce movement limit only for the current turn's token
          if (dragState.combat.active && isCurrentTurnToken) {
            const dragToken = dragState.tokens.find((t) => t.id === orig.tokenId);
            if (dragToken) {
              const maxFt = getMaxMovementFt(dragToken.speed, dragState.turnActions.isDashing, dragState.movementUsedFt);
              if (totalDist > maxFt) {
                dragState.addToast(`Movimento insuficiente (${maxFt}ft restante, necessário ${totalDist}ft)`);
                dragRef.current = null;
                setDragPos(null);
                useGameplayStore.getState().clearDragWaypoints();
                done();
                return;
              }
            }
          }

          pushMovementHistory(orig.tokenId, orig.originX, orig.originY);
          if (isCurrentTurnToken) addMovementFt(totalDist);
          moveToken(orig.tokenId, gx, gy);

          // Check for Opportunity Attacks
          const state = useGameplayStore.getState();
          if (state.combat.active) {
            // isDisengaging only applies to the current turn's token
            const movedIsDisengaging = isCurrentTurnToken && state.turnActions.isDisengaging;
            const pendingOAs = detectOpportunityAttacks(
              orig.tokenId,
              orig.originX,
              orig.originY,
              gx,
              gy,
              state.tokens,
              state.reactionUsedMap,
              movedIsDisengaging,
              cellSizeFt,
            );
            if (pendingOAs.length > 0) {
              // Process all OAs sequentially (async, fire-and-forget from mouseup)
              const movedTokenId = orig.tokenId;
              const canvas = viewportRef.current;
              (async () => {
                for (const oa of pendingOAs) {
                  useGameplayStore.getState().setPendingReaction(oa);

                  // Dramatic alert: sound + screen shake
                  const audioSettings = useSettingsStore.getState().audio;
                  if (!audioSettings.muteAll) {
                    const vol = (audioSettings.effectsVolume * audioSettings.masterVolume) / 10000;
                    playOAAlertSound(vol);
                  }
                  canvas?.classList.add("animate-oa-shake");
                  setTimeout(() => canvas?.classList.remove("animate-oa-shake"), 150);

                  // Wait for this OA to resolve before showing the next
                  const maxWait = 30_000;
                  const start = Date.now();
                  while (Date.now() - start < maxWait) {
                    if (useGameplayStore.getState().pendingReaction === null) break;
                    await new Promise((r) => setTimeout(r, 100));
                  }

                  // Check if token died
                  const tokenAfter = useGameplayStore.getState().tokens.find((t) => t.id === movedTokenId);
                  if (!tokenAfter || tokenAfter.hp <= 0) break;
                }
              })();
            }
          }
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
    [tokens, scaledCell, gridCols, gridRows, cellSizeFt, selectToken, toggleTokenSelection, moveToken, pushMovementHistory, addMovementFt, closeContextMenu, combat.active, currentTurnTokenId, pathPlanningActive, enterPathPlanning],
  );

  // Canvas mousedown (selection box, ruler, ping, pan)
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle-click pan
      if (e.button === 1) {
        e.preventDefault();
        panRef.current = { lastX: e.clientX, lastY: e.clientY };
        function onPanMove(ev: MouseEvent) {
          if (!panRef.current) return;
          const dx = ev.clientX - panRef.current.lastX;
          const dy = ev.clientY - panRef.current.lastY;
          useCameraStore.getState().pan(dx, dy);
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
      if (e.button !== 0) return;
      closeContextMenu();

      // Path planning: clicks on map add cells to planned path
      if (pathPlanningActive && pathPlanningTokenId) {
        const cell = getGridCell(e);
        if (!cell) return;

        const state = useGameplayStore.getState();
        const token = state.tokens.find((t) => t.id === pathPlanningTokenId);
        if (!token) return;

        const currentPath = state.plannedPath;
        const lastCell = currentPath.length > 0
          ? { x: currentPath[currentPath.length - 1].x, y: currentPath[currentPath.length - 1].y }
          : { x: token.x, y: token.y };

        // Don't add if clicking the same cell
        if (cell.x === lastCell.x && cell.y === lastCell.y) return;

        // Movement limit for path planning
        const maxFt = getMaxMovementFt(token.speed, state.turnActions.isDashing, state.movementUsedFt);
        const prevTotalFt = currentPath.length > 0 ? currentPath[currentPath.length - 1].totalFt : 0;

        // Check if adjacent (Chebyshev distance = 1) or needs pathfinding
        const dist = Math.max(Math.abs(cell.x - lastCell.x), Math.abs(cell.y - lastCell.y));

        if (dist === 1) {
          // Adjacent: add single cell
          const step = calculateStepCost(lastCell.x, lastCell.y, cell.x, cell.y, state.terrainCells, cellSizeFt);
          if (step.isImpassable) return;
          // Block if exceeds movement limit
          if (prevTotalFt + step.ftCost > maxFt) {
            state.addToast(`Movimento insuficiente (${maxFt - prevTotalFt}ft restante)`);
            return;
          }
          const events = detectStepEvents(
            lastCell.x, lastCell.y, cell.x, cell.y,
            pathPlanningTokenId, state.tokens, state.reactionUsedMap,
            state.turnActions.isDisengaging, state.wallEdges, state.terrainCells, cellSizeFt,
          );
          addPathCell({
            x: cell.x, y: cell.y,
            ftCost: step.ftCost, totalFt: prevTotalFt + step.ftCost,
            isDiagonal: step.isDiagonal, isDifficultTerrain: step.isDifficultTerrain,
            events,
          });
        } else {
          // Distant: use A* to find route
          const result = findPath(
            lastCell.x, lastCell.y, cell.x, cell.y,
            state.wallEdges, state.terrainCells, gridCols, gridRows, cellSizeFt,
          );
          if (!result.found || result.path.length === 0) return;

          let prevX = lastCell.x;
          let prevY = lastCell.y;
          let runningFt = prevTotalFt;

          for (const p of result.path) {
            const step = calculateStepCost(prevX, prevY, p.x, p.y, state.terrainCells, cellSizeFt);
            // Stop adding cells if exceeds movement limit
            if (runningFt + step.ftCost > maxFt) break;
            runningFt += step.ftCost;
            const events = detectStepEvents(
              prevX, prevY, p.x, p.y,
              pathPlanningTokenId, state.tokens, state.reactionUsedMap,
              state.turnActions.isDisengaging, state.wallEdges, state.terrainCells, cellSizeFt,
            );
            addPathCell({
              x: p.x, y: p.y,
              ftCost: step.ftCost, totalFt: runningFt,
              isDiagonal: step.isDiagonal, isDifficultTerrain: step.isDifficultTerrain,
              events,
            });
            prevX = p.x;
            prevY = p.y;
          }
        }
        return;
      }

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

      // Wall tool (edge-based)
      if (activeTool === "wall") {
        if (getLayer("walls")?.locked) return;
        const edge = getMouseEdge(e);
        if (!edge) return;
        const st = useGameplayStore.getState();
        const { wallDrawMode, activeWallEdgeType, activeWallStyle } = st;

        if (wallDrawMode === "rectangle") {
          // Rectangle mode: drag to define rectangle, walls on release
          const startCell = getGridCell(e);
          if (!startCell) return;

          function onRectMove(ev: MouseEvent) {
            // The rectangle preview is handled by hoverEdge + rectangle state
            // For now, just update the end cell (could store in ref for preview)
          }
          function onRectUp(ev: MouseEvent) {
            const endCell = getGridCell(ev);
            if (endCell && startCell) {
              const keys = rectangleWallKeys(
                startCell.x, startCell.y, endCell.x, endCell.y,
                gridCols, gridRows,
              );
              const s = useGameplayStore.getState();
              for (const key of keys) {
                s.addWallEdge(key, { type: s.activeWallEdgeType, style: s.activeWallStyle });
              }
            }
            document.removeEventListener("mousemove", onRectMove);
            document.removeEventListener("mouseup", onRectUp);
          }
          document.addEventListener("mousemove", onRectMove);
          document.addEventListener("mouseup", onRectUp);
          return;
        }

        if (wallDrawMode === "erase") {
          // Erase mode: click to remove, drag to erase multiple
          st.removeWallEdge(edge.key);
          const erased = new Set<string>([edge.key]);
          function onEraseMove(ev: MouseEvent) {
            const e2 = getMouseEdge(ev);
            if (!e2 || erased.has(e2.key)) return;
            erased.add(e2.key);
            useGameplayStore.getState().removeWallEdge(e2.key);
          }
          function onEraseUp() {
            document.removeEventListener("mousemove", onEraseMove);
            document.removeEventListener("mouseup", onEraseUp);
          }
          document.addEventListener("mousemove", onEraseMove);
          document.addEventListener("mouseup", onEraseUp);
          return;
        }

        // Line mode (default)
        if (e.shiftKey) {
          // Shift+click: create/toggle door on this edge
          const existing = st.wallEdges[edge.key];
          if (existing) {
            if (existing.type === "door-closed" || existing.type === "door-open" || existing.type === "door-locked") {
              st.toggleDoorEdge(edge.key);
            } else {
              // Convert wall to door
              st.updateWallEdge(edge.key, { type: "door-closed" });
            }
          } else {
            st.addWallEdge(edge.key, { type: "door-closed", style: activeWallStyle });
          }
        } else {
          // Normal click: toggle wall (place or remove)
          const existing = st.wallEdges[edge.key];
          if (existing && existing.type === activeWallEdgeType && existing.style === activeWallStyle) {
            st.removeWallEdge(edge.key);
          } else {
            st.addWallEdge(edge.key, { type: activeWallEdgeType, style: activeWallStyle });
          }
        }

        // Drag to add multiple walls
        const painted = new Set<string>([edge.key]);
        function onWallMove(ev: MouseEvent) {
          const e2 = getMouseEdge(ev);
          if (!e2 || painted.has(e2.key)) return;
          painted.add(e2.key);
          const s = useGameplayStore.getState();
          if (!s.wallEdges[e2.key]) {
            s.addWallEdge(e2.key, { type: s.activeWallEdgeType, style: s.activeWallStyle });
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

      // AI tool
      if (activeTool === "ai") {
        const cell = getGridCell(e);
        if (cell) startAIDrag(cell);
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
        if (!viewportRef.current) return;
        const rect = viewportRef.current.getBoundingClientRect();
        const cam = useCameraStore.getState();
        const px = (e.clientX - rect.left - cam.panX) / cam.zoom;
        const py = (e.clientY - rect.top - cam.panY) / cam.zoom;

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
          if (!viewportRef.current) return;
          const r = viewportRef.current.getBoundingClientRect();
          const cam = useCameraStore.getState();
          const mx = (ev.clientX - r.left - cam.panX) / cam.zoom;
          const my = (ev.clientY - r.top - cam.panY) / cam.zoom;
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
        if (getLayer("fog")?.locked) return;
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

      // Terrain
      if (activeTool === "terrain") {
        if (getLayer("terrain")?.locked) return;
        const cell = getGridCell(e);
        if (!cell) return;
        const st = useGameplayStore.getState();
        const editorTool = st.terrainEditorTool;

        if (editorTool === "fill") {
          st.fillTerrain(cell.x, cell.y);
          return;
        }

        if (editorTool === "eraser") {
          const cells = getBrushCells(cell.x, cell.y, st.terrainBrushSize, gridCols, gridRows);
          st.eraseTerrainArea(cells);
          const erased = new Set(cells.map((c) => `${c.x},${c.y}`));
          function onEraseMove(ev: MouseEvent) {
            const c = getGridCell(ev);
            if (!c) return;
            const s = useGameplayStore.getState();
            const brushCells = getBrushCells(c.x, c.y, s.terrainBrushSize, gridCols, gridRows)
              .filter((bc) => !erased.has(`${bc.x},${bc.y}`));
            if (brushCells.length === 0) return;
            brushCells.forEach((bc) => erased.add(`${bc.x},${bc.y}`));
            s.eraseTerrainArea(brushCells);
            s.setHoverCell(c);
          }
          function onEraseUp() {
            document.removeEventListener("mousemove", onEraseMove);
            document.removeEventListener("mouseup", onEraseUp);
          }
          document.addEventListener("mousemove", onEraseMove);
          document.addEventListener("mouseup", onEraseUp);
          return;
        }

        if (editorTool === "brush") {
          const cells = getBrushCells(cell.x, cell.y, st.terrainBrushSize, gridCols, gridRows);
          st.paintTerrainArea(cells);
          const painted = new Set(cells.map((c) => `${c.x},${c.y}`));
          function onBrushMove(ev: MouseEvent) {
            const c = getGridCell(ev);
            if (!c) return;
            const s = useGameplayStore.getState();
            const brushCells = getBrushCells(c.x, c.y, s.terrainBrushSize, gridCols, gridRows)
              .filter((bc) => !painted.has(`${bc.x},${bc.y}`));
            if (brushCells.length === 0) return;
            brushCells.forEach((bc) => painted.add(`${bc.x},${bc.y}`));
            s.paintTerrainArea(brushCells);
            s.setHoverCell(c);
          }
          function onBrushUp() {
            document.removeEventListener("mousemove", onBrushMove);
            document.removeEventListener("mouseup", onBrushUp);
          }
          document.addEventListener("mousemove", onBrushMove);
          document.addEventListener("mouseup", onBrushUp);
          return;
        }

        if (editorTool === "rectangle") {
          const startCell = cell;
          st.setTerrainRectPreview({ x1: cell.x, y1: cell.y, x2: cell.x, y2: cell.y });
          function onRectMove(ev: MouseEvent) {
            const c = getGridCell(ev);
            if (!c) return;
            useGameplayStore.getState().setTerrainRectPreview({
              x1: startCell.x, y1: startCell.y, x2: c.x, y2: c.y,
            });
          }
          function onRectUp(ev: MouseEvent) {
            const c = getGridCell(ev);
            const s = useGameplayStore.getState();
            s.setTerrainRectPreview(null);
            if (c) {
              const minX = Math.min(startCell.x, c.x);
              const minY = Math.min(startCell.y, c.y);
              const maxX = Math.max(startCell.x, c.x);
              const maxY = Math.max(startCell.y, c.y);
              const rectCells: { x: number; y: number }[] = [];
              for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                  rectCells.push({ x, y });
                }
              }
              s.paintTerrainArea(rectCells);
            }
            document.removeEventListener("mousemove", onRectMove);
            document.removeEventListener("mouseup", onRectUp);
          }
          document.addEventListener("mousemove", onRectMove);
          document.addEventListener("mouseup", onRectUp);
          return;
        }
        return;
      }

      // Objects tool
      if (activeTool === "objects") {
        if (getLayer("decorations")?.locked) return;
        const cell = getGridCell(e);
        if (!cell) return;
        const store = useGameplayStore.getState();
        if (e.shiftKey) {
          // Shift+click removes object at cell
          const obj = store.mapObjects.find((o) => o.x === cell.x && o.y === cell.y);
          if (obj) store.removeObject(obj.id);
        } else {
          store.placeObject(cell.x, cell.y);
        }
        return;
      }

      // Pan
      if (activeTool === "pan" || spaceHeld) {
        panRef.current = { lastX: e.clientX, lastY: e.clientY };
        function onPanMove(ev: MouseEvent) {
          if (!panRef.current) return;
          const dx = ev.clientX - panRef.current.lastX;
          const dy = ev.clientY - panRef.current.lastY;
          useCameraStore.getState().pan(dx, dy);
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
      if (activeTool !== "pointer" || !viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const cam = useCameraStore.getState();
      const px = (e.clientX - rect.left - cam.panX) / cam.zoom;
      const py = (e.clientY - rect.top - cam.panY) / cam.zoom;
      selBoxRef.current = { startPxX: px, startPxY: py };

      function onMove(ev: MouseEvent) {
        if (!selBoxRef.current || !viewportRef.current) return;
        const r = viewportRef.current.getBoundingClientRect();
        const cam = useCameraStore.getState();
        setSelectionBox({
          startX: selBoxRef.current.startPxX,
          startY: selBoxRef.current.startPxY,
          endX: (ev.clientX - r.left - cam.panX) / cam.zoom,
          endY: (ev.clientY - r.top - cam.panY) / cam.zoom,
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
    [activeTool, spaceHeld, scaledCell, onMapTokens, getGridCell, closeContextMenu, clearSelection, setSelectionBox, addRulerPoint, setRulerActive, clearRuler, addPing, aoeShape, aoeColor, setAoePlacing, addAoe, drawingTool, drawColor, drawWidth, regionSelection, clearRegion, startRegionDrag, startAIDrag, pathPlanningActive, pathPlanningTokenId, addPathCell, cellSizeFt, gridCols, gridRows],
  );

  // Canvas right-click
  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // Right-click exits path planning
      if (pathPlanningActive) {
        exitPathPlanning();
        return;
      }
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
    [getGridCell, onMapTokens, selectToken, openTokenContextMenu, openCellContextMenu, pathPlanningActive, exitPathPlanning],
  );

  // Canvas mouse move (ruler, wall hover, terrain hover)
  const setHoverCell = useGameplayStore((s) => s.setHoverCell);
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === "ruler" && rulerActive) {
        const cell = getGridCell(e);
        if (cell) setRulerMouse(cell);
      }
      if (activeTool === "wall") {
        const edge = getMouseEdge(e);
        setHoverEdge(edge);
      } else if (hoverEdge) {
        setHoverEdge(null);
      }
      if (activeTool === "terrain") {
        const cell = getGridCell(e);
        setHoverCell(cell);
      } else {
        setHoverCell(null);
      }
    },
    [activeTool, rulerActive, getGridCell, getMouseEdge, hoverEdge, setHoverCell],
  );

  // Double-click: toggle doors
  const handleCanvasDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== "wall") return;
      const edge = getMouseEdge(e);
      if (!edge) return;
      const st = useGameplayStore.getState();
      const wall = st.wallEdges[edge.key];
      if (!wall) return;
      if (wall.type === "door-closed" || wall.type === "door-open" || wall.type === "door-locked") {
        st.toggleDoorEdge(edge.key);
      }
    },
    [activeTool, getMouseEdge],
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

      // Path planning keyboard shortcuts
      const ppState = useGameplayStore.getState();
      if (ppState.pathPlanningActive) {
        if (e.key === "Escape") { ppState.exitPathPlanning(); return; }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (ppState.plannedPath.length > 0) {
            // Dynamically import to avoid circular dependency
            import("@/lib/path-execution").then(({ executePath }) => {
              executePath(ppState.pathPlanningTokenId!, ppState.plannedPath);
            });
          }
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); ppState.undoPathStep(); return; }
        if (e.key === "Backspace") { ppState.undoPathStep(); return; }
        return; // Consume all other keys during path planning
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
        st.clearAISelection();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        useGameplayStore.getState().selectedTokenIds.forEach((id) =>
          useGameplayStore.getState().removeToken(id),
        );
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") { e.preventDefault(); useGameplayStore.getState().selectAllTokens(); return; }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        useGameplayStore.getState().redoTerrain();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        const st = useGameplayStore.getState();
        if (st.activeTool === "terrain") {
          st.undoTerrain();
        } else if (st.activeTool === "draw") {
          st.undoStroke();
        } else if (st.activeTool === "ai" && st.aiLayers.length > 0) {
          st.undoLastAILayer();
          st.addToast("Textura IA removida");
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
          if (tok) {
            useCameraStore.getState().centerOnCell(tok.x, tok.y);
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
        return;
      }
      if (e.key === "=" || e.key === "+") { useCameraStore.getState().zoomIn(); return; }
      if (e.key === "-") { useCameraStore.getState().zoomOut(); return; }
      if (e.key === "0") { useCameraStore.getState().reset(); return; }
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
    // Subscribe to camera changes and update viewport/store
    const unsub = useCameraStore.subscribe((cam) => {
      setViewport({
        x: -cam.panX / cam.zoom,
        y: -cam.panY / cam.zoom,
        w: cam.viewportWidth / cam.zoom,
        h: cam.viewportHeight / cam.zoom,
      });
      setMapViewport({
        scrollLeft: -cam.panX / cam.zoom,
        scrollTop: -cam.panY / cam.zoom,
        viewportW: cam.viewportWidth / cam.zoom,
        viewportH: cam.viewportHeight / cam.zoom,
        cellSize: CELL_SIZE,
      });
    });

    // Resize observer for viewport size
    const el = viewportRef.current;
    if (el) {
      const ro = new ResizeObserver(() => {
        useCameraStore.getState().setViewportSize(el.clientWidth, el.clientHeight);
      });
      ro.observe(el);
      // Initial size
      useCameraStore.getState().setViewportSize(el.clientWidth, el.clientHeight);
      return () => { unsub(); ro.disconnect(); };
    }
    return unsub;
  }, [setMapViewport]);

  const handleMiniMapNavigate = useCallback(
    (worldX: number, worldY: number) => {
      const cam = useCameraStore.getState();
      const targetPanX = cam.viewportWidth / 2 - worldX * cam.zoom;
      const targetPanY = cam.viewportHeight / 2 - worldY * cam.zoom;
      cam.setPan(targetPanX, targetPanY);
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

  // NPC drag-and-drop from sidebar
  const addToken = useGameplayStore((s) => s.addToken);
  const linkTokenToCreature = useGameplayStore((s) => s.linkTokenToCreature);

  const handleDrop = useCallback((e: React.DragEvent) => {
    // Convert drop position to grid cell
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const cam = useCameraStore.getState();
    const worldX = (e.clientX - rect.left - cam.panX) / cam.zoom;
    const worldY = (e.clientY - rect.top - cam.panY) / cam.zoom;
    const cellX = Math.floor(worldX / CELL_SIZE);
    const cellY = Math.floor(worldY / CELL_SIZE);

    // ── NPC drop ──
    const npcId = e.dataTransfer.getData("application/questboard-npc");
    if (npcId) {
      e.preventDefault();
      const npcStore = useNPCStore.getState();
      const npc = npcStore.npcs.find((n) => n.id === npcId);
      if (!npc) return;

      let hp = 10, maxHp = 10, ac = 10, speed = 30, size = 1;
      let creatureId: string | null = null;

      if (npc.statBlockSource === "inline" && npc.inlineStats) {
        hp = npc.inlineStats.hp; maxHp = npc.inlineStats.maxHp;
        ac = npc.inlineStats.ac; speed = npc.inlineStats.speed;
        size = npc.inlineStats.size;
      } else if (npc.statBlockSource === "compendium" && npc.compendiumCreatureId) {
        const c = CREATURE_COMPENDIUM.find((cr) => cr.id === npc.compendiumCreatureId);
        if (c) { hp = c.hp; maxHp = c.hp; ac = c.ac; speed = parseInt(c.speed) || 30; creatureId = c.id; }
      } else if (npc.statBlockSource === "custom" && npc.customCreatureId) {
        const c = useCustomCreaturesStore.getState().creatures.find((cr) => cr.id === npc.customCreatureId);
        if (c) { hp = c.hp; maxHp = c.hp; ac = c.ac; speed = parseInt(c.speed) || 30; creatureId = c.id; }
      }

      const alignmentMap: Record<string, TokenAlignment> = { hostile: "hostile", neutral: "neutral", ally: "ally", merchant: "neutral" };
      const tokenId = `tok_npc_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

      addToken({ id: tokenId, name: npc.name, alignment: alignmentMap[npc.type] ?? "neutral", hp, maxHp, ac, speed, size, x: cellX, y: cellY, icon: npc.portrait || undefined });
      npcStore.linkTokenToNpc(npcId, tokenId);
      if (creatureId) linkTokenToCreature(tokenId, creatureId);
      return;
    }

    // ── Saved Token drop ──
    const savedTokenId = e.dataTransfer.getData("application/questboard-token");
    if (savedTokenId) {
      e.preventDefault();
      const savedToken = useTokenLibraryStore.getState().savedTokens.find((t) => t.id === savedTokenId);
      if (!savedToken) return;

      const typeAlignMap: Record<string, TokenAlignment> = { hostile: "hostile", ally: "ally", neutral: "neutral", object: "neutral", trap: "neutral", mount: "ally" };
      const tokenId = `tok_lib_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      addToken({
        id: tokenId, name: savedToken.name,
        alignment: typeAlignMap[savedToken.type] ?? "neutral",
        hp: savedToken.hp, maxHp: savedToken.hp, ac: savedToken.ac,
        speed: parseInt(savedToken.speed) || 30, size: savedToken.gridSize,
        x: cellX, y: cellY, icon: savedToken.icon || undefined,
      });
      if (savedToken.compendiumId) linkTokenToCreature(tokenId, savedToken.compendiumId);
      return;
    }

    // ── Compendium creature drop ──
    const compendiumId = e.dataTransfer.getData("application/questboard-compendium");
    if (compendiumId) {
      e.preventDefault();
      const creature = CREATURE_COMPENDIUM.find((c) => c.id === compendiumId)
        ?? useCustomCreaturesStore.getState().creatures.find((c) => c.id === compendiumId);
      if (!creature) return;

      const sizeMap: Record<string, number> = { tiny: 1, small: 1, medium: 1, large: 2, huge: 3, gargantuan: 4 };
      const tokenId = `tok_comp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      addToken({
        id: tokenId, name: creature.name,
        alignment: "hostile" as TokenAlignment,
        hp: creature.hp, maxHp: creature.hp, ac: creature.ac,
        speed: parseInt(creature.speed) || 30, size: sizeMap[creature.size] ?? 1,
        x: cellX, y: cellY, icon: creature.icon || undefined,
      });
      linkTokenToCreature(tokenId, creature.id);
      return;
    }
  }, [scaledCell, addToken, linkTokenToCreature]);

  const cursorClass =
    activeTool === "pan" || spaceHeld ? "cursor-grab"
    : activeTool === "ruler" || activeTool === "aoe" || activeTool === "region" || activeTool === "ai" ? "cursor-crosshair"
    : activeTool === "draw" || activeTool === "wall" || activeTool === "terrain" || activeTool === "objects" ? "cursor-crosshair"
    : "cursor-default";

  // Wheel zoom — native event listener with passive:false for proper preventDefault
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const cam = useCameraStore.getState();
      if (e.deltaY < 0) cam.zoomIn(1.1, mouseX, mouseY);
      else cam.zoomOut(1.1, mouseX, mouseY);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div
      ref={viewportRef}
      className={`relative bg-[#0F0F12] ${cursorClass}`}
      style={{ flex: 1, minWidth: 0, overflow: "hidden", "--camera-zoom": zoom } as React.CSSProperties}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onDoubleClick={handleCanvasDoubleClick}
      onContextMenu={handleCanvasContextMenu}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
      onDrop={handleDrop}
    >
      {/* Layer 0: Single unified PIXI.Application (combat animations only) */}
      <PixiCanvas
        gridCols={gridCols}
        gridRows={gridRows}
        gridVisible={gridVisible && (getLayer("grid")?.visible ?? true)}
        gridOpacity={(getLayer("grid")?.opacity ?? 100) / 100}
      />

      {/* Layer 1: React world-space overlays (CSS transform synced with camera) */}
      <div
        ref={reactWorldRef}
        className="pointer-events-none absolute left-0 top-0"
        style={{
          transformOrigin: "0 0",
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          width: canvasW,
          height: canvasH,
          willChange: "transform",
        }}
      >
          {/* Background image (layer: background) */}
          {mapBackgroundImage && getLayer("background")?.visible && (
            <img
              src={mapBackgroundImage}
              alt=""
              className="pointer-events-none absolute inset-0"
              style={{
                width: canvasW,
                height: canvasH,
                objectFit: "cover",
                opacity: mapBackgroundOpacity * (getLayer("background")?.opacity ?? 100) / 100,
                transform: `translate(${mapGridOffsetX}px, ${mapGridOffsetY}px)`,
              }}
              draggable={false}
            />
          )}

          {/* AI generated layers */}
          {aiLayers.map((layer) => {
            const lx1 = Math.min(layer.x1, layer.x2);
            const ly1 = Math.min(layer.y1, layer.y2);
            const lx2 = Math.max(layer.x1, layer.x2);
            const ly2 = Math.max(layer.y1, layer.y2);
            const lw = (lx2 - lx1 + 1) * scaledCell;
            const lh = (ly2 - ly1 + 1) * scaledCell;
            return (
              <img
                key={layer.id}
                src={layer.imageDataUrl}
                alt={layer.name}
                className="pointer-events-none absolute"
                style={{
                  left: lx1 * scaledCell,
                  top: ly1 * scaledCell,
                  width: lw,
                  height: lh,
                  imageRendering: "pixelated",
                }}
                draggable={false}
              />
            );
          })}

          {/* Terrain (layer: terrain) */}
          {getLayer("terrain")?.visible && (
            <div style={{ opacity: (getLayer("terrain")?.opacity ?? 100) / 100 }}>
              <TerrainOverlay cells={terrainCells} scaledCell={scaledCell} gridCols={gridCols} gridRows={gridRows} />
              <TerrainBrushPreview scaledCell={scaledCell} gridCols={gridCols} gridRows={gridRows} />
              <TerrainRectPreview scaledCell={scaledCell} />
            </div>
          )}

          {/* Walls (layer: walls) */}
          {getLayer("walls")?.visible && (
            <div style={{ opacity: (getLayer("walls")?.opacity ?? 100) / 100 }}>
              <WallRenderer scaledCell={scaledCell} canvasW={canvasW} canvasH={canvasH} hoverEdge={hoverEdge} />
            </div>
          )}

          {/* Map objects (layer: decorations) */}
          {getLayer("decorations")?.visible && (
            <div style={{ opacity: (getLayer("decorations")?.opacity ?? 100) / 100 }}>
              <ObjectOverlay scaledCell={scaledCell} />
            </div>
          )}

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
          {showMarkers && <MarkersOverlay markers={markers} scaledCell={scaledCell} />}
          {showGMNotes && <NotesOverlay notes={notes} scaledCell={scaledCell} />}
          <LightSourceOverlay scaledCell={scaledCell} />

          {/* Fog (layer: fog) */}
          {getLayer("fog")?.visible && (
            <div style={{ opacity: (getLayer("fog")?.opacity ?? 100) / 100 }}>
              <FogOverlay
                canvasW={canvasW}
                canvasH={canvasH}
                scaledCell={scaledCell}
                scrollLeft={viewport.x}
                scrollTop={viewport.y}
                viewportW={viewport.w > 0 ? viewport.w : canvasW}
                viewportH={viewport.h > 0 ? viewport.h : canvasH}
              />
            </div>
          )}

          {/* Grid is rendered by PIXI in worldContainer (pixi-canvas.tsx) */}

          {/* Movement preview (hidden during path planning) */}
          {currentTurnToken?.onMap && !pathPlanningActive && (
            <MovementPreview token={currentTurnToken} scaledCell={scaledCell} movementUsedFt={movementUsedFt} />
          )}

          {/* Path planning overlay */}
          {pathPlanningActive && (
            <PathOverlay scaledCell={scaledCell} cellSizeFt={cellSizeFt} />
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

          {/* OA Preview during drag */}
          {dragPos && dragRef.current && combat.active && (
            <OAPreviewOverlay
              draggedTokenId={dragPos.id}
              originX={dragRef.current.originX}
              originY={dragRef.current.originY}
              currentX={dragPos.x}
              currentY={dragPos.y}
              tokens={onMapTokens}
              reactionUsedMap={reactionUsedMap}
              isDisengaging={turnActions.isDisengaging}
              scaledCell={scaledCell}
              cellSizeFt={cellSizeFt}
            />
          )}

          {/* Selection box */}
          {selectionBox && <SelectionBoxOverlay box={selectionBox} />}


          {/* Region selection */}
          {regionSelection && (
            <RegionSelectOverlay
              region={regionSelection}
              scaledCell={scaledCell}
              viewportRef={viewportRef}
            />
          )}

          {/* AI selection overlay */}
          {aiSelection && (
            <AISelectionOverlay
              selection={aiSelection}
              scaledCell={scaledCell}
              viewportRef={viewportRef}
            />
          )}

          {/* Ruler */}
          {rulerPoints.length > 0 && (
            <RulerOverlay points={rulerPoints} mousePoint={rulerActive ? rulerMouse : null} scaledCell={scaledCell} />
          )}

          {/* AOE (layer: effects) */}
          {getLayer("effects")?.visible && (
            <div style={{ opacity: (getLayer("effects")?.opacity ?? 100) / 100 }}>
              <AOEOverlay instances={aoeInstances} placing={aoePlacing} scaledCell={scaledCell} />
            </div>
          )}

          {/* Pings */}
          <PingOverlay pings={pings} scaledCell={scaledCell} />

          {/* Damage floats */}
          <DamageFloatOverlay floats={damageFloats} tokens={onMapTokens} scaledCell={scaledCell} />

          {/* Combat animations are now in the unified PixiCanvas */}

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

          {/* Reaction prompt */}
          {pendingReaction && (() => {
            const reactorToken = onMapTokens.find((t) => t.id === pendingReaction.reactorTokenId);
            const triggerToken = onMapTokens.find((t) => t.id === pendingReaction.triggerTokenId);
            if (!reactorToken || !triggerToken) return null;
            return (
              <ReactionPrompt
                pending={pendingReaction}
                reactorToken={reactorToken}
                triggerToken={triggerToken}
                scaledCell={scaledCell}
                onUse={async (weaponId) => {
                  const state = useGameplayStore.getState();
                  const pr = state.pendingReaction;
                  if (!pr) return;
                  const weapon = pr.weaponOptions.find((w) => w.weaponId === weaponId);
                  if (!weapon) return;
                  const target = state.tokens.find((t) => t.id === pr.triggerTokenId);
                  if (!target) return;

                  await executeAttackWithAnimation({
                    attackerTokenId: pr.reactorTokenId,
                    targetTokenId: pr.triggerTokenId,
                    weapon,
                    targetAC: target.ac,
                    context: "opportunity-attack",
                  });
                }}
                onSkip={() => {
                  useGameplayStore.getState().setPendingReaction(null);
                }}
              />
            );
          })()}

          {/* Ambient lighting overlay */}
          {ambientLight !== "bright" && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                width: canvasW,
                height: canvasH,
                backgroundColor: `rgba(0, 0, 0, ${AMBIENT_LIGHT_CONFIG[ambientLight].overlay})`,
                filter: AMBIENT_LIGHT_CONFIG[ambientLight].desaturation > 0
                  ? `saturate(${1 - AMBIENT_LIGHT_CONFIG[ambientLight].desaturation})`
                  : undefined,
                zIndex: 25,
              }}
            />
          )}

          {/* Tokens (layer: tokens) */}
          {getLayer("tokens")?.visible && onMapTokens.map((token) => {
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
            const behRender = behaviorRenderStates[token.id];
            const baseX = behRender ? behRender.targetX : token.x;
            const baseY = behRender ? behRender.targetY : token.y;
            const dx = isDragging ? dragPos.x * scaledCell : baseX * scaledCell;
            const dy = isDragging ? dragPos.y * scaledCell : baseY * scaledCell;

            return (
              <div
                key={token.id}
                data-token-id={token.id}
                className={`pointer-events-auto absolute flex cursor-grab flex-col items-center justify-center ${isDead ? "opacity-30" : ""} ${isDragging ? "z-30 opacity-70" : ""} ${isHidden ? "opacity-40" : ""}`}
                style={{
                  left: dx, top: dy, width: size, height: size,
                  transition: isDragging ? "none" : "left 200ms ease-out, top 200ms ease-out",
                }}
                onMouseDown={(e) => handleTokenMouseDown(e, token.id)}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); selectToken(token.id); openTokenContextMenu(token.id, e.clientX, e.clientY); }}
                onMouseEnter={(e) => handleTokenMouseEnter(e, token.id)}
                onMouseLeave={handleTokenMouseLeave}
              >
                {(() => {
                  const creatureId = tokenCreatureMap[token.id];
                  const hasSprite = creatureId && CREATURE_SPRITES[creatureId];
                  if (hasSprite) {
                    return (
                      <div
                        className="flex items-center justify-center transition-all"
                        style={{
                          width: size, height: size,
                          filter: isSelected ? `drop-shadow(0 0 6px ${color})` : isHovered ? `drop-shadow(0 0 3px ${color})` : undefined,
                        }}
                      >
                        <CreatureSpriteToken creatureId={creatureId} alignment={token.alignment} size={size} />
                      </div>
                    );
                  }
                  return (
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
                  );
                })()}

                {scaledCell * zoom >= 20 && (
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

      {/* Tooltip */}
      {hoveredToken && tooltipPos && !contextMenu.open && !dragPos && (
        <TokenTooltip token={hoveredToken} x={tooltipPos.x} y={tooltipPos.y} />
      )}

      {/* Context menus — stopPropagation prevents canvas mousedown from closing before onClick fires */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div onMouseDown={(e) => e.stopPropagation()}>
        {contextMenu.open && contextMenu.type === "token" && contextToken && (
          <TokenContextMenu token={contextToken} x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
        )}
        {contextMenu.open && contextMenu.type === "cell" && (
          <CellContextMenu cellX={contextMenu.cellX} cellY={contextMenu.cellY} x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
        )}
        {contextMenu.open && contextMenu.type === "canvas" && (
          <CanvasContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
        )}
      </div>

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

      {/* Path planning preview panel */}
      {pathPlanningActive && (
        <div className="pointer-events-none absolute inset-0 z-40">
          <PathPreviewPanel />
        </div>
      )}


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
