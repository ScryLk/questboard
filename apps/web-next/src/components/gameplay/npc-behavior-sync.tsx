"use client";

import { useEffect } from "react";
import { useNpcBehaviorStore } from "@/lib/npc-behavior-store";
import { onBroadcastMessage, broadcastSend } from "@/lib/broadcast-sync";
import type { BroadcastMessage } from "@/lib/broadcast-sync";
import type { BehaviorTickPayload } from "@/lib/npc-behavior-types";

export function NpcBehaviorSync() {
  useEffect(() => {
    const cleanup = onBroadcastMessage("npc-behavior-sync", (msg: BroadcastMessage) => {
      const store = useNpcBehaviorStore.getState();

      switch (msg.type) {
        case "npc:behavior-tick": {
          const payload = msg.payload as BehaviorTickPayload;
          store.applyTick(payload);
          break;
        }
        case "npc:behavior-ended": {
          const { behaviorId } = msg.payload as { behaviorId: string };
          store.stopBehavior(behaviorId);
          break;
        }
        case "npc:behavior-paused": {
          const { behaviorId } = msg.payload as { behaviorId: string };
          store.pauseBehavior(behaviorId);
          break;
        }
        case "gm:combat-start": {
          store.pauseByTypes(["RIOT", "FLEE", "PANIC"]);
          break;
        }
        case "gm:map-switch": {
          store.stopAllForMap("default");
          break;
        }
      }
    });

    return cleanup;
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const s = useNpcBehaviorStore.getState();
      const renderStates = s.renderStates;
      const entries = Object.entries(renderStates);
      if (entries.length === 0) return;

      const positions = entries.map(([tokenId, rs]) => ({
        tokenId,
        x: rs.targetX,
        y: rs.targetY,
        facing: rs.facing,
      }));

      broadcastSend("npc:behavior-tick", {
        behaviorId: "broadcast",
        timestamp: Date.now(),
        positions,
      } satisfies BehaviorTickPayload);
    }, 200);

    return () => window.clearInterval(interval);
  }, []);

  return null;
}
