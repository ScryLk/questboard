import { z } from "zod";

export const aiCharacterCategorySchema = z.enum(["npc", "creature"]);

export const aiCharacterRoleSchema = z.enum([
  "ally",
  "villain",
  "neutral",
  "merchant",
  "quest",
  "boss",
]);

export const aiCharacterDispositionSchema = z.enum([
  "hostile",
  "neutral",
  "friendly",
  "undead",
]);

export const aiCharacterCreatureTypeSchema = z.enum([
  "humanoide",
  "besta",
  "morto-vivo",
  "aberracao",
  "constructo",
  "dragao",
  "elementar",
  "fada",
  "fiend",
  "gigante",
  "monstruosidade",
  "planta",
]);

export const aiCharacterStatsSchema = z.object({
  hp: z.number().int().min(1).max(999),
  maxHp: z.number().int().min(1).max(999),
  ac: z.number().int().min(5).max(25),
  speed: z.number().int().min(0).max(120),
  cr: z.string().max(6).optional(),
  str: z.number().int().min(1).max(30),
  dex: z.number().int().min(1).max(30),
  con: z.number().int().min(1).max(30),
  int: z.number().int().min(1).max(30),
  wis: z.number().int().min(1).max(30),
  cha: z.number().int().min(1).max(30),
});

export const aiCharacterNarrativeContextSchema = z.object({
  nodeTitle: z.string().trim().min(1).max(200),
  nodeDescription: z.string().trim().max(2000).optional(),
  nodeGmNotes: z.string().trim().max(2000).optional(),
});

export const aiCharacterGenerationRequestSchema = z.object({
  prompt: z.string().trim().min(10).max(500),
  category: aiCharacterCategorySchema.default("npc"),
  narrativeContext: aiCharacterNarrativeContextSchema.optional(),
});

export const aiCharacterGenerationResultSchema = z.object({
  name: z.string().trim().min(1).max(60),
  title: z.string().trim().max(80).optional(),
  description: z.string().trim().min(1).max(800),
  role: aiCharacterRoleSchema.optional(),
  disposition: aiCharacterDispositionSchema,
  creatureType: aiCharacterCreatureTypeSchema.optional(),
  stats: aiCharacterStatsSchema,
  dialogueGreeting: z.string().trim().max(300).optional(),
  dialogueNotes: z.string().trim().max(1200).optional(),
});

export type AICharacterCategory = z.infer<typeof aiCharacterCategorySchema>;
export type AICharacterRole = z.infer<typeof aiCharacterRoleSchema>;
export type AICharacterDisposition = z.infer<typeof aiCharacterDispositionSchema>;
export type AICharacterCreatureType = z.infer<typeof aiCharacterCreatureTypeSchema>;
export type AICharacterStats = z.infer<typeof aiCharacterStatsSchema>;
export type AICharacterNarrativeContext = z.infer<typeof aiCharacterNarrativeContextSchema>;
export type AICharacterGenerationRequest = z.infer<typeof aiCharacterGenerationRequestSchema>;
export type AICharacterGenerationResult = z.infer<typeof aiCharacterGenerationResultSchema>;
