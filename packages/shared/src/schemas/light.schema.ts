import { z } from "zod";

export const createLightSourceSchema = z.object({
  x: z.number(),
  y: z.number(),
  brightRadius: z.number().min(0),
  dimRadius: z.number().min(0),
  color: z.string().max(20).default("#FFF4E0"),
  intensity: z.number().min(0).max(1).default(1.0),
  lightType: z.enum(["POINT", "CONE", "AMBIENT"]).default("POINT"),
  coneAngle: z.number().min(0).max(360).optional(),
  coneDirection: z.number().min(0).max(360).optional(),
  isEnabled: z.boolean().default(true),
  flickers: z.boolean().default(false),
  flickerIntensity: z.number().min(0).max(1).default(0.1),
  tokenId: z.string().optional().nullable(),
  isStatic: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
});

export const updateLightSourceSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  brightRadius: z.number().min(0).optional(),
  dimRadius: z.number().min(0).optional(),
  color: z.string().max(20).optional(),
  intensity: z.number().min(0).max(1).optional(),
  lightType: z.enum(["POINT", "CONE", "AMBIENT"]).optional(),
  coneAngle: z.number().min(0).max(360).optional().nullable(),
  coneDirection: z.number().min(0).max(360).optional().nullable(),
  isEnabled: z.boolean().optional(),
  flickers: z.boolean().optional(),
  flickerIntensity: z.number().min(0).max(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateLightSourceInput = z.infer<typeof createLightSourceSchema>;
export type UpdateLightSourceInput = z.infer<typeof updateLightSourceSchema>;
