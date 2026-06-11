#!/usr/bin/env node
// Reduz PNGs pixel-art de 2048x2048 (lote Gemini 2026-05) pra 256x256.
// Usa kernel "nearest" pra preservar pixel art crisp.
//
// Backup .bak já existe da etapa de remoção de fundo. Esse script
// roda em cima do arquivo atual (já com bg transparente).

import { existsSync, statSync } from "node:fs";
import { resolve, join, basename } from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "apps/web-next/public/items",
);

const FILES = [
  "chair_wood.png",
  "table_long.png",
  "table_round.png",
  "bed_red.png",
  "bookshelf_books.png",
  "chest_locked.png",
  "barrel_iron.png",
  "barrel_small.png",
  "rock_large.png",
  "rug_round.png",
  "chalice.png",
  "beer_mug.png",
  "candleholder.png",
  "fireplace_stone.png",
];

const TARGET = 256;

/** Remove "flocos de neve": pixels CLAROS (média >=200) ou ESCUROS
 *  (média <=30) com pouquíssimos vizinhos 8-conexos opacos (≤2).
 *  Esses são resíduos de AA do bg original que sobreviveram em
 *  posições isoladas. Highlights legítimos vêm em clusters maiores
 *  (≥4 vizinhos), então ficam preservados. */
function despeckle(raw, width, height, channels) {
  const out = Buffer.from(raw);
  let removed = 0;

  // Pass A — flocos CLAROS ou ESCUROS adjacentes a transparência.
  // Múltiplas iterações: cada pass expõe novos flocos quando vizinhos
  // ficam transparentes. Para quando não acha mais nada.
  for (let pass = 0; pass < 6; pass++) {
    let hits = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        if (out[i + 3] === 0) continue;
        const r = out[i], g = out[i + 1], b = out[i + 2];
        const mean = (r + g + b) / 3;
        const isLight = mean >= 200;
        const isDark = mean <= 30;
        if (!isLight && !isDark) continue;

        let opaqueNeighbors = 0;
        let hasTransparentNeighbor = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (out[(ny * width + nx) * channels + 3] >= 128) opaqueNeighbors++;
            else hasTransparentNeighbor = true;
          }
        }
        // Resíduo: poucos vizinhos opacos E tocando transparência.
        if (opaqueNeighbors <= 4 && hasTransparentNeighbor) {
          out[i + 3] = 0;
          hits++;
        }
      }
    }
    removed += hits;
    if (hits === 0) break;
  }

  // Pass B — pixels ULTRA isolados de QUALQUER cor (≤1 vizinho opaco).
  // Pega "antenas" cinza que sobraram de detalhes amputados pela remoção
  // do bg (ex: ponta de aro que ficou desconectada do barril principal).
  // Mais conservador: só remove se tiver 0 ou 1 vizinho opaco — pixel
  // realmente solto. Highlights legítimos têm ao menos 2 vizinhos.
  for (let pass = 0; pass < 4; pass++) {
    let hits = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        if (out[i + 3] === 0) continue;

        let opaqueNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (out[(ny * width + nx) * channels + 3] >= 128) opaqueNeighbors++;
          }
        }
        if (opaqueNeighbors <= 1) {
          out[i + 3] = 0;
          hits++;
        }
      }
    }
    removed += hits;
    if (hits === 0) break;
  }

  return { out, removed };
}

/** Limpeza final pós-downsize: pixel bg-like (≥230 OU ≤25) que está
 *  TOCANDO transparência vira transparente. Cobre o halo que o
 *  resize com kernel "nearest" deixa nas bordas. NÃO ataca pixels
 *  internos (que podem ser highlights legítimos do sprite). */
function finalCleanup(raw, width, height, channels) {
  const out = Buffer.from(raw);
  const isBgLike = (r, g, b) =>
    (r >= 230 && g >= 230 && b >= 230) || (r <= 25 && g <= 25 && b <= 25);
  let removed = 0;
  // Múltiplas iterações pra pegar bordas duplas.
  for (let pass = 0; pass < 3; pass++) {
    const snapshot = Buffer.from(out);
    let hits = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        if (out[i + 3] === 0) continue;
        const r = out[i], g = out[i + 1], b = out[i + 2];
        if (!isBgLike(r, g, b)) continue;

        // Só limpa se tocar transparência (no estado da iteração anterior).
        let touchesTransparent = false;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (snapshot[(ny * width + nx) * channels + 3] === 0) {
            touchesTransparent = true;
            break;
          }
        }
        if (touchesTransparent) {
          out[i + 3] = 0;
          hits++;
        }
      }
    }
    removed += hits;
    if (hits === 0) break;
  }
  return { out, removed };
}

for (const f of FILES) {
  const filePath = join(PUBLIC_DIR, f);
  if (!existsSync(filePath)) {
    console.warn(`[skip] ${f} não existe`);
    continue;
  }
  const { data, info } = await sharp(filePath)
    .resize(TARGET, TARGET, {
      kernel: "nearest",
      fit: "inside",
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const haloed = finalCleanup(
    data,
    info.width,
    info.height,
    info.channels,
  );
  const speckled = despeckle(
    haloed.out,
    info.width,
    info.height,
    info.channels,
  );
  const out = speckled.out;
  const removed = haloed.removed + speckled.removed;

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png({ compressionLevel: 9 })
    .toFile(filePath);

  const kb = (statSync(filePath).size / 1024).toFixed(1);
  console.log(`[ok] ${f} → ${TARGET}px (${kb} KB, ${removed} resíduos limpos)`);
}
