"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  Eraser,
  Eye,
  Fence,
  ImageIcon,
  Mountain,
  Package,
  Paintbrush,
  PaintBucket,
  Save,
  Square,
  Stamp,
  Trash2,
  Upload,
  Undo2,
  Redo2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";
import type {
  TerrainType,
  TerrainEditorTool,
  WallSide,
  WallMaterial,
  MapObjectType,
  TerrainCell,
  WallSegment,
  MapObjectCell,
} from "@/lib/gameplay-mock-data";
import { MAP_OBJECT_CATALOG } from "@/lib/gameplay-mock-data";
import {
  TERRAIN_CATALOG,
  TERRAIN_CATEGORIES,
  getTerrainsByCategory,
  type TerrainCategoryId,
} from "@/lib/terrain-catalog";
import { getTerrainCSSPattern } from "@/components/gameplay/map-canvas/terrain-patterns";
import { ROOM_TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/room-templates";
import {
  saveMap,
  listSavedMaps,
  loadMap,
  deleteMap,
  type SavedMap,
} from "@/lib/map-storage";

// ── Standalone editor state (no gameplay store dependency) ───────────

interface EditorState {
  gridCols: number;
  gridRows: number;
  cellSize: number;
  zoom: number;
  terrainCells: TerrainCell[];
  walls: WallSegment[];
  mapObjects: MapObjectCell[];
  // Active selections
  activeTool: "terrain" | "wall" | "objects" | "eraser";
  terrainEditorTool: TerrainEditorTool;
  activeTerrainType: TerrainType;
  terrainCategory: TerrainCategoryId | "all";
  brushSize: 1 | 2 | 3;
  activeWallType: WallMaterial;
  activeObjectType: MapObjectType;
  // Undo
  history: { terrain: TerrainCell[]; walls: WallSegment[]; objects: MapObjectCell[] }[];
  future: { terrain: TerrainCell[]; walls: WallSegment[]; objects: MapObjectCell[] }[];
  // Background image
  backgroundImage: string | null;
  backgroundOpacity: number;
  // Meta
  mapName: string;
  savedMapId: string | null;
}

function createInitialState(): EditorState {
  return {
    gridCols: 25,
    gridRows: 25,
    cellSize: 40,
    zoom: 100,
    terrainCells: [],
    walls: [],
    mapObjects: [],
    activeTool: "terrain",
    terrainEditorTool: "brush",
    activeTerrainType: "stone_floor",
    terrainCategory: "all",
    brushSize: 1,
    activeWallType: "stone",
    activeObjectType: "chest",
    history: [],
    future: [],
    backgroundImage: null,
    backgroundOpacity: 0.5,
    mapName: "Novo Mapa",
    savedMapId: null,
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

// ── Wall visual helpers ──────────────────────────────────────────────

const WALL_COLORS: Record<WallMaterial, string> = {
  stone: "#8B7355",
  wood: "#A0764D",
  iron: "#7A8B99",
  magic: "#9B6CE7",
};

function getWallLine(
  w: { x: number; y: number; side: WallSide },
  cell: number,
) {
  const left = w.x * cell;
  const top = w.y * cell;
  const right = left + cell;
  const bottom = top + cell;
  switch (w.side) {
    case "top": return { x1: left, y1: top, x2: right, y2: top };
    case "bottom": return { x1: left, y1: bottom, x2: right, y2: bottom };
    case "left": return { x1: left, y1: top, x2: left, y2: bottom };
    case "right": return { x1: right, y1: top, x2: right, y2: bottom };
  }
}

// ── Object icon lookup ───────────────────────────────────────────────

const objectIconMap = new Map(MAP_OBJECT_CATALOG.map((o) => [o.type, o.icon]));

// ── Component ────────────────────────────────────────────────────────

export default function MapEditorPage() {
  const [state, setState] = useState<EditorState>(createInitialState);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [hoverWall, setHoverWall] = useState<{ x: number; y: number; side: WallSide } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCat, setTemplateCat] = useState("all");
  const [showSaved, setShowSaved] = useState(false);
  const [savedMaps, setSavedMaps] = useState<SavedMap[]>([]);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);

  const scaledCell = Math.round(state.cellSize * (state.zoom / 100));
  const canvasW = state.gridCols * scaledCell;
  const canvasH = state.gridRows * scaledCell;

  // ── Snapshot for undo ──────────────────────────────────────────────

  const pushSnapshot = useCallback(() => {
    setState((s) => ({
      ...s,
      history: [
        ...s.history.slice(-49),
        { terrain: [...s.terrainCells], walls: [...s.walls], objects: [...s.mapObjects] },
      ],
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return {
        ...s,
        history: s.history.slice(0, -1),
        future: [
          ...s.future,
          { terrain: [...s.terrainCells], walls: [...s.walls], objects: [...s.mapObjects] },
        ],
        terrainCells: prev.terrain,
        walls: prev.walls,
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
          { terrain: [...s.terrainCells], walls: [...s.walls], objects: [...s.mapObjects] },
        ],
        terrainCells: next.terrain,
        walls: next.walls,
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
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const sLeft = scrollRef.current?.scrollLeft ?? 0;
      const sTop = scrollRef.current?.scrollTop ?? 0;
      const px = e.clientX - rect.left + sLeft;
      const py = e.clientY - rect.top + sTop;
      return {
        x: Math.max(0, Math.min(state.gridCols - 1, Math.floor(px / scaledCell))),
        y: Math.max(0, Math.min(state.gridRows - 1, Math.floor(py / scaledCell))),
      };
    },
    [scaledCell, state.gridCols, state.gridRows],
  );

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
      if (cellX < 0 || cellX >= state.gridCols || cellY < 0 || cellY >= state.gridRows) return null;
      const localX = (px / scaledCell) - cellX;
      const localY = (py / scaledCell) - cellY;
      const dists = { top: localY, bottom: 1 - localY, left: localX, right: 1 - localX };
      const min = Math.min(dists.top, dists.bottom, dists.left, dists.right);
      const side: WallSide = min === dists.top ? "top" : min === dists.bottom ? "bottom" : min === dists.left ? "left" : "right";
      return { x: cellX, y: cellY, side };
    },
    [scaledCell, state.gridCols, state.gridRows],
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
      const el = scrollRef.current;
      if (!el) return;
      const startScrollX = el.scrollLeft;
      const startScrollY = el.scrollTop;

      function onMove(ev: MouseEvent) {
        if (!el) return;
        el.scrollLeft = startScrollX - (ev.clientX - startX);
        el.scrollTop = startScrollY - (ev.clientY - startY);
      }
      function onUp() {
        setIsPanning(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [],
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
      // Space+left-click pan
      if (spaceHeld) {
        handlePanStart(e);
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

      // Wall tool
      if (state.activeTool === "wall") {
        const wallInfo = getClosestWallSide(e);
        if (!wallInfo) return;
        setState((s) => {
          const exists = s.walls.findIndex((w) => w.x === wallInfo.x && w.y === wallInfo.y && w.side === wallInfo.side);
          if (e.shiftKey) {
            if (exists >= 0) {
              const w = s.walls[exists];
              if (w.isDoor) {
                const states: ("closed" | "open" | "locked" | "secret")[] = ["closed", "open", "locked", "secret"];
                const cur = w.doorState ?? "closed";
                const next = states[(states.indexOf(cur as "closed") + 1) % states.length];
                const updated = [...s.walls];
                updated[exists] = { ...w, doorState: next, doorOpen: next === "open" };
                return { ...s, walls: updated };
              }
              const updated = [...s.walls];
              updated[exists] = { ...w, isDoor: true, doorOpen: false, doorState: "closed" };
              return { ...s, walls: updated };
            }
            return { ...s, walls: [...s.walls, { ...wallInfo, isDoor: true, doorOpen: false, wallType: s.activeWallType, doorState: "closed" }] };
          }
          if (exists >= 0) {
            return { ...s, walls: s.walls.filter((_, i) => i !== exists) };
          }
          return { ...s, walls: [...s.walls, { ...wallInfo, isDoor: false, doorOpen: false, wallType: s.activeWallType }] };
        });

        // Drag to add walls
        const painted = new Set([`${wallInfo.x},${wallInfo.y},${wallInfo.side}`]);
        function onMove(ev: MouseEvent) {
          const wi = getClosestWallSide(ev);
          if (!wi) return;
          const key = `${wi.x},${wi.y},${wi.side}`;
          if (painted.has(key)) return;
          painted.add(key);
          setState((s) => {
            const exists = s.walls.some((w) => w.x === wi.x && w.y === wi.y && w.side === wi.side);
            if (exists) return s;
            return { ...s, walls: [...s.walls, { ...wi, isDoor: false, doorOpen: false, wallType: s.activeWallType }] };
          });
        }
        function onUp() { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return;
      }

      // Objects tool
      if (state.activeTool === "objects") {
        const cell = getGridCell(e);
        if (!cell) return;
        if (e.shiftKey) {
          setState((s) => ({ ...s, mapObjects: s.mapObjects.filter((o) => !(o.x === cell.x && o.y === cell.y)) }));
        } else {
          setState((s) => {
            const existing = s.mapObjects.findIndex((o) => o.x === cell.x && o.y === cell.y);
            if (existing >= 0) {
              const updated = [...s.mapObjects];
              updated[existing] = { ...updated[existing], type: s.activeObjectType };
              return { ...s, mapObjects: updated };
            }
            return {
              ...s,
              mapObjects: [
                ...s.mapObjects,
                { id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, x: cell.x, y: cell.y, type: s.activeObjectType, rotation: 0 },
              ],
            };
          });
        }
        return;
      }

      // Eraser tool
      if (state.activeTool === "eraser") {
        const cell = getGridCell(e);
        if (!cell) return;
        setState((s) => ({
          ...s,
          terrainCells: s.terrainCells.filter((c) => !(c.x === cell.x && c.y === cell.y)),
          walls: s.walls.filter((w) => !(w.x === cell.x && w.y === cell.y)),
          mapObjects: s.mapObjects.filter((o) => !(o.x === cell.x && o.y === cell.y)),
        }));
        const erased = new Set([`${cell.x},${cell.y}`]);
        function onMove(ev: MouseEvent) {
          const c = getGridCell(ev);
          if (!c) return;
          const key = `${c.x},${c.y}`;
          if (erased.has(key)) return;
          erased.add(key);
          setState((s) => ({
            ...s,
            terrainCells: s.terrainCells.filter((tc) => !(tc.x === c.x && tc.y === c.y)),
            walls: s.walls.filter((w) => !(w.x === c.x && w.y === c.y)),
            mapObjects: s.mapObjects.filter((o) => !(o.x === c.x && o.y === c.y)),
          }));
        }
        function onUp() { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      }
    },
    [state.activeTool, state.terrainEditorTool, state.brushSize, state.gridCols, state.gridRows, state.activeWallType, state.activeObjectType, getGridCell, getClosestWallSide, pushSnapshot, paintTerrainCells, eraseTerrainCells, fillTerrain, spaceHeld, handlePanStart],
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (state.activeTool === "wall") {
        setHoverWall(getClosestWallSide(e));
      } else {
        setHoverWall(null);
      }
      const cell = getGridCell(e);
      setHoverCell(cell);
    },
    [state.activeTool, getGridCell, getClosestWallSide],
  );

  // ── Wheel zoom ────────────────────────────────────────────────────

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setState((s) => ({ ...s, zoom: Math.max(25, Math.min(300, s.zoom + delta)) }));
      }
    },
    [],
  );

  // ── Save / Load ────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const saved = saveMap({
      name: state.mapName,
      gridCols: state.gridCols,
      gridRows: state.gridRows,
      terrainCells: state.terrainCells,
      walls: state.walls,
      mapObjects: state.mapObjects,
    });
    setState((s) => ({ ...s, savedMapId: saved.id }));
  }, [state.mapName, state.gridCols, state.gridRows, state.terrainCells, state.walls, state.mapObjects]);

  const handleLoad = useCallback((map: SavedMap) => {
    setState((s) => ({
      ...s,
      mapName: map.name,
      gridCols: map.gridCols,
      gridRows: map.gridRows,
      terrainCells: map.terrainCells,
      walls: map.walls,
      mapObjects: map.mapObjects,
      savedMapId: map.id,
      history: [],
      future: [],
    }));
    setShowSaved(false);
  }, []);

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
        const newWalls = [...s.walls];
        for (const w of tmpl.walls) {
          const x = cx + w.dx;
          const y = cy + w.dy;
          if (x < 0 || y < 0 || x >= s.gridCols || y >= s.gridRows) continue;
          if (!newWalls.some((e) => e.x === x && e.y === y && e.side === w.side)) {
            newWalls.push({ x, y, side: w.side, isDoor: w.isDoor ?? false, doorOpen: w.doorState === "open", wallType: s.activeWallType, doorState: w.doorState ?? (w.isDoor ? "closed" : undefined) });
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
        return { ...s, terrainCells: newTerrain, walls: newWalls, mapObjects: newObjects };
      });
    },
    [state.gridCols, state.gridRows, hoverCell, pushSnapshot],
  );

  // ── Terrain palette data ───────────────────────────────────────────

  const terrains = getTerrainsByCategory(state.terrainCategory);

  const WALL_TYPES: { type: WallMaterial; label: string; color: string }[] = [
    { type: "stone", label: "Pedra", color: "#8B7355" },
    { type: "wood", label: "Madeira", color: "#A0764D" },
    { type: "iron", label: "Ferro", color: "#7A8B99" },
    { type: "magic", label: "Magica", color: "#9B6CE7" },
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

  return (
    <div className="-m-6 flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-brand-border bg-[#0D0D12] px-3">
        <Link
          href="/dashboard/maps"
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

          <div className="mx-1 h-5 w-px bg-brand-border" />

          <button
            onClick={() => { setSavedMaps(listSavedMaps()); setShowSaved(true); }}
            title="Carregar mapa"
            className="flex h-7 items-center gap-1 rounded px-2 text-[10px] text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
          >
            <Upload className="h-3 w-3" />
            Carregar
          </button>
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
            className="flex h-7 items-center gap-1 rounded bg-brand-accent px-3 text-[10px] font-medium text-white transition-colors hover:bg-brand-accent/80"
          >
            <Save className="h-3 w-3" />
            Salvar
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
              <div className="mb-2 flex gap-0.5">
                {[{ id: "all" as const, label: "Todos" }, ...TERRAIN_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setState((s) => ({ ...s, terrainCategory: tab.id }))}
                    className={`flex-1 rounded px-1 py-0.5 text-[9px] transition-colors ${
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
                  const pattern = t.pattern ? getTerrainCSSPattern(t.pattern.type, t.pattern.color, t.pattern.opacity, 24) : null;
                  return (
                    <button
                      key={t.type}
                      title={t.label}
                      onClick={() => setState((s) => ({ ...s, activeTerrainType: t.type as TerrainType }))}
                      className={`flex flex-col items-center gap-0.5 rounded border p-1 transition-colors ${
                        isActive ? "border-brand-accent bg-brand-accent/10" : "border-transparent hover:border-brand-border"
                      }`}
                    >
                      <div
                        className="h-6 w-6 rounded"
                        style={{
                          backgroundColor: t.color,
                          ...(pattern && { backgroundImage: pattern.backgroundImage, backgroundSize: pattern.backgroundSize }),
                        }}
                      />
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
              <div className="mb-2 text-[9px] text-brand-muted">Tipo de parede:</div>
              <div className="mb-3 flex flex-col gap-1">
                {WALL_TYPES.map(({ type, label, color }) => (
                  <button
                    key={type}
                    onClick={() => setState((s) => ({ ...s, activeWallType: type }))}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-[10px] transition-colors ${
                      state.activeWallType === type ? "bg-white/10 font-semibold text-brand-text" : "text-brand-muted hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                    {label}
                  </button>
                ))}
              </div>
              <div className="mb-2 h-px bg-brand-border" />
              <div className="flex flex-col gap-1 text-[9px] text-brand-muted">
                <span>Click: adicionar/remover parede</span>
                <span>Shift+Click: criar/alternar porta</span>
              </div>
              <div className="mt-3 h-px bg-brand-border" />
              <button
                onClick={() => { pushSnapshot(); setState((s) => ({ ...s, walls: [] })); }}
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
              <div className="mb-2 flex gap-0.5">
                {OBJ_CATEGORIES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setObjCategory(id)}
                    className={`flex-1 rounded px-1 py-0.5 text-[9px] transition-colors ${
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
                    className={`flex flex-col items-center gap-0.5 rounded border p-1.5 transition-colors ${
                      state.activeObjectType === obj.type
                        ? "border-brand-accent bg-brand-accent/10"
                        : "border-transparent hover:border-brand-border"
                    }`}
                  >
                    <span className="text-sm">{obj.icon}</span>
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
        </div>

        {/* Canvas area */}
        <div
          className={`relative flex-1 bg-[#0A0A0F] ${isPanning || spaceHeld ? "cursor-grabbing" : "cursor-crosshair"}`}
          style={{ overflow: "hidden" }}
          onWheel={handleWheel}
        >
          <div ref={scrollRef} className="scrollbar-hidden h-full w-full overflow-auto" onMouseDown={(e) => { if (e.button === 1) e.preventDefault(); }}>
            <div
              ref={canvasRef}
              className="relative"
              style={{ width: canvasW, height: canvasH }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => { setHoverCell(null); setHoverWall(null); }}
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

              {/* Terrain cells */}
              {state.terrainCells.map((cell) => {
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

              {/* Walls */}
              {state.walls.length > 0 && (
                <svg className="pointer-events-none absolute left-0 top-0" width={canvasW} height={canvasH} style={{ zIndex: 5 }}>
                  {state.walls.map((wall, i) => {
                    const line = getWallLine(wall, scaledCell);
                    const color = wall.isDoor
                      ? (wall.doorState === "open" ? "#6A8B4D" : wall.doorState === "locked" ? "#CC4444" : wall.doorState === "secret" ? "#888888" : "#C0A060")
                      : WALL_COLORS[wall.wallType ?? "stone"];
                    const width = wall.isDoor && wall.doorState === "open" ? 1.5 : wall.wallType === "iron" ? 4 : 3;
                    const dash = wall.isDoor
                      ? (wall.doorState === "secret" ? "2,4" : wall.doorState === "locked" ? "6,3" : "6,4")
                      : wall.wallType === "magic" ? "4,4" : undefined;
                    return (
                      <line
                        key={`w-${i}`}
                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                        stroke={color}
                        strokeWidth={width}
                        strokeDasharray={dash}
                        strokeLinecap="round"
                        opacity={wall.isDoor && wall.doorOpen ? 0.5 : 1}
                      />
                    );
                  })}
                  {/* Wall hover preview */}
                  {hoverWall && state.activeTool === "wall" && (() => {
                    const line = getWallLine(hoverWall, scaledCell);
                    return (
                      <line
                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                        stroke={WALL_COLORS[state.activeWallType]}
                        strokeWidth={3}
                        strokeLinecap="round"
                        opacity={0.5}
                      />
                    );
                  })()}
                </svg>
              )}

              {/* Wall hover when no walls yet */}
              {state.walls.length === 0 && hoverWall && state.activeTool === "wall" && (
                <svg className="pointer-events-none absolute left-0 top-0" width={canvasW} height={canvasH} style={{ zIndex: 5 }}>
                  {(() => {
                    const line = getWallLine(hoverWall, scaledCell);
                    return (
                      <line
                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                        stroke={WALL_COLORS[state.activeWallType]}
                        strokeWidth={3}
                        strokeLinecap="round"
                        opacity={0.5}
                      />
                    );
                  })()}
                </svg>
              )}

              {/* Map objects */}
              {state.mapObjects.map((obj) => {
                const icon = objectIconMap.get(obj.type) ?? "?";
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
                    <span className="select-none drop-shadow-md" style={{ fontSize: Math.max(10, scaledCell * 0.5), lineHeight: 1 }}>
                      {icon}
                    </span>
                  </div>
                );
              })}

              {/* Hover cell highlight */}
              {hoverCell && state.activeTool !== "wall" && (
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
            </div>
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
              T:{state.terrainCells.length} W:{state.walls.length} O:{state.mapObjects.length}
            </span>
          </div>
        </div>
      </div>

      {/* Load modal */}
      {showSaved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowSaved(false)}>
          <div className="w-[420px] rounded-xl border border-brand-border bg-[#111116] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-sm font-semibold text-brand-text">Mapas Salvos</h3>
            {savedMaps.length === 0 ? (
              <p className="py-6 text-center text-xs text-brand-muted">Nenhum mapa salvo ainda.</p>
            ) : (
              <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto">
                {savedMaps.map((map) => (
                  <div key={map.id} className="flex items-center justify-between rounded-lg border border-brand-border bg-white/[0.02] px-3 py-2">
                    <div>
                      <div className="text-xs font-medium text-brand-text">{map.name}</div>
                      <div className="text-[10px] text-brand-muted">
                        {map.gridCols}x{map.gridRows} — {new Date(map.savedAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLoad(map)}
                        className="rounded bg-brand-accent px-2 py-1 text-[10px] text-white hover:bg-brand-accent/80"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => {
                          deleteMap(map.id);
                          setSavedMaps(listSavedMaps());
                        }}
                        className="rounded px-2 py-1 text-[10px] text-brand-muted hover:bg-white/[0.06] hover:text-brand-danger"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowSaved(false)}
              className="mt-4 w-full rounded-lg py-2 text-xs text-brand-muted transition-colors hover:bg-white/[0.06]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
