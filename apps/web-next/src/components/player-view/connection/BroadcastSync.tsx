"use client";

import { useEffect, useRef } from "react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { buildPlayerView } from "@/lib/visibility-filter";
import { onBroadcastMessage, broadcastSend } from "@/lib/broadcast-sync";
import type { BroadcastMessage } from "@/lib/broadcast-sync";

/**
 * BroadcastSync — syncs player view with GM state.
 *
 * For local development (same machine, different tabs):
 * - Listens to GM store changes and updates player view
 * - Listens to BroadcastChannel messages from GM tab
 * - Sends player actions via BroadcastChannel
 *
 * In production, this would be replaced by Socket.IO.
 */
export function BroadcastSync() {
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial sync + periodic sync from GM store
  useEffect(() => {
    // Sync immediately
    syncFromGMStore();

    // Subscribe to GM store changes
    const unsub = useGameplayStore.subscribe(() => {
      syncFromGMStore();
    });

    // Also listen for BroadcastChannel messages (from GM in another tab)
    const unsubBroadcast = onBroadcastMessage("player-sync", handleBroadcastMessage);

    // Announce player joined
    const state = usePlayerViewStore.getState();
    broadcastSend("player:join", {
      playerId: state.playerId,
      playerName: state.playerName,
      characterName: state.myToken?.name,
    }, "player");

    return () => {
      unsub();
      unsubBroadcast();
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/**
 * Read the GM's Zustand store directly (same tab / same window context)
 * and build the player view from it.
 */
function syncFromGMStore() {
  const gmState = useGameplayStore.getState();
  const playerState = usePlayerViewStore.getState();
  const settings = playerState.settings;

  const view = buildPlayerView(
    {
      tokens: gmState.tokens,
      fogCells: gmState.fogCells,
      combat: gmState.combat,
      markers: gmState.markers,
      notes: gmState.notes,
      aoeInstances: gmState.aoeInstances,
    },
    playerState.playerId,
    settings,
  );

  // Filter messages (no mesa-gm)
  const filteredMessages = gmState.messages.filter(
    (m) => m.channel !== "mesa-gm",
  );

  usePlayerViewStore.setState({
    visibleTokens: view.visibleTokens,
    myToken: view.myToken,
    fogCells: gmState.fogCells,
    visibleMarkers: view.visibleMarkers,
    visibleNotes: view.visibleNotes,
    visibleAOE: view.visibleAOE,
    combat: view.combat,
    isMyTurn: view.isMyTurn,
    movementMaxFt: view.myToken?.speed ?? 30,
    messages: filteredMessages,
    fogSettings: gmState.fogSettings,
  });
}

/**
 * Handle messages from BroadcastChannel (GM in another tab).
 */
function handleBroadcastMessage(msg: BroadcastMessage) {
  // Only process messages from GM
  if (msg.senderId === "player") return;

  switch (msg.type) {
    case "gm:state-sync":
      syncFromGMStore();
      break;

    case "gm:scene-show":
      usePlayerViewStore.getState().setActiveScene(msg.payload as import("@/lib/player-view-store").SceneCard);
      break;

    case "gm:scene-dismiss":
      usePlayerViewStore.getState().setActiveScene(null);
      break;

    case "gm:session-pause":
      usePlayerViewStore.getState().setSessionPaused(true);
      break;

    case "gm:session-resume":
      usePlayerViewStore.getState().setSessionPaused(false);
      break;

    case "gm:session-end":
      usePlayerViewStore.getState().setSessionEnded(true);
      break;

    case "gm:damage-applied": {
      const payload = msg.payload as { tokenId: string };
      const myToken = usePlayerViewStore.getState().myToken;
      if (myToken && payload.tokenId === myToken.id) {
        usePlayerViewStore.getState().triggerDamageVignette();
      }
      break;
    }

    case "gm:heal-applied": {
      const payload = msg.payload as { tokenId: string };
      const myToken = usePlayerViewStore.getState().myToken;
      if (myToken && payload.tokenId === myToken.id) {
        usePlayerViewStore.getState().triggerHealGlow();
      }
      break;
    }

    default:
      // Re-sync for any GM action
      syncFromGMStore();
      break;
  }
}
