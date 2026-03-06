"use client";

import { useState, useCallback, useRef } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import { useNPCStore } from "@/lib/npc-store";
import { CREATURE_COMPENDIUM } from "@/lib/creature-data";
import type { DialogueRequest, CreaturePersonality } from "@/lib/ai-types";
import type { GameToken } from "@/lib/gameplay-mock-data";

export function useNPCDialogue() {
  const [streamedText, setStreamedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (token: GameToken, situation: string) => {
    setStreamedText("");
    setError(null);
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const state = useGameplayStore.getState();
      const customCreatures = useCustomCreaturesStore.getState().creatures;

      // Look up creature personality via tokenCreatureMap
      const creatureId = state.tokenCreatureMap[token.id];
      let personality: CreaturePersonality | null = null;
      let creatureType = "criatura";
      let extraContext = "";

      if (creatureId) {
        const custom = customCreatures.find((c) => c.id === creatureId);
        if (custom) {
          personality = custom.personality ?? null;
          creatureType = custom.type;
        } else {
          const compendium = CREATURE_COMPENDIUM.find(
            (c) => c.id === creatureId,
          );
          if (compendium) creatureType = compendium.type;
        }
      }

      // Enrich with NPC store data (personality, attitude, knowledge)
      const npcStore = useNPCStore.getState();
      const npcId = npcStore.getTokenNpcId(token.id);
      if (npcId) {
        const npc = npcStore.npcs.find((n) => n.id === npcId);
        if (npc) {
          if (!personality && npc.personality.personalityTrait) {
            personality = {
              personalityTraits: [npc.personality.personalityTrait],
              ideal: npc.personality.ideal,
              bond: npc.personality.bond,
              flaw: npc.personality.flaw,
              backstory: "",
              voiceNotes: npc.personality.voiceStyle,
              mannerisms: npc.personality.quirk,
              motivation: npc.personality.ideal,
            };
          }
          const parts: string[] = [];
          if (npc.aiContext) parts.push(npc.aiContext);
          if (npc.knowledge.length > 0) {
            const known = npc.knowledge.filter((k) => !k.revealed).map((k) => k.text);
            if (known.length > 0) parts.push(`Sabe sobre: ${known.join("; ")}`);
          }
          if (parts.length > 0) extraContext = parts.join("\n");
        }
      }

      // Get recent messages for context
      const recentMessages = state.messages
        .filter((m) => m.channel === state.chatChannel)
        .slice(-5)
        .map((m) => ({ sender: m.sender, content: m.content }));

      const fullSituation = [situation, extraContext]
        .filter(Boolean)
        .join("\n");

      const body: DialogueRequest = {
        npcName: token.name,
        personality,
        creatureType,
        situation: fullSituation,
        recentMessages,
        combatActive: state.combat.active,
      };

      const res = await fetch("/api/ai/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro de rede" }));
        throw new Error(err.error ?? `Erro ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream não disponível");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamedText(fullText);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generate,
    isLoading,
    streamedText,
    error,
  };
}
