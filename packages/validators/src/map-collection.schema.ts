import { z } from "zod";

export const createMapCollectionSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(60, "Máximo de 60 caracteres"),
  description: z.string().trim().max(500, "Máximo de 500 caracteres").optional(),
  coverMapId: z.string().optional(),
});

export const updateMapCollectionSchema = createMapCollectionSchema.partial();

export const reorderMapsSchema = z.object({
  mapIds: z.array(z.string()).min(1).max(100),
});

export const mapCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  coverMapId: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type CreateMapCollectionInput = z.infer<typeof createMapCollectionSchema>;
export type UpdateMapCollectionInput = z.infer<typeof updateMapCollectionSchema>;
export type ReorderMapsInput = z.infer<typeof reorderMapsSchema>;
