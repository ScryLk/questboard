// ── Socket Event Types ──

import type { TokenDTO, FogAreaDTO } from "./map";
import type { MessageDTO, DiceRollDTO, DiceRollMode, ChatChannel } from "./chat";
import type { InitiativeEntry } from "./combat";
import type { SessionStatus, SessionPlayerDTO } from "./session";

export interface SessionAudioDTO {
  layer: string;
  trackId: string;
  trackName: string;
  trackUrl: string;
  volume: number;
  isPlaying: boolean;
}

// ── Lobby Types ──

export type LobbyPlayerStatus = "ready" | "joining" | "offline";

export interface LobbyPlayerDTO {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: "GM" | "PLAYER";
  characterName: string | null;
  characterClass: string | null;
  characterLevel: number | null;
  status: LobbyPlayerStatus;
}

export interface ServerToClientEvents {
  "session:player-joined": (data: { player: SessionPlayerDTO }) => void;
  "session:player-left": (data: { userId: string }) => void;
  "session:status-changed": (data: { status: SessionStatus }) => void;

  "token:moved": (data: { tokenId: string; x: number; y: number }) => void;
  "token:added": (data: { token: TokenDTO }) => void;
  "token:removed": (data: { tokenId: string }) => void;
  "token:updated": (data: {
    tokenId: string;
    changes: Partial<TokenDTO>;
  }) => void;

  "fog:updated": (data: { areas: FogAreaDTO[] }) => void;

  "dice:result": (data: DiceRollDTO) => void;

  "chat:message": (data: MessageDTO) => void;

  "audio:sync": (data: SessionAudioDTO[]) => void;

  "initiative:updated": (data: InitiativeEntry[]) => void;

  "cursor:position": (data: {
    userId: string;
    x: number;
    y: number;
  }) => void;

  // Lobby events
  "lobby:player-joined": (data: { player: LobbyPlayerDTO }) => void;
  "lobby:player-left": (data: { userId: string }) => void;
  "lobby:player-ready": (data: { userId: string; ready: boolean }) => void;
  "lobby:started": (data: { sessionId: string }) => void;
  "lobby:cancelled": () => void;
}

export interface ClientToServerEvents {
  "session:join": (data: { sessionId: string }) => void;
  "session:leave": () => void;

  "token:move": (data: { tokenId: string; x: number; y: number }) => void;

  "dice:roll": (data: {
    formula: string;
    context?: string;
    mode: DiceRollMode;
  }) => void;

  "chat:send": (data: {
    channel: ChatChannel;
    content: string;
    targetId?: string;
  }) => void;

  "cursor:move": (data: { x: number; y: number }) => void;

  // Lobby events
  "lobby:join": (data: { sessionId: string }) => void;
  "lobby:ready": (data: { ready: boolean }) => void;
  "lobby:start": () => void;
  "lobby:cancel": () => void;
  "lobby:disconnect": () => void;
}
