import { create } from "zustand";
import { CELL_SIZE, MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM } from "./gameplay/constants";
import { getZoomInLevel, getZoomOutLevel } from "./map-scale";

export interface CameraState {
  panX: number;
  panY: number;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface CameraStore extends CameraState {
  // Ações
  pan: (dx: number, dy: number) => void;
  setPan: (x: number, y: number) => void;
  zoomAt: (newZoom: number, screenX?: number, screenY?: number) => void;
  zoomIn: (factor?: number, screenX?: number, screenY?: number) => void;
  zoomOut: (factor?: number, screenX?: number, screenY?: number) => void;
  centerOnCell: (cellX: number, cellY: number) => void;
  reset: () => void;
  setViewportSize: (w: number, h: number) => void;

  // Conversões
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  screenToCell: (screenX: number, screenY: number) => { x: number; y: number };
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
  getVisibleWorldRect: () => { left: number; top: number; right: number; bottom: number };
}

// Animação de pan/zoom (fora do store para evitar re-renders)
let animFrameId: number | null = null;
let zoomAnimFrameId: number | null = null;
/** Flag pra wheel handler não bater enquanto animação de zoom roda. */
let zoomAnimating = false;

/** Consultado pelo wheel handler pra debounce. */
export function isZoomAnimating(): boolean {
  return zoomAnimating;
}

function cancelZoomAnim() {
  if (zoomAnimFrameId !== null) {
    cancelAnimationFrame(zoomAnimFrameId);
    zoomAnimFrameId = null;
  }
  zoomAnimating = false;
}

export const useCameraStore = create<CameraStore>((set, get) => ({
  panX: 0,
  panY: 0,
  zoom: DEFAULT_ZOOM,
  viewportWidth: 800,
  viewportHeight: 600,

  pan: (dx, dy) => {
    set((s) => ({ panX: s.panX + dx, panY: s.panY + dy }));
  },

  setPan: (x, y) => {
    set({ panX: x, panY: y });
  },

  zoomAt: (newZoom, screenX, screenY) => {
    // Snap pro nível discreto mais próximo, clampa pela constante geral.
    const raw = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    // Animação de 200ms easeOutCubic pro novo nível (pan correspondente
    // pra manter o ponto sob o cursor fixo).
    cancelZoomAnim();

    const s = get();
    const cx = screenX ?? s.viewportWidth / 2;
    const cy = screenY ?? s.viewportHeight / 2;
    const worldX = (cx - s.panX) / s.zoom;
    const worldY = (cy - s.panY) / s.zoom;
    const targetPanX = cx - worldX * raw;
    const targetPanY = cy - worldY * raw;

    const startZoom = s.zoom;
    const startPanX = s.panX;
    const startPanY = s.panY;
    const startTime = performance.now();
    const duration = 200;
    zoomAnimating = true;

    const step = () => {
      const elapsed = performance.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      set({
        zoom: startZoom + (raw - startZoom) * eased,
        panX: startPanX + (targetPanX - startPanX) * eased,
        panY: startPanY + (targetPanY - startPanY) * eased,
      });
      if (p < 1) {
        zoomAnimFrameId = requestAnimationFrame(step);
      } else {
        zoomAnimFrameId = null;
        zoomAnimating = false;
      }
    };
    zoomAnimFrameId = requestAnimationFrame(step);
  },

  // `factor` é ignorado — zoom agora é discreto (snap pros níveis fixos).
  // Assinatura preservada pra não quebrar callsites existentes.
  zoomIn: (_factor = 1.15, screenX, screenY) => {
    const target = getZoomInLevel(get().zoom);
    get().zoomAt(target, screenX, screenY);
  },

  zoomOut: (_factor = 1.15, screenX, screenY) => {
    const target = getZoomOutLevel(get().zoom);
    get().zoomAt(target, screenX, screenY);
  },

  centerOnCell: (cellX, cellY) => {
    const s = get();
    const worldX = cellX * CELL_SIZE + CELL_SIZE / 2;
    const worldY = cellY * CELL_SIZE + CELL_SIZE / 2;
    const targetPanX = s.viewportWidth / 2 - worldX * s.zoom;
    const targetPanY = s.viewportHeight / 2 - worldY * s.zoom;

    // Animação easeOutCubic
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);

    const startX = s.panX;
    const startY = s.panY;
    const startTime = performance.now();
    const duration = 400;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      set({
        panX: startX + (targetPanX - startX) * eased,
        panY: startY + (targetPanY - startY) * eased,
      });

      if (progress < 1) {
        animFrameId = requestAnimationFrame(animate);
      } else {
        animFrameId = null;
      }
    };
    animFrameId = requestAnimationFrame(animate);
  },

  reset: () => {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    set({ panX: 0, panY: 0, zoom: DEFAULT_ZOOM });
  },

  setViewportSize: (w, h) => {
    set({ viewportWidth: w, viewportHeight: h });
  },

  // Conversões (usam getState para evitar stale closures)
  screenToWorld: (screenX, screenY) => {
    const { panX, panY, zoom } = get();
    return {
      x: (screenX - panX) / zoom,
      y: (screenY - panY) / zoom,
    };
  },

  screenToCell: (screenX, screenY) => {
    const world = get().screenToWorld(screenX, screenY);
    return {
      x: Math.floor(world.x / CELL_SIZE),
      y: Math.floor(world.y / CELL_SIZE),
    };
  },

  worldToScreen: (worldX, worldY) => {
    const { panX, panY, zoom } = get();
    return {
      x: worldX * zoom + panX,
      y: worldY * zoom + panY,
    };
  },

  getVisibleWorldRect: () => {
    const { panX, panY, zoom, viewportWidth, viewportHeight } = get();
    const invZoom = 1 / zoom;
    return {
      left: -panX * invZoom,
      top: -panY * invZoom,
      right: (-panX + viewportWidth) * invZoom,
      bottom: (-panY + viewportHeight) * invZoom,
    };
  },
}));
