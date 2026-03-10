"use client";

import { useEffect, useRef, useCallback } from "react";
import { Application } from "pixi.js";
import {
  CombatAnimationEngine,
  setCombatEngine,
  getCombatEngine,
} from "@/lib/animation/combat-animation-engine";
import { COMBAT_ANIMATION_REGISTRY } from "@/lib/animation/combat-animation-registry";
import type { AnimationSettings, AnimationType } from "@/lib/animation/combat-animation-types";
import { useSettingsStore } from "@/lib/settings-store";
import { useGameplayStore } from "@/lib/gameplay-store";

interface PixiCombatLayerProps {
  scaledCell: number;
  gridCols: number;
  gridRows: number;
}

export function PixiCombatLayer({
  scaledCell,
  gridCols,
  gridRows,
}: PixiCombatLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const engineRef = useRef<CombatAnimationEngine | null>(null);
  const readyRef = useRef(false);
  const destroyedRef = useRef(false);

  const canvasW = gridCols * scaledCell;
  const canvasH = gridRows * scaledCell;

  // Read settings
  const appearance = useSettingsStore((s) => s.appearance);
  const accessibility = useSettingsStore((s) => s.accessibility);
  const performance = useSettingsStore((s) => s.performance);

  const getAnimSettings = useCallback((): AnimationSettings => {
    return {
      enabled: appearance.enableAnimations,
      particles: appearance.enableParticles && !accessibility.disableParticles,
      reducedMotion: appearance.reducedMotion || accessibility.reducedMotion,
      noFlash: accessibility.disableFlash,
      noShake: accessibility.disableScreenShake,
      particleLimit: performance.particleLimit,
      batterySaver: performance.batterySaverMode,
    };
  }, [appearance, accessibility, performance]);

  // Initialize Pixi Application
  useEffect(() => {
    const app = new Application();
    appRef.current = app;
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

        // Create engine
        const engine = new CombatAnimationEngine(app.stage);
        engine.setScale(scaledCell);
        engine.updateSettings(getAnimSettings());
        engineRef.current = engine;
        setCombatEngine(engine);

        // Dev helper: expose test function on window
        if (process.env.NODE_ENV === "development") {
          const w = window as unknown as Record<string, unknown>;
          const testAnim = (
            type: AnimationType = "sword_slash",
            hit = true,
            crit = false,
          ) => {
            const eng = getCombatEngine();
            if (!eng) { console.warn("Engine not ready"); return; }
            const tokens = useGameplayStore.getState().tokens;
            if (tokens.length < 2) { console.warn("Need 2+ tokens on map"); return; }
            const [a, b] = tokens;
            const positions = new Map(
              tokens.map((t) => [t.id, { x: t.x, y: t.y, size: t.size }]),
            );
            console.log(`Playing: ${type} (${hit ? (crit ? "CRIT" : "hit") : "miss"})`);
            return eng.play(
              {
                animationType: type,
                attackerTokenId: a.id,
                targetTokenId: b.id,
                isHit: hit,
                isCrit: crit,
                damageTotal: hit ? 12 : 0,
                damageType: "slashing",
              },
              positions,
            );
          };
          w.__testAnim = testAnim;
          w.__testAllAnims = async () => {
            const types = Object.keys(COMBAT_ANIMATION_REGISTRY) as AnimationType[];
            for (const type of types) {
              console.log(`▶ ${type}`);
              await testAnim(type, true, false);
              await new Promise((r) => setTimeout(r, 1200));
            }
            console.log("All done");
          };
          console.log("Combat anims ready! Use __testAnim('sword_slash') or __testAllAnims()");
        }

        readyRef.current = true;
      });

    return () => {
      destroyedRef.current = true;
      if (engineRef.current) {
        engineRef.current.destroy();
        setCombatEngine(null);
        engineRef.current = null;
      }
      if (readyRef.current) {
        app.destroy(true, { children: true });
      }
      appRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update scale
  useEffect(() => {
    if (!readyRef.current || !appRef.current) return;
    appRef.current.renderer.resize(canvasW, canvasH);
    engineRef.current?.setScale(scaledCell);
  }, [scaledCell, canvasW, canvasH]);

  // Update settings
  useEffect(() => {
    engineRef.current?.updateSettings(getAnimSettings());
  }, [getAnimSettings]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: canvasW,
        height: canvasH,
        zIndex: 50,
        pointerEvents: "none",
      }}
    />
  );
}
