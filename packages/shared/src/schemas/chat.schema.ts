import { z } from "zod";
import { ChatChannel, MessageAuthorType, MessageContentType } from "../types/enums.js";

// ── Send Message ──

export const sendMessageSchema = z.object({
  channel: z.nativeEnum(ChatChannel).default(ChatChannel.GENERAL),
  content: z.string().min(1).max(4000),
  contentType: z.nativeEnum(MessageContentType).default(MessageContentType.TEXT),
  recipientIds: z.array(z.string()).optional(),
  groupName: z.string().max(50).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    type: z.enum(["image", "file", "audio", "handout"]),
    url: z.string().url(),
    fileName: z.string().max(255),
    fileSizeMb: z.number().min(0).max(50),
    mimeType: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    thumbnailUrl: z.string().url().optional(),
    caption: z.string().max(500).optional(),
  })).max(10).optional(),
  authorAsNpc: z.object({
    name: z.string().min(1).max(100),
    portrait: z.string().url().optional(),
  }).optional(),
  characterId: z.string().optional(),
  embed: z.record(z.unknown()).optional(),
  isAsyncPost: z.boolean().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ── Edit Message ──

export const editMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().min(1).max(4000),
});

export type EditMessageInput = z.infer<typeof editMessageSchema>;

// ── Delete Message ──

export const deleteMessageSchema = z.object({
  messageId: z.string(),
});

// ── Pin Message ──

export const pinMessageSchema = z.object({
  messageId: z.string(),
  isPinned: z.boolean(),
});

// ── React to Message ──

export const reactMessageSchema = z.object({
  messageId: z.string(),
  emoji: z.string().min(1).max(10),
});

// ── Mark Read ──

export const markReadSchema = z.object({
  channel: z.nativeEnum(ChatChannel),
});

// ── Chat History Query ──

export const chatHistoryQuerySchema = z.object({
  channel: z.nativeEnum(ChatChannel).optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().max(200).optional(),
  authorId: z.string().optional(),
  contentType: z.nativeEnum(MessageContentType).optional(),
  pinnedOnly: z.boolean().optional(),
});

export type ChatHistoryQuery = z.infer<typeof chatHistoryQuerySchema>;

// ── Bot Command ──

export const botCommandSchema = z.object({
  command: z.enum(["/roll", "/whisper", "/initiative", "/npc", "/narrate"]),
  args: z.string(),
});

// ── Media Upload ──

export const mediaUploadSchema = z.object({
  fileName: z.string().max(255),
  fileSizeMb: z.number().min(0).max(50),
  mimeType: z.string(),
  purpose: z.enum(["chat_attachment", "handout_image", "character_avatar", "custom_audio"]),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
