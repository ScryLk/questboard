import { z } from "zod";

export const createMapZoneSchema = z.object({
  name: z.string().min(1).max(100),
  zoneType: z.enum([
    "DIFFICULT_TERRAIN", "HAZARD", "DARKNESS", "AMBIENT_SOUND",
    "NARRATIVE", "ANTI_MAGIC", "CONCEALMENT", "TRIGGER", "SAFE_ZONE", "CUSTOM",
  ]),
  shapeType: z.enum(["rectangle", "circle", "polygon"]),
  geometry: z.record(z.unknown()),
  properties: z.record(z.unknown()).default({}),
  isVisible: z.boolean().default(true),
  visibleToGmOnly: z.boolean().default(false),
  overlayColor: z.string().max(20).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateMapZoneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  zoneType: z.enum([
    "DIFFICULT_TERRAIN", "HAZARD", "DARKNESS", "AMBIENT_SOUND",
    "NARRATIVE", "ANTI_MAGIC", "CONCEALMENT", "TRIGGER", "SAFE_ZONE", "CUSTOM",
  ]).optional(),
  shapeType: z.enum(["rectangle", "circle", "polygon"]).optional(),
  geometry: z.record(z.unknown()).optional(),
  properties: z.record(z.unknown()).optional(),
  isVisible: z.boolean().optional(),
  visibleToGmOnly: z.boolean().optional(),
  overlayColor: z.string().max(20).optional().nullable(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const batchCreateZonesSchema = z.object({
  zones: z.array(createMapZoneSchema).min(1).max(100),
});

export type CreateMapZoneInput = z.infer<typeof createMapZoneSchema>;
export type UpdateMapZoneInput = z.infer<typeof updateMapZoneSchema>;
