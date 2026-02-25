import type { AiProvider, GenerationRequest, GenerationResult, WallDetectionResult } from "./types.js";

export function createStabilityProvider(): AiProvider {
  const apiKey = process.env.STABILITY_API_KEY;

  return {
    name: "stability",

    isAvailable() {
      return !!apiKey;
    },

    async generateMap(request: GenerationRequest): Promise<GenerationResult> {
      if (!apiKey) throw new Error("STABILITY_API_KEY not configured");

      const prompt = buildPrompt(request);

      const body = new FormData();
      body.append("prompt", prompt);
      body.append("output_format", "png");
      body.append("aspect_ratio", "1:1");

      const endpoint =
        request.mode === "INPAINT" && request.maskData
          ? "https://api.stability.ai/v2beta/stable-image/edit/inpaint"
          : "https://api.stability.ai/v2beta/stable-image/generate/sd3";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Stability API error: ${response.status} ${err}`);
      }

      const data = (await response.json()) as {
        image: string;
        finish_reason: string;
        seed: number;
      };

      // Base64 image — will be uploaded to R2 by the worker
      return {
        imageUrl: `data:image/png;base64,${data.image}`,
        width: 1024,
        height: 1024,
        provider: "stability",
        model: "sd3",
        costCents: 4, // ~$0.04 per generation
        metadata: { seed: data.seed, finishReason: data.finish_reason },
      };
    },

    async detectWalls(_imageUrl: string, _gridSize: number): Promise<WallDetectionResult> {
      // Stability does not support wall detection — delegate to OpenAI
      throw new Error("Wall detection not supported by Stability provider");
    },
  };
}

function buildPrompt(request: GenerationRequest): string {
  const base = request.prompt ?? "A detailed fantasy RPG battle map, top-down view";

  switch (request.mode) {
    case "TEXT_TO_MAP":
      return `Top-down battle map for tabletop RPG: ${base}. High detail, clear layout, no text, fantasy style.`;
    case "VARIATION":
      return `Variation of battle map: ${base}. Top-down view, high detail.`;
    case "ENHANCE":
      return `Enhanced battle map: ${base}. More detail, better lighting.`;
    case "INPAINT":
      return request.inpaintPrompt ?? base;
    default:
      return base;
  }
}
