"use client";

import { useState, useCallback, useRef } from "react";
import { safeParseNPCJSON } from "@/lib/ai-utils";
import type { CustomCreature, CreaturePersonality } from "@/lib/ai-types";

interface GeneratedNPC {
  creature: CustomCreature;
  personality: CreaturePersonality;
}

export function useGenerateNPC() {
  const [generatedNPC, setGeneratedNPC] = useState<GeneratedNPC | null>(null);
  const [streamedText, setStreamedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (prompt: string) => {
    setGeneratedNPC(null);
    setStreamedText("");
    setError(null);
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/generate-npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
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

      // Parse completed text
      const parsed = safeParseNPCJSON(fullText);
      if (parsed) {
        const customCreature: CustomCreature = {
          ...parsed.creature,
          isCustom: true,
          generatedAt: new Date().toISOString(),
          personality: parsed.personality,
          sourcePrompt: prompt,
        };
        setGeneratedNPC({
          creature: customCreature,
          personality: parsed.personality,
        });
      } else {
        setError(
          "Não foi possível interpretar a resposta da IA. Tente novamente.",
        );
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
    generatedNPC,
    error,
  };
}
