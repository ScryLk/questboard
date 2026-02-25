import { z } from "zod";

export const requestMapGenerationSchema = z.object({
  mode: z.enum(["TEXT_TO_MAP", "VARIATION", "INPAINT", "ENHANCE", "WALLS_DETECT"]),
  prompt: z.string().max(2000).optional(),
  parameters: z.record(z.unknown()).optional(),
  sourceMapId: z.string().optional(),
  maskData: z.string().optional(),
  inpaintPrompt: z.string().max(500).optional(),
  variationOfId: z.string().optional(),
});

export const acceptGenerationSchema = z.object({
  name: z.string().min(1).max(200),
  gridType: z.enum(["SQUARE", "HEX_FLAT", "HEX_POINTY", "NONE"]).default("SQUARE"),
  gridSize: z.number().int().min(8).max(256).default(32),
});

export const rateGenerationSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export type RequestMapGenerationInput = z.infer<typeof requestMapGenerationSchema>;
export type AcceptGenerationInput = z.infer<typeof acceptGenerationSchema>;
