"use client";

import { useEffect, useRef, useCallback } from "react";
import { Application, Container } from "pixi.js";
import { drawGrid } from "@/lib/gameplay/gridRenderer";
import { CELL_SIZE } from "@/lib/gameplay/constants";
import { useCameraStore } from "@/lib/camera-store";
import {
  CombatAnimationEngine,
  setCombatEngine,
  getCombatEngine,
} from "@/lib/animation/combat-animation-engine";
import { COMBAT_ANIMATION_REGISTRY } from "@/lib/animation/combat-animation-registry";
import type { AnimationSettings, AnimationType } from "@/lib/animation/combat-animation-types";
import { useSettingsStore } from "@/lib/settings-store";
import { useGameplayStore } from "@/lib/gameplay-store";

interface PixiCanvasProps {
  gridCols: number;
  gridRows: number;
  gridVisible: boolean;
  gridOpacity: number;
}

export function PixiCanvas({ gridCols, gridRows, gridVisible, gridOpacity }: PixiCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const worldContainerRef = useRef<Container | null>(null);
    const gridLayerRef = useRef<Container | null>(null);
    const combatLayerRef = useRef<Container | null>(null);
    const engineRef = useRef<CombatAnimationEngine | null>(null);
    const readyRef = useRef(false);
    const destroyedRef = useRef(false);

    // Settings para combat engine
    const appearance = useSettingsStore((s) => s.appearance);
    const accessibility = useSettingsStore((s) => s.accessibility);
    const perf = useSettingsStore((s) => s.performance);

    const getAnimSettings = useCallback((): AnimationSettings => ({
      enabled: appearance.enableAnimations,
      particles: appearance.enableParticles && !accessibility.disableParticles,
      reducedMotion: appearance.reducedMotion || accessibility.reducedMotion,
      noFlash: accessibility.disableFlash,
      noShake: accessibility.disableScreenShake,
      particleLimit: perf.particleLimit,
      batterySaver: perf.batterySaverMode,
    }), [appearance, accessibility, perf]);

    // ─── Inicializar Application ÚNICO ───
    useEffect(() => {
      if (!containerRef.current) return;

      const app = new Application();
      appRef.current = app;
      readyRef.current = false;
      destroyedRef.current = false;

      const container = containerRef.current;

      app.init({
        resizeTo: container,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      }).then(() => {
        if (destroyedRef.current) {
          app.destroy(true, { children: true });
          return;
        }
        if (!container) return;

        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.pointerEvents = "none";
        container.appendChild(canvas);

        // ─── World Container (recebe pan/zoom) ───
        const worldContainer = new Container();
        worldContainer.sortableChildren = true;
        app.stage.addChild(worldContainer);
        worldContainerRef.current = worldContainer;

        // ─── Grid Layer ───
        const gridLayer = new Container();
        gridLayer.zIndex = 0;
        worldContainer.addChild(gridLayer);
        gridLayerRef.current = gridLayer;

        drawGrid(gridLayer, gridCols, gridRows, CELL_SIZE);
        gridLayer.visible = gridVisible;
        gridLayer.alpha = gridOpacity;

        // ─── Combat Layer ───
        const combatLayer = new Container();
        combatLayer.zIndex = 10;
        worldContainer.addChild(combatLayer);
        combatLayerRef.current = combatLayer;

        // ─── Combat Animation Engine ───
        const engine = new CombatAnimationEngine(combatLayer);
        engine.setScale(CELL_SIZE);
        engine.updateSettings(getAnimSettings());
        engineRef.current = engine;
        setCombatEngine(engine);

        // Dev helper
        if (process.env.NODE_ENV === "development") {
          const w = window as unknown as Record<string, unknown>;
          const testAnim = (type: AnimationType = "sword_slash", hit = true, crit = false) => {
            const eng = getCombatEngine();
            if (!eng) { console.warn("Engine not ready"); return; }
            const tokens = useGameplayStore.getState().tokens;
            if (tokens.length < 2) { console.warn("Need 2+ tokens on map"); return; }
            const [a, b] = tokens;
            const positions = new Map(tokens.map((t) => [t.id, { x: t.x, y: t.y, size: t.size }]));
            console.log(`Playing: ${type} (${hit ? (crit ? "CRIT" : "hit") : "miss"})`);
            return eng.play({ animationType: type, attackerTokenId: a.id, targetTokenId: b.id, isHit: hit, isCrit: crit, damageTotal: hit ? 12 : 0, damageType: "slashing" }, positions);
          };
          w.__testAnim = testAnim;
          w.__testAllAnims = async () => {
            for (const type of Object.keys(COMBAT_ANIMATION_REGISTRY) as AnimationType[]) {
              console.log(`▶ ${type}`);
              await testAnim(type, true, false);
              await new Promise((r) => setTimeout(r, 1200));
            }
            console.log("All done");
          };
          console.log("Combat anims ready! Use __testAnim('sword_slash') or __testAllAnims()");
        }

        // ─── Aplicar estado inicial da câmera ───
        const { panX, panY, zoom } = useCameraStore.getState();
        worldContainer.position.set(panX, panY);
        worldContainer.scale.set(zoom);

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
        worldContainerRef.current = null;
        gridLayerRef.current = null;
        combatLayerRef.current = null;
        appRef.current = null;
        readyRef.current = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Sincronizar câmera com worldContainer ───
    useEffect(() => {
      const unsub = useCameraStore.subscribe((state) => {
        const wc = worldContainerRef.current;
        if (!wc) return;
        wc.position.set(state.panX, state.panY);
        wc.scale.set(state.zoom);
      });
      return unsub;
    }, []);

    // ─── Grid visibilidade/opacidade ───
    useEffect(() => {
      const gl = gridLayerRef.current;
      if (!gl) return;
      gl.visible = gridVisible;
      gl.alpha = gridOpacity;
    }, [gridVisible, gridOpacity]);

    // ─── Redesenhar grid se dimensões mudarem ───
    useEffect(() => {
      const gl = gridLayerRef.current;
      if (!gl || !readyRef.current) return;
      gl.removeChildren();
      drawGrid(gl, gridCols, gridRows, CELL_SIZE);
    }, [gridCols, gridRows]);

    // ─── Atualizar settings do engine ───
    useEffect(() => {
      engineRef.current?.updateSettings(getAnimSettings());
    }, [getAnimSettings]);

    return (
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 0 }}
      />
    );
}
