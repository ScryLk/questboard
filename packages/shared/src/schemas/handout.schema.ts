import { z } from "zod";
import { HandoutType } from "../types/enums.js";

// ── Create Handout ──

export const handoutSectionInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  content: z.string().max(10000).optional(),
  imageUrl: z.string().url().optional(),
  isRevealed: z.boolean().default(false),
  revealedTo: z.array(z.string()).default([]),
  revealCondition: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const createHandoutSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  handoutType: z.nativeEnum(HandoutType).default(HandoutType.DOCUMENT),
  sections: z.array(handoutSectionInputSchema).min(1).max(50),
  coverImageUrl: z.string().url().optional(),
  style: z.string().max(100).default("default"),
  visibleTo: z.array(z.string()).default([]),
});

export type CreateHandoutInput = z.infer<typeof createHandoutSchema>;

// ── Update Handout ──

export const updateHandoutSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  sections: z.array(handoutSectionInputSchema).min(1).max(50).optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  style: z.string().max(100).optional(),
  visibleTo: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

export type UpdateHandoutInput = z.infer<typeof updateHandoutSchema>;

// ── Reveal Section ──

export const revealSectionSchema = z.object({
  handoutId: z.string(),
  sectionId: z.string(),
  revealTo: z.array(z.string()).optional(), // empty = all players
});

export type RevealSectionInput = z.infer<typeof revealSectionSchema>;

// ── Handout Query ──

export const handoutQuerySchema = z.object({
  type: z.nativeEnum(HandoutType).optional(),
  pinnedOnly: z.boolean().optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type HandoutQuery = z.infer<typeof handoutQuerySchema>;
