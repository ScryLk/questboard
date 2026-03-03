import { z } from "zod";

export const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  system: z.string().min(1).max(50),
  templateId: z.string().optional(),
  data: z.record(z.unknown()).default({}),
  avatarUrl: z.string().url().nullable().optional(),
});

export const updateCharacterSchema = createCharacterSchema.partial();

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;
