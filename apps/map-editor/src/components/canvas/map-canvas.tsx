import { useEffect, useRef, useCallback } from "react";
import { Application, Container, Graphics } from "pixi.js";
import { useEditorStore } from "../../lib/editor-store";
import { getTerrainColor } from "../../lib/terrain-data";

export function MapCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const terrainLayerRef = useRef<Container | null>(null);
  const gridLayerRef = useRef<Graphics | null>(null);
  const isPaintingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  const store = useEditorStore();

  // ─── Initialize Pixi Application ────────────────────────
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new Application();

    (async () => {
      await app.init({
        background: "#0A0A0F",
        resizeTo: canvasRef.current!,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      canvasRef.current!.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      // Create layers
      const terrainLayer = new Container();
      terrainLayer.label = "terrain";
      app.stage.addChild(terrainLayer);
      terrainLayerRef.current = terrainLayer;

      const gridGraphics = new Graphics();
      gridGraphics.label = "grid";
      app.stage.addChild(gridGraphics);
      gridLayerRef.current = gridGraphics;

      // Initial render
      renderTerrain();
      renderGrid();
    })();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  // ─── Render Terrain ─────────────────────────────────────
  const renderTerrain = useCallback(() => {
    const terrain = terrainLayerRef.current;
    if (!terrain) return;

    terrain.removeChildren();

    const state = useEditorStore.getState();
    const { layers, tileSize } = state;

    for (let y = 0; y < layers.terrain.tiles.length; y++) {
      const row = layers.terrain.tiles[y];
      if (!row) continue;
      for (let x = 0; x < row.length; x++) {
        const tile = row[x];
        if (!tile) continue;

        const g = new Graphics();
        const color = getTerrainColor(tile.type);
        g.rect(x * tileSize, y * tileSize, tileSize, tileSize);
        g.fill(color);

        // Add subtle border between tiles
        g.rect(x * tileSize, y * tileSize, tileSize, tileSize);
        g.stroke({ color: 0x000000, width: 0.5, alpha: 0.2 });

        // Variant tinting (subtle variation)
        if (tile.variant > 0) {
          g.rect(x * tileSize, y * tileSize, tileSize, tileSize);
          g.fill({ color: tile.variant % 2 === 0 ? 0xffffff : 0x000000, alpha: 0.04 * tile.variant });
        }

        terrain.addChild(g);
      }
    }
  }, []);

  // ─── Render Grid ────────────────────────────────────────
  const renderGrid = useCallback(() => {
    const grid = gridLayerRef.current;
    if (!grid) return;

    grid.clear();

    const state = useEditorStore.getState();
    if (!state.gridVisible) return;

    const { mapWidth, mapHeight, tileSize } = state;
    const totalW = mapWidth * tileSize;
    const totalH = mapHeight * tileSize;

    // Vertical lines
    for (let x = 0; x <= mapWidth; x++) {
      grid.moveTo(x * tileSize, 0);
      grid.lineTo(x * tileSize, totalH);
    }
    // Horizontal lines
    for (let y = 0; y <= mapHeight; y++) {
      grid.moveTo(0, y * tileSize);
      grid.lineTo(totalW, y * tileSize);
    }
    grid.stroke({ color: 0xffffff, width: 0.5, alpha: 0.08 });

    // Map border
    grid.rect(0, 0, totalW, totalH);
    grid.stroke({ color: 0xffffff, width: 1, alpha: 0.15 });
  }, []);

  // ─── Re-render on state changes ─────────────────────────
  useEffect(() => {
    const unsub = useEditorStore.subscribe(
      (state) => state.layers.terrain,
      () => renderTerrain(),
    );
    return unsub;
  }, [renderTerrain]);

  useEffect(() => {
    const unsub = useEditorStore.subscribe(
      (state) => state.gridVisible,
      () => renderGrid(),
    );
    return unsub;
  }, [renderGrid]);

  // ─── Apply viewport transforms ─────────────────────────
  useEffect(() => {
    const unsub = useEditorStore.subscribe(
      (state) => state.viewport,
      (viewport) => {
        const app = appRef.current;
        if (!app) return;
        app.stage.position.set(viewport.x, viewport.y);
        app.stage.scale.set(viewport.zoom);
      },
    );
    return unsub;
  }, []);

  // ─── Mouse Event Handlers ──────────────────────────────
  const getTileCoords = useCallback((e: React.MouseEvent) => {
    const state = useEditorStore.getState();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const worldX = (e.clientX - rect.left - state.viewport.x) / state.viewport.zoom;
    const worldY = (e.clientY - rect.top - state.viewport.y) / state.viewport.zoom;
    const tileX = Math.floor(worldX / state.tileSize);
    const tileY = Math.floor(worldY / state.tileSize);
    if (tileX < 0 || tileX >= state.mapWidth || tileY < 0 || tileY >= state.mapHeight) return null;
    return { x: tileX, y: tileY };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const state = useEditorStore.getState();

    // Middle click or space + click = pan
    if (e.button === 1) {
      isPanningRef.current = true;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      return;
    }

    if (e.button !== 0) return;

    const coords = getTileCoords(e);
    if (!coords) return;

    if (state.activeTool === "terrain") {
      isPaintingRef.current = true;
      state.paintTerrain(coords.x, coords.y);
    } else if (state.activeTool === "eraser") {
      isPaintingRef.current = true;
      state.eraseTerrain(coords.x, coords.y);
    } else if (state.activeTool === "cursor") {
      const tile = state.layers.terrain.tiles[coords.y]?.[coords.x];
      if (tile) {
        state.setSelection({
          type: "tile",
          id: `${coords.x},${coords.y}`,
          x: coords.x,
          y: coords.y,
        });
      } else {
        state.setSelection(null);
      }
    } else if (state.activeTool === "fog") {
      state.toggleFogTile(coords.x, coords.y);
    }
  }, [getTileCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastPanRef.current.x;
      const dy = e.clientY - lastPanRef.current.y;
      lastPanRef.current = { x: e.clientX, y: e.clientY };
      const state = useEditorStore.getState();
      state.setViewport({
        x: state.viewport.x + dx,
        y: state.viewport.y + dy,
      });
      return;
    }

    if (!isPaintingRef.current) return;

    const coords = getTileCoords(e);
    if (!coords) return;

    const state = useEditorStore.getState();
    if (state.activeTool === "terrain") {
      state.paintTerrain(coords.x, coords.y);
    } else if (state.activeTool === "eraser") {
      state.eraseTerrain(coords.x, coords.y);
    }
  }, [getTileCoords]);

  const handleMouseUp = useCallback(() => {
    isPaintingRef.current = false;
    isPanningRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const state = useEditorStore.getState();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.25, Math.min(4, state.viewport.zoom * delta));

    // Zoom towards cursor position
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - state.viewport.x) * (newZoom / state.viewport.zoom);
    const newY = mouseY - (mouseY - state.viewport.y) * (newZoom / state.viewport.zoom);

    state.setViewport({ x: newX, y: newY, zoom: newZoom });
  }, []);

  // ─── Context menu (right click = erase) ─────────────────
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const state = useEditorStore.getState();
    if (state.activeTool === "terrain") {
      const coords = getTileCoords(e);
      if (coords) {
        state.eraseTerrain(coords.x, coords.y);
      }
    }
  }, [getTileCoords]);

  return (
    <div
      ref={canvasRef}
      className="flex-1 cursor-crosshair overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    />
  );
}
