export enum Plan {
  FREE = "FREE",
  ADVENTURER = "ADVENTURER",
  LEGENDARY = "LEGENDARY",
}

export enum SessionType {
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
  ASYNC = "ASYNC",
}

export enum SessionStatus {
  IDLE = "IDLE",
  LOBBY = "LOBBY",
  LIVE = "LIVE",
  PAUSED = "PAUSED",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED",
}

export enum PlayerRole {
  GM = "GM",
  CO_GM = "CO_GM",
  PLAYER = "PLAYER",
  SPECTATOR = "SPECTATOR",
}

export enum GridType {
  SQUARE = "SQUARE",
  HEX = "HEX",
}

export enum MapGenerationStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

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

export enum PostType {
  TEXT = "TEXT",
  CHARACTER_CARD = "CHARACTER_CARD",
  SESSION_HIGHLIGHT = "SESSION_HIGHLIGHT",
  ARTWORK = "ARTWORK",
  CAMPAIGN_RECRUIT = "CAMPAIGN_RECRUIT",
  DICE_ROLL = "DICE_ROLL",
  QUOTE = "QUOTE",
}

export enum PostVisibility {
  PUBLIC = "PUBLIC",
  FOLLOWERS = "FOLLOWERS",
  CAMPAIGN_ONLY = "CAMPAIGN_ONLY",
}

export enum ReactionType {
  EPIC = "EPIC",
  LORE = "LORE",
  LAUGH = "LAUGH",
  RIP = "RIP",
  HYPE = "HYPE",
  HEART = "HEART",
}
