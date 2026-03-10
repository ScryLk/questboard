interface MapPromptInput {
  description: string;
  widthCells: number;
  heightCells: number;
  widthPx: number;
  heightPx: number;
  references: string[];
  name?: string;
}

export function buildMapGenerationPrompt(input: MapPromptInput): string {
  const { description, widthCells, heightCells, widthPx, heightPx, references, name } = input;

  const refString =
    references.length > 0 ? `\nAmbient references: ${references.join(", ")}.` : "";

  return `Create a top-down RPG battle map tile texture for a scene${name ? ` called "${name}"` : ""}.

SCENE DESCRIPTION:
${description}${refString}

TECHNICAL REQUIREMENTS:
- Style: pixel art, top-down orthographic view (bird's eye, 90 degrees)
- Resolution: ${widthPx}x${heightPx} pixels
- Grid: covers a ${widthCells}x${heightCells} cell area (each cell = 64x64 pixels)
- Color palette: dark fantasy, desaturated, atmospheric
- No characters, no tokens, no UI elements, no text, no labels
- No borders or frames — full bleed texture
- The entire image must be filled with the map texture

PIXEL ART STYLE RULES:
- Clear pixel clusters, no anti-aliasing
- Limited color palette per element (4-8 colors per material)
- Strong contrast between walkable floor and obstacles/walls
- Top-down consistent lighting (light source from top-left)
- Shadows cast downward-right for depth

FLOOR AND ELEMENTS:
- Floor tiles must be clearly walkable (flat, consistent pattern)
- Walls/obstacles must read clearly as impassable
- Details like furniture, props and decor should be recognizable at 64px scale
- Subtle grid alignment so tiles snap cleanly at 64px intervals

OUTPUT: A single seamless pixel art map texture. No borders. Full bleed.`;
}

const CELL_SIZE = 64;
const MAX_PX = 1024;

export function calculatePromptDimensions(widthCells: number, heightCells: number) {
  const widthPx = Math.min(widthCells * (CELL_SIZE / 2), MAX_PX);
  const heightPx = Math.min(heightCells * (CELL_SIZE / 2), MAX_PX);
  return { widthPx: Math.round(widthPx), heightPx: Math.round(heightPx) };
}
