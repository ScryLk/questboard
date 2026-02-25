import type { AiProvider, GenerationRequest, GenerationResult, WallDetectionResult } from "./types.js";

export function createOpenAiProvider(): AiProvider {
  const apiKey = process.env.OPENAI_API_KEY;

  return {
    name: "openai",

    isAvailable() {
      return !!apiKey;
    },

    async generateMap(request: GenerationRequest): Promise<GenerationResult> {
      if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

      const prompt = buildPrompt(request);

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          response_format: "url",
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(err)}`);
      }

      const data = (await response.json()) as {
        data: Array<{ url: string; revised_prompt?: string }>;
      };

      return {
        imageUrl: data.data[0].url,
        width: 1024,
        height: 1024,
        provider: "openai",
        model: "dall-e-3",
        costCents: 8, // ~$0.080 per HD image
        metadata: { revisedPrompt: data.data[0].revised_prompt },
      };
    },

    async detectWalls(imageUrl: string, gridSize: number): Promise<WallDetectionResult> {
      if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a VTT map wall detection assistant. Analyze the battle map image and detect wall segments. The grid size is ${gridSize}px per cell. Return a JSON array of wall segments with x1, y1, x2, y2 (in grid cells), wallType (NORMAL/WINDOW/TERRAIN), and isDoor (boolean). Only return the JSON array, no other text.`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Detect walls in this battle map:" },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(err)}`);
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };

      const parsed = JSON.parse(data.choices[0].message.content);
      const walls = Array.isArray(parsed) ? parsed : parsed.walls ?? [];

      return {
        walls: walls.map((w: Record<string, unknown>) => ({
          x1: Number(w.x1) || 0,
          y1: Number(w.y1) || 0,
          x2: Number(w.x2) || 0,
          y2: Number(w.y2) || 0,
          wallType: String(w.wallType || "NORMAL"),
          isDoor: Boolean(w.isDoor),
        })),
        provider: "openai",
        model: "gpt-4o",
        costCents: 3, // ~$0.03 per analysis
      };
    },
  };
}

function buildPrompt(request: GenerationRequest): string {
  const base = request.prompt ?? "A detailed fantasy RPG battle map, top-down view, grid-ready";

  switch (request.mode) {
    case "TEXT_TO_MAP":
      return `Top-down battle map for tabletop RPG: ${base}. High detail, clear grid-ready layout, no text or labels, fantasy art style.`;
    case "VARIATION":
      return `Create a variation of this battle map: ${base}. Top-down view, grid-ready, high detail.`;
    case "ENHANCE":
      return `Enhance and improve this battle map: ${base}. Add more detail, better lighting, sharper edges.`;
    case "INPAINT":
      return request.inpaintPrompt ?? base;
    default:
      return base;
  }
}
