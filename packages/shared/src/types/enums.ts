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
  LIVE = "LIVE",
  PAUSED = "PAUSED",
  ENDED = "ENDED",
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
