import type { Camera } from "./camera";
import { CELL_SIZE } from "./constants";

/**
 * Input handler para zoom/pan no canvas.
 * Wheel → zoom centrado no mouse.
 * Middle mouse button → pan.
 * Space + drag → pan (alternativa).
 */
export class InputHandler {
  private camera: Camera;
  private canvas: HTMLCanvasElement;
  private isPanning = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private spaceHeld = false;

  // Event handlers bound to this (for cleanup)
  private handleWheel: (e: WheelEvent) => void;
  private handleMouseDown: (e: MouseEvent) => void;
  private handleMouseMove: (e: MouseEvent) => void;
  private handleMouseUp: (e: MouseEvent) => void;
  private handleKeyDown: (e: KeyboardEvent) => void;
  private handleKeyUp: (e: KeyboardEvent) => void;

  // Callback for when the user clicks a cell (for other handlers to consume)
  onCellClick: ((cellX: number, cellY: number, event: MouseEvent) => void) | null = null;

  constructor(camera: Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;

    this.handleWheel = this._onWheel.bind(this);
    this.handleMouseDown = this._onMouseDown.bind(this);
    this.handleMouseMove = this._onMouseMove.bind(this);
    this.handleMouseUp = this._onMouseUp.bind(this);
    this.handleKeyDown = this._onKeyDown.bind(this);
    this.handleKeyUp = this._onKeyUp.bind(this);

    this.setupEvents();
  }

  private setupEvents() {
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private _onWheel(e: WheelEvent) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.deltaY < 0) {
      this.camera.zoomIn(1.1, mouseX, mouseY);
    } else {
      this.camera.zoomOut(1.1, mouseX, mouseY);
    }
  }

  private _onMouseDown(e: MouseEvent) {
    // Middle button OR space+left click → pan
    if (e.button === 1 || (e.button === 0 && this.spaceHeld)) {
      e.preventDefault();
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  private _onMouseMove(e: MouseEvent) {
    if (this.isPanning) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.camera.pan(dx, dy);
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  private _onMouseUp(e: MouseEvent) {
    if (e.button === 1 || e.button === 0) {
      this.isPanning = false;
    }
  }

  private _onKeyDown(e: KeyboardEvent) {
    if (e.code === "Space" && !e.repeat) {
      this.spaceHeld = true;
    }
    // +/= → zoom in
    if (e.key === "+" || e.key === "=") {
      this.camera.zoomIn();
    }
    // - → zoom out
    if (e.key === "-") {
      this.camera.zoomOut();
    }
    // Home → reset camera
    if (e.key === "Home") {
      this.camera.reset();
    }
  }

  private _onKeyUp(e: KeyboardEvent) {
    if (e.code === "Space") {
      this.spaceHeld = false;
      this.isPanning = false;
    }
  }

  /**
   * Convert screen coordinates to cell coordinates.
   */
  screenToCell(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const localX = screenX - rect.left;
    const localY = screenY - rect.top;
    return this.camera.screenToCell(localX, localY);
  }

  isSpaceHeld(): boolean {
    return this.spaceHeld;
  }

  destroy() {
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}
