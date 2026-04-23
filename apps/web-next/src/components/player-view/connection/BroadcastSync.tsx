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

// Último sussurro entregue ao overlay — evita reabrir no mesmo msg
// a cada re-sync. Vive em module-scope porque syncFromGMStore não é hook.
let lastWhisperShown: string | null = null;

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

  // Filter messages (no mesa-gm, e sussurros só pra quem é alvo/remetente)
  const myPlayerId = playerState.playerId;
  const filteredMessages = gmState.messages.filter((m) => {
    if (m.channel === "mesa-gm") return false;
    // Sussurro só visível pra destinatário ou remetente. Se whisperTo
    // estiver ausente (legacy), mantém visível pra não quebrar histórico.
    if (m.channel === "sussurro" && m.whisperTo) {
      return m.whisperTo === myPlayerId || m.sender === myPlayerId;
    }
    return true;
  });

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

  // Dispara overlay do sussurro quando um novo chega pra mim.
  const latestWhisper = [...filteredMessages]
    .reverse()
    .find(
      (m) =>
        m.channel === "sussurro" &&
        m.whisperTo === myPlayerId &&
        m.isGM,
    );
  if (latestWhisper && latestWhisper.id !== lastWhisperShown) {
    lastWhisperShown = latestWhisper.id;
    usePlayerViewStore.getState().showWhisper({
      fromName: latestWhisper.sender,
      message: latestWhisper.content,
      fromId: "gm",
      imageUrl: latestWhisper.imageUrl,
    });
  }
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

    case "gm:map-switch": {
      const { mapId, mapName } = msg.payload as { mapId: string; mapName?: string };
      usePlayerViewStore.getState().setActiveMap(mapId, mapName);
      break;
    }

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

    case "gm:move-approved": {
      const payload = msg.payload as { playerId: string };
      const me = usePlayerViewStore.getState().playerId;
      if (payload.playerId === me) {
        // Token já moveu via sync do GM store; só limpa o staged.
        usePlayerViewStore.getState().clearStagedMove();
      }
      break;
    }

    case "gm:move-rejected": {
      const payload = msg.payload as { playerId: string };
      const me = usePlayerViewStore.getState().playerId;
      if (payload.playerId === me) {
        usePlayerViewStore.getState().clearStagedMove();
      }
      break;
    }

    default:
      // Re-sync for any GM action
      syncFromGMStore();
      break;
  }
}
