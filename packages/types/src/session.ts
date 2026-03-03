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

export interface Session {
  id: string;
  name: string;
  type: SessionType;
  system: string;
  status: SessionStatus;
  inviteCode: string;
  maxPlayers: number;
  isPublic: boolean;
  tags: string[];
  scheduledAt: Date | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionPlayer {
  id: string;
  role: PlayerRole;
  joinedAt: Date;
  userId: string;
  sessionId: string;
  characterId: string | null;
}

export interface SessionPlayerDTO {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: PlayerRole;
  characterId: string | null;
  characterName: string | null;
}
