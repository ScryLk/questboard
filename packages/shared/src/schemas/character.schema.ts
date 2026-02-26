import { z } from "zod";

// ── Character Template Schemas ──

export const createCharacterTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).nullable().optional(),
  systemName: z.string().min(1).max(100),
  iconUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  schema: z.object({
    sections: z.array(z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string().optional(),
      columns: z.number().optional(),
      fields: z.array(z.record(z.unknown())),
    })),
  }),
  layout: z.record(z.unknown()).default({}),
  formulas: z.record(z.string()).default({}),
  diceActions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    notation: z.string(),
    rollType: z.string(),
    followUp: z.object({
      condition: z.string(),
      label: z.string(),
      notation: z.string(),
      rollType: z.string(),
    }).optional(),
  })).default([]),
  defaults: z.record(z.unknown()).default({}),
  settings: z.record(z.unknown()).default({}),
  tier: z.enum(["FREE", "ADVENTURER", "LEGENDARY"]).default("FREE"),
  isOfficial: z.boolean().default(true),
});

export const updateCharacterTemplateSchema = createCharacterTemplateSchema
  .omit({ slug: true })
  .partial()
  .extend({
    changelog: z.string().max(5000).optional(),
  });

// ── Character CRUD Schemas ──

export const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: z.string().min(1),
  avatarUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  pronouns: z.string().max(50).nullable().optional(),
  data: z.record(z.unknown()).default({}),
  backstory: z.string().max(50000).nullable().optional(),
});

export const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  bannerUrl: z.string().url().nullable().optional(),
  pronouns: z.string().max(50).nullable().optional(),
  status: z.enum(["ACTIVE", "RETIRED", "DEAD", "ARCHIVED"]).optional(),
  isPublic: z.boolean().optional(),
  backstory: z.string().max(50000).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ── Field Update Schema ──

export const updateCharacterFieldSchema = z.object({
  fieldPath: z.string().min(1),
  value: z.unknown(),
});

export const batchUpdateFieldsSchema = z.object({
  updates: z.array(z.object({
    fieldPath: z.string().min(1),
    value: z.unknown(),
  })).min(1).max(50),
});

// ── Inventory Schemas ──

export const inventoryItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  quantity: z.number().int().min(0).default(1),
  weight: z.number().min(0).default(0),
  equipped: z.boolean().default(false),
  attunement: z.boolean().default(false),
  rarity: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  properties: z.record(z.unknown()).optional(),
});

export const addInventoryItemSchema = inventoryItemSchema;

export const updateInventoryItemSchema = inventoryItemSchema.partial();

// ── Spell Schemas ──

export const addSpellSchema = z.object({
  name: z.string().min(1).max(200),
  level: z.number().int().min(0).max(9),
  school: z.string().max(50).optional(),
  castingTime: z.string().max(100).optional(),
  range: z.string().max(100).optional(),
  duration: z.string().max(100).optional(),
  components: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  prepared: z.boolean().default(false),
  ritual: z.boolean().default(false),
  concentration: z.boolean().default(false),
  source: z.string().max(100).optional(),
  diceAction: z.string().optional(),
});

export const updateSpellSchema = addSpellSchema.partial();

// ── Dice Roll Schemas ──

export const contextualDiceRollSchema = z.object({
  characterId: z.string().min(1),
  notation: z.string().min(1).max(200),
  label: z.string().max(200).optional(),
  rollType: z.enum([
    "MANUAL", "ABILITY_CHECK", "SAVING_THROW", "ATTACK", "DAMAGE",
    "SPELL_ATTACK", "SPELL_DAMAGE", "INITIATIVE", "HIT_DICE", "DEATH_SAVE", "CUSTOM",
  ]).default("MANUAL"),
  visibility: z.enum(["PUBLIC", "GM_ONLY", "WHISPER", "SELF"]).default("PUBLIC"),
  whisperTo: z.array(z.string()).default([]),
  context: z.record(z.unknown()).optional(),
});

// ── Level Up Schemas ──

export const levelUpSchema = z.object({
  hpMethod: z.enum(["roll", "average", "manual"]),
  hpRoll: z.number().int().min(1).optional(),
  hpManual: z.number().int().min(1).optional(),
  abilityScoreImprovements: z.record(z.number().int().min(-2).max(2)).optional(),
  featChoice: z.string().optional(),
  classFeatureChoices: z.record(z.string()).optional(),
  newSpells: z.array(z.string()).optional(),
  skillProficiencies: z.array(z.string()).optional(),
});

// ── Share Permission Schemas ──

export const setSharePermissionSchema = z.object({
  sessionId: z.string().min(1),
  targetType: z.enum(["GM", "CO_GM", "ALL_PLAYERS", "SPECIFIC_USER"]),
  targetUserId: z.string().optional(),
  visibleSections: z.array(z.string()).default(["basic"]),
  canEdit: z.boolean().default(false),
});

// ── Vault Schemas ──

export const uploadVaultFileSchema = z.object({
  folder: z.string().max(200).default("/"),
  description: z.string().max(500).optional(),
});

// ── Note Schemas ──

export const characterNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000),
  isPrivate: z.boolean().default(true),
});

// ── Rest Schemas ──

export const shortRestSchema = z.object({
  hitDiceToSpend: z.number().int().min(0).max(20).default(0),
});

export const longRestSchema = z.object({});

// ── Export types ──

export type CreateCharacterTemplateInput = z.infer<typeof createCharacterTemplateSchema>;
export type UpdateCharacterTemplateInput = z.infer<typeof updateCharacterTemplateSchema>;
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;
export type UpdateCharacterFieldInput = z.infer<typeof updateCharacterFieldSchema>;
export type BatchUpdateFieldsInput = z.infer<typeof batchUpdateFieldsSchema>;
export type AddInventoryItemInput = z.infer<typeof addInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type AddSpellInput = z.infer<typeof addSpellSchema>;
export type UpdateSpellInput = z.infer<typeof updateSpellSchema>;
export type ContextualDiceRollInput = z.infer<typeof contextualDiceRollSchema>;
export type LevelUpInput = z.infer<typeof levelUpSchema>;
export type SetSharePermissionInput = z.infer<typeof setSharePermissionSchema>;
export type UploadVaultFileInput = z.infer<typeof uploadVaultFileSchema>;
export type CharacterNoteInput = z.infer<typeof characterNoteSchema>;
export type ShortRestInput = z.infer<typeof shortRestSchema>;
