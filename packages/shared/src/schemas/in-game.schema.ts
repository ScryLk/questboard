import { z } from "zod";
import { SceneCardStyle, TimeOfDay, WeatherType, QuestType, QuestStatus, NoteVisibility, LootStatus } from "../types/enums.js";

// ── Scene Card ──

export const createSceneCardSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  style: z.nativeEnum(SceneCardStyle).default(SceneCardStyle.CINEMATIC),
  duration: z.number().int().min(1).max(60).default(5),
  animation: z.enum(["fade", "slide_up", "typewriter", "dramatic"]).default("fade"),
  soundEffect: z.string().max(100).optional(),
  dimBackground: z.boolean().default(true),
});

export type CreateSceneCardInput = z.infer<typeof createSceneCardSchema>;

// ── Environment ──

export const updateEnvironmentSchema = z.object({
  timeOfDay: z.nativeEnum(TimeOfDay).optional(),
  hourInGame: z.number().int().min(0).max(23).optional(),
  weather: z.nativeEnum(WeatherType).optional(),
  weatherIntensity: z.number().min(0).max(1).optional(),
  visualOverlay: z.object({
    tint: z.string().optional(),
    brightness: z.number().min(0).max(1).optional(),
    saturation: z.number().min(0).max(1).optional(),
    particleEffect: z.enum(["rain", "snow", "fog", "fireflies", "dust"]).nullable().optional(),
    particleIntensity: z.number().min(0).max(1).optional(),
    vignette: z.boolean().optional(),
  }).optional(),
  mechanicalEffects: z.object({
    visionMultiplier: z.number().min(0).max(2).optional(),
    outdoorTorchesExtinguished: z.boolean().optional(),
    rangedDisadvantage: z.boolean().optional(),
    stealthAdvantage: z.boolean().optional(),
    perceptionDisadvantage: z.boolean().optional(),
  }).optional(),
  autoSoundtrackEnabled: z.boolean().optional(),
  soundtrackMapping: z.record(z.string()).optional(),
});

export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>;

export const setTimeFlowSchema = z.object({
  rate: z.number().min(0).max(100),
  startHour: z.number().int().min(0).max(23).optional(),
});

export type SetTimeFlowInput = z.infer<typeof setTimeFlowSchema>;

// ── Quest ──

export const questObjectiveInputSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1).max(500),
  status: z.enum(["pending", "in_progress", "completed", "failed"]).default("pending"),
  isSecret: z.boolean().default(false),
  visibleTo: z.array(z.string()).default([]),
  linkedMapId: z.string().optional(),
  linkedPosition: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const createQuestSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  questType: z.nativeEnum(QuestType).default(QuestType.MAIN),
  objectives: z.array(questObjectiveInputSchema).max(50).default([]),
  rewards: z.object({
    xp: z.number().int().min(0).default(0),
    currency: z.record(z.number()).default({}),
    items: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
    })).default([]),
    description: z.string().max(500).optional(),
  }).default({}),
  visibleTo: z.array(z.string()).default([]),
  isSecret: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isPinned: z.boolean().default(false),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;

export const updateQuestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(QuestStatus).optional(),
  objectives: z.array(questObjectiveInputSchema).max(50).optional(),
  rewards: z.object({
    xp: z.number().int().min(0).optional(),
    currency: z.record(z.number()).optional(),
    items: z.array(z.object({ name: z.string(), description: z.string().optional() })).optional(),
    description: z.string().max(500).optional(),
  }).optional(),
  visibleTo: z.array(z.string()).optional(),
  isSecret: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isPinned: z.boolean().optional(),
});

export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;

export const updateObjectiveSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "failed"]),
});

export const questQuerySchema = z.object({
  status: z.nativeEnum(QuestStatus).optional(),
  type: z.nativeEnum(QuestType).optional(),
  myOnly: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type QuestQuery = z.infer<typeof questQuerySchema>;

// ── Party Loot ──

export const addLootSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  quantity: z.number().int().min(1).default(1),
  itemType: z.string().max(50).optional(),
  value: z.object({
    amount: z.number().min(0),
    currency: z.string().max(10),
  }).optional(),
  source: z.string().max(200).optional(),
  foundOnMapId: z.string().optional(),
});

export type AddLootInput = z.infer<typeof addLootSchema>;

export const lootQuerySchema = z.object({
  status: z.nativeEnum(LootStatus).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type LootQuery = z.infer<typeof lootQuerySchema>;

// ── Marching Order ──

export const setMarchingOrderSchema = z.object({
  formation: z.array(z.object({
    position: z.enum(["front", "middle", "rear"]),
    tokenIds: z.array(z.string()),
  })),
  isActive: z.boolean().optional(),
  rules: z.object({
    frontTriggersTraps: z.boolean().default(true),
    rearTriggersAmbush: z.boolean().default(true),
    frontGetsFirstPerception: z.boolean().default(true),
    formationWidth: z.number().int().min(1).max(4).default(2),
  }).default({}),
});

export type SetMarchingOrderInput = z.infer<typeof setMarchingOrderSchema>;

// ── Map Notes ──

export const createMapNoteSchema = z.object({
  x: z.number(),
  y: z.number(),
  content: z.string().min(1).max(500),
  icon: z.string().max(10).default("📌"),
  color: z.string().max(20).default("#6C5CE7"),
  visibility: z.nativeEnum(NoteVisibility).default(NoteVisibility.PERSONAL),
});

export type CreateMapNoteInput = z.infer<typeof createMapNoteSchema>;

// ── NPC Profile ──

export const createNpcProfileSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().max(200).optional(),
  portraitUrl: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  quickStats: z.object({
    hp: z.object({ current: z.number(), max: z.number() }).optional(),
    ac: z.number().optional(),
    speed: z.number().optional(),
    abilities: z.record(z.number()).optional(),
    attacks: z.array(z.object({
      name: z.string(),
      bonus: z.string(),
      damage: z.string(),
      type: z.string(),
    })).optional(),
    cr: z.string().optional(),
    xp: z.number().optional(),
  }).default({}),
  personality: z.object({
    traits: z.array(z.string()).optional(),
    speech: z.string().optional(),
    motivation: z.string().optional(),
    secrets: z.string().optional(),
  }).default({}),
  notes: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  isRecurring: z.boolean().default(false),
  tokenId: z.string().optional(),
});

export type CreateNpcProfileInput = z.infer<typeof createNpcProfileSchema>;

export const updateNpcProfileSchema = createNpcProfileSchema.partial();
export type UpdateNpcProfileInput = z.infer<typeof updateNpcProfileSchema>;

export const setNpcDispositionSchema = z.object({
  userId: z.string(),
  attitude: z.enum(["friendly", "helpful", "neutral", "unfriendly", "hostile", "unknown"]),
  notes: z.string().max(500).optional(),
});

export type SetNpcDispositionInput = z.infer<typeof setNpcDispositionSchema>;

export const npcQuerySchema = z.object({
  search: z.string().max(200).optional(),
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type NpcQuery = z.infer<typeof npcQuerySchema>;

// ── Session Recap ──

export const createRecapSchema = z.object({
  sessionNumber: z.number().int().min(1),
  content: z.string().min(1),
});

export type CreateRecapInput = z.infer<typeof createRecapSchema>;

export const updateRecapSchema = z.object({
  content: z.string().min(1).optional(),
  sessionNumber: z.number().int().min(1).optional(),
});

export type UpdateRecapInput = z.infer<typeof updateRecapSchema>;

// ── Thought Bubble ──

export const sendThoughtSchema = z.object({
  content: z.string().min(1).max(500),
  isLocationBound: z.boolean().default(false),
});

export type SendThoughtInput = z.infer<typeof sendThoughtSchema>;

// ── Item Trading ──

export const tradeOfferSchema = z.object({
  targetUserId: z.string(),
  itemId: z.string(),
  fromCharacterId: z.string(),
});

export type TradeOfferInput = z.infer<typeof tradeOfferSchema>;

// ── Emote ──

export const emoteSchema = z.object({
  emote: z.string().min(1).max(200),
});
