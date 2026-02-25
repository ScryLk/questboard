import { z } from "zod";
import { PlayerRole } from "../types/enums.js";

export const createInviteSchema = z.object({
  invitedUserId: z.string().optional(),
  invitedEmail: z.string().email().optional(),
  role: z.nativeEnum(PlayerRole).default(PlayerRole.PLAYER),
  message: z.string().max(500).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
