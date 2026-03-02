import { useRef, useEffect, useCallback, useState } from "react";
import { useMapEditorStore, getBrushTiles } from "../../../stores/map-editor-store.js";
import { TERRAIN_COLOR_MAP } from "@questboard/shared/constants";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

interface CanvasMouseState {
  isPanning: boolean;
  isPainting: boolean;
  lastPanX: number;
  lastPanY: number;
}

export function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseState = useRef<CanvasMouseState>({
    isPanning: false,
    isPainting: false,
    lastPanX: 0,
    lastPanY: 0,
  });
  const {
    width,
    height,
    tileSize,
    layers,
    activeTool,
    brushSize,
    brushShape,
    selectedTerrainType,
    viewport,
    gridVisible,
    layerVisibility,
    selection,
    wallDrawing,
    setViewport,
    paintTerrain,
    paintTerrainArea,
    eraseTerrain,
    setSelection,
    clearSelection,
    addWall,
    setWallDrawing,
    addDoor,
    addLight,
    setFogTile,
    addAnnotation,
    pushHistory,
    selectedWallType,
    selectedDoorType,
    selectedDoorState,
    selectedLightType,
  } = useMapEditorStore();

  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);

  // Convert screen coordinates to tile coordinates
  const screenToTile = useCallback(
    (screenX: number, screenY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = (screenX - rect.left - viewport.x) / (tileSize * viewport.zoom);
      const y = (screenY - rect.top - viewport.y) / (tileSize * viewport.zoom);
      return {
        x: Math.floor(x),
        y: Math.floor(y),
      };
    },
    [viewport, tileSize]
  );

  // Convert screen coordinates to edge-snapped coordinates (for walls)
  const screenToEdge = useCallback(
    (screenX: number, screenY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = (screenX - rect.left - viewport.x) / (tileSize * viewport.zoom);
      const y = (screenY - rect.top - viewport.y) / (tileSize * viewport.zoom);
      return {
        x: Math.round(x),
        y: Math.round(y),
      };
    },
    [viewport, tileSize]
  );

  // ─── Rendering ───

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const zoom = viewport.zoom;
    const ts = tileSize * zoom;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "#0A0A0F";
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(viewport.x, viewport.y);

    // ─── Terrain Layer ───
    if (layerVisibility.terrain) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const tile = layers.terrain.tiles[y]?.[x];
          if (!tile) continue;

          const px = x * ts;
          const py = y * ts;

          // Fill with terrain color
          const color = TERRAIN_COLOR_MAP[tile.type] ?? "#333333";
          ctx.fillStyle = color;
          ctx.globalAlpha = tile.opacity;
          ctx.fillRect(px, py, ts, ts);

          // Variation pattern (subtle noise)
          if (tile.variant > 0) {
            ctx.fillStyle = tile.variant % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)";
            ctx.fillRect(px, py, ts, ts);
          }

          // Elevation indicator
          if (tile.elevation !== 0) {
            ctx.fillStyle = tile.elevation > 0 ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)";
            ctx.fillRect(px, py, ts, ts);
          }

          // Detail indicator (small diamond)
          if (tile.detail) {
            ctx.fillStyle = "#E94560";
            const cx = px + ts / 2;
            const cy = py + ts / 2;
            const s = Math.max(3, ts * 0.1);
            ctx.beginPath();
            ctx.moveTo(cx, cy - s);
            ctx.lineTo(cx + s, cy);
            ctx.lineTo(cx, cy + s);
            ctx.lineTo(cx - s, cy);
            ctx.closePath();
            ctx.fill();
          }

          ctx.globalAlpha = 1;
        }
      }
    }

    // ─── Objects Layer ───
    if (layerVisibility.objects) {
      for (const obj of layers.objects.objects) {
        const px = obj.x * ts;
        const py = obj.y * ts;
        const ow = obj.width * ts;
        const oh = obj.height * ts;

        ctx.globalAlpha = obj.opacity;
        ctx.fillStyle = obj.tintColor ?? "#8B6914";
        ctx.fillRect(px + 2, py + 2, ow - 4, oh - 4);

        // Object label
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `${Math.max(8, ts * 0.15)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = obj.name.length > 8 ? obj.name.slice(0, 7) + "..." : obj.name;
        ctx.fillText(label, px + ow / 2, py + oh / 2);

        // Selection highlight
        if (selection.type === "object" && selection.id === obj.id) {
          ctx.strokeStyle = "#E94560";
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, ow, oh);
        }

        ctx.globalAlpha = 1;
      }
    }

    // ─── Structures Layer (Walls & Doors) ───
    if (layerVisibility.structures) {
      // Walls
      for (const wall of layers.structures.walls) {
        const sx = wall.startX * ts;
        const sy = wall.startY * ts;
        const ex = wall.endX * ts;
        const ey = wall.endY * ts;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);

        const wallColors: Record<string, string> = {
          stone: "#4A4A4A",
          wood: "#8B6914",
          iron: "#A0A0A0",
          natural: "#5A4A3A",
          magic: "#8B4AE8",
          invisible: "#FFFFFF40",
        };

        ctx.strokeStyle = wallColors[wall.type] ?? "#4A4A4A";
        ctx.lineWidth = Math.max(2, wall.thickness * 2 * zoom);
        ctx.lineCap = "round";
        ctx.stroke();

        if (selection.type === "wall" && selection.id === wall.id) {
          ctx.strokeStyle = "#E94560";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Wall drawing preview
      if (wallDrawing && hoverTile) {
        ctx.beginPath();
        ctx.moveTo(wallDrawing.startX * ts, wallDrawing.startY * ts);
        ctx.lineTo(hoverTile.x * ts, hoverTile.y * ts);
        ctx.strokeStyle = "#E9456080";
        ctx.lineWidth = 3 * zoom;
        ctx.setLineDash([6, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Doors
      for (const door of layers.structures.doors) {
        const px = door.x * ts;
        const py = door.y * ts;
        const doorSize = ts * 0.6;
        const offset = (ts - doorSize) / 2;

        let dx = px;
        let dy = py;
        let dw = doorSize;
        let dh = ts * 0.15;

        if (door.side === "north") {
          dx = px + offset;
          dy = py - dh / 2;
        } else if (door.side === "south") {
          dx = px + offset;
          dy = py + ts - dh / 2;
        } else if (door.side === "west") {
          dx = px - dh / 2;
          dy = py + offset;
          dw = ts * 0.15;
          dh = doorSize;
        } else {
          dx = px + ts - dh / 2;
          dy = py + offset;
          dw = ts * 0.15;
          dh = doorSize;
        }

        const doorColors: Record<string, string> = {
          open: "#3D7A3D",
          closed: "#8B6914",
          locked: "#D4B36A",
          barred: "#666666",
          secret: "#FFFFFF20",
          broken: "#5C3D1A",
        };

        ctx.fillStyle = doorColors[door.state] ?? "#8B6914";
        ctx.fillRect(dx, dy, dw, dh);

        // Lock icon for locked doors
        if (door.state === "locked") {
          ctx.fillStyle = "#FFD700";
          ctx.font = `${Math.max(8, ts * 0.2)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("L", px + ts / 2, py + ts / 2);
        }

        if (selection.type === "door" && selection.id === door.id) {
          ctx.strokeStyle = "#E94560";
          ctx.lineWidth = 2;
          ctx.strokeRect(dx - 2, dy - 2, dw + 4, dh + 4);
        }
      }
    }

    // ─── Lighting Layer ───
    if (layerVisibility.lighting) {
      for (const light of layers.lighting.sources) {
        const cx = (light.x + 0.5) * ts;
        const cy = (light.y + 0.5) * ts;
        const radius = light.radius * ts;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, light.color + "40");
        gradient.addColorStop(0.5, light.color + "15");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Light source marker
        ctx.fillStyle = light.color;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(3, ts * 0.1), 0, Math.PI * 2);
        ctx.fill();

        if (selection.type === "light" && selection.id === light.id) {
          ctx.strokeStyle = "#E94560";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(6, ts * 0.15), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // ─── Fog Layer ───
    if (layerVisibility.fog) {
      const defaultHidden = layers.fog.defaultState === "ALL_HIDDEN";
      const fogTileMap = new Map<string, string>();
      for (const ft of layers.fog.tiles) {
        fogTileMap.set(`${ft.x},${ft.y}`, ft.state);
      }

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const state = fogTileMap.get(`${x},${y}`);
          let fogOpacity = 0;

          if (state === "hidden" || (defaultHidden && !state)) {
            fogOpacity = 0.7;
          } else if (state === "explored") {
            fogOpacity = 0.35;
          }

          if (fogOpacity > 0) {
            ctx.fillStyle = `rgba(0,0,0,${fogOpacity})`;
            ctx.fillRect(x * ts, y * ts, ts, ts);
          }
        }
      }
    }

    // ─── Annotations Layer ───
    if (layerVisibility.annotations) {
      for (const ann of layers.annotations.annotations) {
        const cx = (ann.x + 0.5) * ts;
        const cy = (ann.y + 0.5) * ts;

        ctx.fillStyle = ann.color + "80";
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(6, ts * 0.2), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `${Math.max(8, ts * 0.12)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(
          ann.text.length > 12 ? ann.text.slice(0, 11) + "..." : ann.text,
          cx,
          cy + Math.max(8, ts * 0.22)
        );
      }
    }

    // ─── Grid ───
    if (gridVisible) {
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;

      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * ts, 0);
        ctx.lineTo(x * ts, height * ts);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * ts);
        ctx.lineTo(width * ts, y * ts);
        ctx.stroke();
      }
    }

    // ─── Hover / Brush Preview ───
    if (hoverTile && activeTool === "terrain") {
      const brushTiles = getBrushTiles(
        hoverTile.x,
        hoverTile.y,
        brushSize,
        brushShape,
        width,
        height
      );

      const previewColor = TERRAIN_COLOR_MAP[selectedTerrainType] ?? "#666666";
      ctx.fillStyle = previewColor + "40";
      ctx.strokeStyle = previewColor + "80";
      ctx.lineWidth = 1;

      for (const bt of brushTiles) {
        ctx.fillRect(bt.x * ts, bt.y * ts, ts, ts);
        ctx.strokeRect(bt.x * ts, bt.y * ts, ts, ts);
      }
    } else if (hoverTile && activeTool === "eraser") {
      ctx.fillStyle = "rgba(255,0,0,0.15)";
      ctx.strokeStyle = "rgba(255,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.fillRect(hoverTile.x * ts, hoverTile.y * ts, ts, ts);
      ctx.strokeRect(hoverTile.x * ts, hoverTile.y * ts, ts, ts);
    } else if (hoverTile && (activeTool === "cursor" || activeTool === "lights" || activeTool === "doors" || activeTool === "fog" || activeTool === "annotate")) {
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(hoverTile.x * ts, hoverTile.y * ts, ts, ts);
    }

    // ─── Selection highlight ───
    if (selection.tileX !== null && selection.tileY !== null && selection.type === "terrain") {
      ctx.strokeStyle = "#E94560";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        selection.tileX * ts,
        selection.tileY * ts,
        ts,
        ts
      );
    }

    // ─── AI Zone selection ───
    const aiZone = useMapEditorStore.getState().aiZoneSelection;
    if (aiZone) {
      ctx.fillStyle = "rgba(139,74,232,0.15)";
      ctx.strokeStyle = "#8B4AE8";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.fillRect(aiZone.x * ts, aiZone.y * ts, aiZone.width * ts, aiZone.height * ts);
      ctx.strokeRect(aiZone.x * ts, aiZone.y * ts, aiZone.width * ts, aiZone.height * ts);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [
    width,
    height,
    tileSize,
    layers,
    viewport,
    gridVisible,
    layerVisibility,
    hoverTile,
    activeTool,
    brushSize,
    brushShape,
    selectedTerrainType,
    selection,
    wallDrawing,
  ]);

  // ─── Canvas resize ───

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        render();
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [render]);

  // ─── Render loop ───

  useEffect(() => {
    render();
  }, [render]);

  // ─── Event handlers ───

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const tile = screenToTile(e.clientX, e.clientY);
      const edge = screenToEdge(e.clientX, e.clientY);

      // Middle click or space + click = pan
      if (e.button === 1 || (e.button === 0 && e.altKey && activeTool !== "terrain")) {
        mouseState.current.isPanning = true;
        mouseState.current.lastPanX = e.clientX;
        mouseState.current.lastPanY = e.clientY;
        return;
      }

      if (e.button !== 0 || !tile) return;

      switch (activeTool) {
        case "cursor": {
          // Check if clicking on an object
          const clickedObj = layers.objects.objects.find(
            (obj) =>
              tile.x >= obj.x &&
              tile.x < obj.x + obj.width &&
              tile.y >= obj.y &&
              tile.y < obj.y + obj.height
          );
          if (clickedObj) {
            setSelection({ type: "object", id: clickedObj.id, tileX: tile.x, tileY: tile.y });
          } else {
            // Check terrain
            const terrainTile = layers.terrain.tiles[tile.y]?.[tile.x];
            if (terrainTile) {
              setSelection({ type: "terrain", id: null, tileX: tile.x, tileY: tile.y });
            } else {
              clearSelection();
            }
          }
          break;
        }

        case "terrain": {
          pushHistory("Paint terrain");
          mouseState.current.isPainting = true;
          if (e.shiftKey) {
            eraseTerrain(tile.x, tile.y);
          } else if (brushSize > 1) {
            const tiles = getBrushTiles(tile.x, tile.y, brushSize, brushShape, width, height);
            paintTerrainArea(tiles);
          } else {
            paintTerrain(tile.x, tile.y);
          }
          break;
        }

        case "eraser": {
          pushHistory("Erase terrain");
          mouseState.current.isPainting = true;
          eraseTerrain(tile.x, tile.y);
          break;
        }

        case "walls": {
          if (!edge) break;
          if (!wallDrawing) {
            setWallDrawing({ startX: edge.x, startY: edge.y });
          } else {
            pushHistory("Add wall");
            addWall({
              id: `wall_${Date.now()}`,
              startX: wallDrawing.startX,
              startY: wallDrawing.startY,
              endX: edge.x,
              endY: edge.y,
              type: selectedWallType,
              thickness: 2,
              blocksVision: true,
              blocksMovement: true,
            });
            setWallDrawing(null);
          }
          break;
        }

        case "doors": {
          pushHistory("Add door");
          // Determine door side based on position within tile
          const canvas = canvasRef.current;
          if (!canvas) break;
          const rect = canvas.getBoundingClientRect();
          const exactX = (e.clientX - rect.left - viewport.x) / (tileSize * viewport.zoom);
          const exactY = (e.clientY - rect.top - viewport.y) / (tileSize * viewport.zoom);
          const dx = exactX - tile.x;
          const dy = exactY - tile.y;

          let side: "north" | "south" | "east" | "west" = "north";
          if (dy < 0.25) side = "north";
          else if (dy > 0.75) side = "south";
          else if (dx < 0.25) side = "west";
          else side = "east";

          addDoor({
            id: `door_${Date.now()}`,
            x: tile.x,
            y: tile.y,
            side,
            state: selectedDoorState,
            type: selectedDoorType,
            isInteractable: true,
          });
          break;
        }

        case "lights": {
          pushHistory("Add light");
          const lightDefaults: Record<string, { color: string; radius: number }> = {
            torch: { color: "#FF9933", radius: 6 },
            lantern: { color: "#FFD700", radius: 8 },
            campfire: { color: "#FF6600", radius: 10 },
            magic: { color: "#8B4AE8", radius: 6 },
            sunlight: { color: "#FFF8DC", radius: 20 },
            moonlight: { color: "#C0C0E0", radius: 12 },
          };
          const def = lightDefaults[selectedLightType] ?? lightDefaults.torch!;
          addLight({
            id: `light_${Date.now()}`,
            x: tile.x,
            y: tile.y,
            radius: def.radius,
            color: def.color,
            intensity: 0.8,
            type: selectedLightType,
            flicker: selectedLightType === "torch" || selectedLightType === "campfire",
            castsShadows: false,
          });
          break;
        }

        case "fog": {
          mouseState.current.isPainting = true;
          setFogTile(tile.x, tile.y, e.shiftKey ? "visible" : "hidden");
          break;
        }

        case "annotate": {
          const text = prompt("Nota do GM:");
          if (text) {
            pushHistory("Add annotation");
            addAnnotation({
              id: `ann_${Date.now()}`,
              x: tile.x,
              y: tile.y,
              text,
              color: "#FFD700",
            });
          }
          break;
        }

        case "ai_zone": {
          const store = useMapEditorStore.getState();
          if (!store.aiZoneSelection) {
            store.setAIZoneSelection({ x: tile.x, y: tile.y, width: 1, height: 1 });
          }
          break;
        }
      }
    },
    [
      activeTool,
      screenToTile,
      screenToEdge,
      brushSize,
      brushShape,
      width,
      height,
      wallDrawing,
      selectedWallType,
      selectedDoorType,
      selectedDoorState,
      selectedLightType,
      layers,
      viewport,
      tileSize,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const tile = screenToTile(e.clientX, e.clientY);

      // Panning
      if (mouseState.current.isPanning) {
        const dx = e.clientX - mouseState.current.lastPanX;
        const dy = e.clientY - mouseState.current.lastPanY;
        mouseState.current.lastPanX = e.clientX;
        mouseState.current.lastPanY = e.clientY;
        setViewport({ x: viewport.x + dx, y: viewport.y + dy });
        return;
      }

      if (tile) {
        // Update hover for edge-snapped tools
        if (activeTool === "walls") {
          const edge = screenToEdge(e.clientX, e.clientY);
          setHoverTile(edge);
        } else {
          setHoverTile(tile);
        }
      }

      // Painting while dragging
      if (mouseState.current.isPainting && tile) {
        switch (activeTool) {
          case "terrain": {
            if (brushSize > 1) {
              const tiles = getBrushTiles(tile.x, tile.y, brushSize, brushShape, width, height);
              paintTerrainArea(tiles);
            } else {
              paintTerrain(tile.x, tile.y);
            }
            break;
          }
          case "eraser":
            eraseTerrain(tile.x, tile.y);
            break;
          case "fog":
            setFogTile(tile.x, tile.y, e.shiftKey ? "visible" : "hidden");
            break;
        }
      }

      // AI zone drag
      if (activeTool === "ai_zone" && e.buttons === 1) {
        const store = useMapEditorStore.getState();
        const sel = store.aiZoneSelection;
        if (sel && tile) {
          const newWidth = Math.max(1, tile.x - sel.x + 1);
          const newHeight = Math.max(1, tile.y - sel.y + 1);
          store.setAIZoneSelection({ ...sel, width: newWidth, height: newHeight });
        }
      }
    },
    [
      activeTool,
      screenToTile,
      screenToEdge,
      viewport,
      brushSize,
      brushShape,
      width,
      height,
    ]
  );

  const handleMouseUp = useCallback(() => {
    mouseState.current.isPanning = false;
    mouseState.current.isPainting = false;

    // Finalize AI zone selection
    if (activeTool === "ai_zone") {
      const store = useMapEditorStore.getState();
      if (store.aiZoneSelection && store.aiZoneSelection.width > 1) {
        store.setShowAIZoneModal(true);
      }
    }
  }, [activeTool]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.zoom * delta));

      // Zoom towards cursor
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scale = newZoom / viewport.zoom;
      const newX = mouseX - (mouseX - viewport.x) * scale;
      const newY = mouseY - (mouseY - viewport.y) * scale;

      setViewport({ x: newX, y: newY, zoom: newZoom });
    },
    [viewport]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const tile = screenToTile(e.clientX, e.clientY);
    if (tile && activeTool === "terrain") {
      eraseTerrain(tile.x, tile.y);
    }
  }, [activeTool, screenToTile]);

  const handleMouseLeave = useCallback(() => {
    setHoverTile(null);
    mouseState.current.isPanning = false;
    mouseState.current.isPainting = false;
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden bg-[#0A0A0F]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      />

      {/* Minimap */}
      <div className="absolute bottom-4 right-4 rounded-lg border border-white/10 bg-[#111116]/90 p-1">
        <div
          className="relative"
          style={{
            width: 120,
            height: Math.round((120 * height) / width),
            background: "#0A0A0F",
          }}
        >
          {/* Simplified minimap terrain */}
          <canvas
            ref={(miniCanvas) => {
              if (!miniCanvas) return;
              const ctx = miniCanvas.getContext("2d");
              if (!ctx) return;
              miniCanvas.width = 120;
              miniCanvas.height = Math.round((120 * height) / width);
              const sw = miniCanvas.width / width;
              const sh = miniCanvas.height / height;

              ctx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  const tile = layers.terrain.tiles[y]?.[x];
                  if (tile) {
                    ctx.fillStyle = TERRAIN_COLOR_MAP[tile.type] ?? "#333";
                    ctx.fillRect(x * sw, y * sh, sw, sh);
                  }
                }
              }
            }}
            className="absolute inset-0"
          />

          {/* Viewport indicator */}
          <div
            className="absolute border border-brand-accent/60"
            style={{
              left: Math.max(0, (-viewport.x / (tileSize * viewport.zoom * width)) * 120),
              top: Math.max(0, (-viewport.y / (tileSize * viewport.zoom * height)) * Math.round((120 * height) / width)),
              width: Math.min(120, (containerRef.current?.clientWidth ?? 880) / (tileSize * viewport.zoom * width) * 120),
              height: Math.min(
                Math.round((120 * height) / width),
                ((containerRef.current?.clientHeight ?? 600) / (tileSize * viewport.zoom * height)) * Math.round((120 * height) / width)
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
