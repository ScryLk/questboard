// ── Helper centralizado de emit Socket.IO ──
//
// Cada função emite um evento tipado para a sala da sessão (namespace
// `/session`, room `session:<id>`). Centraliza nomes de eventos e
// shapes de payload — evita typos e drift entre handlers.
//
// Eventos espelham os listados no CLAUDE.md §8.

import { getIO } from "./socket.js";

const NAMESPACE = "/session";

function room(sessionId: string): string {
  return `session:${sessionId}`;
}

function emitToSession(sessionId: string, event: string, payload: unknown): void {
  try {
    const io = getIO();
    io.of(NAMESPACE).to(room(sessionId)).emit(event, payload);
  } catch {
    // Socket.IO não inicializado em dev/teste isolado — não derruba o
    // fluxo. Logging fica a cargo do caller se quiser.
  }
}

// ─── Sessão ──────────────────────────────────────────────────

export interface SessionStatusChangedPayload {
  sessionId: string;
  status: "IDLE" | "LOBBY" | "LIVE" | "PAUSED" | "ENDED" | "ARCHIVED";
  by: string;
  at: string;
}

export function emitSessionStatusChanged(p: SessionStatusChangedPayload): void {
  emitToSession(p.sessionId, "session:status-changed", p);
}

export interface SessionSettingsUpdatedPayload {
  sessionId: string;
  settings: Record<string, unknown>;
  by: string;
  at: string;
}

export function emitSessionSettingsUpdated(p: SessionSettingsUpdatedPayload): void {
  emitToSession(p.sessionId, "session:settings-updated", p);
}

// ─── Combate ─────────────────────────────────────────────────

export interface CombatHpChangedPayload {
  sessionId: string;
  participantId: string;
  tokenId?: string | null;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  delta: number;
  isDead: boolean;
  by: string;
  at: string;
}

export function emitCombatHpChanged(p: CombatHpChangedPayload): void {
  emitToSession(p.sessionId, "combat:hp-changed", p);
}

// ─── Dados ───────────────────────────────────────────────────

export interface DiceResultPayload {
  sessionId: string;
  rollId: string;
  rolledBy: string;
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  label?: string;
  context?: string;
  visibility: "public" | "secret";
  isNat20: boolean;
  isNat1: boolean;
  at: string;
}

/** Rola público vai pra todos da sala; secret vai só pro GM owner. */
export function emitDiceResult(
  p: DiceResultPayload,
  options?: { gmRoom?: string },
): void {
  try {
    const io = getIO();
    if (p.visibility === "secret" && options?.gmRoom) {
      io.of(NAMESPACE).to(options.gmRoom).emit("dice:result", p);
    } else {
      io.of(NAMESPACE).to(room(p.sessionId)).emit("dice:result", p);
    }
  } catch {
    // Silent: socket não inicializado em testes unitários.
  }
}

// ─── Presença ────────────────────────────────────────────────

export interface PlayerPresencePayload {
  sessionId: string;
  userId: string;
  at: string;
}

export function emitPlayerConnected(p: PlayerPresencePayload): void {
  emitToSession(p.sessionId, "player:connected", p);
}

export function emitPlayerDisconnected(p: PlayerPresencePayload): void {
  emitToSession(p.sessionId, "player:disconnected", p);
}

// ─── Conversa com NPC (CLAUDE.md §6.3 / §8) ──────────────────

export interface NpcConversationOpenedPayload {
  conversationId: string;
  sessionId: string;
  npcId: string;
  mode: "SCRIPTED" | "AI" | "HYBRID";
  initiatorId: string;
  greeting?: string | null;
  at: string;
}

export function emitNpcConversationOpened(p: NpcConversationOpenedPayload): void {
  emitToSession(p.sessionId, "npc:conversation-opened", p);
}

export interface NpcThinkingPayload {
  conversationId: string;
  sessionId: string;
}

/** Sinaliza ao frontend que o backend está processando a fala do NPC.
 *  Modo SCRIPTED é instantâneo, então só emite no AI/HYBRID. Mantido
 *  no helper pra ficar pronto pra Sprint Gemini. */
export function emitNpcThinking(p: NpcThinkingPayload): void {
  emitToSession(p.sessionId, "npc:thinking", p);
}

export interface NpcConversationMessagePayload {
  conversationId: string;
  sessionId: string;
  message: {
    id: string;
    speaker: "NPC" | "PLAYER" | "GM_OVERRIDE";
    text: string;
    branchId?: string | null;
    createdAt: string;
  };
  /** Quando true, modal frontend mostra "Encerrar". */
  finished: boolean;
}

export function emitNpcMessage(p: NpcConversationMessagePayload): void {
  emitToSession(p.sessionId, "npc:message", p);
}

export interface NpcConversationClosedPayload {
  conversationId: string;
  sessionId: string;
  reason: "finished" | "interrupted";
  at: string;
}

export function emitNpcConversationClosed(
  p: NpcConversationClosedPayload,
): void {
  emitToSession(p.sessionId, "npc:conversation-closed", p);
}

export interface NpcReputationChangedPayload {
  conversationId: string;
  sessionId: string;
  delta: number;
  total: number;
}

export function emitNpcReputationChanged(
  p: NpcReputationChangedPayload,
): void {
  emitToSession(p.sessionId, "npc:reputation-changed", p);
}

// ─── Behavior (CLAUDE.md §6.2) ──────────────────────────────

export interface BehaviorTickPayload {
  behaviorId: string;
  sessionId: string;
  ts: number;
  positions: Array<{
    tokenId: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: number;
  }>;
}

export function emitBehaviorTick(p: BehaviorTickPayload): void {
  emitToSession(p.sessionId, "npc:behavior-tick", p);
}

export interface BehaviorTokenEventPayload {
  behaviorId: string;
  sessionId: string;
  tokenId: string;
  at: string;
}

export function emitNpcEscaped(p: BehaviorTokenEventPayload): void {
  emitToSession(p.sessionId, "npc:escaped", p);
}

export function emitNpcTrapped(p: BehaviorTokenEventPayload): void {
  emitToSession(p.sessionId, "npc:trapped", p);
}

export interface DoorEventPayload {
  sessionId: string;
  doorId: string;
  tokenId: string;
  at: string;
}

export function emitDoorNpcOpened(p: DoorEventPayload): void {
  emitToSession(p.sessionId, "door:npc-opened", p);
}

export function emitDoorNpcBroken(p: DoorEventPayload): void {
  emitToSession(p.sessionId, "door:npc-broken", p);
}

export interface BehaviorLifecyclePayload {
  behaviorId: string;
  sessionId: string;
  type: string;
  at: string;
}

export function emitBehaviorStarted(p: BehaviorLifecyclePayload): void {
  emitToSession(p.sessionId, "npc:behavior-started", p);
}

export function emitBehaviorEnded(p: BehaviorLifecyclePayload): void {
  emitToSession(p.sessionId, "npc:behavior-ended", p);
}
