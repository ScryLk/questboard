// ── Chat Types ──

export enum ChatChannel {
  GENERAL = "GENERAL",
  IN_CHARACTER = "IN_CHARACTER",
  WHISPER = "WHISPER",
  GM_ONLY = "GM_ONLY",
  GROUP = "GROUP",
}

export enum MessageType {
  TEXT = "TEXT",
  DICE_ROLL = "DICE_ROLL",
  SYSTEM = "SYSTEM",
  MEDIA = "MEDIA",
  NARRATIVE = "NARRATIVE",
}

export enum DiceRollMode {
  PUBLIC = "PUBLIC",
  GM_ONLY = "GM_ONLY",
  SELF = "SELF",
}

export interface Message {
  id: string;
  channel: ChatChannel;
  content: string;
  type: MessageType;
  metadata: Record<string, unknown> | null;
  sessionId: string;
  userId: string;
  targetId: string | null;
  createdAt: Date;
}

export interface MessageDTO {
  id: string;
  channel: ChatChannel;
  content: string;
  type: MessageType;
  metadata: Record<string, unknown> | null;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  targetId: string | null;
  createdAt: string;
}

export interface DiceRoll {
  id: string;
  formula: string;
  results: number[];
  total: number;
  context: string | null;
  isSecret: boolean;
  sessionId: string;
  userId: string;
  createdAt: Date;
}

export interface DiceRollDTO {
  id: string;
  formula: string;
  results: number[];
  total: number;
  context: string | null;
  isSecret: boolean;
  userId: string;
  displayName: string;
  createdAt: string;
}
