import { z } from "zod";
import {
  CAMPAIGN_TAGS,
  CONTENT_WARNINGS,
  REPORT_REASONS,
  JOIN_CODE_LENGTH,
  CAMPAIGN_SYSTEMS,
} from "@questboard/constants";

// ── Primitivos ──

export const campaignSystemSchema = z.enum(
  CAMPAIGN_SYSTEMS.map((s) => s.value) as [string, ...string[]],
);

export const campaignVisibilitySchema = z.enum(["PRIVATE", "CODE", "PUBLIC"]);

export const campaignStatusSchema = z.enum([
  "active",
  "paused",
  "completed",
  "archived",
]);

export const campaignFrequencySchema = z.enum([
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "IRREGULAR",
  "ONESHOT",
]);

export const campaignLengthSchema = z.enum([
  "ONESHOT",
  "SHORT_ARC",
  "LONG",
  "INDEFINITE",
]);

export const ageRatingSchema = z.enum(["ALL_AGES", "T14", "T16", "T18"]);

export const safetyToolSchema = z.enum(["OPEN_DOOR", "X_CARD", "LINES_AND_VEILS"]);

export const reportReasonSchema = z.enum(REPORT_REASONS);

export const campaignTagSchema = z.enum(CAMPAIGN_TAGS);

export const contentWarningSchema = z.enum(CONTENT_WARNINGS);

// ── Form / inputs ──

export const externalChatSchema = z.object({
  discord: z.string().url().optional(),
  whatsapp: z.string().url().optional(),
});

export const createCampaignSchema = z
  .object({
    name: z.string().min(3, "Nome muito curto").max(80, "Nome muito longo"),
    system: campaignSystemSchema,
    visibility: campaignVisibilitySchema.default("PRIVATE"),

    coverImageUrl: z.string().url("URL inválida").optional(),
    synopsis: z.string().max(2000, "Sinopse muito longa").optional(),
    tags: z.array(campaignTagSchema).max(8, "Máximo 8 tags").default([]),

    language: z.string().default("pt-BR"),
    frequency: campaignFrequencySchema.optional(),
    expectedLength: campaignLengthSchema.optional(),
    ageRating: ageRatingSchema.default("ALL_AGES"),
    contentWarnings: z.array(contentWarningSchema).default([]),
    safetyTools: z.array(safetyToolSchema).default(["OPEN_DOOR", "X_CARD"]),

    isSoloStory: z.boolean().default(false),
    externalChat: externalChatSchema.optional(),
    publicPitch: z.string().max(500, "Pitch muito longo").optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.visibility === "PUBLIC" &&
      (!data.synopsis || !data.publicPitch)
    ) {
      if (!data.synopsis) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["synopsis"],
          message: "Campanhas públicas exigem sinopse.",
        });
      }
      if (!data.publicPitch) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["publicPitch"],
          message: "Campanhas públicas exigem pitch.",
        });
      }
    }
    if (data.isSoloStory && data.visibility === "PUBLIC") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isSoloStory"],
        message:
          "Modo Solo Story não pode ser combinado com visibilidade pública.",
      });
    }
  });

// Update aceita o mesmo shape mas todos opcionais. Refines reaplicam no
// final via superRefine sobre o shape parcial.
export const updateCampaignSchema = z
  .object({
    name: z.string().min(3).max(80).optional(),
    system: campaignSystemSchema.optional(),
    visibility: campaignVisibilitySchema.optional(),
    coverImageUrl: z.string().url().nullable().optional(),
    synopsis: z.string().max(2000).nullable().optional(),
    tags: z.array(campaignTagSchema).max(8).optional(),
    language: z.string().optional(),
    frequency: campaignFrequencySchema.nullable().optional(),
    expectedLength: campaignLengthSchema.nullable().optional(),
    ageRating: ageRatingSchema.optional(),
    contentWarnings: z.array(contentWarningSchema).optional(),
    safetyTools: z.array(safetyToolSchema).optional(),
    isSoloStory: z.boolean().optional(),
    externalChat: externalChatSchema.nullable().optional(),
    publicPitch: z.string().max(500).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isSoloStory === true && data.visibility === "PUBLIC") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isSoloStory"],
        message: "Solo Story incompatível com visibilidade pública.",
      });
    }
  });

// ── Filtros do catálogo público ──

export const campaignFiltersSchema = z.object({
  system: campaignSystemSchema.optional(),
  language: z.string().optional(),
  ageRating: ageRatingSchema.optional(),
  tags: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
    ),
  excludeWarnings: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
    ),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

// ── Membros / convites ──

export const inviteMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["CO_GM", "PLAYER", "SPECTATOR"]).default("PLAYER"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["CO_GM", "PLAYER", "SPECTATOR"]),
});

// ── Join por código ──

export const joinByCodeSchema = z.object({
  code: z
    .string()
    .length(JOIN_CODE_LENGTH, `Código deve ter ${JOIN_CODE_LENGTH} caracteres`)
    .toUpperCase(),
});

// ── Report ──

export const reportCampaignSchema = z.object({
  reason: reportReasonSchema,
  details: z.string().max(1000).optional(),
});

// ── Tipos inferidos ──

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignFiltersInput = z.infer<typeof campaignFiltersSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type JoinByCodeInput = z.infer<typeof joinByCodeSchema>;
export type ReportCampaignInput = z.infer<typeof reportCampaignSchema>;
