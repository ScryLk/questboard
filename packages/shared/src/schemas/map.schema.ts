import { z } from "zod";

export const createMapSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  gridType: z.enum(["SQUARE", "HEX_FLAT", "HEX_POINTY", "NONE"]).default("SQUARE"),
  gridSize: z.number().int().min(8).max(256).default(32),
  gridColor: z.string().max(20).default("#FFFFFF20"),
  gridVisible: z.boolean().default(true),
  settings: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateMapSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  gridType: z.enum(["SQUARE", "HEX_FLAT", "HEX_POINTY", "NONE"]).optional(),
  gridSize: z.number().int().min(8).max(256).optional(),
  gridOffsetX: z.number().int().optional(),
  gridOffsetY: z.number().int().optional(),
  gridColor: z.string().max(20).optional(),
  gridVisible: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const reorderMapsSchema = z.object({
  mapIds: z.array(z.string()).min(1),
});

export type CreateMapInput = z.infer<typeof createMapSchema>;
export type UpdateMapInput = z.infer<typeof updateMapSchema>;
