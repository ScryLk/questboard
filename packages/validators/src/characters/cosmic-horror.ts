// ── Horror Investigativo (d100) — schema Zod da ficha ──
//
// Valida o estado bruto da ficha. Cálculos derivados (HP, MP, SAN
// max, dodge) ficam no motor (`@questboard/game-engine/cosmic-horror`).
// Slug do sistema: `cosmic-horror`.

import { z } from "zod";

// ATTRIBUTE_KEYS removido — slugs vivem em `@questboard/constants`
// (`COSMIC_HORROR_ATTRIBUTES`). Schema usa shape literal abaixo.

const MADNESS_STATES = [
  "SANE",
  "TEMPORARY",
  "INDEFINITE",
  "PERMANENT",
] as const;

const attrSchema = z.number().int().min(15).max(99);
const attrSchemaWide = z.number().int().min(40).max(99);

const skillEntrySchema = z.object({
  slug: z.string().min(1),
  /** Valor atual (0-99). Pode ultrapassar o base por improvement. */
  value: z.number().int().min(0).max(99),
  /** Marca pra improvement check no fim da sessão. */
  improvementFlag: z.boolean().default(false),
});

const inventoryItemSchema = z.object({
  itemSlug: z.string(),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().optional(),
});

export const cosmicHorrorCharacterSchema = z
  .object({
    // Identidade
    occupation: z.string().min(1),
    age: z.number().int().min(15).max(90),
    birthplace: z.string().optional(),
    residence: z.string().optional(),

    // Atributos (8). FOR/CON/DES/APA/POD: 15-99. TAM/INT/EDU: 40-99
    // (gerados com 2d6+6 × 5).
    attributes: z.object({
      for: attrSchema,
      con: attrSchema,
      tam: attrSchemaWide,
      des: attrSchema,
      apa: attrSchema,
      int: attrSchemaWide,
      pod: attrSchema,
      edu: attrSchemaWide,
    }),

    // Stats derivados (cache — recálculo via motor)
    hpCurrent: z.number().int().min(0),
    hpMax: z.number().int().min(0),
    mpCurrent: z.number().int().min(0),
    mpMax: z.number().int().min(0),
    luck: z.number().int().min(0).max(99),

    // Sanidade — central no sistema
    sanityCurrent: z.number().int().min(0).max(99),
    sanityMax: z.number().int().min(0).max(99),
    sanityStartingMax: z.number().int().min(0).max(99),
    mythosKnowledge: z.number().int().min(0).max(99).default(0),
    madness: z.enum(MADNESS_STATES).default("SANE"),

    // Skills
    skills: z.array(skillEntrySchema).default([]),

    // Inventário
    inventory: z.array(inventoryItemSchema).default([]),
    creditRating: z.number().int().min(0).max(99).default(10),

    // Roleplay
    backstory: z.string().max(5000).optional(),
    notes: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hpCurrent > data.hpMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hpCurrent"],
        message: "HP atual não pode ultrapassar o máximo.",
      });
    }
    if (data.mpCurrent > data.mpMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mpCurrent"],
        message: "MP atual não pode ultrapassar o máximo.",
      });
    }
    if (data.sanityCurrent > data.sanityMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sanityCurrent"],
        message: "Sanidade atual não pode passar do máximo.",
      });
    }
    if (data.sanityMax > data.sanityStartingMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sanityMax"],
        message:
          "Sanidade máxima não pode ultrapassar o teto inicial (POD).",
      });
    }
    // Mythos derruba SAN máxima 1:1.
    const expectedMax = Math.max(
      0,
      data.sanityStartingMax - data.mythosKnowledge,
    );
    if (data.sanityMax > expectedMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sanityMax"],
        message: `SAN máxima desce 1:1 com Conhecimento do Mythos (esperado ≤ ${expectedMax}).`,
      });
    }
    // SAN 0 implica madness PERMANENT.
    if (data.sanityCurrent === 0 && data.madness !== "PERMANENT") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["madness"],
        message: "SAN em 0 implica loucura permanente.",
      });
    }
  });

export type CosmicHorrorCharacterInput = z.infer<
  typeof cosmicHorrorCharacterSchema
>;
