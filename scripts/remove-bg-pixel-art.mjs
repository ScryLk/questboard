#!/usr/bin/env node
// Remove fundo sólido (preto ou branco) de PNGs pixel-art em
// `apps/web-next/public/items/`. Decide a cor do bg amostrando os
// 4 cantos. Tolerância pequena (~6) cobre artefatos de geração.
//
// Uso:
//   node scripts/remove-bg-pixel-art.mjs           # processa lista fixa
//   node scripts/remove-bg-pixel-art.mjs <file...> # processa específicos
//
// Mantém uma cópia .bak da imagem original na primeira execução.

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { resolve, join, basename } from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "apps/web-next/public/items",
);

// Arquivos do lote pixel-art 2026-05.
const DEFAULT_FILES = [
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

const TOLERANCE = 16; // 0-255; cobre AA da geração IA. Era 8, off-by-one
// deixava pixels ~252,248,245 sobrando como artefatos brilhantes no
// sprite final.

/** Distância Chebyshev (max canal) entre dois pixels RGB. */
function chebyshev(a, b) {
  return Math.max(
    Math.abs(a[0] - b[0]),
    Math.abs(a[1] - b[1]),
    Math.abs(a[2] - b[2]),
  );
}

async function removeBackground(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`[skip] não encontrado: ${filePath}`);
    return;
  }

  const bakPath = `${filePath}.bak`;
  if (!existsSync(bakPath)) {
    copyFileSync(filePath, bakPath);
  }

  const img = sharp(bakPath).ensureAlpha();
  const { data, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info; // channels === 4

  // Pré-processo: apaga a watermark do Gemini no canto inferior-direito.
  // Aparece como sparkle ✦ em ~92-97% x 92-97% nos PNGs gerados, sempre
  // disjunto do sprite principal (separado por fundo). Pinta a região
  // 88%+ x 88%+ de cor do fundo (será removida na passada principal).
  // Pra detectar a cor do fundo aqui usamos um pixel do canto (0,0) que
  // ainda não foi alterado.
  const wmStartX = Math.floor(width * 0.88);
  const wmStartY = Math.floor(height * 0.88);
  const corner = [data[0], data[1], data[2]];
  for (let y = wmStartY; y < height; y++) {
    for (let x = wmStartX; x < width; x++) {
      const i = (y * width + x) * channels;
      data[i] = corner[0];
      data[i + 1] = corner[1];
      data[i + 2] = corner[2];
      data[i + 3] = 255;
    }
  }

  const pixel = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };

  // Vota a cor do fundo amostrando os 4 cantos + meio de cada borda.
  const samples = [
    pixel(0, 0),
    pixel(width - 1, 0),
    pixel(0, height - 1),
    pixel(width - 1, height - 1),
    pixel(Math.floor(width / 2), 0),
    pixel(Math.floor(width / 2), height - 1),
    pixel(0, Math.floor(height / 2)),
    pixel(width - 1, Math.floor(height / 2)),
  ];

  let whiteVotes = 0;
  let blackVotes = 0;
  let alphaVotes = 0;
  for (const s of samples) {
    if (s[3] < 16) {
      alphaVotes++;
      continue;
    }
    const isWhite = s[0] > 240 && s[1] > 240 && s[2] > 240;
    const isBlack = s[0] < 16 && s[1] < 16 && s[2] < 16;
    if (isWhite) whiteVotes++;
    else if (isBlack) blackVotes++;
  }

  if (alphaVotes >= 5) {
    console.log(`[skip] já transparente: ${basename(filePath)}`);
    return;
  }
  if (whiteVotes < 4 && blackVotes < 4) {
    console.warn(
      `[skip] borda não-uniforme (white=${whiteVotes} black=${blackVotes} alpha=${alphaVotes}): ${basename(filePath)}`,
    );
    return;
  }

  const bgColor = whiteVotes >= blackVotes ? [255, 255, 255] : [0, 0, 0];
  const bgLabel = whiteVotes >= blackVotes ? "white" : "black";

  // Pinta o canal alpha em 0 onde o pixel está dentro da tolerância
  // da cor de fundo. Não toca em pixels já transparentes.
  const out = Buffer.from(data); // copia
  let removed = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const rgb = [out[i], out[i + 1], out[i + 2]];
      if (chebyshev(rgb, bgColor) <= TOLERANCE) {
        out[i + 3] = 0;
        removed++;
      }
    }
  }

  // Halo cleanup: pixels CLAROS (pra white bg) ou ESCUROS (pra black bg)
  // adjacentes a um pixel já transparente vêm da suavização da IA na
  // borda do sprite — eles sobreviveram à primeira passada mas ainda
  // assim parecem o fundo. Remove em até 2 iterações pra capturar
  // bordas duplas. Usa um threshold mais permissivo (28) que só
  // dispara em pixels adjacentes a transparência.
  const HALO_TOLERANCE = 28;
  for (let pass = 0; pass < 2; pass++) {
    const snapshot = Buffer.from(out);
    let halo = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        if (out[i + 3] === 0) continue; // já transparente
        const rgb = [out[i], out[i + 1], out[i + 2]];
        if (chebyshev(rgb, bgColor) > HALO_TOLERANCE) continue;

        // Checa 4-vizinhança no snapshot (estado antes desta passada).
        const neighborTransparent = (nx, ny) => {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) return false;
          return snapshot[(ny * width + nx) * channels + 3] === 0;
        };
        if (
          neighborTransparent(x - 1, y) ||
          neighborTransparent(x + 1, y) ||
          neighborTransparent(x, y - 1) ||
          neighborTransparent(x, y + 1)
        ) {
          out[i + 3] = 0;
          halo++;
          removed++;
        }
      }
    }
    if (halo === 0) break;
  }

  await sharp(out, { raw: { width, height, channels } })
    .png()
    .toFile(filePath);

  const pct = ((removed / (width * height)) * 100).toFixed(1);
  console.log(
    `[ok] ${basename(filePath)} (${bgLabel} bg, ${pct}% pixels apagados)`,
  );
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : DEFAULT_FILES.map((f) => join(PUBLIC_DIR, f));

for (const t of targets) {
  await removeBackground(t);
}
