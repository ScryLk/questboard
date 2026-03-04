import type {
  PlayerRole,
  ChatChannel,
  MessageType,
} from "./enums";

export interface SessionPlayerDTO {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: PlayerRole;
  characterId: string | null;
  characterName: string | null;
}

export interface TokenDTO {
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
  characterId: string | null;
}

export interface FogAreaDTO {
  id: string;
  type: string;
  points: unknown;
  revealed: boolean;
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

export interface SessionAudioDTO {
  layer: string;
  trackId: string;
  trackName: string;
  trackUrl: string;
  volume: number;
  isPlaying: boolean;
}

export interface InitiativeEntry {
  id: string;
  tokenId: string;
  label: string;
  initiative: number;
  isCurrentTurn: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
