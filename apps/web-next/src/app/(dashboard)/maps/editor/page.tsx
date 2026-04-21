"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BoxSelect,
  Check,
  Eraser,
  Eye,
  Fence,
  Copy,
  Hand,
  MousePointer2,
  RotateCw,
  ImageIcon,
  Mountain,
  Package,
  Paintbrush,
  PaintBucket,
  Save,
  Square,
  Stamp,
  Trash2,
  Undo2,
  Redo2,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import type {
  TerrainType,
  TerrainEditorTool,
  WallType,
  WallStyle,
  WallData,
  WallDrawMode,
  MapObjectType,
  TerrainCell,
  MapObjectCell,
} from "@/lib/gameplay-mock-data";
import { MAP_OBJECT_CATALOG } from "@/lib/gameplay-mock-data";
import { ObjectSpriteIcon } from "@/components/gameplay/object-sprite-icon";
import { ObjectActionToolbar, TOOLBAR_HEIGHT } from "@/components/gameplay/object-action-toolbar";
import { hasObjectSprite } from "@questboard/constants";
import { HelpCircle } from "lucide-react";
import {
  getNearestEdge,
  getWallRenderLine,
  wallSideToEdgeKey,
  type NearestEdge,
} from "@/lib/wall-helpers";
import {
  TERRAIN_CATALOG,
  TERRAIN_CATEGORIES,
  getTerrainsByCategory,
  type TerrainCategoryId,
} from "@/lib/terrain-catalog";
import { getTerrainCSSPattern } from "@/components/gameplay/map-canvas/terrain-patterns";
import { hasProceduralTexture, getTerrainCanvas } from "@/lib/terrain-texture-generator";
import { PixiTerrainLayer } from "@/components/gameplay/map-canvas/pixi-terrain-layer";
import { ROOM_TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/room-templates";
import { useMapLibraryStore } from "@/lib/map-library-store";
import { editorStateToMapData, mapToEditorState } from "@/lib/map-types";
import { generateMapThumbnail } from "@/lib/map-thumbnail";

// ── Standalone editor state (no gameplay store dependency) ───────────

interface EditorState {
  gridCols: number;
  gridRows: number;
  cellSize: number;
  zoom: number;
  terrainCells: TerrainCell[];
  wallEdges: Record<string, WallData>;
  mapObjects: MapObjectCell[];
  // Active selections
  activeTool: "pointer" | "terrain" | "wall" | "objects" | "eraser" | "hand";
  terrainEditorTool: TerrainEditorTool;
  activeTerrainType: TerrainType;
  terrainCategory: TerrainCategoryId | "all";
  brushSize: 1 | 2 | 3;
  activeWallEdgeType: WallType;
  activeWallStyle: WallStyle;
  activeWallLockDC: number;
  wallDrawMode: WallDrawMode;
  activeObjectType: MapObjectType;
  // Undo
  history: { terrain: TerrainCell[]; wallEdges: Record<string, WallData>; objects: MapObjectCell[] }[];
  future: { terrain: TerrainCell[]; wallEdges: Record<string, WallData>; objects: MapObjectCell[] }[];
  // Background image
  backgroundImage: string | null;
  backgroundOpacity: number;
  // Meta
  mapName: string;
  savedMapId: string | null;
  // Selection (objects tool)
  selectedObjectId: string | null;
}

function createInitialState(): EditorState {
  return {
    gridCols: 25,
    gridRows: 25,
    cellSize: 40,
    zoom: 100,
    terrainCells: [],
    wallEdges: {},
    mapObjects: [],
    activeTool: "terrain",
    terrainEditorTool: "brush",
    activeTerrainType: "stone_floor",
    terrainCategory: "all",
    brushSize: 1,
    activeWallEdgeType: "wall",
    activeWallStyle: "stone",
    activeWallLockDC: 15,
    wallDrawMode: "line",
    activeObjectType: "chest",
    history: [],
    future: [],
    backgroundImage: null,
    backgroundOpacity: 0.5,
    mapName: "Novo Mapa",
    savedMapId: null,
    selectedObjectId: null,
  };
}

function getBrushCells(
  cx: number,
  cy: number,
  size: number,
  maxCols: number,
  maxRows: number,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  const offset = Math.floor(size / 2);
  for (let dx = -offset; dx < size - offset; dx++) {
    for (let dy = -offset; dy < size - offset; dy++) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx >= 0 && ny >= 0 && nx < maxCols && ny < maxRows) {
        cells.push({ x: nx, y: ny });
      }
    }
  }
  return cells;
}

// ── Wall visual config (shared with wall-renderer) ──────────────────

const WALL_TYPE_VISUALS: Record<WallType, { color: string; thickness: number; dash?: string; alpha: number; doorIcon?: string }> = {
  "wall":        { color: "#888888", thickness: 4, alpha: 1.0 },
  "door-closed": { color: "#C8A050", thickness: 4, alpha: 1.0, doorIcon: "▯" },
  "door-open":   { color: "#C8A050", thickness: 2, dash: "4,4", alpha: 0.5, doorIcon: "○" },
  "door-locked": { color: "#C8A050", thickness: 4, alpha: 1.0, doorIcon: "🔒" },
  "window":      { color: "#6BB8E0", thickness: 3, dash: "6,3", alpha: 0.8 },
  "half-wall":   { color: "#888888", thickness: 3, dash: "8,2", alpha: 0.8 },
  "secret":      { color: "#AA55CC", thickness: 2, dash: "3,5", alpha: 0.4 },
  "illusory":    { color: "#CC55AA", thickness: 2, dash: "2,4", alpha: 0.3 },
  "portcullis":  { color: "#999999", thickness: 3, dash: "2,2", alpha: 0.9 },
};

const WALL_STYLE_COLORS: Record<WallStyle, string> = {
  stone:   "#777780",
  wood:    "#8B6040",
  metal:   "#A0A0B0",
  magic:   "#8855DD",
  natural: "#666660",
  brick:   "#995533",
};

function getEdgeColor(data: WallData): string {
  if (data.type === "wall" || data.type === "half-wall") return WALL_STYLE_COLORS[data.style];
  return WALL_TYPE_VISUALS[data.type].color;
}

// ── Object icon lookup ───────────────────────────────────────────────

const objectIconMap = new Map(MAP_OBJECT_CATALOG.map((o) => [o.type, o.icon]));

// ── Component ────────────────────────────────────────────────────────

export default function MapEditorPage() {
  const searchParams = useSearchParams();
  const mapIdParam = searchParams.get("id");
  const aiAutoOpenParam = searchParams.get("ai");

  const addMap = useMapLibraryStore((s) => s.addMap);
  const updateMap = useMapLibraryStore((s) => s.updateMap);

  const [state, setState] = useState<EditorState>(createInitialState);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [hoverEdge, setHoverEdge] = useState<NearestEdge | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCat, setTemplateCat] = useState("all");
  const [saveIndicator, setSaveIndicator] = useState<"saved" | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUseArea, setAiUseArea] = useState(false);
  const [aiAreaMode, setAiAreaMode] = useState(false);
  const [aiAreaDrag, setAiAreaDrag] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scaledCell = Math.round(state.cellSize * (state.zoom / 100));
  const canvasW = state.gridCols * scaledCell;
  const canvasH = state.gridRows * scaledCell;

  // ── Snapshot for undo ──────────────────────────────────────────────

  const pushSnapshot = useCallback(() => {
    setState((s) => ({
      ...s,
      history: [
        ...s.history.slice(-49),
        { terrain: [...s.terrainCells], wallEdges: { ...s.wallEdges }, objects: [...s.mapObjects] },
      ],
      future: [],
    }));
  }, []);

  const runAIGeneration = useCallback(
    async (promptText: string, area: { x1: number; y1: number; x2: number; y2: number } | null) => {
      setAiLoading(true);
      try {
        const res = await fetch("/api/ai/generate-map-structured", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptText,
            gridCols: state.gridCols,
            gridRows: state.gridRows,
            ...(area ? { area } : {}),
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(err.error ?? "Falha ao gerar mapa");
        }
        const result = (await res.json()) as {
          terrain: { x: number; y: number; type: TerrainType }[];
          walls: {
            x: number;
            y: number;
            side: "top" | "right" | "bottom" | "left";
            type: WallType;
            style: WallStyle;
            lockDC?: number;
          }[];
          objects: { x: number; y: number; type: MapObjectType; rotation?: number }[];
        };

        pushSnapshot();
        setState((s) => {
          const now = Date.now();
          const newObjects: MapObjectCell[] = result.objects.map((o, i) => ({
            id: `obj_${now}_${i}_${Math.random().toString(36).slice(2, 5)}`,
            x: o.x,
            y: o.y,
            type: o.type,
            rotation: o.rotation ?? 0,
          }));

          if (area) {
            const { x1, y1, x2, y2 } = area;
            const inArea = (x: number, y: number) =>
              x >= x1 && x <= x2 && y >= y1 && y <= y2;

            const keptTerrain = s.terrainCells.filter((c) => !inArea(c.x, c.y));
            const newTerrainMap = new Map<string, TerrainCell>();
            for (const c of result.terrain) {
              newTerrainMap.set(`${c.x},${c.y}`, { x: c.x, y: c.y, type: c.type });
            }

            const keptEdges: Record<string, WallData> = {};
            for (const [key, data] of Object.entries(s.wallEdges)) {
              const [a, b] = key.split(":");
              const [ax, ay] = a.split(",").map(Number);
              const [bx, by] = b.split(",").map(Number);
              if (!inArea(ax, ay) && !inArea(bx, by)) keptEdges[key] = data;
            }
            for (const w of result.walls) {
              const key = wallSideToEdgeKey(w.x, w.y, w.side);
              const data: WallData = { type: w.type, style: w.style };
              if (w.type === "door-locked" && typeof w.lockDC === "number") {
                data.lockDC = w.lockDC;
              }
              keptEdges[key] = data;
            }

            const keptObjects = s.mapObjects.filter((o) => !inArea(o.x, o.y));

            return {
              ...s,
              terrainCells: [...keptTerrain, ...Array.from(newTerrainMap.values())],
              wallEdges: keptEdges,
              mapObjects: [...keptObjects, ...newObjects],
            };
          }

          const terrainByCell = new Map<string, TerrainCell>();
          for (const c of result.terrain) {
            terrainByCell.set(`${c.x},${c.y}`, { x: c.x, y: c.y, type: c.type });
          }
          const nextEdges: Record<string, WallData> = {};
          for (const w of result.walls) {
            const key = wallSideToEdgeKey(w.x, w.y, w.side);
            const data: WallData = { type: w.type, style: w.style };
            if (w.type === "door-locked" && typeof w.lockDC === "number") {
              data.lockDC = w.lockDC;
            }
            nextEdges[key] = data;
          }
          return {
            ...s,
            terrainCells: Array.from(terrainByCell.values()),
            wallEdges: nextEdges,
            mapObjects: newObjects,
          };
        });

        setAiOpen(false);
        setAiPrompt("");
        setAiUseArea(false);
      } catch (err) {
        alert(`Erro: ${err instanceof Error ? err.message : "Falha desconhecida"}`);
      } finally {
        setAiLoading(false);
      }
    },
    [state.gridCols, state.gridRows, pushSnapshot],
  );

  const undo = useCallback(() => {
    setState((s) => {
      if (s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return {
        ...s,
        history: s.history.slice(0, -1),
        future: [
          ...s.future,
          { terrain: [...s.terrainCells], wallEdges: { ...s.wallEdges }, objects: [...s.mapObjects] },
        ],
        terrainCells: prev.terrain,
        wallEdges: prev.wallEdges,
        mapObjects: prev.objects,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((s) => {
      if (s.future.length === 0) return s;
      const next = s.future[s.future.length - 1];
      return {
        ...s,
        future: s.future.slice(0, -1),
        history: [
          ...s.history,
          { terrain: [...s.terrainCells], wallEdges: { ...s.wallEdges }, objects: [...s.mapObjects] },
        ],
        terrainCells: next.terrain,
        wallEdges: next.wallEdges,
        mapObjects: next.objects,
      };
    });
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "h" || e.key === "H") {
        setState((s) => ({ ...s, activeTool: s.activeTool === "hand" ? "terrain" : "hand" }));
      }
      if (e.key === "v" || e.key === "V") {
        setState((s) => ({
          ...s,
          activeTool: s.activeTool === "pointer" ? "terrain" : "pointer",
        }));
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") {
        setSpaceHeld(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo]);

  // ── Grid cell from mouse ───────────────────────────────────────────

  const getGridCell = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left - panX;
      const py = e.clientY - rect.top - panY;
      return {
        x: Math.max(0, Math.min(state.gridCols - 1, Math.floor(px / scaledCell))),
        y: Math.max(0, Math.min(state.gridRows - 1, Math.floor(py / scaledCell))),
      };
    },
    [scaledCell, state.gridCols, state.gridRows, panX, panY],
  );

  const getMouseEdge = useCallback(
    (e: MouseEvent | React.MouseEvent): NearestEdge | null => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left - panX;
      const py = e.clientY - rect.top - panY;
      return getNearestEdge(px, py, scaledCell, state.gridCols, state.gridRows);
    },
    [scaledCell, state.gridCols, state.gridRows, panX, panY],
  );

  // ── Terrain painting ───────────────────────────────────────────────

  const paintTerrainCells = useCallback(
    (cells: { x: number; y: number }[]) => {
      setState((s) => {
        const newCells = [...s.terrainCells];
        for (const { x, y } of cells) {
          const idx = newCells.findIndex((c) => c.x === x && c.y === y);
          if (idx >= 0) {
            newCells[idx] = { x, y, type: s.activeTerrainType };
          } else {
            newCells.push({ x, y, type: s.activeTerrainType });
          }
        }
        return { ...s, terrainCells: newCells };
      });
    },
    [],
  );

  const eraseTerrainCells = useCallback(
    (cells: { x: number; y: number }[]) => {
      setState((s) => {
        const removeSet = new Set(cells.map((c) => `${c.x},${c.y}`));
        return { ...s, terrainCells: s.terrainCells.filter((c) => !removeSet.has(`${c.x},${c.y}`)) };
      });
    },
    [],
  );

  const fillTerrain = useCallback(
    (startX: number, startY: number) => {
      setState((s) => {
        const targetType = s.terrainCells.find((c) => c.x === startX && c.y === startY)?.type ?? null;
        if (targetType === s.activeTerrainType) return s;
        const visited = new Set<string>();
        const queue: { x: number; y: number }[] = [{ x: startX, y: startY }];
        const filled: { x: number; y: number }[] = [];
        while (queue.length > 0) {
          const cell = queue.pop()!;
          const key = `${cell.x},${cell.y}`;
          if (visited.has(key)) continue;
          if (cell.x < 0 || cell.y < 0 || cell.x >= s.gridCols || cell.y >= s.gridRows) continue;
          const cellType = s.terrainCells.find((c) => c.x === cell.x && c.y === cell.y)?.type ?? null;
          if (cellType !== targetType) continue;
          visited.add(key);
          filled.push(cell);
          queue.push({ x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y }, { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 });
        }
        if (filled.length === 0) return s;
        const newCells = [...s.terrainCells];
        for (const fc of filled) {
          const idx = newCells.findIndex((c) => c.x === fc.x && c.y === fc.y);
          if (idx >= 0) {
            newCells[idx] = { x: fc.x, y: fc.y, type: s.activeTerrainType };
          } else {
            newCells.push({ x: fc.x, y: fc.y, type: s.activeTerrainType });
          }
        }
        return { ...s, terrainCells: newCells };
      });
    },
    [],
  );

  // ── Pan handling (Space+drag or middle-click) ─────────────────────

  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsPanning(true);
      const startX = e.clientX;
      const startY = e.clientY;
      let currentPanX = panX;
      let currentPanY = panY;

      function onMove(ev: MouseEvent) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        currentPanX = panX + dx;
        currentPanY = panY + dy;
        setPanX(currentPanX);
        setPanY(currentPanY);
      }
      function onUp() {
        setIsPanning(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [panX, panY],
  );

  // ── Canvas mouse handling ──────────────────────────────────────────

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle-click pan
      if (e.button === 1) {
        handlePanStart(e);
        return;
      }
      if (e.button !== 0) return;
      // Space+left-click pan OR hand tool
      if (spaceHeld || state.activeTool === "hand") {
        handlePanStart(e);
        return;
      }

      // AI area selection mode (toggle button active)
      if (aiAreaMode) {
        const startCell = getGridCell(e);
        if (!startCell) return;
        const sx = startCell.x;
        const sy = startCell.y;
        setAiAreaDrag({ x1: sx, y1: sy, x2: sx, y2: sy });
        function onAreaMove(ev: MouseEvent) {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const px = ev.clientX - rect.left - panX;
          const py = ev.clientY - rect.top - panY;
          const cx = Math.max(0, Math.min(state.gridCols - 1, Math.floor(px / scaledCell)));
          const cy = Math.max(0, Math.min(state.gridRows - 1, Math.floor(py / scaledCell)));
          setAiAreaDrag({ x1: sx, y1: sy, x2: cx, y2: cy });
        }
        function onAreaUp(ev: MouseEvent) {
          document.removeEventListener("mousemove", onAreaMove);
          document.removeEventListener("mouseup", onAreaUp);
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const px = ev.clientX - rect.left - panX;
          const py = ev.clientY - rect.top - panY;
          const cx = Math.max(0, Math.min(state.gridCols - 1, Math.floor(px / scaledCell)));
          const cy = Math.max(0, Math.min(state.gridRows - 1, Math.floor(py / scaledCell)));
          const finalArea = {
            x1: Math.min(sx, cx),
            y1: Math.min(sy, cy),
            x2: Math.max(sx, cx),
            y2: Math.max(sy, cy),
          };
          setAiAreaDrag(null);
          setAiAreaMode(false);
          void runAIGeneration(aiPrompt.trim(), finalArea);
        }
        document.addEventListener("mousemove", onAreaMove);
        document.addEventListener("mouseup", onAreaUp);
        return;
      }

      pushSnapshot();

      // Terrain tool
      if (state.activeTool === "terrain") {
        const cell = getGridCell(e);
        if (!cell) return;

        if (state.terrainEditorTool === "fill") {
          fillTerrain(cell.x, cell.y);
          return;
        }

        if (state.terrainEditorTool === "eraser") {
          const cells = getBrushCells(cell.x, cell.y, state.brushSize, state.gridCols, state.gridRows);
          eraseTerrainCells(cells);
          const erased = new Set(cells.map((c) => `${c.x},${c.y}`));
          function onMove(ev: MouseEvent) {
            const c = getGridCell(ev);
            if (!c) return;
            const brushCells = getBrushCells(c.x, c.y, state.brushSize, state.gridCols, state.gridRows).filter((bc) => !erased.has(`${bc.x},${bc.y}`));
            if (brushCells.length === 0) return;
            brushCells.forEach((bc) => erased.add(`${bc.x},${bc.y}`));
            eraseTerrainCells(brushCells);
            setHoverCell(c);
          }
          function onUp() { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
          return;
        }

        if (state.terrainEditorTool === "brush") {
          const cells = getBrushCells(cell.x, cell.y, state.brushSize, state.gridCols, state.gridRows);
          paintTerrainCells(cells);
          const painted = new Set(cells.map((c) => `${c.x},${c.y}`));
          function onMove(ev: MouseEvent) {
            const c = getGridCell(ev);
            if (!c) return;
            const brushCells = getBrushCells(c.x, c.y, state.brushSize, state.gridCols, state.gridRows).filter((bc) => !painted.has(`${bc.x},${bc.y}`));
            if (brushCells.length === 0) return;
            brushCells.forEach((bc) => painted.add(`${bc.x},${bc.y}`));
            paintTerrainCells(brushCells);
            setHoverCell(c);
          }
          function onUp() { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
          return;
        }

        if (state.terrainEditorTool === "rectangle") {
          const startCell = cell;
          function onMove(ev: MouseEvent) {
            const c = getGridCell(ev);
            if (c) setHoverCell(c);
          }
          function onUp(ev: MouseEvent) {
            const c = getGridCell(ev);
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
              paintTerrainCells(rectCells);
            }
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
          }
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onUp);
          return;
        }
      }

      // Wall tool (edge-based)
      if (state.activeTool === "wall") {
        const edge = getMouseEdge(e);
        if (!edge) return;

        if (state.wallDrawMode === "erase") {
          setState((s) => {
            const next = { ...s.wallEdges };
            delete next[edge.key];
            return { ...s, wallEdges: next };
          });
          const erased = new Set([edge.key]);
          function onEraseMove(ev: MouseEvent) {
            const e2 = getMouseEdge(ev);
            if (!e2 || erased.has(e2.key)) return;
            erased.add(e2.key);
            setState((s) => {
              const next = { ...s.wallEdges };
              delete next[e2.key];
              return { ...s, wallEdges: next };
            });
          }
          function onEraseUp() { document.removeEventListener("mousemove", onEraseMove); document.removeEventListener("mouseup", onEraseUp); }
          document.addEventListener("mousemove", onEraseMove);
          document.addEventListener("mouseup", onEraseUp);
          return;
        }

        setState((s) => {
          if (e.shiftKey) {
            // Shift+click: create/toggle door
            const existing = s.wallEdges[edge.key];
            if (existing) {
              if (existing.type === "door-closed" || existing.type === "door-open" || existing.type === "door-locked") {
                const nextType = existing.type === "door-closed" ? "door-open" : "door-closed";
                return { ...s, wallEdges: { ...s.wallEdges, [edge.key]: { ...existing, type: nextType } } };
              }
              return { ...s, wallEdges: { ...s.wallEdges, [edge.key]: { ...existing, type: "door-closed" } } };
            }
            return { ...s, wallEdges: { ...s.wallEdges, [edge.key]: { type: "door-closed", style: s.activeWallStyle } } };
          }
          // Normal click: toggle wall (place or remove)
          const existing = s.wallEdges[edge.key];
          if (existing && existing.type === s.activeWallEdgeType && existing.style === s.activeWallStyle) {
            const next = { ...s.wallEdges };
            delete next[edge.key];
            return { ...s, wallEdges: next };
          }
          const nextData: WallData = { type: s.activeWallEdgeType, style: s.activeWallStyle };
          if (s.activeWallEdgeType === "door-locked") nextData.lockDC = s.activeWallLockDC;
          return { ...s, wallEdges: { ...s.wallEdges, [edge.key]: nextData } };
        });

        // Drag to add walls
        const painted = new Set([edge.key]);
        function onMove(ev: MouseEvent) {
          const e2 = getMouseEdge(ev);
          if (!e2 || painted.has(e2.key)) return;
          painted.add(e2.key);
          setState((s) => {
            if (s.wallEdges[e2.key]) return s;
            const d: WallData = { type: s.activeWallEdgeType, style: s.activeWallStyle };
            if (s.activeWallEdgeType === "door-locked") d.lockDC = s.activeWallLockDC;
            return { ...s, wallEdges: { ...s.wallEdges, [e2.key]: d } };
          });
        }
        function onUp() { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return;
      }

      // Pointer tool: só seleciona/deseleciona (nunca coloca nem apaga)
      if (state.activeTool === "pointer") {
        const cell = getGridCell(e);
        if (!cell) return;
        const existingAtCell = state.mapObjects.find(
          (o) => o.x === cell.x && o.y === cell.y,
        );
        setState((s) => ({
          ...s,
          selectedObjectId: existingAtCell ? existingAtCell.id : null,
        }));
        return;
      }

      // Objects tool
      if (state.activeTool === "objects") {
        const cell = getGridCell(e);
        if (!cell) return;
        const existingAtCell = state.mapObjects.find(
          (o) => o.x === cell.x && o.y === cell.y,
        );

        // Shift+click em objeto = remove direto (poweruser)
        if (e.shiftKey && existingAtCell) {
          setState((s) => ({
            ...s,
            mapObjects: s.mapObjects.filter((o) => o.id !== existingAtCell.id),
            selectedObjectId:
              s.selectedObjectId === existingAtCell.id ? null : s.selectedObjectId,
          }));
          return;
        }

        // Click em objeto existente = seleciona
        if (existingAtCell) {
          setState((s) => ({ ...s, selectedObjectId: existingAtCell.id }));
          return;
        }

        // Click em célula vazia = coloca (e limpa seleção prévia)
        setState((s) => ({
          ...s,
          mapObjects: [
            ...s.mapObjects,
            {
              id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
              x: cell.x,
              y: cell.y,
              type: s.activeObjectType,
              rotation: 0,
            },
          ],
          selectedObjectId: null,
        }));
        return;
      }

      // Eraser tool
      if (state.activeTool === "eraser") {
        const cell = getGridCell(e);
        if (!cell) return;
        setState((s) => {
          // Remove wall edges touching this cell
          const nextEdges = { ...s.wallEdges };
          const cx = cell.x, cy = cell.y;
          for (const key of Object.keys(nextEdges)) {
            const [a, b] = key.split(":");
            const [x1, y1] = a.split(",").map(Number);
            const [x2, y2] = b.split(",").map(Number);
            if ((x1 === cx && y1 === cy) || (x2 === cx && y2 === cy)) {
              delete nextEdges[key];
            }
          }
          return {
            ...s,
            terrainCells: s.terrainCells.filter((c) => !(c.x === cx && c.y === cy)),
            wallEdges: nextEdges,
            mapObjects: s.mapObjects.filter((o) => !(o.x === cx && o.y === cy)),
          };
        });
        const erased = new Set([`${cell.x},${cell.y}`]);
        function onMove(ev: MouseEvent) {
          const c = getGridCell(ev);
          if (!c) return;
          const key = `${c.x},${c.y}`;
          if (erased.has(key)) return;
          erased.add(key);
          setState((s) => {
            const nextEdges = { ...s.wallEdges };
            for (const k of Object.keys(nextEdges)) {
              const [a, b] = k.split(":");
              const [x1, y1] = a.split(",").map(Number);
              const [x2, y2] = b.split(",").map(Number);
              if ((x1 === c.x && y1 === c.y) || (x2 === c.x && y2 === c.y)) {
                delete nextEdges[k];
              }
            }
            return {
              ...s,
              terrainCells: s.terrainCells.filter((tc) => !(tc.x === c.x && tc.y === c.y)),
              wallEdges: nextEdges,
              mapObjects: s.mapObjects.filter((o) => !(o.x === c.x && o.y === c.y)),
            };
          });
        }
        function onUp() { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      }
    },
    [state.activeTool, state.terrainEditorTool, state.brushSize, state.gridCols, state.gridRows, state.activeWallEdgeType, state.activeWallStyle, state.wallDrawMode, state.activeObjectType, state.mapObjects, state.selectedObjectId, getGridCell, getMouseEdge, pushSnapshot, paintTerrainCells, eraseTerrainCells, fillTerrain, spaceHeld, handlePanStart, aiAreaMode, aiPrompt, scaledCell, panX, panY, runAIGeneration],
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (state.activeTool === "wall") {
        setHoverEdge(getMouseEdge(e));
      } else {
        setHoverEdge(null);
      }
      const cell = getGridCell(e);
      setHoverCell(cell);
    },
    [state.activeTool, getGridCell, getMouseEdge],
  );

  // ── Wheel zoom ────────────────────────────────────────────────────

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = e.deltaY > 0 ? -10 : 10;
        setState((s) => ({ ...s, zoom: Math.max(25, Math.min(300, s.zoom + delta)) }));
      } else {
        // Pan — regular scroll moves the canvas
        setPanX((p) => p - e.deltaX);
        setPanY((p) => p - e.deltaY);
      }
    },
    [],
  );

  // ── Save / Load ────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const mapData = editorStateToMapData({
      mapName: state.mapName,
      gridCols: state.gridCols,
      gridRows: state.gridRows,
      terrainCells: state.terrainCells,
      wallEdges: state.wallEdges,
      mapObjects: state.mapObjects,
      backgroundImage: state.backgroundImage,
      backgroundOpacity: state.backgroundOpacity,
    });

    // Generate thumbnail
    const thumbnail = generateMapThumbnail({
      width: state.gridCols,
      height: state.gridRows,
      terrain: mapData.terrain,
      walls: mapData.walls,
      objects: mapData.objects,
    });

    if (state.savedMapId) {
      updateMap(state.savedMapId, { ...mapData, thumbnail });
    } else {
      const newId = addMap({ ...mapData, thumbnail });
      setState((s) => ({ ...s, savedMapId: newId }));
      window.history.replaceState(null, "", `/maps/editor?id=${newId}`);
    }
    setSaveIndicator("saved");
    setTimeout(() => setSaveIndicator(null), 2000);
  }, [state.mapName, state.gridCols, state.gridRows, state.terrainCells, state.wallEdges, state.mapObjects, state.backgroundImage, state.backgroundOpacity, state.savedMapId, addMap, updateMap]);

  // Load map from URL param on mount
  useEffect(() => {
    if (!mapIdParam) return;
    const map = useMapLibraryStore.getState().maps[mapIdParam];
    if (!map) return;
    const editorData = mapToEditorState(map);
    setState((s) => ({
      ...s,
      ...editorData,
      savedMapId: mapIdParam,
      history: [],
      future: [],
    }));
  }, [mapIdParam]);

  // Auto-abrir modal IA quando chega com ?ai=1 (vem de "Gerar com IA" em /maps)
  useEffect(() => {
    if (aiAutoOpenParam === "1") setAiOpen(true);
  }, [aiAutoOpenParam]);

  // Auto-save with 2s debounce (only if map was already saved once)
  useEffect(() => {
    if (!state.savedMapId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.terrainCells, state.wallEdges, state.mapObjects, state.mapName, state.gridCols, state.gridRows]);

  const handleImportImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setState((s) => ({ ...s, backgroundImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }, []);

  const handleStampTemplate = useCallback(
    (templateId: string) => {
      const tmpl = ROOM_TEMPLATES.find((t) => t.id === templateId);
      if (!tmpl) return;
      pushSnapshot();
      const cx = hoverCell?.x ?? Math.floor((state.gridCols - tmpl.width) / 2);
      const cy = hoverCell?.y ?? Math.floor((state.gridRows - tmpl.height) / 2);
      setState((s) => {
        const newTerrain = [...s.terrainCells];
        for (const t of tmpl.terrain) {
          const x = cx + t.dx;
          const y = cy + t.dy;
          if (x < 0 || y < 0 || x >= s.gridCols || y >= s.gridRows) continue;
          const idx = newTerrain.findIndex((c) => c.x === x && c.y === y);
          if (idx >= 0) newTerrain[idx] = { x, y, type: t.type };
          else newTerrain.push({ x, y, type: t.type });
        }
        const newEdges = { ...s.wallEdges };
        for (const w of tmpl.walls) {
          const x = cx + w.dx;
          const y = cy + w.dy;
          if (x < 0 || y < 0 || x >= s.gridCols || y >= s.gridRows) continue;
          const edgeKey = wallSideToEdgeKey(x, y, w.side);
          if (!newEdges[edgeKey]) {
            let wt: import("@/lib/gameplay-mock-data").WallType = "wall";
            if (w.isDoor) {
              wt = w.doorState === "open" ? "door-open" : w.doorState === "locked" ? "door-locked" : "door-closed";
            }
            newEdges[edgeKey] = { type: wt, style: s.activeWallStyle };
          }
        }
        const newObjects = [...s.mapObjects];
        for (const o of tmpl.objects) {
          const x = cx + o.dx;
          const y = cy + o.dy;
          if (x < 0 || y < 0 || x >= s.gridCols || y >= s.gridRows) continue;
          if (!newObjects.some((e) => e.x === x && e.y === y)) {
            newObjects.push({ id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, x, y, type: o.type as MapObjectType, rotation: 0 });
          }
        }
        return { ...s, terrainCells: newTerrain, wallEdges: newEdges, mapObjects: newObjects };
      });
    },
    [state.gridCols, state.gridRows, hoverCell, pushSnapshot],
  );

  // ── Terrain palette data ───────────────────────────────────────────

  const terrains = getTerrainsByCategory(state.terrainCategory);

  const EDITOR_WALL_TYPES: { type: WallType; label: string }[] = [
    { type: "wall", label: "Parede" },
    { type: "door-closed", label: "Porta" },
    { type: "window", label: "Janela" },
    { type: "half-wall", label: "Meia" },
    { type: "portcullis", label: "Grade" },
    { type: "secret", label: "Porta Secreta" },
    { type: "illusory", label: "Ilusão" },
  ];

  const DOOR_INITIAL_STATES: { type: WallType; label: string }[] = [
    { type: "door-closed", label: "Fechada" },
    { type: "door-locked", label: "Trancada" },
    { type: "door-open", label: "Aberta" },
  ];

  const isDoorType = (t: WallType) =>
    t === "door-closed" || t === "door-locked" || t === "door-open";

  const EDITOR_WALL_STYLES: { style: WallStyle; label: string; color: string }[] = [
    { style: "stone", label: "Pedra", color: "#777780" },
    { style: "wood", label: "Madeira", color: "#8B6040" },
    { style: "metal", label: "Metal", color: "#A0A0B0" },
    { style: "magic", label: "Magica", color: "#8855DD" },
    { style: "natural", label: "Natural", color: "#666660" },
    { style: "brick", label: "Tijolo", color: "#995533" },
  ];

  const OBJ_CATEGORIES = [
    { id: "all", label: "Todos" },
    { id: "furniture", label: "Moveis" },
    { id: "container", label: "Recipientes" },
    { id: "decoration", label: "Decoracao" },
    { id: "nature", label: "Natureza" },
    { id: "light", label: "Luz" },
  ] as const;

  const [objCategory, setObjCategory] = useState<string>("all");
  const filteredObjects = objCategory === "all" ? MAP_OBJECT_CATALOG : MAP_OBJECT_CATALOG.filter((o) => o.category === objCategory);

  // ── Selected-object actions ───────────────────────────────────────
  const rotateSelectedObject = useCallback(() => {
    pushSnapshot();
    setState((s) => {
      if (!s.selectedObjectId) return s;
      return {
        ...s,
        mapObjects: s.mapObjects.map((o) =>
          o.id === s.selectedObjectId
            ? { ...o, rotation: (o.rotation + 90) % 360 }
            : o,
        ),
      };
    });
  }, [pushSnapshot]);

  const deleteSelectedObject = useCallback(() => {
    pushSnapshot();
    setState((s) => {
      if (!s.selectedObjectId) return s;
      return {
        ...s,
        mapObjects: s.mapObjects.filter((o) => o.id !== s.selectedObjectId),
        selectedObjectId: null,
      };
    });
  }, [pushSnapshot]);

  const duplicateSelectedObject = useCallback(() => {
    pushSnapshot();
    setState((s) => {
      if (!s.selectedObjectId) return s;
      const src = s.mapObjects.find((o) => o.id === s.selectedObjectId);
      if (!src) return s;
      const occupied = new Set(s.mapObjects.map((o) => `${o.x},${o.y}`));
      const neighbors: [number, number][] = [
        [src.x + 1, src.y],
        [src.x, src.y + 1],
        [src.x - 1, src.y],
        [src.x, src.y - 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= s.gridCols || ny >= s.gridRows) continue;
        if (occupied.has(`${nx},${ny}`)) continue;
        const newId = `obj_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
        return {
          ...s,
          mapObjects: [
            ...s.mapObjects,
            { ...src, id: newId, x: nx, y: ny },
          ],
          selectedObjectId: newId,
        };
      }
      return s; // sem célula adjacente livre
    });
  }, [pushSnapshot]);

  // ── Keyboard shortcuts (objects tool + selection) ─────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      )
        return;

      const canSelect = state.activeTool === "objects" || state.activeTool === "pointer";
      if (!canSelect) return;

      if (e.key === "Escape") {
        if (state.selectedObjectId) {
          e.preventDefault();
          setState((s) => ({ ...s, selectedObjectId: null }));
        }
        return;
      }

      if (!state.selectedObjectId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelectedObject();
        return;
      }
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        rotateSelectedObject();
        return;
      }
      if ((e.key === "d" || e.key === "D") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        duplicateSelectedObject();
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    state.activeTool,
    state.selectedObjectId,
    rotateSelectedObject,
    deleteSelectedObject,
    duplicateSelectedObject,
  ]);

  // ── Limpa seleção ao sair do modo "objects" ───────────────────────
  useEffect(() => {
    const canSelect = state.activeTool === "objects" || state.activeTool === "pointer";
    if (!canSelect && state.selectedObjectId !== null) {
      setState((s) => ({ ...s, selectedObjectId: null }));
    }
  }, [state.activeTool, state.selectedObjectId]);

  return (
    <div className="-m-6 flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-brand-border bg-[#0D0D12] px-3">
        <Link
          href="/maps"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-brand-muted transition-colors hover:text-brand-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Mapas
        </Link>

        <div className="h-5 w-px bg-brand-border" />

        <input
          value={state.mapName}
          onChange={(e) => setState((s) => ({ ...s, mapName: e.target.value }))}
          className="h-7 rounded border border-brand-border bg-transparent px-2 text-xs font-medium text-brand-text outline-none focus:border-brand-accent"
          style={{ width: 180 }}
        />

        <div className="flex items-center gap-1 text-[10px] text-brand-muted">
          {state.gridCols}x{state.gridRows}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button onClick={undo} title="Desfazer (Ctrl+Z)" disabled={state.history.length === 0} className="flex h-7 w-7 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text disabled:opacity-30">
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={redo} title="Refazer (Ctrl+Shift+Z)" disabled={state.future.length === 0} className="flex h-7 w-7 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text disabled:opacity-30">
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <div className="mx-1 h-5 w-px bg-brand-border" />

          <button onClick={() => setState((s) => ({ ...s, zoom: Math.max(50, s.zoom - 25) }))} title="Zoom out" className="flex h-7 w-7 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-[10px] tabular-nums text-brand-muted">{state.zoom}%</span>
          <button onClick={() => setState((s) => ({ ...s, zoom: Math.min(200, s.zoom + 25) }))} title="Zoom in" className="flex h-7 w-7 items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() =>
              setState((s) => ({
                ...s,
                activeTool: s.activeTool === "pointer" ? "terrain" : "pointer",
              }))
            }
            title="Selecionar objetos (V)"
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-colors ${
              state.activeTool === "pointer"
                ? "bg-brand-accent text-white"
                : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
            }`}
          >
            <MousePointer2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setState((s) => ({ ...s, activeTool: s.activeTool === "hand" ? "terrain" : "hand" }))}
            title="Mover canvas (H)"
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-colors ${
              state.activeTool === "hand"
                ? "bg-brand-accent text-white"
                : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
            }`}
          >
            <Hand className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setAiOpen(true)}
            title="Gerar mapa com IA"
            className="flex h-7 w-7 items-center justify-center rounded text-brand-muted transition-colors hover:bg-brand-accent/15 hover:text-brand-accent"
          >
            <Wand2 className="h-3.5 w-3.5" />
          </button>

          <div className="mx-1 h-5 w-px bg-brand-border" />

          <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImportImage} />
          <button
            onClick={() => bgInputRef.current?.click()}
            title="Importar imagem de fundo"
            className="flex h-7 items-center gap-1 rounded px-2 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
          >
            <ImageIcon className="h-3 w-3" />
            Imagem
          </button>
          <button
            onClick={handleSave}
            title="Salvar mapa (Ctrl+S)"
            className={`flex h-7 items-center gap-1 rounded px-3 text-[10px] font-medium transition-colors ${
              saveIndicator === "saved"
                ? "bg-brand-success text-white"
                : "bg-brand-accent text-white hover:bg-brand-accent/80"
            }`}
          >
            {saveIndicator === "saved" ? (
              <><Check className="h-3 w-3" /> Salvo</>
            ) : (
              <><Save className="h-3 w-3" /> Salvar</>
            )}
          </button>
        </div>
      </div>

      {/* Body: sidebar + canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left tool palette */}
        <div className="flex w-[260px] shrink-0 flex-col overflow-y-auto border-r border-brand-border bg-[#111116] p-3">
          {/* Tool tabs */}
          <div className="mb-3 flex gap-1">
            {([
              { tool: "terrain" as const, icon: Mountain, label: "Terreno" },
              { tool: "wall" as const, icon: Fence, label: "Paredes" },
              { tool: "objects" as const, icon: Package, label: "Objetos" },
              { tool: "eraser" as const, icon: Eraser, label: "Apagar" },
            ] as const).map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => setState((s) => ({ ...s, activeTool: tool }))}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[9px] transition-colors ${
                  state.activeTool === tool
                    ? "bg-brand-accent text-white"
                    : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Terrain palette ── */}
          {state.activeTool === "terrain" && (
            <>
              {/* Editor sub-tools */}
              <div className="mb-2 flex gap-1">
                {([
                  { tool: "brush" as const, icon: Paintbrush, label: "Pincel" },
                  { tool: "rectangle" as const, icon: Square, label: "Ret." },
                  { tool: "fill" as const, icon: PaintBucket, label: "Preencher" },
                  { tool: "eraser" as const, icon: Eraser, label: "Apagar" },
                ] as const).map(({ tool, icon: Icon, label }) => (
                  <button
                    key={tool}
                    onClick={() => setState((s) => ({ ...s, terrainEditorTool: tool }))}
                    className={`flex flex-1 items-center justify-center gap-0.5 rounded py-1 text-[9px] transition-colors ${
                      state.terrainEditorTool === tool
                        ? "bg-white/10 font-semibold text-brand-text"
                        : "text-brand-muted hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Brush size */}
              {(state.terrainEditorTool === "brush" || state.terrainEditorTool === "eraser") && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[9px] text-brand-muted">Tamanho:</span>
                  {([1, 2, 3] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setState((s) => ({ ...s, brushSize: size }))}
                      className={`h-5 w-7 rounded text-[9px] font-semibold ${
                        state.brushSize === size
                          ? "bg-brand-accent text-white"
                          : "text-brand-muted hover:bg-white/[0.06]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}

              <div className="mb-2 h-px bg-brand-border" />

              {/* Category tabs */}
              <div className="mb-2 flex min-w-0 gap-0.5 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent">
                {[{ id: "all" as const, label: "Todos" }, ...TERRAIN_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setState((s) => ({ ...s, terrainCategory: tab.id }))}
                    className={`shrink-0 rounded px-2 py-0.5 text-[9px] transition-colors ${
                      state.terrainCategory === tab.id
                        ? "bg-white/10 font-semibold text-brand-text"
                        : "text-brand-muted hover:bg-white/[0.04]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Terrain swatches */}
              <div className="mb-2 grid max-h-[240px] grid-cols-3 gap-1 overflow-y-auto">
                {terrains.map((t) => {
                  const isActive = state.activeTerrainType === t.type;
                  return (
                    <button
                      key={t.type}
                      title={t.label}
                      onClick={() => setState((s) => ({ ...s, activeTerrainType: t.type as TerrainType }))}
                      className={`flex flex-col items-center gap-0.5 rounded border p-1 transition-colors ${
                        isActive ? "border-brand-accent bg-brand-accent/10" : "border-transparent hover:border-brand-border"
                      }`}
                    >
                      <EditorTerrainSwatch terrainType={t.type} fallbackColor={t.color} />
                      <span className="w-full truncate text-center text-[8px] text-brand-muted">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mb-2 h-px bg-brand-border" />

              {/* Room templates */}
              <button
                onClick={() => setShowTemplates((v) => !v)}
                className={`mb-2 flex items-center justify-center gap-1 rounded py-1 text-[10px] transition-colors ${
                  showTemplates ? "bg-brand-accent/20 text-brand-accent" : "text-brand-muted hover:bg-white/[0.06]"
                }`}
              >
                <Stamp className="h-3 w-3" />
                Templates de Sala
              </button>

              {showTemplates && (
                <>
                  <div className="mb-1 flex gap-0.5">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setTemplateCat(cat.id)}
                        className={`flex-1 rounded px-1 py-0.5 text-[8px] transition-colors ${
                          templateCat === cat.id ? "bg-white/10 font-semibold text-brand-text" : "text-brand-muted hover:bg-white/[0.04]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <div className="mb-2 grid max-h-[120px] grid-cols-2 gap-1 overflow-y-auto">
                    {ROOM_TEMPLATES.filter((t) => templateCat === "all" || t.category === templateCat).map((tmpl) => (
                      <button
                        key={tmpl.id}
                        title={`${tmpl.name} (${tmpl.width}x${tmpl.height})`}
                        onClick={() => handleStampTemplate(tmpl.id)}
                        className="flex flex-col items-center gap-0.5 rounded border border-transparent p-1 transition-colors hover:border-brand-border hover:bg-white/[0.04]"
                      >
                        <span className="text-sm">{tmpl.icon}</span>
                        <span className="w-full truncate text-center text-[7px] text-brand-muted">{tmpl.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => { pushSnapshot(); setState((s) => ({ ...s, terrainCells: [] })); }}
                className="flex items-center justify-center gap-1 rounded py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
              >
                <Trash2 className="h-3 w-3" />
                Limpar Terreno
              </button>
            </>
          )}

          {/* ── Wall palette ── */}
          {state.activeTool === "wall" && (
            <>
              <div className="mb-2 text-[9px] text-brand-muted">Tipo:</div>
              <div className="mb-2 flex flex-wrap gap-1">
                {EDITOR_WALL_TYPES.map(({ type, label }) => {
                  const isActive =
                    type === "door-closed"
                      ? isDoorType(state.activeWallEdgeType)
                      : state.activeWallEdgeType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setState((s) => ({ ...s, activeWallEdgeType: type }))}
                      className={`cursor-pointer rounded px-2 py-1 text-[9px] transition-colors ${
                        isActive ? "bg-brand-accent text-white font-semibold" : "text-brand-muted hover:bg-white/[0.06]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {isDoorType(state.activeWallEdgeType) && (
                <div className="mb-2 space-y-2 rounded-md border border-brand-accent/20 bg-brand-accent/[0.03] p-2">
                  <div className="text-[9px] text-brand-muted">Estado inicial:</div>
                  <div className="flex gap-1">
                    {DOOR_INITIAL_STATES.map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => setState((s) => ({ ...s, activeWallEdgeType: type }))}
                        className={`flex-1 cursor-pointer rounded px-1 py-1 text-[9px] transition-colors ${
                          state.activeWallEdgeType === type ? "bg-brand-accent text-white font-semibold" : "text-brand-muted hover:bg-white/[0.06]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {state.activeWallEdgeType === "door-locked" && (
                    <div className="flex items-center gap-2">
                      <label className="text-[9px] text-brand-muted">DC:</label>
                      <input
                        type="number"
                        min={5}
                        max={30}
                        value={state.activeWallLockDC}
                        onChange={(e) => {
                          const raw = Number(e.target.value);
                          const clamped = Number.isFinite(raw)
                            ? Math.max(5, Math.min(30, Math.round(raw)))
                            : 15;
                          setState((s) => ({ ...s, activeWallLockDC: clamped }));
                        }}
                        className="h-6 w-14 rounded border border-brand-border bg-brand-primary px-2 text-[10px] text-brand-text outline-none focus:border-brand-accent"
                      />
                      <span className="text-[9px] text-brand-muted">(5–30)</span>
                    </div>
                  )}
                </div>
              )}
              <div className="mb-2 text-[9px] text-brand-muted">Estilo:</div>
              <div className="mb-2 flex gap-1">
                {EDITOR_WALL_STYLES.map(({ style, label, color }) => (
                  <button
                    key={style}
                    title={label}
                    onClick={() => setState((s) => ({ ...s, activeWallStyle: style }))}
                    className={`flex h-6 w-6 items-center justify-center rounded-sm transition-colors ${
                      state.activeWallStyle === style ? "ring-1 ring-brand-accent ring-offset-1 ring-offset-[#111116]" : "hover:ring-1 hover:ring-brand-border"
                    }`}
                  >
                    <span className="block h-4 w-4 rounded-sm" style={{ backgroundColor: color }} />
                  </button>
                ))}
              </div>
              <div className="mb-2 text-[9px] text-brand-muted">Modo:</div>
              <div className="mb-3 flex gap-1">
                {([["line", "Linha"], ["rectangle", "Retangulo"], ["erase", "Apagar"]] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setState((s) => ({ ...s, wallDrawMode: mode }))}
                    className={`flex-1 rounded px-1 py-1 text-[9px] transition-colors ${
                      state.wallDrawMode === mode ? "bg-brand-accent text-white" : "text-brand-muted hover:bg-white/[0.06]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mb-2 h-px bg-brand-border" />
              <div className="flex flex-col gap-1 text-[8px] text-brand-muted">
                <span>Click: colocar | Click em existente: remover</span>
                <span>Shift+Click: criar porta | Dbl-click porta: toggle</span>
              </div>
              <div className="mt-3 h-px bg-brand-border" />
              <button
                onClick={() => { pushSnapshot(); setState((s) => ({ ...s, wallEdges: {} })); }}
                className="mt-2 flex items-center justify-center gap-1 rounded py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
              >
                <Trash2 className="h-3 w-3" />
                Limpar Paredes
              </button>
            </>
          )}

          {/* ── Objects palette ── */}
          {state.activeTool === "objects" && (
            <>
              <div className="mb-2 flex min-w-0 gap-0.5 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent">
                {OBJ_CATEGORIES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setObjCategory(id)}
                    className={`shrink-0 rounded px-2 py-0.5 text-[9px] transition-colors ${
                      objCategory === id ? "bg-white/10 font-semibold text-brand-text" : "text-brand-muted hover:bg-white/[0.04]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mb-2 grid max-h-[300px] grid-cols-3 gap-1 overflow-y-auto">
                {filteredObjects.map((obj) => (
                  <button
                    key={obj.type}
                    title={obj.label}
                    onClick={() => setState((s) => ({ ...s, activeObjectType: obj.type }))}
                    className={`flex cursor-pointer flex-col items-center gap-0.5 rounded border p-1.5 transition-colors ${
                      state.activeObjectType === obj.type
                        ? "border-brand-accent bg-brand-accent/10"
                        : "border-transparent hover:border-brand-border"
                    }`}
                  >
                    <ObjectSpriteIcon
                      type={obj.type}
                      fallback={obj.icon}
                      size={20}
                      title={obj.label}
                      className="text-brand-text"
                    />
                    <span className="w-full truncate text-center text-[7px] text-brand-muted">{obj.label}</span>
                  </button>
                ))}
              </div>
              <div className="mb-2 h-px bg-brand-border" />
              <div className="flex flex-col gap-1 text-[9px] text-brand-muted">
                <span>Click: colocar objeto</span>
                <span>Shift+Click: remover objeto</span>
              </div>
              <div className="mt-3 h-px bg-brand-border" />
              <button
                onClick={() => { pushSnapshot(); setState((s) => ({ ...s, mapObjects: [] })); }}
                className="mt-2 flex items-center justify-center gap-1 rounded py-1 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
              >
                <Trash2 className="h-3 w-3" />
                Limpar Objetos
              </button>
            </>
          )}

          {/* ── Eraser info ── */}
          {state.activeTool === "eraser" && (
            <div className="flex flex-col gap-2 text-[10px] text-brand-muted">
              <p>Click e arraste para apagar terreno, paredes e objetos de qualquer celula.</p>
              <div className="h-px bg-brand-border" />
              <button
                onClick={() => {
                  pushSnapshot();
                  setState((s) => ({ ...s, terrainCells: [], walls: [], mapObjects: [] }));
                }}
                className="flex items-center justify-center gap-1 rounded py-1.5 text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
              >
                <Trash2 className="h-3 w-3" />
                Limpar Tudo
              </button>
            </div>
          )}

          {/* ── Pointer info ── */}
          {state.activeTool === "pointer" && (() => {
            const sel = state.selectedObjectId
              ? state.mapObjects.find((o) => o.id === state.selectedObjectId)
              : null;
            const selInfo = sel
              ? MAP_OBJECT_CATALOG.find((c) => c.type === sel.type)
              : null;
            return (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[11px] text-brand-text">
                  <MousePointer2 className="h-3.5 w-3.5 text-brand-accent" />
                  <span className="font-semibold">Seleção</span>
                </div>

                {sel ? (
                  <div className="rounded-md border border-brand-accent/20 bg-brand-accent/[0.03] p-2.5">
                    <div className="flex items-center gap-2">
                      <ObjectSpriteIcon
                        type={sel.type}
                        fallback={objectIconMap.get(sel.type) ?? HelpCircle}
                        size={24}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[11px] text-brand-text">
                          {selInfo?.label ?? sel.type}
                        </div>
                        <div className="text-[9px] text-brand-muted">
                          ({sel.x}, {sel.y}) · {sel.rotation}°
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      <button
                        onClick={rotateSelectedObject}
                        title="Rotacionar (R)"
                        className="flex cursor-pointer items-center justify-center gap-1 rounded py-1.5 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
                      >
                        <RotateCw className="h-3 w-3" />
                        Girar
                      </button>
                      <button
                        onClick={duplicateSelectedObject}
                        title="Duplicar (Ctrl+D)"
                        className="flex cursor-pointer items-center justify-center gap-1 rounded py-1.5 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
                      >
                        <Copy className="h-3 w-3" />
                        Dupl.
                      </button>
                      <button
                        onClick={deleteSelectedObject}
                        title="Deletar (Del)"
                        className="flex cursor-pointer items-center justify-center gap-1 rounded py-1.5 text-[9px] text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-brand-border p-3 text-[10px] text-brand-muted">
                    Click em um objeto no canvas para selecioná-lo.
                  </div>
                )}

                <div className="h-px bg-brand-border" />
                <div className="flex flex-col gap-1 text-[9px] text-brand-muted">
                  <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-muted/80">
                    Atalhos
                  </div>
                  <ShortcutRow keys="V" label="Modo seleção" />
                  <ShortcutRow keys="R" label="Rotacionar 90°" />
                  <ShortcutRow keys="Ctrl+D" label="Duplicar" />
                  <ShortcutRow keys="Del" label="Excluir" />
                  <ShortcutRow keys="Esc" label="Limpar seleção" />
                  <ShortcutRow keys="H" label="Mover canvas" />
                </div>
              </div>
            );
          })()}

          {/* ── Hand info ── */}
          {state.activeTool === "hand" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[11px] text-brand-text">
                <Hand className="h-3.5 w-3.5 text-brand-accent" />
                <span className="font-semibold">Mover Canvas</span>
              </div>
              <div className="rounded-md border border-dashed border-brand-border p-3 text-[10px] text-brand-muted">
                Arraste o canvas com o mouse para navegar pelo mapa. O zoom é controlado pelos botões no topo ou pela roda do mouse.
              </div>
              <div className="h-px bg-brand-border" />
              <div className="flex flex-col gap-1 text-[9px] text-brand-muted">
                <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-muted/80">
                  Atalhos
                </div>
                <ShortcutRow keys="H" label="Alternar Mover" />
                <ShortcutRow keys="Espaço" label="Pan temporário" />
                <ShortcutRow keys="V" label="Modo seleção" />
              </div>
            </div>
          )}
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          className={`relative flex-1 bg-[#0A0A0F] ${isPanning ? "cursor-grabbing" : spaceHeld || state.activeTool === "hand" ? "cursor-grab" : "cursor-crosshair"}`}
          style={{ overflow: "hidden" }}
          onWheel={handleWheel}
          onMouseDown={(e) => {
            // Middle-click anywhere in the container pans
            if (e.button === 1) {
              e.preventDefault();
              handlePanStart(e);
            }
          }}
        >
          <div
            ref={canvasRef}
            className="relative"
            style={{ width: canvasW, height: canvasH, transform: `translate(${panX}px, ${panY}px)` }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => { setHoverCell(null); setHoverEdge(null); }}
          >
              {/* Background image */}
              {state.backgroundImage && (
                <img
                  src={state.backgroundImage}
                  alt=""
                  className="pointer-events-none absolute inset-0"
                  style={{
                    width: canvasW,
                    height: canvasH,
                    objectFit: "cover",
                    opacity: state.backgroundOpacity,
                  }}
                  draggable={false}
                />
              )}

              {/* Grid */}
              <svg className="pointer-events-none absolute inset-0" width={canvasW} height={canvasH}>
                {Array.from({ length: state.gridCols + 1 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * scaledCell} y1={0} x2={i * scaledCell} y2={canvasH} stroke="#1E1E2A" strokeWidth={1} />
                ))}
                {Array.from({ length: state.gridRows + 1 }).map((_, i) => (
                  <line key={`h${i}`} x1={0} y1={i * scaledCell} x2={canvasW} y2={i * scaledCell} stroke="#1E1E2A" strokeWidth={1} />
                ))}
              </svg>

              {/* Terrain cells — procedural (Pixi.js) + CSS fallback */}
              {state.terrainCells.length > 0 && (
                <>
                  <PixiTerrainLayer
                    cells={state.terrainCells.filter((c) => hasProceduralTexture(c.type))}
                    scaledCell={scaledCell}
                    gridCols={state.gridCols}
                    gridRows={state.gridRows}
                  />
                  {state.terrainCells
                    .filter((c) => !hasProceduralTexture(c.type))
                    .map((cell) => {
                      const info = TERRAIN_CATALOG[cell.type];
                      const color = info?.color ?? "rgba(255,255,255,0.05)";
                      const borderColor = info?.borderColor ?? "transparent";
                      const pattern = info?.pattern ? getTerrainCSSPattern(info.pattern.type, info.pattern.color, info.pattern.opacity, scaledCell) : null;
                      return (
                        <div
                          key={`t_${cell.x}_${cell.y}`}
                          className="pointer-events-none absolute"
                          style={{
                            left: cell.x * scaledCell,
                            top: cell.y * scaledCell,
                            width: scaledCell,
                            height: scaledCell,
                            backgroundColor: color,
                            borderRight: `1px solid ${borderColor}`,
                            borderBottom: `1px solid ${borderColor}`,
                            ...(pattern && { backgroundImage: pattern.backgroundImage, backgroundSize: pattern.backgroundSize }),
                          }}
                        >
                          {info?.icon && scaledCell >= 28 && (
                            <span
                              className="pointer-events-none flex h-full w-full select-none items-center justify-center opacity-40"
                              style={{ fontSize: Math.max(8, scaledCell * 0.3) }}
                            >
                              {info.icon}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </>
              )}

              {/* Walls (edge-based) */}
              {(Object.keys(state.wallEdges).length > 0 || (hoverEdge && state.activeTool === "wall")) && (
                <svg className="pointer-events-none absolute left-0 top-0" width={canvasW} height={canvasH} style={{ zIndex: 5 }}>
                  {Object.entries(state.wallEdges).map(([key, data]) => {
                    const line = getWallRenderLine(key, scaledCell);
                    const visual = WALL_TYPE_VISUALS[data.type];
                    const color = getEdgeColor(data);
                    const midX = (line.x1 + line.x2) / 2;
                    const midY = (line.y1 + line.y2) / 2;
                    return (
                      <g key={key}>
                        <line
                          x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                          stroke={color}
                          strokeWidth={visual.thickness}
                          strokeDasharray={visual.dash}
                          strokeLinecap="round"
                          opacity={visual.alpha}
                        />
                        {visual.thickness >= 3 && (
                          <>
                            <circle cx={line.x1} cy={line.y1} r={visual.thickness / 2} fill={color} opacity={visual.alpha} />
                            <circle cx={line.x2} cy={line.y2} r={visual.thickness / 2} fill={color} opacity={visual.alpha} />
                          </>
                        )}
                        {visual.doorIcon && scaledCell >= 20 && (
                          <>
                            <circle cx={midX} cy={midY} r={scaledCell * 0.15} fill="#1A1A24" opacity={0.9} />
                            <text x={midX} y={midY} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={Math.max(8, scaledCell * 0.22)} opacity={0.8}>
                              {visual.doorIcon}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  })}
                  {/* Hover preview */}
                  {hoverEdge && state.activeTool === "wall" && (
                    <line
                      x1={hoverEdge.renderX} y1={hoverEdge.renderY}
                      x2={hoverEdge.renderEndX} y2={hoverEdge.renderEndY}
                      stroke={state.wallDrawMode === "erase" ? "#FF4444" : (
                        state.activeWallEdgeType === "wall" || state.activeWallEdgeType === "half-wall"
                          ? WALL_STYLE_COLORS[state.activeWallStyle]
                          : WALL_TYPE_VISUALS[state.activeWallEdgeType].color
                      )}
                      strokeWidth={state.wallDrawMode === "erase" ? 2 : 4}
                      strokeLinecap="round"
                      strokeDasharray={state.wallDrawMode === "erase" ? "4,4" : undefined}
                      opacity={0.6}
                    />
                  )}
                </svg>
              )}

              {/* Map objects */}
              {state.mapObjects.map((obj) => {
                const fallback = objectIconMap.get(obj.type) ?? HelpCircle;
                const iconSize = hasObjectSprite(obj.type)
                  ? scaledCell
                  : Math.max(10, scaledCell * 0.5);
                return (
                  <div
                    key={obj.id}
                    className="pointer-events-none absolute flex items-center justify-center"
                    style={{
                      left: obj.x * scaledCell,
                      top: obj.y * scaledCell,
                      width: scaledCell,
                      height: scaledCell,
                      transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
                      zIndex: 4,
                    }}
                  >
                    <ObjectSpriteIcon
                      type={obj.type}
                      fallback={fallback}
                      size={iconSize}
                      className="select-none text-brand-text drop-shadow-md"
                    />
                  </div>
                );
              })}

              {/* Selected object: bounding box + floating toolbar */}
              {(() => {
                const canShowSelection =
                  state.activeTool === "objects" || state.activeTool === "pointer";
                if (!canShowSelection || !state.selectedObjectId) return null;
                const sel = state.mapObjects.find((o) => o.id === state.selectedObjectId);
                if (!sel) return null;

                const flipBelow = sel.y * scaledCell < TOOLBAR_HEIGHT + 12;
                const toolbarTop = flipBelow
                  ? (sel.y + 1) * scaledCell + 8
                  : sel.y * scaledCell - TOOLBAR_HEIGHT - 8;
                const toolbarLeft = sel.x * scaledCell + scaledCell / 2;

                return (
                  <>
                    <div
                      className="pointer-events-none absolute rounded-sm ring-2 ring-brand-accent ring-offset-1 ring-offset-[#0A0A0F]"
                      style={{
                        left: sel.x * scaledCell,
                        top: sel.y * scaledCell,
                        width: scaledCell,
                        height: scaledCell,
                        zIndex: 10,
                      }}
                    />
                    <ObjectActionToolbar
                      left={toolbarLeft}
                      top={toolbarTop}
                      onRotate={() => rotateSelectedObject()}
                      onDuplicate={() => duplicateSelectedObject()}
                      onDelete={() => deleteSelectedObject()}
                    />
                  </>
                );
              })()}

              {/* Hover cell highlight */}
              {hoverCell && state.activeTool !== "wall" && !aiAreaMode && (
                <div
                  className="pointer-events-none absolute border border-white/20"
                  style={{
                    left: hoverCell.x * scaledCell,
                    top: hoverCell.y * scaledCell,
                    width: scaledCell,
                    height: scaledCell,
                    zIndex: 10,
                  }}
                />
              )}

              {/* AI area: drag preview */}
              {aiAreaDrag && (
                <div
                  className="pointer-events-none absolute border-2 border-dashed border-brand-accent bg-brand-accent/10"
                  style={{
                    left: Math.min(aiAreaDrag.x1, aiAreaDrag.x2) * scaledCell,
                    top: Math.min(aiAreaDrag.y1, aiAreaDrag.y2) * scaledCell,
                    width: (Math.abs(aiAreaDrag.x2 - aiAreaDrag.x1) + 1) * scaledCell,
                    height: (Math.abs(aiAreaDrag.y2 - aiAreaDrag.y1) + 1) * scaledCell,
                    zIndex: 20,
                  }}
                />
              )}

            </div>

          {/* Background image controls */}
          {state.backgroundImage && (
            <div className="absolute bottom-12 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-[#111116]/95 px-4 py-2 shadow-xl backdrop-blur-sm">
              <Eye className="h-3.5 w-3.5 text-brand-muted" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(state.backgroundOpacity * 100)}
                onChange={(e) => setState((s) => ({ ...s, backgroundOpacity: Number(e.target.value) / 100 }))}
                className="h-1 w-24 cursor-pointer accent-brand-accent"
              />
              <span className="w-8 text-right text-[10px] text-brand-muted">
                {Math.round(state.backgroundOpacity * 100)}%
              </span>
              <div className="h-5 w-px bg-white/10" />
              <button
                onClick={() => bgInputRef.current?.click()}
                className="text-[10px] text-brand-muted transition-colors hover:text-brand-text"
                title="Trocar imagem"
              >
                <ImageIcon className="h-3 w-3" />
              </button>
              <button
                onClick={() => setState((s) => ({ ...s, backgroundImage: null }))}
                className="text-[10px] text-red-400 transition-colors hover:text-red-300"
                title="Remover imagem"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Status bar */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-brand-border bg-[#111116] px-3 py-1.5">
            <span className="text-[10px] text-brand-muted">
              {hoverCell ? `(${hoverCell.x}, ${hoverCell.y})` : `${state.gridCols}x${state.gridRows}`}
            </span>
            <span className="text-[10px] text-brand-muted">
              T:{state.terrainCells.length} W:{Object.keys(state.wallEdges).length} O:{state.mapObjects.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── AI Map Generation Modal ─────────────────────────────────── */}
      {aiOpen && aiAreaMode && (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-[200] flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-brand-accent bg-[#111116]/95 px-4 py-2 shadow-xl backdrop-blur-sm">
            <BoxSelect className="h-4 w-4 text-brand-accent" />
            <span className="text-xs text-brand-text">Arraste no canvas para selecionar a área</span>
            <button
              onClick={() => setAiAreaMode(false)}
              className="pointer-events-auto text-[11px] text-brand-muted transition-colors hover:text-brand-text"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {aiOpen && !aiAreaMode && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !aiLoading) setAiOpen(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-brand-accent" />
                <h2 className="text-sm font-semibold text-brand-text">Gerar mapa com IA</h2>
              </div>
              <button
                onClick={() => {
                  if (aiLoading) return;
                  setAiOpen(false);
                  setAiUseArea(false);
                }}
                disabled={aiLoading}
                className="rounded p-1 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:opacity-50"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <label className="mb-2 block text-xs text-brand-muted">
                Descreva o mapa que deseja gerar
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ex.: masmorra com sala do trono, corredor e duas câmaras laterais com baús"
                rows={4}
                disabled={aiLoading}
                className="w-full resize-none rounded-md border border-brand-border bg-[#0A0A0F] p-3 text-sm text-brand-text placeholder-brand-muted outline-none focus:border-brand-accent disabled:opacity-50"
                autoFocus
              />

              <button
                type="button"
                role="switch"
                aria-checked={aiUseArea}
                disabled={aiLoading}
                onClick={() => setAiUseArea((v) => !v)}
                className="mt-3 flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-brand-border bg-[#0A0A0F] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <BoxSelect className="h-3.5 w-3.5 text-brand-muted" />
                  <span className="text-xs text-brand-text">Restringir a uma área específica</span>
                </div>
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    aiUseArea ? "bg-brand-accent" : "bg-white/10"
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      aiUseArea ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </span>
              </button>

              <p className="mt-2 text-[10px] text-brand-muted">
                {aiUseArea
                  ? "Ao clicar Gerar, você vai desenhar a área no canvas (o resto do mapa é preservado)."
                  : `A IA vai gerar terreno, paredes e objetos em um mapa ${state.gridCols}x${state.gridRows}.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-brand-border px-4 py-3">
              <button
                onClick={() => {
                  setAiOpen(false);
                  setAiUseArea(false);
                }}
                disabled={aiLoading}
                className="rounded-md px-3 py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!aiPrompt.trim() || aiLoading) return;
                  if (aiUseArea) {
                    setAiAreaMode(true);
                  } else {
                    void runAIGeneration(aiPrompt.trim(), null);
                  }
                }}
                disabled={!aiPrompt.trim() || aiLoading}
                className="flex items-center gap-1.5 rounded-md bg-brand-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiUseArea ? <BoxSelect className="h-3 w-3" /> : <Wand2 className="h-3 w-3" />}
                {aiLoading
                  ? "Gerando..."
                  : aiUseArea
                    ? "Selecionar Área"
                    : "Gerar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Shortcut row (sidebar info) ──

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <kbd className="rounded border border-brand-border bg-brand-primary px-1.5 py-0.5 font-mono text-[9px] text-brand-text">
        {keys}
      </kbd>
    </div>
  );
}

// ── Terrain swatch with procedural texture preview ──

function EditorTerrainSwatch({ terrainType, fallbackColor }: { terrainType: string; fallbackColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasTexture = hasProceduralTexture(terrainType);

  useEffect(() => {
    if (!hasTexture) return;
    const src = getTerrainCanvas(terrainType);
    const dst = canvasRef.current;
    if (!src || !dst) return;
    const ctx = dst.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(src, 0, 0, 256, 256, 0, 0, 24, 24);
  }, [terrainType, hasTexture]);

  if (!hasTexture) {
    return <div className="h-6 w-6 rounded" style={{ backgroundColor: fallbackColor }} />;
  }

  return <canvas ref={canvasRef} width={24} height={24} className="h-6 w-6 rounded" />;
}
