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
