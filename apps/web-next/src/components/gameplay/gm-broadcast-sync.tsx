"use client";

import { useEffect } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import {
  broadcastSend,
  onBroadcastMessage,
} from "@/lib/broadcast-sync";
import type { BroadcastMessage, GmStateSyncPayload } from "@/lib/broadcast-sync";
import type { ChatMessage } from "@/lib/gameplay-mock-data";
import { MOCK_MAP } from "@/lib/gameplay-mock-data";
import { canTokenTravel } from "@/lib/collision";

/**
 * GmBroadcastSync — GM-side counterpart of the player's BroadcastSync.
 *
 * Outbound: mirrors the GM game state to player tabs via gm:state-sync,
 * throttled with leading edge so token movement feels instantaneous.
 *
 * Inbound: applies player actions (move, chat, roll, end-turn) to the
 * GM store. The store change re-triggers the state broadcast, which
 * confirms (or corrects) the player's optimistic update.
 */

const SYNC_THROTTLE_MS = 50;

let throttleTimer: number | null = null;
let lastSentAt = 0;

function buildStatePayload(): GmStateSyncPayload {
  const s = useGameplayStore.getState();
  return {
    tokens: s.tokens,
    fogCells: s.fogCells,
    terrainCells: s.terrainCells,
    wallEdges: s.wallEdges,
    markers: s.markers,
    notes: s.notes,
    aoeInstances: s.aoeInstances,
    damageFloats: s.damageFloats,
    gridVisible: s.gridVisible,
    fogSettings: s.fogSettings,
    combat: s.combat,
    messages: s.messages,
  };
}

function broadcastState(): void {
  lastSentAt = Date.now();
  broadcastSend("gm:state-sync", buildStatePayload(), "gm");
}

function scheduleBroadcast(): void {
  const elapsed = Date.now() - lastSentAt;
  if (elapsed >= SYNC_THROTTLE_MS) {
    broadcastState();
    return;
  }
  if (throttleTimer === null) {
    throttleTimer = window.setTimeout(() => {
      throttleTimer = null;
      broadcastState();
    }, SYNC_THROTTLE_MS - elapsed);
  }
}

/** First unoccupied cell in an outward spiral from the map center. */
function findFreeCell(tokens: Array<{ x: number; y: number; onMap?: boolean }>): { x: number; y: number } {
  const cx = Math.floor(MOCK_MAP.gridCols / 2);
  const cy = Math.floor(MOCK_MAP.gridRows / 2);
  const occupied = new Set(tokens.map((t) => `${t.x},${t.y}`));

  for (let radius = 0; radius < Math.max(MOCK_MAP.gridCols, MOCK_MAP.gridRows); radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= MOCK_MAP.gridCols || y >= MOCK_MAP.gridRows) continue;
        if (!occupied.has(`${x},${y}`)) return { x, y };
      }
    }
  }
  return { x: cx, y: cy };
}

function handlePlayerMessage(msg: BroadcastMessage): void {
  if (!msg.senderId.startsWith("player")) return;
  const store = useGameplayStore.getState();

  switch (msg.type) {
    case "lobby:join-request": {
      // GM is already in gameplay — let the waiting player in immediately
      const p = msg.payload as { playerName?: string; characterName?: string };
      store.addToast(`${p.playerName ?? "Jogador"} entrou na sala — sessão em andamento, liberando entrada`);
      broadcastSend("lobby:session-start", {}, "gm");
      broadcastState();
      break;
    }

    case "player:join": {
      const p = msg.payload as { playerId?: string; playerName?: string; characterName?: string };
      store.addToast(`${p.characterName ?? p.playerName ?? "Jogador"} conectou-se à sessão`);

      // Make sure the player has a controllable token on the map
      if (p.playerId) {
        const owned = store.tokens.find((t) => t.playerId === p.playerId);
        if (!owned) {
          const byName = p.characterName
            ? store.tokens.find((t) => !t.playerId && t.name === p.characterName)
            : undefined;
          if (byName) {
            store.assignTokenToPlayer(byName.id, p.playerId);
          } else {
            const spawn = findFreeCell(store.tokens);
            store.addToken({
              name: p.characterName ?? p.playerName ?? "Aventureiro",
              x: spawn.x,
              y: spawn.y,
              alignment: "player",
              hp: 30,
              maxHp: 30,
              ac: 14,
              speed: 30,
              playerId: p.playerId,
            });
          }
        }
      }

      // New tab needs the full state right away
      broadcastState();
      break;
    }

    case "player:move": {
      const { tokenId, x, y } = msg.payload as { tokenId: string; x: number; y: number };
      const token = store.tokens.find((t) => t.id === tokenId);
      if (!token) break;

      const check = canTokenTravel(
        token.x, token.y, x, y,
        MOCK_MAP.gridCols, MOCK_MAP.gridRows,
        store.wallEdges,
      );
      if (check.allowed) {
        store.moveToken(tokenId, x, y);
      } else {
        // Reject: re-broadcast authoritative state so the player snaps back
        broadcastState();
      }
      break;
    }

    case "player:chat":
    case "player:roll":
      store.addMessage(msg.payload as ChatMessage);
      break;

    case "player:end-turn": {
      if (!store.combat.active) break;
      const current = store.combat.order[store.combat.turnIndex];
      const token = current ? store.tokens.find((t) => t.id === current.tokenId) : null;
      // Only allow ending turns of player-controlled tokens
      if (token?.playerId) store.nextTurn();
      break;
    }
  }
}

export function GmBroadcastSync() {
  useEffect(() => {
    broadcastState();

    const unsubStore = useGameplayStore.subscribe(scheduleBroadcast);
    const unsubMsg = onBroadcastMessage("gm-sync", handlePlayerMessage);

    return () => {
      unsubStore();
      unsubMsg();
      if (throttleTimer !== null) {
        window.clearTimeout(throttleTimer);
        throttleTimer = null;
      }
    };
  }, []);

  return null;
}
