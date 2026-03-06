"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useNPCDialogue } from "@/hooks/use-npc-dialogue";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { GameToken } from "@/lib/gameplay-mock-data";

interface NPCDialogueButtonProps {
  token: GameToken;
}

export function NPCDialogueButton({ token }: NPCDialogueButtonProps) {
  const [situation, setSituation] = useState("");
  const { generate, isLoading, streamedText, error } = useNPCDialogue();
  const addMessage = useGameplayStore((s) => s.addMessage);
  const chatChannel = useGameplayStore((s) => s.chatChannel);
  const prevStreamRef = useRef("");

  // When streaming completes, add as chat message
  useEffect(() => {
    if (!isLoading && streamedText && streamedText !== prevStreamRef.current) {
      prevStreamRef.current = streamedText;
      addMessage({
        id: `msg_${Date.now()}`,
        channel: chatChannel,
        type: "normal",
        sender: token.name,
        senderInitials: token.name.slice(0, 2).toUpperCase(),
        isGM: false,
        content: streamedText,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  }, [isLoading, streamedText, token.name, addMessage, chatChannel]);

  function handleGenerate() {
    if (isLoading) return;
    generate(token, situation);
  }

  return (
    <div className="border-t border-brand-border px-3 py-2">
      <div className="flex items-center gap-2">
        {/* NPC indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-brand-muted">
          <span className="font-medium text-brand-text">
            {token.icon ?? token.name.slice(0, 2).toUpperCase()}
          </span>
          <span>Falar como: {token.name}</span>
        </div>
      </div>

      <div className="mt-1.5 flex gap-1.5">
        <input
          type="text"
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleGenerate();
          }}
          placeholder="Situação... (opcional)"
          className="flex-1 rounded-md border border-brand-border bg-white/[0.03] px-2 py-1 text-[11px] text-brand-text placeholder:text-brand-muted/40 focus:border-brand-accent/50 focus:outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-1 rounded-md bg-brand-accent/20 px-2.5 py-1 text-[11px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/30 disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          Gerar
        </button>
      </div>

      {/* Streaming preview */}
      {isLoading && streamedText && (
        <div className="mt-1.5 rounded-md bg-white/[0.02] px-2 py-1.5 text-[11px] text-brand-muted italic">
          {streamedText}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-1.5 text-[10px] text-red-400">{error}</div>
      )}
    </div>
  );
}
