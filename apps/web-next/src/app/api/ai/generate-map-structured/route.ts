import { NextResponse } from "next/server";
import {
  aiMapGenerationRequestSchema,
  aiMapGenerationResultSchema,
  type AIMapGenerationResult,
} from "@questboard/validators";

const MODEL = "gemini-2.5-flash";

const TERRAIN_TYPES = [
  "stone_floor", "dirt_floor", "wooden_floor", "cobblestone", "marble", "carpet",
  "grass", "forest_floor", "sand", "mud", "snow", "rocky", "swamp",
  "water_shallow", "water_deep", "lava", "ice",
  "void", "magic_circle", "trap", "pit", "bridge",
  "stairs_up", "stairs_down", "portal", "altar",
  "cave_floor", "tiles_white", "acid", "blood",
  "wood_wall", "dungeon_wall", "brick_wall",
  "dense_trees", "light_trees",
];

const WALL_TYPES = [
  "wall",
  "door-closed",
  "door-open",
  "door-locked",
  "window",
  "half-wall",
  "secret",
  "illusory",
  "portcullis",
];
const WALL_STYLES = ["stone", "wood", "metal", "magic", "natural", "brick"];
const WALL_SIDES = ["top", "right", "bottom", "left"];
const OBJECT_TYPES = [
  "table", "chair", "bed", "chest", "barrel", "bookshelf", "throne",
  "fountain", "statue", "pillar", "campfire", "tree", "bush",
  "rock_large", "rock_small", "torch_stand", "banner", "rug", "cage",
  "well", "cart", "crate", "sack", "weapon_rack", "anvil", "cauldron",
];

function buildGeminiSchema() {
  return {
    type: "OBJECT",
    properties: {
      terrain: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            x: { type: "INTEGER" },
            y: { type: "INTEGER" },
            type: { type: "STRING", enum: TERRAIN_TYPES },
          },
          required: ["x", "y", "type"],
        },
      },
      walls: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            x: { type: "INTEGER" },
            y: { type: "INTEGER" },
            side: { type: "STRING", enum: WALL_SIDES },
            type: { type: "STRING", enum: WALL_TYPES },
            style: { type: "STRING", enum: WALL_STYLES },
            lockDC: { type: "INTEGER" },
          },
          required: ["x", "y", "side", "type", "style"],
        },
      },
      objects: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            x: { type: "INTEGER" },
            y: { type: "INTEGER" },
            type: { type: "STRING", enum: OBJECT_TYPES },
            rotation: { type: "INTEGER" },
          },
          required: ["x", "y", "type"],
        },
      },
    },
    required: ["terrain", "walls", "objects"],
  };
}

function buildPrompt(
  description: string,
  gridCols: number,
  gridRows: number,
  area?: { x1: number; y1: number; x2: number; y2: number },
) {
  const areaBlock = area
    ? `
ÁREA RESTRITA (gere CONTEÚDO APENAS DENTRO desta sub-região):
- x em [${area.x1}, ${area.x2}]
- y em [${area.y1}, ${area.y2}]
- Largura: ${area.x2 - area.x1 + 1} células · Altura: ${area.y2 - area.y1 + 1} células
- Qualquer célula/parede/objeto fora dessa área será descartado.
- Paredes de perímetro da sala devem ficar nas arestas INTERNAS da área (não nas bordas absolutas do mapa).
`
    : "";

  return `Você é um gerador de mapas de RPG de mesa em grade de tiles para um VTT estilo top-down.

GRADE:
- Dimensões: ${gridCols} colunas x ${gridRows} linhas
- Coordenadas válidas: x em [0, ${gridCols - 1}], y em [0, ${gridRows - 1}]
- (0,0) é o canto superior esquerdo
${areaBlock}

DESCRIÇÃO DO MAPA (em pt-BR):
"${description}"

REGRAS DE GERAÇÃO:
1. TERRENO: cada célula pode ter UM tipo. Preencha o chão de TODAS as áreas transitáveis e também áreas decorativas (água, lava, etc).
2. PAREDES: cada parede fica na ARESTA entre duas células. Use "side" para indicar qual aresta da célula (x,y):
   - "top" = aresta superior (entre (x,y-1) e (x,y))
   - "bottom" = aresta inferior (entre (x,y) e (x,y+1))
   - "left" = aresta esquerda (entre (x-1,y) e (x,y))
   - "right" = aresta direita (entre (x,y) e (x+1,y))
   Para fazer um quarto retangular, coloque paredes em todas as arestas externas. NÃO duplique arestas (a aresta "right" de (2,5) é a mesma da "left" de (3,5) — escolha uma).
3. PORTAS: use "door-closed" no meio de paredes para criar entradas. Toda sala fechada deve ter pelo menos 1 porta.
4. OBJETOS: mobiliário/decoração em células específicas. rotation é opcional (0, 90, 180, 270).
5. COERÊNCIA: o terreno deve fazer sentido com o ambiente descrito (masmorra = stone_floor + dungeon_wall style; floresta = grass/forest_floor + tree objects; etc).
6. DENSIDADE: preencha o mapa — não deixe a maioria das células vazias. Objetos com moderação (10-40 objetos em mapa médio).

TIPOS ESPECIAIS DE PAREDE (use com PARCIMÔNIA — só quando a descrição justifica):
- "door-locked" (porta trancada): use APENAS quando a descrição mencionar explicitamente "trancada", "cadeado", "chave", "senha" ou contexto óbvio (cofre, tesouro, cela). Inclua o campo "lockDC" entre 12 (simples) e 20 (complexa). Default 15 se não houver indicação de dificuldade. NO MÁXIMO 2 portas trancadas por mapa.
- "secret" (porta/passagem secreta): use APENAS quando a descrição mencionar "secreta", "escondida", "passagem oculta", "armadilha". Parece uma parede normal até ser revelada. NO MÁXIMO 1 por mapa — são raras e narrativas.
- "illusory" (parede ilusória): use APENAS quando a descrição mencionar "ilusão", "magia", "parede falsa" ou ambientes mágicos. Parece parede mas não bloqueia movimento. NO MÁXIMO 1 por mapa.
- "portcullis" (grade): use em calabouços, masmorras, entradas de prisão, arenas. Bloqueia movimento mas visão passa. Pode ter 1-3 num mapa de masmorra.

Quando em dúvida, prefira "door-closed" comum. NÃO encha o mapa de variações especiais só porque pode.

ESTILOS DE PAREDE sugeridos:
- Masmorra/dungeon → style "stone"
- Casa/taberna → style "wood"
- Castelo/templo → style "brick" ou "stone"
- Floresta natural → style "natural"
- Cripta mágica → style "magic"
- Grade (portcullis) → style "metal"

Retorne APENAS o JSON no schema definido.`;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = aiMapGenerationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Requisição inválida", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { prompt, gridCols, gridRows, area } = parsed.data;

  const normalizedArea = area
    ? {
        x1: Math.min(area.x1, area.x2),
        y1: Math.min(area.y1, area.y2),
        x2: Math.max(area.x1, area.x2),
        y2: Math.max(area.y1, area.y2),
      }
    : undefined;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: buildPrompt(prompt, gridCols, gridRows, normalizedArea) }] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: buildGeminiSchema(),
          temperature: 0.85,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[AI Map Structured] Gemini error:", JSON.stringify(data));
      return NextResponse.json(
        { error: "Falha ao gerar mapa via Gemini" },
        { status: 502 },
      );
    }

    const textPart = data.candidates?.[0]?.content?.parts?.find(
      (p: { text?: string }) => typeof p.text === "string",
    );
    const rawText: string | undefined = textPart?.text;
    if (!rawText) {
      return NextResponse.json(
        { error: "Gemini não retornou conteúdo" },
        { status: 502 },
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      console.error("[AI Map Structured] Invalid JSON from Gemini:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: "Gemini retornou JSON inválido" },
        { status: 502 },
      );
    }

    const validated = aiMapGenerationResultSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error("[AI Map Structured] Schema validation failed:", validated.error.flatten());
      return NextResponse.json(
        { error: "Resposta do Gemini fora do schema esperado" },
        { status: 502 },
      );
    }

    const clamped = clampToGrid(validated.data, gridCols, gridRows, normalizedArea);

    return NextResponse.json(clamped);
  } catch (err) {
    console.error("[AI Map Structured] Error:", err);
    return NextResponse.json(
      { error: "Erro interno ao gerar mapa" },
      { status: 500 },
    );
  }
}

function clampToGrid(
  result: AIMapGenerationResult,
  gridCols: number,
  gridRows: number,
  area?: { x1: number; y1: number; x2: number; y2: number },
): AIMapGenerationResult {
  const minX = area ? area.x1 : 0;
  const minY = area ? area.y1 : 0;
  const maxX = area ? area.x2 : gridCols - 1;
  const maxY = area ? area.y2 : gridRows - 1;

  const inBounds = (x: number, y: number) =>
    x >= minX && y >= minY && x <= maxX && y <= maxY;

  return {
    terrain: result.terrain.filter((c) => inBounds(c.x, c.y)),
    walls: result.walls
      .filter((w) => {
        if (!inBounds(w.x, w.y)) return false;
        if (w.side === "top" && w.y === 0) return false;
        if (w.side === "bottom" && w.y === gridRows - 1) return false;
        if (w.side === "left" && w.x === 0) return false;
        if (w.side === "right" && w.x === gridCols - 1) return false;
        return true;
      })
      .map((w) => {
        // Normaliza lockDC: mantém só em door-locked; default 15 se veio sem DC.
        if (w.type === "door-locked") {
          return { ...w, lockDC: w.lockDC ?? 15 };
        }
        const { lockDC: _drop, ...rest } = w;
        void _drop;
        return rest;
      }),
    objects: result.objects.filter((o) => inBounds(o.x, o.y)),
  };
}
