import { TERRAIN_CATALOG } from "./terrain-catalog";
import { parseWallKey } from "./wall-helpers";
import type { WallSaveData, MapObjectSaveData } from "./map-types";

const THUMB_SIZE = 200;
const THUMB_PAD = 10;

/** Parse an rgba() color string and return it with boosted alpha for thumbnails. */
function boostAlpha(color: string, minAlpha = 0.7): string {
  const match = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
  );
  if (!match) return color;
  const [, r, g, b, a] = match;
  const alpha = Math.max(Number(a ?? 1), minAlpha);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Generate a 200x200 thumbnail of a map as a base64 data URL. */
export function generateMapThumbnail(map: {
  width: number;
  height: number;
  terrain: Record<string, string>;
  walls: Record<string, WallSaveData>;
  objects: MapObjectSaveData[];
}): string {
  const canvas = document.createElement("canvas");
  canvas.width = THUMB_SIZE;
  canvas.height = THUMB_SIZE;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#0D0D12";
  ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);

  // Calculate cell size to fit within padding
  const usable = THUMB_SIZE - THUMB_PAD * 2;
  const cellPx = Math.min(usable / map.width, usable / map.height);
  const offsetX = (THUMB_SIZE - map.width * cellPx) / 2;
  const offsetY = (THUMB_SIZE - map.height * cellPx) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);

  // Draw terrain cells
  for (const [key, terrainType] of Object.entries(map.terrain)) {
    const [x, y] = key.split(",").map(Number);
    const info = TERRAIN_CATALOG[terrainType];
    ctx.fillStyle = info ? boostAlpha(info.color) : "rgba(60,60,70,0.7)";
    ctx.fillRect(x * cellPx, y * cellPx, cellPx, cellPx);
  }

  // Draw walls
  const wallLineWidth = Math.max(1, cellPx * 0.08);
  for (const [key, wall] of Object.entries(map.walls)) {
    if (wall.type === "door-open") continue;

    const isDoor = wall.type.startsWith("door");
    ctx.strokeStyle = isDoor ? "#C8A050" : "#888888";
    ctx.lineWidth = wallLineWidth;
    ctx.beginPath();

    const { x1, y1, x2, y2 } = parseWallKey(key);
    if (x1 === x2) {
      // Horizontal wall (same column, adjacent rows)
      const edgeY = Math.max(y1, y2) * cellPx;
      ctx.moveTo(x1 * cellPx, edgeY);
      ctx.lineTo((x1 + 1) * cellPx, edgeY);
    } else {
      // Vertical wall (same row, adjacent columns)
      const edgeX = Math.max(x1, x2) * cellPx;
      ctx.moveTo(edgeX, y1 * cellPx);
      ctx.lineTo(edgeX, (y1 + 1) * cellPx);
    }
    ctx.stroke();
  }

  // Draw objects as small dots
  if (cellPx >= 3) {
    const dotR = Math.max(1, cellPx * 0.2);
    ctx.fillStyle = "#FDCB6E";
    for (const obj of map.objects) {
      ctx.beginPath();
      ctx.arc(
        (obj.x + 0.5) * cellPx,
        (obj.y + 0.5) * cellPx,
        dotR,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  ctx.restore();

  // Border
  ctx.strokeStyle = "#1E1E2A";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, THUMB_SIZE - 2, THUMB_SIZE - 2);

  return canvas.toDataURL("image/png", 0.7);
}
