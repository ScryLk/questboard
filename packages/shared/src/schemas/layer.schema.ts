import { z } from "zod";

export const createLayerSchema = z.object({
  name: z.string().min(1).max(100),
  layerType: z.enum(["IMAGE", "DRAWING"]).default("DRAWING"),
  isVisible: z.boolean().default(true),
  opacity: z.number().min(0).max(1).default(1.0),
  metadata: z.record(z.unknown()).optional(),
});

export const updateLayerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isVisible: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  opacity: z.number().min(0).max(1).optional(),
  objects: z.array(z.record(z.unknown())).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const reorderLayersSchema = z.object({
  layerIds: z.array(z.string()).min(1),
});

export type CreateLayerInput = z.infer<typeof createLayerSchema>;
export type UpdateLayerInput = z.infer<typeof updateLayerSchema>;
