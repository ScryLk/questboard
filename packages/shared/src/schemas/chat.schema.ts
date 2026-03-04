import { z } from "zod";
import { ChatChannel } from "../types/enums";

export const sendMessageSchema = z.object({
  channel: z.nativeEnum(ChatChannel).default(ChatChannel.GENERAL),
  content: z.string().min(1).max(2000),
  targetId: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
