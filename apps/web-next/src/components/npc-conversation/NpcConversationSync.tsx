"use client";

import { useEffect } from "react";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";
import {
  broadcastSend,
  onBroadcastMessage,
} from "@/lib/broadcast-sync";

export function NpcConversationSync({ role }: { role: "gm" | "player" }) {
  const activeConversations = useNpcConversationStore((s) => s.activeConversations);
  const addMessage = useNpcConversationStore((s) => s.addMessage);
  const setNpcThinking = useNpcConversationStore((s) => s.setNpcThinking);
  const updateReputation = useNpcConversationStore((s) => s.updateReputation);
  const updateConversationMood = useNpcConversationStore((s) => s.updateConversationMood);

  useEffect(() => {
    const cleanup = onBroadcastMessage(`npc-sync-${role}`, (msg) => {
      const payload = msg.payload as Record<string, unknown>;
      const convId = payload.conversationId as string;

      if (role === "gm") {
        switch (msg.type) {
          case "npc:conversation-started":
            break;
          case "npc:player-message":
            break;
          case "npc:conversation-ended":
            break;
          case "npc:voice-recording":
            setNpcThinking(convId, false);
            break;
          case "npc:voice-processing":
            setNpcThinking(convId, true);
            break;
          case "npc:voice-result": {
            const vr = payload as {
              playerText: string;
              playerEmotion: string;
              playerVolume: string;
              emotionIntensity: number;
              npcResponse: string;
              reputationDelta: number;
            };
            setNpcThinking(convId, false);
            addMessage(convId, {
              role: "PLAYER",
              text: vr.playerText,
              wasAI: false,
              gmOverride: false,
              reputationDelta: vr.reputationDelta,
              wasVoice: true,
              detectedEmotion: vr.playerEmotion as any,
              detectedVolume: vr.playerVolume as any,
              emotionIntensity: vr.emotionIntensity,
            });
            addMessage(convId, {
              role: "NPC",
              text: vr.npcResponse,
              wasAI: true,
              gmOverride: false,
              reputationDelta: 0,
            });
            if (vr.reputationDelta !== 0) {
              updateReputation(convId, vr.reputationDelta);
            }
            break;
          }
        }
      }

      if (role === "player") {
        switch (msg.type) {
          case "npc:gm-override":
            addMessage(convId, {
              role: "NPC",
              text: payload.text as string,
              wasAI: false,
              gmOverride: true,
              reputationDelta: 0,
            });
            break;
          case "npc:npc-thinking":
            setNpcThinking(convId, true);
            break;
          case "npc:npc-message":
            setNpcThinking(convId, false);
            addMessage(convId, {
              role: "NPC",
              text: payload.text as string,
              wasAI: payload.wasAI as boolean,
              gmOverride: false,
              reputationDelta: 0,
            });
            break;
          case "npc:mood-changed":
            updateConversationMood(convId, payload.mood as any);
            break;
          case "npc:reputation-changed":
            updateReputation(convId, payload.delta as number);
            break;
        }
      }
    });

    return cleanup;
  }, [role, addMessage, setNpcThinking, updateReputation, updateConversationMood]);

  // Broadcast player conversation events to GM
  useEffect(() => {
    if (role !== "player") return;

    const unsub = useNpcConversationStore.subscribe((state, prevState) => {
      const convIds = Object.keys(state.activeConversations);
      const prevConvIds = Object.keys(prevState.activeConversations);

      for (const id of convIds) {
        const conv = state.activeConversations[id];
        const prevConv = prevState.activeConversations[id];

        if (!prevConv) {
          broadcastSend("npc:conversation-started", {
            conversationId: id,
            npcId: conv.npcId,
            npcName: conv.npcName,
            characterName: conv.characterName,
          }, "player");
        }

        if (prevConv && conv.messages.length > prevConv.messages.length) {
          const newMsg = conv.messages[conv.messages.length - 1];
          if (newMsg.role === "PLAYER") {
            broadcastSend("npc:player-message", {
              conversationId: id,
              message: newMsg,
            }, "player");
          }
        }
      }

      for (const id of prevConvIds) {
        if (!convIds.includes(id)) {
          broadcastSend("npc:conversation-ended", {
            conversationId: id,
          }, "player");
        }
      }
    });

    return unsub;
  }, [role]);

  return null;
}
