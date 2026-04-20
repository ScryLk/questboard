import { z } from "zod";

export const wallTypeSchema = z.enum([
  "wall",
  "door-closed",
  "door-open",
  "door-locked",
  "window",
  "half-wall",
  "secret",
  "illusory",
  "portcullis",
]);

export const wallStyleSchema = z.enum([
  "stone",
  "wood",
  "metal",
  "magic",
  "natural",
  "brick",
]);

export const doorStateSchema = z.enum(["closed", "open", "locked", "destroyed"]);

export const wallDataSchema = z
  .object({
    type: wallTypeSchema,
    style: wallStyleSchema,
    lockDC: z.number().int().min(5).max(30).optional(),
  })
  .refine((w) => w.type === "door-locked" || w.lockDC === undefined, {
    message: "lockDC só é válido em portas trancadas.",
  });

export type WallTypeValue = z.infer<typeof wallTypeSchema>;
export type WallStyleValue = z.infer<typeof wallStyleSchema>;
export type DoorStateValue = z.infer<typeof doorStateSchema>;
export type WallDataValue = z.infer<typeof wallDataSchema>;
