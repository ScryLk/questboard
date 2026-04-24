import { z } from "zod";
import {
  AUDIO_CHANNELS,
  AUDIO_MAX_FILE_SIZE_MB,
  AUDIO_DURATION_LIMITS_MS,
} from "@questboard/constants";

export const audioChannelSchema = z.enum(AUDIO_CHANNELS);

// Shape completo lido da API (inclui campos legacy + canônicos).
export const audioTrackSchema = z.object({
  id: z.string().cuid(),
  ownerId: z.string().cuid().nullable(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable(),
  url: z.string().url(),
  durationMs: z.number().int().positive(),
  fileSizeBytes: z.number().int().positive(),
  channel: audioChannelSchema,
  tags: z.array(z.string().min(1).max(40)).max(20),
  isOfficial: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Criação (upload do usuário). Refinado para validar duração por canal.
export const createAudioTrackSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório").max(120, "Nome muito longo"),
    description: z.string().max(500).optional(),
    url: z.string().url("URL inválida"),
    durationMs: z.number().int().positive("Duração inválida"),
    fileSizeBytes: z
      .number()
      .int()
      .positive()
      .max(
        AUDIO_MAX_FILE_SIZE_MB * 1024 * 1024,
        `Arquivo maior que ${AUDIO_MAX_FILE_SIZE_MB}MB`,
      ),
    channel: audioChannelSchema,
    tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  })
  .superRefine((data, ctx) => {
    const limit = AUDIO_DURATION_LIMITS_MS[data.channel];
    if (data.durationMs > limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationMs"],
        message: `Duração excede o limite do canal ${data.channel} (${limit / 1000}s)`,
      });
    }
  });

// Query da listagem GET /audio/tracks.
// `tags` chega como string "combate,epico" e é normalizada em array.
export const listAudioTracksQuerySchema = z.object({
  channel: audioChannelSchema.optional(),
  tags: z
    .string()
    .optional()
    .transform((v) =>
      v ? v.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    ),
  search: z.string().max(120).optional(),
  scope: z.enum(["official", "mine", "all"]).default("all"),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const updateAudioTrackSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
});

export type CreateAudioTrackInput = z.infer<typeof createAudioTrackSchema>;
export type UpdateAudioTrackInput = z.infer<typeof updateAudioTrackSchema>;
export type ListAudioTracksQuery = z.infer<typeof listAudioTracksQuerySchema>;
