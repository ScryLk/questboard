import { Container } from "pixi.js";
import { MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM, CELL_SIZE } from "./constants";

export interface CameraState {
  panX: number;
  panY: number;
  zoom: number;
}

export class Camera {
  private worldContainer: Container;
  private state: CameraState;
  private canvasWidth: number;
  private canvasHeight: number;
  private animFrameId: number | null = null;

  constructor(
    worldContainer: Container,
    canvasWidth: number,
    canvasHeight: number,
  ) {
    this.worldContainer = worldContainer;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.state = { panX: 0, panY: 0, zoom: DEFAULT_ZOOM };
    this.apply();
  }

  // ═══ APLICAR ESTADO DA CÂMERA NO PIXI ═══
  private apply() {
    // SOMENTE o worldContainer é afetado
    this.worldContainer.scale.set(this.state.zoom);
    this.worldContainer.position.set(this.state.panX, this.state.panY);
  }

  // ═══ ZOOM ═══
  setZoom(zoom: number, centerX?: number, centerY?: number) {
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

    if (centerX !== undefined && centerY !== undefined) {
      // Zoom centrado no ponto do mouse/touch
      const worldX = (centerX - this.state.panX) / this.state.zoom;
      const worldY = (centerY - this.state.panY) / this.state.zoom;

      this.state.zoom = newZoom;
      this.state.panX = centerX - worldX * newZoom;
      this.state.panY = centerY - worldY * newZoom;
    } else {
      // Zoom centrado no meio do canvas
      const cx = this.canvasWidth / 2;
      const cy = this.canvasHeight / 2;
      const worldX = (cx - this.state.panX) / this.state.zoom;
      const worldY = (cy - this.state.panY) / this.state.zoom;

      this.state.zoom = newZoom;
      this.state.panX = cx - worldX * newZoom;
      this.state.panY = cy - worldY * newZoom;
    }

    this.apply();
  }

  zoomIn(factor = 1.15, centerX?: number, centerY?: number) {
    this.setZoom(this.state.zoom * factor, centerX, centerY);
  }

  zoomOut(factor = 1.15, centerX?: number, centerY?: number) {
    this.setZoom(this.state.zoom / factor, centerX, centerY);
  }

  // ═══ PAN ═══
  pan(deltaX: number, deltaY: number) {
    this.state.panX += deltaX;
    this.state.panY += deltaY;
    this.apply();
  }

  panTo(worldX: number, worldY: number, animated = false) {
    const targetPanX = this.canvasWidth / 2 - worldX * this.state.zoom;
    const targetPanY = this.canvasHeight / 2 - worldY * this.state.zoom;

    if (animated) {
      this.animatePan(targetPanX, targetPanY, 400);
    } else {
      this.state.panX = targetPanX;
      this.state.panY = targetPanY;
      this.apply();
    }
  }

  private animatePan(targetX: number, targetY: number, duration: number) {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    const startX = this.state.panX;
    const startY = this.state.panY;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      this.state.panX = startX + (targetX - startX) * eased;
      this.state.panY = startY + (targetY - startY) * eased;
      this.apply();

      if (progress < 1) {
        this.animFrameId = requestAnimationFrame(animate);
      } else {
        this.animFrameId = null;
      }
    };
    this.animFrameId = requestAnimationFrame(animate);
  }

  // Centralizar no token
  centerOnCell(cellX: number, cellY: number, animated = false) {
    const worldX = cellX * CELL_SIZE + CELL_SIZE / 2;
    const worldY = cellY * CELL_SIZE + CELL_SIZE / 2;
    this.panTo(worldX, worldY, animated);
  }

  reset() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.state = { panX: 0, panY: 0, zoom: DEFAULT_ZOOM };
    this.apply();
  }

  // ═══ CONVERSÕES ═══

  // Tela (pixel do canvas) → World (pixel do mundo)
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.state.panX) / this.state.zoom,
      y: (screenY - this.state.panY) / this.state.zoom,
    };
  }

  // Tela → Célula do grid
  screenToCell(screenX: number, screenY: number): { x: number; y: number } {
    const world = this.screenToWorld(screenX, screenY);
    return {
      x: Math.floor(world.x / CELL_SIZE),
      y: Math.floor(world.y / CELL_SIZE),
    };
  }

  // World → Tela
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.state.zoom + this.state.panX,
      y: worldY * this.state.zoom + this.state.panY,
    };
  }

  // Célula → World
  cellToWorld(cellX: number, cellY: number): { x: number; y: number } {
    return {
      x: cellX * CELL_SIZE,
      y: cellY * CELL_SIZE,
    };
  }

  // Atualizar dimensões do canvas (no resize da janela)
  updateCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    // NÃO recalcular cellSize, NÃO redesenhar grid
  }

  getState(): CameraState {
    return { ...this.state };
  }

  getZoom(): number {
    return this.state.zoom;
  }

  destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
