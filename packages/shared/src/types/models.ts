import type {
  Plan,
  SessionType,
  SessionStatus,
  PlayerRole,
  GridType,
  ChatChannel,
  MessageType,
} from "./enums";

export interface User {
  id: string;
  externalId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
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

export interface Character {
  id: string;
  name: string;
  system: string;
  templateId: string | null;
  data: Record<string, unknown>;
  avatarUrl: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterTemplate {
  id: string;
  system: string;
  name: string;
  schema: Record<string, unknown>;
  version: number;
}

export interface MapData {
  id: string;
  name: string;
  imageUrl: string;
  gridType: GridType;
  gridSize: number;
  width: number;
  height: number;
  sessionId: string;
  createdAt: Date;
}

export interface Token {
  id: string;
  x: number;
  y: number;
  size: number;
  imageUrl: string | null;
  label: string | null;
  conditions: string[];
  currentHp: number | null;
  maxHp: number | null;
  isVisible: boolean;
  mapId: string;
  characterId: string | null;
}

export interface FogArea {
  id: string;
  type: string;
  points: unknown;
  revealed: boolean;
  mapId: string;
}

export interface MapLayer {
  id: string;
  type: string;
  data: unknown;
  zIndex: number;
  visible: boolean;
  mapId: string;
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

export interface AudioTrack {
  id: string;
  category: string;
  name: string;
  url: string;
  duration: number;
  isBuiltin: boolean;
}

export interface SessionAudio {
  id: string;
  layer: string;
  volume: number;
  isPlaying: boolean;
  sessionId: string;
  trackId: string;
}

export interface TimelineEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  sessionId: string;
  createdAt: Date;
}
