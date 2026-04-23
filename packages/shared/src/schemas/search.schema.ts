import { z } from "zod";

export const searchTypeSchema = z.enum(["map", "character", "note", "session"]);
export type SearchType = z.infer<typeof searchTypeSchema>;

export const searchRequestSchema = z.object({
  q: z.string().min(2, "Digite pelo menos 2 caracteres.").max(100),
  types: z
    .array(searchTypeSchema)
    .nonempty()
    .optional()
    .default(["map", "character", "note", "session"]),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

// `z.input` reflete o que o cliente envia (campos com .default() são opcionais),
// `z.output` reflete o que o handler recebe após parse (campos com defaults
// preenchidos viram obrigatórios).
export type SearchRequestInput = z.input<typeof searchRequestSchema>;
export type SearchRequestParsed = z.output<typeof searchRequestSchema>;

export const searchResultItemSchema = z.object({
  id: z.string(),
  type: searchTypeSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  thumbnail: z.string().url().optional(),
  url: z.string(),
  score: z.number(),
});

export type SearchResultItem = z.infer<typeof searchResultItemSchema>;

export const searchResponseSchema = z.object({
  query: z.string(),
  results: z.object({
    maps: z.array(searchResultItemSchema),
    characters: z.array(searchResultItemSchema),
    notes: z.array(searchResultItemSchema),
    sessions: z.array(searchResultItemSchema),
  }),
  totalCount: z.number(),
  tookMs: z.number(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
