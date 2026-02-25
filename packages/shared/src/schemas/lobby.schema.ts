import { z } from "zod";

export const lobbySearchSchema = z.object({
  search: z.string().max(100).optional(),
  system: z.string().max(50).optional(),
  tags: z.array(z.string()).max(10).optional(),
  language: z.string().max(10).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  includeIdle: z.coerce.boolean().default(true),
  hasOpenSlots: z.coerce.boolean().default(false),
  sortBy: z.enum(["newest", "starting", "popular", "live_first"]).default("live_first"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type LobbySearchInput = z.infer<typeof lobbySearchSchema>;
