"use client";

import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";
import { CELL_SIZE } from "@/lib/gameplay/constants";

interface PixiGridLayerProps {
  gridCols: number;
  gridRows: number;
  opacity?: number;
}

/**
 * GPU-rendered grid using Pixi.js.
 * The grid is drawn ONCE on init and NEVER redrawn.
 * CELL_SIZE is fixed (64px) and immutable.
 * No scale, no transform, no resize during gameplay.
 */
export function PixiGridLayer({ gridCols, gridRows, opacity = 1 }: PixiGridLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const destroyedRef = useRef(false);

  const canvasW = gridCols * CELL_SIZE;
  const canvasH = gridRows * CELL_SIZE;

  useEffect(() => {
    const app = new Application();
    readyRef.current = false;
    destroyedRef.current = false;

    app
      .init({
        width: canvasW,
        height: canvasH,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })
      .then(() => {
        if (destroyedRef.current) {
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

        // ═══ DRAW GRID ONCE — NEVER REDRAW ═══
        const g = new Graphics();
        g.setStrokeStyle({ width: 1, color: 0xffffff, alpha: 0.08 });

        const totalW = gridCols * CELL_SIZE;
        const totalH = gridRows * CELL_SIZE;

        for (let x = 0; x <= gridCols; x++) {
          g.moveTo(x * CELL_SIZE, 0);
          g.lineTo(x * CELL_SIZE, totalH);
        }
        for (let y = 0; y <= gridRows; y++) {
          g.moveTo(0, y * CELL_SIZE);
          g.lineTo(totalW, y * CELL_SIZE);
        }
        g.stroke();
        app.stage.addChild(g);

        readyRef.current = true;
      });

    return () => {
      destroyedRef.current = true;
      if (readyRef.current) {
        app.destroy(true, { children: true });
      }
      readyRef.current = false;
    };
    // Grid constants never change — only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      style={{ width: canvasW, height: canvasH, opacity }}
    />
  );
}
