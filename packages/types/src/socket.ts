// ── Socket Event Types ──

import type { TokenDTO, FogAreaDTO } from "./map";
import type { MessageDTO, DiceRollDTO, DiceRollMode, ChatChannel } from "./chat";
import type {
  InitiativeEntry,
  CombatState,
  CombatParticipant,
  CombatCondition,
  CombatConfig,
  CombatConditionId,
} from "./combat";
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

  // ── Combat Tracker (servidor → cliente) ──
  "combat:started": (data: { combat: CombatState }) => void;
  "combat:ended": (data: { sessionId: string }) => void;
  "combat:turn-changed": (data: {
    sessionId: string;
    round: number;
    currentIndex: number;
    currentTokenId: string;
  }) => void;
  "combat:initiative-changed": (data: {
    sessionId: string;
    tokenId: string;
    value: number;
  }) => void;
  "combat:reordered": (data: { sessionId: string; order: string[] }) => void;
  "combat:participant-added": (data: {
    sessionId: string;
    participant: CombatParticipant;
  }) => void;
  "combat:participant-removed": (data: {
    sessionId: string;
    tokenId: string;
  }) => void;
  "combat:condition-added": (data: {
    sessionId: string;
    tokenId: string;
    condition: CombatCondition;
  }) => void;
  "combat:condition-removed": (data: {
    sessionId: string;
    tokenId: string;
    conditionId: CombatConditionId;
  }) => void;
  "combat:config-changed": (data: {
    sessionId: string;
    config: CombatConfig;
  }) => void;
  "combat:hp-changed": (data: {
    sessionId: string;
    tokenId: string;
    hpCurrent: number;
    hpTemp?: number;
  }) => void;
  // Fatia 3A — broadcasts dos novos intents (servidor → cliente)
  "combat:participant-acted": (data: {
    sessionId: string;
    tokenId: string;
    hasActed: boolean;
  }) => void;
  "combat:condition-changed": (data: {
    sessionId: string;
    tokenId: string;
    conditionId: CombatConditionId;
    durationRounds: number | null;
  }) => void;

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

  // ── Combat Tracker (cliente → servidor) ──
  // GM intents
  "combat:start": (data: {
    sessionId: string;
    participantTokenIds: string[];
  }) => void;
  "combat:end": (data: { sessionId: string }) => void;
  "combat:next-turn": (data: { sessionId: string }) => void;
  "combat:previous-turn": (data: { sessionId: string }) => void;
  "combat:roll-all-initiative": (data: { sessionId: string }) => void;
  "combat:roll-initiative": (data: {
    sessionId: string;
    tokenId: string;
  }) => void;
  "combat:set-initiative": (data: {
    sessionId: string;
    tokenId: string;
    value: number;
  }) => void;
  "combat:reorder-initiative": (data: {
    sessionId: string;
    tokenIds: string[];
  }) => void;
  "combat:add-participant": (data: {
    sessionId: string;
    tokenId: string;
    initiative?: number;
  }) => void;
  "combat:remove-participant": (data: {
    sessionId: string;
    tokenId: string;
  }) => void;
  "combat:add-condition": (data: {
    sessionId: string;
    tokenId: string;
    conditionId: CombatConditionId;
    customLabel?: string;
    durationRounds?: number;
  }) => void;
  "combat:remove-condition": (data: {
    sessionId: string;
    tokenId: string;
    conditionId: CombatConditionId;
  }) => void;
  "combat:skip-turn": (data: { sessionId: string; tokenId: string }) => void;
  "combat:update-config": (data: {
    sessionId: string;
    showEnemyHp?: boolean;
    turnTimerSec?: 0 | 60 | 90;
  }) => void;
  // Fatia 3A — duplicar / mark-acted / condition-updated / hp-change extendido
  "combat:duplicate-participant": (data: {
    sessionId: string;
    sourceTokenId: string;
    autoName: string;
  }) => void;
  "combat:mark-acted": (data: {
    sessionId: string;
    tokenId: string;
    hasActed: boolean;
  }) => void;
  "combat:condition-updated": (data: {
    sessionId: string;
    tokenId: string;
    conditionId: CombatConditionId;
    durationRounds: number | null;
  }) => void;
  "combat:hp-change": (data: {
    sessionId: string;
    tokenId: string;
    delta?: number;
    absolute?: number;
    hpTemp?: number;
  }) => void;
  // Player intent
  "combat:pass-turn": (data: { sessionId: string }) => void;

  // Lobby events
  "lobby:join": (data: { sessionId: string }) => void;
  "lobby:ready": (data: { ready: boolean }) => void;
  "lobby:start": () => void;
  "lobby:cancel": () => void;
  "lobby:disconnect": () => void;
}
