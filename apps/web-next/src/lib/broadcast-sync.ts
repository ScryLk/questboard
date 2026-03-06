/**
 * BroadcastChannel-based sync between GM tab and Player tab.
 * Used for local development/demo — replaces Socket.IO.
 *
 * GM tab sends state updates → Player tab receives filtered view.
 * Player tab sends actions → GM tab receives and applies.
 */

// ── Message types ─────────────────────────────────────────────

export type BroadcastMessageType =
  // GM → Player
  | "gm:state-sync"          // Full state sync
  | "gm:token-move"          // Token moved
  | "gm:token-hp"            // Token HP changed
  | "gm:token-visibility"    // Token visibility changed
  | "gm:token-add"           // Token added
  | "gm:token-remove"        // Token removed
  | "gm:token-condition"     // Token condition changed
  | "gm:fog-update"          // Fog cells changed
  | "gm:combat-start"        // Combat started
  | "gm:combat-turn"         // Turn changed
  | "gm:combat-end"          // Combat ended
  | "gm:scene-show"          // Scene card
  | "gm:scene-dismiss"       // Scene card dismissed
  | "gm:soundtrack-play"     // Play soundtrack
  | "gm:soundtrack-stop"     // Stop soundtrack
  | "gm:chat-message"        // Chat message from GM
  | "gm:session-pause"       // Session paused
  | "gm:session-resume"      // Session resumed
  | "gm:session-end"         // Session ended
  | "gm:damage-applied"      // Damage applied to token
  | "gm:heal-applied"        // Heal applied to token
  // Player → GM
  | "player:move"            // Player moves token
  | "player:chat"            // Player chat message
  | "player:roll"            // Player rolled dice
  | "player:end-turn"        // Player ends turn
  | "player:join"            // Player connected
  | "player:leave"           // Player disconnected
  // Lobby — GM → Players
  | "lobby:session-info"     // Session metadata
  | "lobby:player-list"      // Full player list update
  | "lobby:player-accepted"  // Join request accepted
  | "lobby:player-rejected"  // Join request rejected
  | "lobby:player-kicked"    // Player kicked from lobby
  | "lobby:chat-message"     // Lobby chat message
  | "lobby:countdown-start"  // Countdown began
  | "lobby:countdown-cancel" // Countdown cancelled
  | "lobby:session-start"    // Session started
  // Lobby — Player → GM
  | "lobby:join-request"     // Player wants to join
  | "lobby:character-selected" // Player selected character
  | "lobby:ready"            // Player ready toggle
  | "lobby:player-chat"      // Player lobby chat
  | "lobby:ping";            // Heartbeat

export interface BroadcastMessage {
  type: BroadcastMessageType;
  payload: unknown;
  timestamp: number;
  senderId: string;
}

// ── Channel singleton ─────────────────────────────────────────

const CHANNEL_NAME = "questboard-session";

let channel: BroadcastChannel | null = null;

export function getBroadcastChannel(): BroadcastChannel {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function closeBroadcastChannel(): void {
  if (channel) {
    channel.close();
    channel = null;
  }
}

// ── Send helpers ──────────────────────────────────────────────

export function broadcastSend(
  type: BroadcastMessageType,
  payload: unknown,
  senderId = "gm",
): void {
  const ch = getBroadcastChannel();
  const msg: BroadcastMessage = {
    type,
    payload,
    timestamp: Date.now(),
    senderId,
  };
  ch.postMessage(msg);
}

// ── Listener helpers ──────────────────────────────────────────

type MessageHandler = (msg: BroadcastMessage) => void;

const listeners = new Map<string, MessageHandler>();

export function onBroadcastMessage(
  id: string,
  handler: MessageHandler,
): () => void {
  const ch = getBroadcastChannel();

  const wrappedHandler = (event: MessageEvent<BroadcastMessage>) => {
    handler(event.data);
  };

  // Remove old listener with same id
  if (listeners.has(id)) {
    ch.removeEventListener("message", listeners.get(id) as unknown as EventListenerOrEventListenerObject);
  }

  listeners.set(id, handler);
  ch.addEventListener("message", wrappedHandler as unknown as EventListenerOrEventListenerObject);

  return () => {
    ch.removeEventListener("message", wrappedHandler as unknown as EventListenerOrEventListenerObject);
    listeners.delete(id);
  };
}

// ── GM-side: auto-broadcast state on changes ──────────────────

export function broadcastGMState(serializedState: unknown): void {
  broadcastSend("gm:state-sync", serializedState, "gm");
}
