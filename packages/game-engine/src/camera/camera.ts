/**
 * Camera system for map viewport management.
 */

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  following: string | null;
}

export interface CameraConstraints {
  minZoom: number;
  maxZoom: number;
  boundsX: [number, number];
  boundsY: [number, number];
  restrictToExplored: boolean;
}

/**
 * Update camera position with smooth lerp following.
 */
export function updateCameraFollow(
  camera: CameraState,
  targetPos: { x: number; y: number },
  smoothing: number,
  deltaTime: number
): CameraState {
  if (smoothing <= 0) {
    return { ...camera, x: targetPos.x, y: targetPos.y };
  }

  const lerpFactor = 1 - Math.pow(smoothing, deltaTime * 60);
  const newX = camera.x + (targetPos.x - camera.x) * lerpFactor;
  const newY = camera.y + (targetPos.y - camera.y) * lerpFactor;

  return { ...camera, x: newX, y: newY };
}

/**
 * Convert screen coordinates to world-space coordinates.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: CameraState,
  canvasSize: { width: number; height: number }
): { worldX: number; worldY: number; cellX: number; cellY: number } {
  const halfW = canvasSize.width / 2;
  const halfH = canvasSize.height / 2;

  const worldX = (screenX - halfW) / camera.zoom + camera.x;
  const worldY = (screenY - halfH) / camera.zoom + camera.y;

  return {
    worldX,
    worldY,
    cellX: Math.floor(worldX),
    cellY: Math.floor(worldY),
  };
}

/**
 * Convert world-space coordinates to screen coordinates.
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: CameraState,
  canvasSize: { width: number; height: number }
): { screenX: number; screenY: number } {
  const halfW = canvasSize.width / 2;
  const halfH = canvasSize.height / 2;

  const screenX = (worldX - camera.x) * camera.zoom + halfW;
  const screenY = (worldY - camera.y) * camera.zoom + halfH;

  return { screenX, screenY };
}

/**
 * Clamp camera position within bounds.
 */
export function clampCamera(
  camera: CameraState,
  constraints: CameraConstraints
): CameraState {
  return {
    ...camera,
    x: Math.max(constraints.boundsX[0], Math.min(constraints.boundsX[1], camera.x)),
    y: Math.max(constraints.boundsY[0], Math.min(constraints.boundsY[1], camera.y)),
    zoom: Math.max(constraints.minZoom, Math.min(constraints.maxZoom, camera.zoom)),
  };
}
