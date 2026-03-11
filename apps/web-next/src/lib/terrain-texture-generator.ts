// ── Procedural Terrain Texture Generator ──
// Generates tileable textures via Canvas 2D API.
// Each terrain type has a generator function that draws onto a 256×256 canvas.
// Canvases are cached globally — generated once, reused everywhere.

const TEX_SIZE = 256;
const textureCache = new Map<string, HTMLCanvasElement>();

// ── Public API ──

export function getTerrainCanvas(terrainType: string): HTMLCanvasElement | null {
  if (textureCache.has(terrainType)) {
    return textureCache.get(terrainType)!;
  }

  const generator = TERRAIN_GENERATORS[terrainType];
  if (!generator) return null;

  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  generator(ctx, TEX_SIZE);
  textureCache.set(terrainType, canvas);
  return canvas;
}

export function hasProceduralTexture(terrainType: string): boolean {
  return terrainType in TERRAIN_GENERATORS;
}

export function clearTextureCache(): void {
  textureCache.clear();
}

// ── Utilities ──

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function addNoise(
  ctx: CanvasRenderingContext2D, size: number, intensity: number,
): void {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * intensity;
    data[i] = Math.max(0, Math.min(255, data[i]! + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1]! + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2]! + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

// ── 1. Stone Floor ──

function generateStoneFloor(ctx: CanvasRenderingContext2D, size: number): void {
  const groutColor = "#15151D";
  const stoneColors = ["#2E2E38", "#33333D", "#393942", "#2A2A34", "#353540"];
  const groutWidth = 2;
  const blockSize = size / 4;
  const rng = seededRandom(42);

  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, size, size);

  for (let row = -1; row <= 4; row++) {
    const rowOffset = row % 2 === 0 ? 0 : blockSize * 0.5;
    for (let col = -1; col <= 4; col++) {
      const bx = col * blockSize + rowOffset;
      const by = row * blockSize;
      const bw = blockSize - groutWidth + (rng() - 0.5) * blockSize * 0.15;
      const bh = blockSize - groutWidth + (rng() - 0.5) * blockSize * 0.1;

      ctx.fillStyle = stoneColors[Math.floor(rng() * stoneColors.length)]!;
      roundedRect(ctx, bx + groutWidth / 2, by + groutWidth / 2, bw, bh, 2);
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const nx = bx + rng() * bw;
        const ny = by + rng() * bh;
        const nr = 1 + rng() * 4;
        const na = 0.03 + rng() * 0.07;
        ctx.fillStyle = rng() > 0.5 ? `rgba(255,255,255,${na})` : `rgba(0,0,0,${na})`;
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  addNoise(ctx, size, 0.04);

  const crackRng = seededRandom(99);
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 2; i++) {
    const startX = crackRng() * size;
    const startY = crackRng() * size;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let seg = 0; seg < 4; seg++) {
      ctx.lineTo(startX + (crackRng() - 0.5) * 40, startY + seg * 15 + crackRng() * 10);
    }
    ctx.stroke();
  }
}

// ── 2. Wood Floor ──

function generateWoodFloor(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(101);
  const plankColors = ["#4A3222", "#523A28", "#5C4230", "#3E2B1C", "#6B4C35", "#4F3626"];
  const gapColor = "#1E1510";
  const numPlanks = 5;
  const plankHeight = size / numPlanks;
  const gapHeight = 1.5;

  ctx.fillStyle = gapColor;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < numPlanks; i++) {
    const py = i * plankHeight + gapHeight / 2;
    const ph = plankHeight - gapHeight;

    ctx.fillStyle = plankColors[Math.floor(rng() * plankColors.length)]!;
    ctx.fillRect(0, py, size, ph);

    for (let v = 0; v < 12; v++) {
      const vy = py + rng() * ph;
      const alpha = 0.03 + rng() * 0.06;
      ctx.strokeStyle = rng() > 0.5 ? `rgba(255,220,180,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.lineWidth = 0.5 + rng() * 1;
      ctx.beginPath();
      ctx.moveTo(0, vy);
      const midY = vy + (rng() - 0.5) * 3;
      ctx.quadraticCurveTo(size / 2, midY, size, vy + (rng() - 0.5) * 2);
      ctx.stroke();
    }

    if (rng() > 0.65) {
      const kx = 20 + rng() * (size - 40);
      const ky = py + ph * 0.3 + rng() * ph * 0.4;
      const kr = 3 + rng() * 5;
      ctx.fillStyle = "rgba(30,20,10,0.3)";
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr, kr * 0.7, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(60,40,20,0.2)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr + 2, kr * 0.7 + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (rng() > 0.4) {
      const jx = size * (0.3 + rng() * 0.4);
      ctx.strokeStyle = gapColor;
      ctx.lineWidth = gapHeight;
      ctx.beginPath();
      ctx.moveTo(jx, py);
      ctx.lineTo(jx + (rng() - 0.5) * 3, py + ph);
      ctx.stroke();
    }
  }

  addNoise(ctx, size, 0.025);
}

// ── 3. Grass ──

function generateGrass(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(202);

  ctx.fillStyle = "#2D5A27";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 15; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 20 + rng() * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    const shade = rng() > 0.5 ? "rgba(50,110,40," : "rgba(20,60,15,";
    gradient.addColorStop(0, shade + (0.1 + rng() * 0.15) + ")");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 300; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const h = 3 + rng() * 6;
    const angle = -0.3 + rng() * 0.6;
    const green = 80 + Math.floor(rng() * 80);
    const alpha = 0.15 + rng() * 0.25;
    ctx.strokeStyle = `rgba(${30 + Math.floor(rng() * 30)},${green},${20 + Math.floor(rng() * 20)},${alpha})`;
    ctx.lineWidth = 0.5 + rng() * 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angle) * h, y - h);
    ctx.stroke();
  }

  for (let i = 0; i < 20; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillStyle = `rgba(${180 + Math.floor(rng() * 75)},${200 + Math.floor(rng() * 55)},${80 + Math.floor(rng() * 40)},${0.1 + rng() * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + rng() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.03);
}

// ── 4. Dirt ──

function generateDirt(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(303);

  ctx.fillStyle = "#5C3D1E";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 20; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 15 + rng() * 35;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    const isDark = rng() > 0.5;
    gradient.addColorStop(0, isDark ? "rgba(40,25,10,0.2)" : "rgba(120,80,40,0.15)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 40; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rx = 1 + rng() * 3;
    const ry = rx * (0.6 + rng() * 0.4);
    const brightness = 60 + Math.floor(rng() * 50);
    ctx.fillStyle = `rgba(${brightness},${brightness - 10},${brightness - 20},${0.3 + rng() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 5; i++) {
    const sx = rng() * size;
    const sy = rng() * size;
    ctx.strokeStyle = `rgba(80,50,20,${0.1 + rng() * 0.15})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    for (let s = 0; s < 3; s++) {
      ctx.lineTo(sx + (rng() - 0.5) * 30, sy + (rng() - 0.5) * 30);
    }
    ctx.stroke();
  }

  addNoise(ctx, size, 0.05);
}

// ── 5. Sand ──

function generateSand(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(404);

  ctx.fillStyle = "#C2A645";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 20; i++) {
    const y = rng() * size;
    const alpha = 0.03 + rng() * 0.06;
    ctx.strokeStyle = rng() > 0.5 ? `rgba(210,185,100,${alpha})` : `rgba(150,120,50,${alpha})`;
    ctx.lineWidth = 1 + rng() * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < size; x += 20) {
      ctx.lineTo(x, y + Math.sin(x * 0.05 + rng() * 5) * (2 + rng() * 4));
    }
    ctx.stroke();
  }

  for (let i = 0; i < 100; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const brightness = 160 + Math.floor(rng() * 80);
    ctx.fillStyle = `rgba(${brightness},${brightness - 20},${brightness - 60},${0.1 + rng() * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.3 + rng() * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.04);
}

// ── 6. Cobblestone ──

function generateCobblestone(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(505);
  const groutColor = "#1A1A20";
  const stoneColors = ["#4A4A55", "#555562", "#3D3D48", "#5A5A65", "#484855"];

  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, size, size);

  const cols = 6;
  const rows = 6;
  const cellW = size / cols;
  const cellH = size / rows;

  for (let row = -1; row <= rows; row++) {
    for (let col = -1; col <= cols; col++) {
      const cx = col * cellW + cellW / 2 + (rng() - 0.5) * cellW * 0.3;
      const cy = row * cellH + cellH / 2 + (rng() - 0.5) * cellH * 0.3;
      const rx = cellW * 0.38 + (rng() - 0.5) * cellW * 0.12;
      const ry = cellH * 0.38 + (rng() - 0.5) * cellH * 0.12;
      const rotation = rng() * Math.PI;

      ctx.fillStyle = stoneColors[Math.floor(rng() * stoneColors.length)]!;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createRadialGradient(cx, cy - ry * 0.3, 0, cx, cy, Math.max(rx, ry));
      grad.addColorStop(0, "rgba(255,255,255,0.08)");
      grad.addColorStop(1, "rgba(0,0,0,0.05)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  addNoise(ctx, size, 0.03);
}

// ── 7. Cave Floor ──

function generateCaveFloor(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(606);

  ctx.fillStyle = "#1E1E26";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 25; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 10 + rng() * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = 25 + Math.floor(rng() * 30);
    gradient.addColorStop(0, `rgba(${tone},${tone},${tone + 5},${0.2 + rng() * 0.2})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(0,0,0,${0.15 + rng() * 0.15})`;
    ctx.lineWidth = 0.5 + rng();
    ctx.beginPath();
    let x = rng() * size;
    let y = rng() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (rng() - 0.5) * 40;
      y += (rng() - 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 30; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 0.5 + rng() * 2;
    ctx.fillStyle = `rgba(${40 + Math.floor(rng() * 30)},${40 + Math.floor(rng() * 30)},${45 + Math.floor(rng() * 30)},${0.3 + rng() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.06);
}

// ── 8. Marble ──

function generateMarble(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(707);

  ctx.fillStyle = "#D4D0CC";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 10; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 30 + rng() * 50;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${190 + Math.floor(rng() * 40)},${185 + Math.floor(rng() * 40)},${180 + Math.floor(rng() * 40)},0.3)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 6; i++) {
    const startX = rng() * size;
    const startY = rng() * size;
    const alpha = 0.06 + rng() * 0.12;
    ctx.strokeStyle = rng() > 0.3 ? `rgba(120,115,130,${alpha})` : `rgba(80,75,90,${alpha})`;
    ctx.lineWidth = 0.5 + rng() * 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    let x = startX, y = startY;
    for (let s = 0; s < 8; s++) {
      const cpx = x + (rng() - 0.5) * 60;
      const cpy = y + 15 + rng() * 25;
      x += (rng() - 0.5) * 40;
      y += 20 + rng() * 15;
      ctx.quadraticCurveTo(cpx, cpy, x, y);
    }
    ctx.stroke();
  }

  addNoise(ctx, size, 0.02);
}

// ── 9. Carpet Red ──

function generateCarpetRed(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(808);

  ctx.fillStyle = "#6B1A1A";
  ctx.fillRect(0, 0, size, size);

  const weaveSize = 4;
  for (let y = 0; y < size; y += weaveSize) {
    for (let x = 0; x < size; x += weaveSize) {
      const isEven = ((x + y) / weaveSize) % 2 === 0;
      ctx.fillStyle = isEven ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
      ctx.fillRect(x, y, weaveSize, weaveSize);
    }
  }

  const patternSize = 64;
  ctx.strokeStyle = "rgba(180,80,80,0.08)";
  ctx.lineWidth = 1;
  for (let py = 0; py < size; py += patternSize) {
    for (let px = 0; px < size; px += patternSize) {
      const cx = px + patternSize / 2;
      const cy = py + patternSize / 2;
      const r = patternSize * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.stroke();
    }
  }

  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 20 + rng() * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${rng() > 0.5 ? 100 : 30},10,10,0.08)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  addNoise(ctx, size, 0.02);
}

// ── 10. Tiles White ──

function generateTilesWhite(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(909);
  const tileSize = size / 4;
  const groutColor = "#AAAAAA";
  const groutWidth = 2;
  const tileColors = ["#E8E5E0", "#E2DFD8", "#EDEAE5", "#D8D5CE", "#F0EDE8"];

  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, size, size);

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tx = col * tileSize + groutWidth / 2;
      const ty = row * tileSize + groutWidth / 2;
      const tw = tileSize - groutWidth;
      const th = tileSize - groutWidth;

      ctx.fillStyle = tileColors[Math.floor(rng() * tileColors.length)]!;
      ctx.fillRect(tx, ty, tw, th);

      const grad = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
      grad.addColorStop(0, "rgba(255,255,255,0.06)");
      grad.addColorStop(0.5, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.03)");
      ctx.fillStyle = grad;
      ctx.fillRect(tx, ty, tw, th);
    }
  }

  addNoise(ctx, size, 0.015);
}

// ── 11. Ice ──

function generateIce(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(1010);

  ctx.fillStyle = "#A8D8EA";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 12; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 20 + rng() * 50;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, rng() > 0.5 ? "rgba(200,230,245,0.2)" : "rgba(100,160,190,0.15)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 3; i++) {
    let x = rng() * size;
    let y = rng() * size;
    ctx.strokeStyle = `rgba(255,255,255,${0.2 + rng() * 0.25})`;
    ctx.lineWidth = 0.5 + rng();
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 6; s++) {
      x += (rng() - 0.5) * 50;
      y += (rng() - 0.5) * 50;
      ctx.lineTo(x, y);
      if (rng() > 0.6) {
        const bx = x, by = y;
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + (rng() - 0.5) * 25, by + (rng() - 0.5) * 25);
        ctx.moveTo(bx, by);
      }
    }
    ctx.stroke();
  }

  const sheen = ctx.createLinearGradient(0, 0, size, size);
  sheen.addColorStop(0, "rgba(255,255,255,0.05)");
  sheen.addColorStop(0.4, "rgba(255,255,255,0)");
  sheen.addColorStop(0.6, "rgba(255,255,255,0.08)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);

  addNoise(ctx, size, 0.02);
}

// ── 12. Swamp ──

function generateSwamp(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(1111);

  ctx.fillStyle = "#2A3C1E";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 6; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rx = 8 + rng() * 25;
    const ry = rx * (0.5 + rng() * 0.5);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    gradient.addColorStop(0, "rgba(20,35,15,0.5)");
    gradient.addColorStop(0.7, "rgba(30,50,20,0.3)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 60; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 1 + rng() * 3;
    const green = 50 + Math.floor(rng() * 50);
    ctx.fillStyle = `rgba(${20 + Math.floor(rng() * 20)},${green},${10 + Math.floor(rng() * 15)},${0.15 + rng() * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 12; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 1.5 + rng() * 3;
    ctx.strokeStyle = `rgba(60,90,40,${0.15 + rng() * 0.2})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(100,140,70,0.1)";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.05);
}

// ── 13-14. Water (shared helper) ──

function generateWater(
  ctx: CanvasRenderingContext2D, size: number,
  baseColor: string, darkColor: string, waveAlpha: number, seed: number,
): void {
  const rng = seededRandom(seed);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 10; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 20 + rng() * 50;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `${darkColor}44`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 15; i++) {
    const y = rng() * size;
    ctx.strokeStyle = `rgba(255,255,255,${waveAlpha + rng() * 0.04})`;
    ctx.lineWidth = 0.5 + rng() * 1.5;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const wy = y + Math.sin(x * 0.04 + rng() * 10) * (3 + rng() * 5);
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 8; i++) {
    const cx = rng() * size;
    const cy = rng() * size;
    const r = 5 + rng() * 15;
    ctx.fillStyle = `rgba(150,220,255,${0.03 + rng() * 0.04})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.7, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.7, cy);
    ctx.closePath();
    ctx.fill();
  }

  addNoise(ctx, size, 0.03);
}

function generateWaterShallow(ctx: CanvasRenderingContext2D, size: number): void {
  generateWater(ctx, size, "#2E8B9A", "#1A6B8A", 0.08, 1212);
}

function generateWaterDeep(ctx: CanvasRenderingContext2D, size: number): void {
  generateWater(ctx, size, "#0D3B66", "#081E3F", 0.05, 1313);
}

// ── 15. Lava ──

function generateLava(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(1414);

  ctx.fillStyle = "#1A0800";
  ctx.fillRect(0, 0, size, size);

  ctx.lineCap = "round";
  for (let i = 0; i < 12; i++) {
    let x = rng() * size;
    let y = rng() * size;
    ctx.strokeStyle = `rgba(255,${100 + Math.floor(rng() * 80)},0,${0.3 + rng() * 0.4})`;
    ctx.lineWidth = 3 + rng() * 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (rng() - 0.5) * 60;
      y += (rng() - 0.5) * 60;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.lineCap = "butt";

  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 15 + rng() * 35;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(255,${120 + Math.floor(rng() * 60)},0,0.25)`);
    gradient.addColorStop(0.5, `rgba(200,${50 + Math.floor(rng() * 30)},0,0.1)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 15; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 5 + rng() * 20;
    ctx.fillStyle = `rgba(30,10,0,${0.3 + rng() * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + rng() * 0.5), rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.04);
}

// ── 16. Acid ──

function generateAcid(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(1515);

  ctx.fillStyle = "#2B5C1E";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 10; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 20 + rng() * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${80 + Math.floor(rng() * 50)},255,${30 + Math.floor(rng() * 40)},0.2)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 3 + rng() * 8;
    ctx.strokeStyle = `rgba(100,255,50,${0.15 + rng() * 0.15})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(80,200,40,0.05)";
    ctx.fill();
    ctx.fillStyle = "rgba(180,255,100,0.1)";
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 25; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 0.5 + rng() * 2;
    ctx.fillStyle = `rgba(120,255,60,${0.1 + rng() * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.04);
}

// ── 17. Blood ──

function generateBlood(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(1616);

  ctx.fillStyle = "#2E0A0A";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rx = 15 + rng() * 40;
    const ry = rx * (0.4 + rng() * 0.6);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    gradient.addColorStop(0, `rgba(${120 + Math.floor(rng() * 40)},10,10,0.4)`);
    gradient.addColorStop(0.6, "rgba(80,5,5,0.2)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 5; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 3 + rng() * 8;
    ctx.fillStyle = `rgba(200,40,40,${0.05 + rng() * 0.08})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.04);
}

// ── 18. Stone Wall ──

function generateStoneWall(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(1717);
  const groutColor = "#0D0D12";
  const stoneColors = ["#1A1A22", "#1E1E28", "#222230", "#16161E"];

  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, size, size);

  const rows = 6;
  const blockH = size / rows;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : blockH * 0.6;
    const cols = 3 + Math.floor(rng() * 2);
    const blockW = size / cols;
    for (let col = -1; col <= cols; col++) {
      const bx = col * blockW + offset + (rng() - 0.5) * 4;
      const by = row * blockH + 1;
      const bw = blockW - 2 + (rng() - 0.5) * 4;
      const bh = blockH - 2;
      ctx.fillStyle = stoneColors[Math.floor(rng() * stoneColors.length)]!;
      roundedRect(ctx, bx, by, bw, bh, 1);
      ctx.fill();
    }
  }

  for (let i = 0; i < 10; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillStyle = `rgba(30,50,25,${0.05 + rng() * 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + rng() * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.05);
}

// ── 19. Wood Wall ──

function generateWoodWall(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(1818);
  const plankColors = ["#2A1A0E", "#332010", "#3B2614", "#241608"];
  const gapColor = "#100A05";
  const numPlanks = 6;
  const plankWidth = size / numPlanks;

  ctx.fillStyle = gapColor;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < numPlanks; i++) {
    const px = i * plankWidth + 1;
    const pw = plankWidth - 2;
    ctx.fillStyle = plankColors[Math.floor(rng() * plankColors.length)]!;
    ctx.fillRect(px, 0, pw, size);

    for (let v = 0; v < 8; v++) {
      const vx = px + rng() * pw;
      ctx.strokeStyle = `rgba(${rng() > 0.5 ? 60 : 0},${rng() > 0.5 ? 30 : 0},${rng() > 0.5 ? 15 : 0},${0.05 + rng() * 0.08})`;
      ctx.lineWidth = 0.5 + rng();
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx + (rng() - 0.5) * 5, size);
      ctx.stroke();
    }
  }

  addNoise(ctx, size, 0.04);
}

// ── 20. Dungeon Wall ──

function generateDungeonWall(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(1919);

  ctx.fillStyle = "#0F0F15";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 12; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rx = 10 + rng() * 30;
    const ry = rx * (0.5 + rng() * 0.5);
    ctx.fillStyle = `rgba(${20 + Math.floor(rng() * 15)},${20 + Math.floor(rng() * 15)},${25 + Math.floor(rng() * 15)},${0.4 + rng() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 15; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillStyle = `rgba(20,${40 + Math.floor(rng() * 30)},15,${0.08 + rng() * 0.12})`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + rng() * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.06);
}

// ── 21. Brick Wall ──

function generateBrickWall(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(2020);
  const groutColor = "#8A8078";
  const brickColors = ["#8B3A2A", "#9B4333", "#7A3020", "#A04838", "#6E2A1A"];
  const brickW = size / 4;
  const brickH = size / 8;
  const groutSize = 2;

  ctx.fillStyle = groutColor;
  ctx.fillRect(0, 0, size, size);

  for (let row = 0; row < 8; row++) {
    const offset = row % 2 === 0 ? 0 : brickW * 0.5;
    for (let col = -1; col <= 4; col++) {
      const bx = col * brickW + offset + groutSize / 2;
      const by = row * brickH + groutSize / 2;
      ctx.fillStyle = brickColors[Math.floor(rng() * brickColors.length)]!;
      ctx.fillRect(bx, by, brickW - groutSize, brickH - groutSize);
      ctx.fillStyle = `rgba(${rng() > 0.5 ? 255 : 0},${rng() > 0.5 ? 255 : 0},${rng() > 0.5 ? 255 : 0},${0.02 + rng() * 0.04})`;
      ctx.fillRect(bx, by, brickW - groutSize, brickH - groutSize);
    }
  }

  addNoise(ctx, size, 0.03);
}

// ── 22. Dense Trees ──

function generateDenseTrees(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(2121);

  ctx.fillStyle = "#1A2E12";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 12; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 15 + rng() * 30;
    const green = 35 + Math.floor(rng() * 50);
    const gradient = ctx.createRadialGradient(x, y - r * 0.2, r * 0.2, x, y, r);
    gradient.addColorStop(0, `rgba(${20 + Math.floor(rng() * 20)},${green + 30},${15 + Math.floor(rng() * 15)},0.7)`);
    gradient.addColorStop(0.7, `rgba(15,${green},10,0.5)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 5; i++) {
    const x = rng() * size;
    ctx.strokeStyle = `rgba(40,25,10,${0.2 + rng() * 0.2})`;
    ctx.lineWidth = 2 + rng() * 3;
    ctx.beginPath();
    ctx.moveTo(x, rng() * size);
    ctx.lineTo(x + (rng() - 0.5) * 10, rng() * size);
    ctx.stroke();
  }

  addNoise(ctx, size, 0.04);
}

// ── 23. Light Trees ──

function generateLightTrees(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(2222);

  // Base grass
  generateGrass(ctx, size);

  // Tree shadows
  for (let i = 0; i < 6; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 15 + rng() * 25;
    ctx.fillStyle = `rgba(0,0,0,${0.1 + rng() * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(x + 5, y + 5, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Light canopies
  for (let i = 0; i < 6; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 12 + rng() * 22;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(40,${100 + Math.floor(rng() * 40)},30,0.4)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── 24. Rocks ──

function generateRocks(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(2323);

  ctx.fillStyle = "#2A2A30";
  ctx.fillRect(0, 0, size, size);

  const rockColors = ["#3A3A42", "#444450", "#353540", "#4A4A55"];
  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rx = 10 + rng() * 35;
    const ry = rx * (0.5 + rng() * 0.5);

    ctx.fillStyle = rockColors[Math.floor(rng() * rockColors.length)]!;
    ctx.beginPath();
    const points = 5 + Math.floor(rng() * 4);
    for (let p = 0; p < points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const dist = rx * 0.7 + rng() * rx * 0.3;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * (dist * ry / rx);
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();
  }

  addNoise(ctx, size, 0.05);
}

// ── 25. Void ──

function generateVoid(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  const rng = seededRandom(2424);
  for (let i = 0; i < 15; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillStyle = `rgba(255,255,255,${0.02 + rng() * 0.05})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + rng(), 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 3; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 30 + rng() * 50;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "rgba(30,10,50,0.08)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
}

// ── 26. Magic Floor ──

function generateMagicFloor(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(2525);

  ctx.fillStyle = "#1A0A2E";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 20 + rng() * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${100 + Math.floor(rng() * 60)},${40 + Math.floor(rng() * 30)},${200 + Math.floor(rng() * 55)},0.15)`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  ctx.strokeStyle = "rgba(160,100,255,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const cx = 30 + rng() * (size - 60);
    const cy = 30 + rng() * (size - 60);
    const r = 8 + rng() * 15;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();
  }

  for (let i = 0; i < 20; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillStyle = `rgba(200,150,255,${0.05 + rng() * 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + rng() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.03);
}

// ── 27. Snow ──

function generateSnow(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(2626);

  ctx.fillStyle = "#E8E8EE";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 10; i++) {
    const y = rng() * size;
    const alpha = 0.03 + rng() * 0.05;
    ctx.strokeStyle = `rgba(${rng() > 0.5 ? 255 : 180},${rng() > 0.5 ? 255 : 185},${rng() > 0.5 ? 255 : 200},${alpha})`;
    ctx.lineWidth = 2 + rng() * 5;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 8) {
      const sy = y + Math.sin(x * 0.03 + rng() * 10) * (2 + rng() * 6);
      if (x === 0) ctx.moveTo(x, sy);
      else ctx.lineTo(x, sy);
    }
    ctx.stroke();
  }

  for (let i = 0; i < 6; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 15 + rng() * 35;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "rgba(180,190,220,0.1)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 15; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillStyle = `rgba(255,255,255,${0.1 + rng() * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.3 + rng() * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.015);
}

// ── Mud (existing type) ──

function generateMud(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(3030);

  ctx.fillStyle = "#4A3520";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 15; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 15 + rng() * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, rng() > 0.5 ? "rgba(60,40,20,0.25)" : "rgba(30,20,10,0.2)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  // Wet puddles
  for (let i = 0; i < 5; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const rx = 10 + rng() * 25;
    const ry = rx * (0.4 + rng() * 0.5);
    ctx.fillStyle = `rgba(35,25,12,${0.3 + rng() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(80,60,30,${0.05 + rng() * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(x - rx * 0.2, y - ry * 0.2, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.06);
}

// ── Forest Floor (existing type) ──

function generateForestFloor(ctx: CanvasRenderingContext2D, size: number): void {
  const rng = seededRandom(3131);

  ctx.fillStyle = "#2A3A1A";
  ctx.fillRect(0, 0, size, size);

  // Leaf litter patches
  for (let i = 0; i < 18; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 10 + rng() * 30;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    const g = 40 + Math.floor(rng() * 40);
    gradient.addColorStop(0, `rgba(${30 + Math.floor(rng() * 30)},${g},${10 + Math.floor(rng() * 15)},${0.2 + rng() * 0.15})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  // Fallen leaves/twigs
  for (let i = 0; i < 40; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const len = 2 + rng() * 6;
    const angle = rng() * Math.PI * 2;
    ctx.strokeStyle = `rgba(${60 + Math.floor(rng() * 40)},${40 + Math.floor(rng() * 30)},${15 + Math.floor(rng() * 15)},${0.15 + rng() * 0.2})`;
    ctx.lineWidth = 0.5 + rng();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Small mushrooms/moss dots
  for (let i = 0; i < 15; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.fillStyle = `rgba(${40 + Math.floor(rng() * 30)},${60 + Math.floor(rng() * 40)},${20 + Math.floor(rng() * 20)},${0.15 + rng() * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + rng() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  addNoise(ctx, size, 0.04);
}

// ── Generator Registry ──
// Keys match TerrainType union values (underscore naming)

const TERRAIN_GENERATORS: Record<
  string,
  (ctx: CanvasRenderingContext2D, size: number) => void
> = {
  // Dungeon
  stone_floor: generateStoneFloor,
  stone_wall: generateStoneWall,
  dirt_floor: generateDirt,
  wooden_floor: generateWoodFloor,
  cobblestone: generateCobblestone,
  marble: generateMarble,
  carpet: generateCarpetRed,
  // Natural
  grass: generateGrass,
  forest_floor: generateForestFloor,
  sand: generateSand,
  mud: generateMud,
  snow: generateSnow,
  rocky: generateRocks,
  swamp: generateSwamp,
  water_shallow: generateWaterShallow,
  water_deep: generateWaterDeep,
  lava: generateLava,
  ice: generateIce,
  // Special
  void: generateVoid,
  magic_circle: generateMagicFloor,
  // New types
  cave_floor: generateCaveFloor,
  tiles_white: generateTilesWhite,
  acid: generateAcid,
  blood: generateBlood,
  wood_wall: generateWoodWall,
  dungeon_wall: generateDungeonWall,
  brick_wall: generateBrickWall,
  dense_trees: generateDenseTrees,
  light_trees: generateLightTrees,
};
