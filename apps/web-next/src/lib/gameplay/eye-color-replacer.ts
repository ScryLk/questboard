import type { TokenAlignment } from "@/lib/gameplay-mock-data";
import { ALIGNMENT_EYE_COLORS } from "@/constants/creature-sprites";

// Cache: "spritePath-alignment" → data URL
const spriteCache = new Map<string, string>();

// Cache de imagens carregadas
const imageCache = new Map<string, HTMLImageElement>();

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return imageCache.get(src)!;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    // Cache bust para forçar reload após mudança dos PNGs
    img.src = src + "?v=2";
  });
}

/**
 * Processa um sprite PNG:
 * 1. Remove fundo checkerboard (pixels cinza/branco sem cor)
 * 2. Recolore olhos (pixels brilhantes com saturação) pela cor da índole
 */
export async function getProcessedSpriteUrl(
  spritePath: string,
  alignment: TokenAlignment,
): Promise<string> {
  const cacheKey = `${spritePath}-${alignment}`;
  if (spriteCache.has(cacheKey)) return spriteCache.get(cacheKey)!;

  const img = await loadImage(spritePath);

  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const pixels = imageData.data;

  const targetColor = hexToRgb(ALIGNMENT_EYE_COLORS[alignment]);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a < 10) continue;

    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const saturation = maxChannel - minChannel;

    // Remover fundo: qualquer pixel sem cor (R≈G≈B) que não seja preto escuro
    // Silhueta = preto (0-40), Checkerboard = cinza (185-195) + branco (250-255)
    // Transição = valores intermediários (40-185) com baixa saturação
    if (saturation < 15 && minChannel > 40) {
      pixels[i + 3] = 0; // Tornar transparente
      continue;
    }

    // Detectar pixels de "olho" — brilhantes e com cor
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const isEyePixel = luminance > 80 && saturation > 40;

    if (isEyePixel) {
      const brightnessRatio = luminance / 255;
      const boost = 1.4;

      pixels[i] = Math.min(255, Math.round(targetColor.r * brightnessRatio * boost));
      pixels[i + 1] = Math.min(255, Math.round(targetColor.g * brightnessRatio * boost));
      pixels[i + 2] = Math.min(255, Math.round(targetColor.b * brightnessRatio * boost));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const blob = await canvas.convertToBlob({ type: "image/png" });
  const url = URL.createObjectURL(blob);

  spriteCache.set(cacheKey, url);
  return url;
}

/**
 * Pré-carrega todas as variantes de cor para um sprite.
 */
export async function preloadSprite(spritePath: string): Promise<void> {
  const alignments: TokenAlignment[] = ["hostile", "ally", "neutral", "player"];
  await Promise.all(alignments.map((a) => getProcessedSpriteUrl(spritePath, a)));
}
