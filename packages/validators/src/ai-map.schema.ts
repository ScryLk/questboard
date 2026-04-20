import { z } from "zod";

export const aiMapTerrainTypeSchema = z.enum([
  "stone_floor",
  "dirt_floor",
  "wooden_floor",
  "cobblestone",
  "marble",
  "carpet",
  "grass",
  "forest_floor",
  "sand",
  "mud",
  "snow",
  "rocky",
  "swamp",
  "water_shallow",
  "water_deep",
  "lava",
  "ice",
  "void",
  "magic_circle",
  "trap",
  "pit",
  "bridge",
  "stairs_up",
  "stairs_down",
  "portal",
  "altar",
  "cave_floor",
  "tiles_white",
  "acid",
  "blood",
  "wood_wall",
  "dungeon_wall",
  "brick_wall",
  "dense_trees",
  "light_trees",
]);

export const aiMapWallTypeSchema = z.enum([
  "wall",
  "door-closed",
  "door-open",
  "window",
  "half-wall",
]);

export const aiMapWallStyleSchema = z.enum([
  "stone",
  "wood",
  "metal",
  "magic",
  "natural",
  "brick",
]);

export const aiMapWallSideSchema = z.enum(["top", "right", "bottom", "left"]);

export const aiMapObjectTypeSchema = z.enum([
  "table",
  "chair",
  "bed",
  "chest",
  "barrel",
  "bookshelf",
  "throne",
  "fountain",
  "statue",
  "pillar",
  "campfire",
  "tree",
  "bush",
  "rock_large",
  "rock_small",
  "torch_stand",
  "banner",
  "rug",
  "cage",
  "well",
  "cart",
  "crate",
  "sack",
  "weapon_rack",
  "anvil",
  "cauldron",
]);

export const aiMapTerrainCellSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  type: aiMapTerrainTypeSchema,
});

export const aiMapWallSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  side: aiMapWallSideSchema,
  type: aiMapWallTypeSchema,
  style: aiMapWallStyleSchema,
});

export const aiMapObjectSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  type: aiMapObjectTypeSchema,
  rotation: z.number().int().min(0).max(359).optional(),
});

export const aiMapGenerationResultSchema = z.object({
  terrain: z.array(aiMapTerrainCellSchema).max(3600),
  walls: z.array(aiMapWallSchema).max(2000),
  objects: z.array(aiMapObjectSchema).max(500),
});

export const aiMapAreaSchema = z.object({
  x1: z.number().int().min(0),
  y1: z.number().int().min(0),
  x2: z.number().int().min(0),
  y2: z.number().int().min(0),
});

export const aiMapGenerationRequestSchema = z.object({
  prompt: z.string().trim().min(10).max(500),
  gridCols: z.number().int().min(5).max(60),
  gridRows: z.number().int().min(5).max(60),
  area: aiMapAreaSchema.optional(),
});

export type AIMapTerrainType = z.infer<typeof aiMapTerrainTypeSchema>;
export type AIMapWallType = z.infer<typeof aiMapWallTypeSchema>;
export type AIMapWallStyle = z.infer<typeof aiMapWallStyleSchema>;
export type AIMapWallSide = z.infer<typeof aiMapWallSideSchema>;
export type AIMapObjectType = z.infer<typeof aiMapObjectTypeSchema>;
export type AIMapTerrainCell = z.infer<typeof aiMapTerrainCellSchema>;
export type AIMapWall = z.infer<typeof aiMapWallSchema>;
export type AIMapObject = z.infer<typeof aiMapObjectSchema>;
export type AIMapArea = z.infer<typeof aiMapAreaSchema>;
export type AIMapGenerationResult = z.infer<typeof aiMapGenerationResultSchema>;
export type AIMapGenerationRequest = z.infer<typeof aiMapGenerationRequestSchema>;
