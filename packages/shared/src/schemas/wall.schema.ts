import { z } from "zod";

export const createWallSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  wallType: z.enum(["NORMAL", "WINDOW", "ETHEREAL", "INVISIBLE", "TERRAIN"]).default("NORMAL"),
  blocksMovement: z.boolean().default(true),
  blocksVision: z.boolean().default(true),
  blocksLight: z.boolean().default(true),
  isDoor: z.boolean().default(false),
  doorState: z.enum(["CLOSED", "OPEN", "LOCKED", "SECRET"]).default("CLOSED"),
  doorLocked: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export const batchCreateWallsSchema = z.object({
  walls: z.array(createWallSchema).min(1).max(500),
});

export const toggleDoorSchema = z.object({
  doorState: z.enum(["CLOSED", "OPEN", "LOCKED", "SECRET"]),
});

export type CreateWallInput = z.infer<typeof createWallSchema>;
