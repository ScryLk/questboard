"use client";

import { useEffect, useRef, useCallback } from "react";
import { Application, Graphics, Texture, Matrix } from "pixi.js";
import type { TerrainCell } from "@/lib/gameplay-mock-data";
import { getTerrainCanvas } from "@/lib/terrain-texture-generator";

interface PixiTerrainLayerProps {
  cells: TerrainCell[];
  scaledCell: number;
  gridCols: number;
  gridRows: number;
}

// Cache PIXI.Texture instances (keyed by terrain type)
const pixiTextureCache = new Map<string, Texture>();

function getPixiTexture(terrainType: string): Texture | null {
  if (pixiTextureCache.has(terrainType)) {
    return pixiTextureCache.get(terrainType)!;
  }

  const canvas = getTerrainCanvas(terrainType);
  if (!canvas) return null;

  const texture = Texture.from(canvas);
  pixiTextureCache.set(terrainType, texture);
  return texture;
}

export function PixiTerrainLayer({
  cells,
  scaledCell,
  gridCols,
  gridRows,
}: PixiTerrainLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const readyRef = useRef(false);

  const canvasW = gridCols * scaledCell;
  const canvasH = gridRows * scaledCell;

  // Initialize Pixi Application
  useEffect(() => {
    // Local flag — see pixi-canvas.tsx for why this can't be a ref.
    let destroyed = false;

    const app = new Application();
    appRef.current = app;
    readyRef.current = false;

    app
      .init({
        width: canvasW,
        height: canvasH,
        backgroundAlpha: 0,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })
      .then(() => {
        // If cleanup already ran while init was in-flight, destroy now
        if (destroyed) {
          app.destroy(true, { children: true });
          return;
        }
        if (!containerRef.current) return;
        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";
        containerRef.current.appendChild(canvas);
        readyRef.current = true;
      });

    return () => {
      destroyed = true;
      if (readyRef.current) {
        app.destroy(true, { children: true });
      }
      appRef.current = null;
      readyRef.current = false;
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw terrain when cells, scaledCell, or grid dimensions change
  const redraw = useCallback(() => {
    const app = appRef.current;
    if (!app || !readyRef.current) return;

    // Resize renderer if needed
    const w = gridCols * scaledCell;
    const h = gridRows * scaledCell;
    app.renderer.resize(w, h);

    // Clear stage
    app.stage.removeChildren();

    if (cells.length === 0) return;

    // Group cells by terrain type
    const cellsByType = new Map<string, { x: number; y: number }[]>();
    for (const cell of cells) {
      const list = cellsByType.get(cell.type);
      if (list) {
        list.push({ x: cell.x, y: cell.y });
      } else {
        cellsByType.set(cell.type, [{ x: cell.x, y: cell.y }]);
      }
    }

    // Render each terrain type as a Graphics object with texture fill
    cellsByType.forEach((positions, terrainType) => {
      const texture = getPixiTexture(terrainType);
      if (!texture) return;

      const graphics = new Graphics();

      for (const { x, y } of positions) {
        const px = x * scaledCell;
        const py = y * scaledCell;

        // Create matrix to offset texture tiling per cell
        const matrix = new Matrix();
        matrix.scale(scaledCell / 256, scaledCell / 256);
        matrix.translate(px, py);

        graphics.rect(px, py, scaledCell, scaledCell).fill({
          texture,
          matrix,
        });
      }

      app.stage.addChild(graphics);
    });
  }, [cells, scaledCell, gridCols, gridRows]);

  useEffect(() => {
    // Small delay to ensure app is initialized
    const timer = setTimeout(redraw, 100);
    return () => clearTimeout(timer);
  }, [redraw]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      style={{ width: canvasW, height: canvasH }}
    />
  );
}
