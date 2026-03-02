import { useRef, useEffect, useCallback } from "react";
import { useMapEditorStore } from "../../lib/map-editor-store.js";
import { TERRAIN_COLORS } from "../../lib/terrain-data.js";
import type { TerrainType, FogState } from "@questboard/shared";

const WALL_COLORS: Record<string, string> = {
  stone: "#4B5563",
  wood: "#92400E",
  iron: "#9CA3AF",
  natural: "#6B7280",
  magic: "#A855F7",
  invisible: "rgba(255,255,255,0.25)",
};

const DOOR_STATE_COLORS: Record<string, string> = {
  open: "#4ADE80",
  closed: "#FBBF24",
  locked: "#EF4444",
  barred: "#DC2626",
  secret: "#A855F7",
  broken: "#6B7280",
};

const OBJECT_COLORS: Record<string, string> = {
  table: "#A0764D",
  chair: "#92653A",
  bed: "#7C3AED",
  chest: "#FBBF24",
  barrel: "#92400E",
  bookshelf: "#6B4423",
  throne: "#FFD700",
  fountain: "#60A5FA",
  statue: "#9CA3AF",
  pillar: "#78716C",
  campfire: "#EF4444",
  tree: "#22C55E",
  bush: "#4ADE80",
  rock_large: "#78716C",
  rock_small: "#9CA3AF",
  mushroom: "#A855F7",
  torch_stand: "#FF9F43",
  banner: "#DC2626",
  rug: "#7C3AED",
  altar: "#FBBF24",
  cage: "#6B7280",
  well: "#60A5FA",
  cart: "#92400E",
  crate: "#A0764D",
  sack: "#92753A",
  weapon_rack: "#4B5563",
  anvil: "#374151",
  cauldron: "#1F2937",
  mirror: "#E5E7EB",
  painting: "#A0764D",
  custom: "#6B7280",
};

export function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPaintingRef = useRef(false);
  const lastPaintedRef = useRef<{ x: number; y: number } | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; vx: number; vy: number }>({ x: 0, y: 0, vx: 0, vy: 0 });

  const {
    mapWidth,
    mapHeight,
    tileSize,
    layers,
    layerVisibility,
    activeTool,
    selectedTerrain,
    brushSize,
    brushShape,
    viewportX,
    viewportY,
    zoom,
    gridVisible,
    selectedTile,
    wallDrawStart,
    fogBrushMode,
    selectedWallType,
    selectedDoorType,
    selectedDoorState,
    selectedLightType,
    lightRadius,
    lightColor,
    lightIntensity,
    selectedObjectType,
    paintTerrain,
    eraseTerrain,
    selectTile,
    clearSelection,
    startPainting,
    stopPainting,
    setZoom,
    setWallDrawStart,
    addWall,
    addDoor,
    addLight,
    addObject,
    setFogTile,
  } = useMapEditorStore();

  // Convert screen coords to tile coords
  const screenToTile = useCallback(
    (screenX: number, screenY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: -1, y: -1 };
      const rect = canvas.getBoundingClientRect();
      const cx = (screenX - rect.left) / zoom - viewportX;
      const cy = (screenY - rect.top) / zoom - viewportY;
      return {
        x: Math.floor(cx / tileSize),
        y: Math.floor(cy / tileSize),
      };
    },
    [zoom, viewportX, viewportY, tileSize]
  );

  // Draw the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const ts = tileSize;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(viewportX, viewportY);

    // Viewport culling bounds
    const startCol = Math.max(0, Math.floor(-viewportX / ts));
    const endCol = Math.min(mapWidth, Math.ceil((-viewportX + w / zoom) / ts));
    const startRow = Math.max(0, Math.floor(-viewportY / ts));
    const endRow = Math.min(mapHeight, Math.ceil((-viewportY + h / zoom) / ts));

    // Background
    ctx.fillStyle = "#0A0A0F";
    ctx.fillRect(0, 0, mapWidth * ts, mapHeight * ts);

    // Draw terrain layer
    if (layerVisibility.terrain) {
      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const tile = layers.terrain.tiles[row]?.[col];
          if (!tile) continue;
          const color = TERRAIN_COLORS[tile.type as TerrainType] ?? "#333";
          ctx.fillStyle = color;
          ctx.globalAlpha = tile.opacity;
          ctx.fillRect(col * ts, row * ts, ts, ts);

          // Add slight variation per variant
          if (tile.variant > 0) {
            ctx.fillStyle = tile.variant % 2 === 0
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)";
            ctx.fillRect(col * ts, row * ts, ts, ts);
          }

          // Tint color
          if (tile.tintColor) {
            ctx.fillStyle = tile.tintColor;
            ctx.globalAlpha = 0.15;
            ctx.fillRect(col * ts, row * ts, ts, ts);
          }

          ctx.globalAlpha = 1;

          // Elevation indicator
          if (tile.elevation !== 0) {
            ctx.fillStyle = tile.elevation > 0
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.2)";
            ctx.fillRect(col * ts, row * ts, ts, ts);
          }

          // Detail indicator (small diamond icon)
          if (tile.detail) {
            ctx.fillStyle = "#FBBF24";
            ctx.beginPath();
            const cx = col * ts + ts - 10;
            const cy = row * ts + 10;
            ctx.moveTo(cx, cy - 4);
            ctx.lineTo(cx + 4, cy);
            ctx.lineTo(cx, cy + 4);
            ctx.lineTo(cx - 4, cy);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    // Draw objects layer
    if (layerVisibility.objects) {
      for (const obj of layers.objects.objects) {
        if (
          obj.x + obj.width < startCol || obj.x > endCol ||
          obj.y + obj.height < startRow || obj.y > endRow
        ) continue;
        const color = OBJECT_COLORS[obj.type] ?? "#6B7280";
        ctx.fillStyle = color;
        ctx.globalAlpha = obj.opacity;
        ctx.fillRect(obj.x * ts + 4, obj.y * ts + 4, obj.width * ts - 8, obj.height * ts - 8);
        ctx.globalAlpha = 1;

        // Object label
        ctx.fillStyle = "#FFF";
        ctx.font = `${Math.max(9, ts * 0.15)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = obj.name.length > 8 ? obj.name.slice(0, 7) + "…" : obj.name;
        ctx.fillText(
          label,
          (obj.x + obj.width / 2) * ts,
          (obj.y + obj.height / 2) * ts
        );
      }
    }

    // Draw structures layer (walls + doors)
    if (layerVisibility.structures) {
      // Walls
      for (const wall of layers.structures.walls) {
        if (
          Math.max(wall.startX, wall.endX) < startCol - 1 ||
          Math.min(wall.startX, wall.endX) > endCol + 1 ||
          Math.max(wall.startY, wall.endY) < startRow - 1 ||
          Math.min(wall.startY, wall.endY) > endRow + 1
        ) continue;

        ctx.strokeStyle = WALL_COLORS[wall.type] ?? "#4B5563";
        ctx.lineWidth = wall.thickness * 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(wall.startX * ts, wall.startY * ts);
        ctx.lineTo(wall.endX * ts, wall.endY * ts);
        ctx.stroke();
      }

      // Doors
      for (const door of layers.structures.doors) {
        if (door.x < startCol - 1 || door.x > endCol + 1 || door.y < startRow - 1 || door.y > endRow + 1) continue;

        const cx = door.x * ts + ts / 2;
        const cy = door.y * ts + ts / 2;
        const ds = ts * 0.3;

        const doorColor = DOOR_STATE_COLORS[door.state] ?? "#FBBF24";
        ctx.fillStyle = doorColor;
        if (door.state === "open") {
          ctx.strokeStyle = doorColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, ds, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillRect(cx - ds, cy - ds, ds * 2, ds * 2);
          if (door.state === "locked") {
            ctx.fillStyle = "#FFF";
            ctx.font = `${ts * 0.2}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🔒", cx, cy);
          } else if (door.state === "secret") {
            ctx.fillStyle = "#FFF";
            ctx.font = `${ts * 0.2}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", cx, cy);
          }
        }
      }
    }

    // Draw lighting layer
    if (layerVisibility.lighting) {
      for (const light of layers.lighting.sources) {
        if (
          light.x + light.radius < startCol || light.x - light.radius > endCol ||
          light.y + light.radius < startRow || light.y - light.radius > endRow
        ) continue;

        const cx = light.x * ts + ts / 2;
        const cy = light.y * ts + ts / 2;
        const r = light.radius * ts;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, light.color + "60");
        gradient.addColorStop(0.6, light.color + "20");
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Light source icon
        ctx.fillStyle = light.color;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw fog layer
    if (layerVisibility.fog) {
      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const fogState = layers.fog.tiles[row]?.[col] as FogState | undefined;
          if (fogState === "hidden") {
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.fillRect(col * ts, row * ts, ts, ts);
          } else if (fogState === "explored") {
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            ctx.fillRect(col * ts, row * ts, ts, ts);
          }
        }
      }
    }

    // Draw annotations layer
    if (layerVisibility.annotations) {
      for (const ann of layers.annotations.annotations) {
        if (ann.x < startCol || ann.x > endCol || ann.y < startRow || ann.y > endRow) continue;
        const cx = ann.x * ts + ts / 2;
        const cy = ann.y * ts + ts / 2;

        ctx.fillStyle = ann.color + "40";
        ctx.fillRect(ann.x * ts + 2, ann.y * ts + 2, ts - 4, ts - 4);

        ctx.fillStyle = ann.color;
        ctx.font = `${Math.max(9, ts * 0.15)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = ann.text.length > 12 ? ann.text.slice(0, 11) + "…" : ann.text;
        ctx.fillText(label, cx, cy);
      }
    }

    // Grid
    if (gridVisible) {
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      for (let col = startCol; col <= endCol; col++) {
        ctx.beginPath();
        ctx.moveTo(col * ts, startRow * ts);
        ctx.lineTo(col * ts, endRow * ts);
        ctx.stroke();
      }
      for (let row = startRow; row <= endRow; row++) {
        ctx.beginPath();
        ctx.moveTo(startCol * ts, row * ts);
        ctx.lineTo(endCol * ts, row * ts);
        ctx.stroke();
      }

      // Map boundary
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, mapWidth * ts, mapHeight * ts);
    }

    // Selection highlight
    if (selectedTile) {
      ctx.strokeStyle = "#E94560";
      ctx.lineWidth = 2;
      ctx.strokeRect(selectedTile.x * ts, selectedTile.y * ts, ts, ts);
    }

    // Wall draw preview
    if (wallDrawStart && activeTool === "walls") {
      ctx.strokeStyle = "#E94560";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(wallDrawStart.x * ts, wallDrawStart.y * ts, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Brush preview for terrain tool (if a selected tile or mouse hover)
    ctx.restore();
  }, [
    tileSize, layers, layerVisibility, viewportX, viewportY, zoom,
    mapWidth, mapHeight, gridVisible, selectedTile, wallDrawStart,
    activeTool,
  ]);

  // Resize canvas
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  // Redraw on state change
  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = screenToTile(e.clientX, e.clientY);

      // Middle mouse button or space+click → pan
      if (e.button === 1) {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY, vx: viewportX, vy: viewportY };
        e.preventDefault();
        return;
      }

      if (e.button !== 0) return;

      if (activeTool === "cursor") {
        if (x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
          selectTile(x, y);
        } else {
          clearSelection();
        }
        return;
      }

      if (activeTool === "terrain") {
        startPainting();
        isPaintingRef.current = true;
        lastPaintedRef.current = { x, y };
        if (e.button === 0) {
          paintTerrain(x, y);
        }
        return;
      }

      if (activeTool === "eraser") {
        startPainting();
        isPaintingRef.current = true;
        lastPaintedRef.current = { x, y };
        eraseTerrain(x, y);
        return;
      }

      if (activeTool === "walls") {
        if (!wallDrawStart) {
          setWallDrawStart({ x, y });
        } else {
          addWall({
            startX: wallDrawStart.x,
            startY: wallDrawStart.y,
            endX: x,
            endY: y,
            type: selectedWallType,
            thickness: 2,
            blocksVision: true,
            blocksMovement: true,
          });
          setWallDrawStart(null);
        }
        return;
      }

      if (activeTool === "doors") {
        if (x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
          addDoor({
            x,
            y,
            side: "north",
            state: selectedDoorState,
            type: selectedDoorType,
            isInteractable: true,
          });
        }
        return;
      }

      if (activeTool === "lights") {
        if (x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
          addLight({
            x,
            y,
            radius: lightRadius,
            color: lightColor,
            intensity: lightIntensity,
            type: selectedLightType,
            flicker: selectedLightType === "torch" || selectedLightType === "campfire",
            castsShadows: false,
          });
        }
        return;
      }

      if (activeTool === "objects") {
        if (x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
          addObject({
            x,
            y,
            width: 1,
            height: 1,
            type: selectedObjectType,
            name: selectedObjectType,
            rotation: 0,
            isInteractable: true,
            layer: "below_tokens",
            opacity: 1,
          });
        }
        return;
      }

      if (activeTool === "fog") {
        startPainting();
        isPaintingRef.current = true;
        if (x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
          setFogTile(x, y, fogBrushMode === "reveal" ? "visible" : "hidden");
        }
        return;
      }
    },
    [
      activeTool, screenToTile, viewportX, viewportY, mapWidth, mapHeight,
      selectedTerrain, brushSize, brushShape, wallDrawStart,
      selectedWallType, selectedDoorType, selectedDoorState,
      selectedLightType, lightRadius, lightColor, lightIntensity,
      selectedObjectType, fogBrushMode,
      selectTile, clearSelection, startPainting, paintTerrain, eraseTerrain,
      setWallDrawStart, addWall, addDoor, addLight, addObject, setFogTile,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current) {
        const dx = (e.clientX - panStartRef.current.x) / zoom;
        const dy = (e.clientY - panStartRef.current.y) / zoom;
        useMapEditorStore.getState().setViewport(
          panStartRef.current.vx + dx,
          panStartRef.current.vy + dy
        );
        return;
      }

      if (!isPaintingRef.current) return;
      const { x, y } = screenToTile(e.clientX, e.clientY);
      if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) return;

      const last = lastPaintedRef.current;
      if (last && last.x === x && last.y === y) return;
      lastPaintedRef.current = { x, y };

      if (activeTool === "terrain") {
        paintTerrain(x, y);
      } else if (activeTool === "eraser") {
        eraseTerrain(x, y);
      } else if (activeTool === "fog") {
        setFogTile(x, y, fogBrushMode === "reveal" ? "visible" : "hidden");
      }
    },
    [activeTool, screenToTile, mapWidth, mapHeight, zoom, paintTerrain, eraseTerrain, setFogTile, fogBrushMode]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
    if (isPaintingRef.current) {
      isPaintingRef.current = false;
      stopPainting();
    }
  }, [stopPainting]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    },
    [zoom, setZoom]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (activeTool === "terrain") {
        const { x, y } = screenToTile(e.clientX, e.clientY);
        if (x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
          eraseTerrain(x, y);
        }
      }
    },
    [activeTool, screenToTile, mapWidth, mapHeight, eraseTerrain]
  );

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-[#0A0A0F]"
      style={{ cursor: activeTool === "cursor" ? "default" : "crosshair" }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        className="block"
      />
    </div>
  );
}
