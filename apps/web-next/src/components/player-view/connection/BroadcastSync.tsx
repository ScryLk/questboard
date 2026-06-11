"use client";

import { useEffect } from "react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { buildPlayerView } from "@/lib/visibility-filter";
import { onBroadcastMessage, broadcastSend } from "@/lib/broadcast-sync";
import type { BroadcastMessage, GmStateSyncPayload } from "@/lib/broadcast-sync";
import { useNpcBehaviorStore } from "@/lib/npc-behavior-store";
import type { BehaviorTickPayload } from "@/lib/npc-behavior-types";

/**
 * BroadcastSync — player-side sync with the GM tab.
 *
 * Cross-tab flow:
 * 1. GM tab broadcasts gm:state-sync (throttled, ~instant) on every change.
 * 2. We mirror that payload into THIS tab's gameplay store, so every
 *    component that reads useGameplayStore (fog, terrain, AOE overlays)
 *    keeps working unchanged.
 * 3. syncFromGMStore() then derives the filtered player view.
 *
 * Player actions are sent via player:* messages and applied by the GM's
 * GmBroadcastSync, whose state re-broadcast confirms (or corrects) our
 * optimistic local updates.
 */
export function BroadcastSync() {
  useEffect(() => {
    // Initial sync from local store (mock state until first GM broadcast)
    syncFromGMStore();

    // Re-derive player view whenever the mirrored store changes
    const unsub = useGameplayStore.subscribe(() => {
      syncFromGMStore();
    });

    const unsubBroadcast = onBroadcastMessage("player-sync", handleBroadcastMessage);

    // Announce player joined — GM responds with a full gm:state-sync
    // and claims/creates our character token
    const state = usePlayerViewStore.getState();
    const chosenCharacter = state.availableCharacters.find(
      (c) => c.id === state.characterId,
    );
    broadcastSend("player:join", {
      playerId: state.playerId,
      playerName: state.playerName,
      characterName: chosenCharacter?.name ?? state.myToken?.name,
    }, "player");

    return () => {
      unsub();
      unsubBroadcast();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/**
 * Mirror the GM's broadcast state into this tab's gameplay store.
 * The store subscription then rebuilds the player view.
 */
function applyGMState(payload: GmStateSyncPayload) {
  useGameplayStore.setState({
    tokens: payload.tokens,
    fogCells: payload.fogCells,
    terrainCells: payload.terrainCells,
    wallEdges: payload.wallEdges,
    markers: payload.markers,
    notes: payload.notes,
    aoeInstances: payload.aoeInstances,
    damageFloats: payload.damageFloats,
    gridVisible: payload.gridVisible,
    fogSettings: payload.fogSettings,
    combat: payload.combat,
    messages: payload.messages,
  });
}

/**
 * Build the filtered player view from the (mirrored) gameplay store.
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
      applyGMState(msg.payload as GmStateSyncPayload);
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

    case "npc:behavior-tick":
      // Live NPC positions during PANIC/FLEE/RIOT etc.
      useNpcBehaviorStore.getState().applyTick(msg.payload as BehaviorTickPayload);
      break;

    case "npc:behavior-ended":
      // Clear stale overrides; authoritative positions come via gm:state-sync
      useNpcBehaviorStore.setState({ renderStates: {} });
      break;

    default:
      // Other gm:* events (scene/audio/npc) are handled by their own
      // sync components; state changes arrive via gm:state-sync.
      break;
  }
}
