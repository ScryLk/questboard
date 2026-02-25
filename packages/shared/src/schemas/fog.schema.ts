import { z } from "zod";

export const createFogAreaSchema = z.object({
  shapeType: z.enum(["RECTANGLE", "CIRCLE", "POLYGON", "FREEHAND", "CELL"]),
  geometry: z.record(z.unknown()),
  isRevealed: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export const updateFogAreaSchema = z.object({
  isRevealed: z.boolean(),
});

export const batchRevealFogSchema = z.object({
  fogAreaIds: z.array(z.string()).min(1),
});

export type CreateFogAreaInput = z.infer<typeof createFogAreaSchema>;
