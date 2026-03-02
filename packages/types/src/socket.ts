// ── Socket Event Types ──

import type { TokenDTO, FogAreaDTO } from "./map.js";
import type { MessageDTO, DiceRollDTO, DiceRollMode, ChatChannel } from "./chat.js";
import type { InitiativeEntry } from "./combat.js";
import type { SessionStatus, SessionPlayerDTO } from "./session.js";

export interface SessionAudioDTO {
  layer: string;
  trackId: string;
  trackName: string;
  trackUrl: string;
  volume: number;
  isPlaying: boolean;
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
}
