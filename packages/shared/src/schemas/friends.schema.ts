import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  userId: z.string().min(1),
  source: z.enum(["session_invite", "search", "link"]).optional(),
  note: z.string().max(200).optional(),
});

export const blockUserSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
