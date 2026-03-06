"use client";

import { useCallback, useRef, useState } from "react";
import {
  Hash,
  Lock,
  Send,
  Shield,
} from "lucide-react";
import type { ChatChannel, ChatMessage } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { playSFX } from "@/lib/audio/sfx-triggers";
import { NPCDialogueButton } from "./npc-dialogue-button";

const CHANNEL_CONFIG: {
  key: ChatChannel;
  label: string;
  icon: typeof Hash;
}[] = [
  { key: "geral", label: "Geral", icon: Hash },
  { key: "mesa-gm", label: "Mesa GM", icon: Shield },
  { key: "sussurro", label: "Sussurro", icon: Lock },
];

export function ChatTab() {
  const messages = useGameplayStore((s) => s.messages);
  const chatChannel = useGameplayStore((s) => s.chatChannel);
  const setChatChannel = useGameplayStore((s) => s.setChatChannel);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const selectedTokenIds = useGameplayStore((s) => s.selectedTokenIds);
  const tokens = useGameplayStore((s) => s.tokens);

  // Find selected NPC token (non-player, no playerId)
  const selectedNPCToken = selectedTokenIds.length === 1
    ? tokens.find(
        (t) =>
          t.id === selectedTokenIds[0] &&
          t.alignment !== "player" &&
          !t.playerId,
      ) ?? null
    : null;

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(
    (m) => m.channel === chatChannel || m.channel === "geral",
  );

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      channel: chatChannel,
      type: chatChannel === "sussurro" ? "whisper" : "normal",
      sender: "Voce (GM)",
      senderInitials: "GM",
      isGM: true,
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    addMessage(msg);
    playSFX("ui:chat_message");
    setInput("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [input, chatChannel, addMessage]);

  return (
    <div className="flex h-full flex-col">
      {/* Channel selector */}
      <div className="flex border-b border-brand-border">
        {CHANNEL_CONFIG.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setChatChannel(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors ${
              chatChannel === key
                ? "border-b-2 border-brand-accent text-brand-accent"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2"
      >
        {filteredMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* NPC Dialogue */}
      {selectedNPCToken && <NPCDialogueButton token={selectedNPCToken} />}

      {/* Input */}
      <div className="border-t border-brand-border p-2">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Mensagem em #${chatChannel}...`}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-xs text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-accent text-white transition-colors hover:bg-brand-accent-hover disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isSystem = message.type === "system";
  const isRoll = message.type === "roll";
  const isWhisper = message.type === "whisper";

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] text-brand-muted">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`mb-2 rounded-lg px-3 py-2 ${
        isWhisper
          ? "border border-brand-accent/20 bg-brand-accent/[0.06]"
          : "bg-white/[0.03]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
            message.isGM
              ? "bg-brand-accent/20 text-brand-accent"
              : "bg-white/10 text-brand-muted"
          }`}
        >
          {message.senderInitials}
        </div>
        <span className="text-[11px] font-medium text-brand-text">
          {message.sender}
        </span>
        {message.isGM && (
          <span className="rounded bg-brand-accent/15 px-1 py-0.5 text-[8px] font-bold uppercase text-brand-accent">
            GM
          </span>
        )}
        {isWhisper && <Lock className="h-2.5 w-2.5 text-brand-accent" />}
        <span className="ml-auto text-[10px] text-brand-muted">
          {message.timestamp}
        </span>
      </div>

      {/* Content */}
      <p className="mt-1 text-xs leading-relaxed text-brand-text/80">
        {message.content}
      </p>

      {/* Roll card */}
      {isRoll && (
        <div className="mt-1.5 rounded-md border border-brand-border bg-brand-primary p-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-brand-muted">
              {message.rollFormula}
            </span>
            <span className="text-[10px] text-brand-muted">
              ({message.rollDetails})
            </span>
          </div>
          <p
            className={`mt-0.5 text-lg font-bold tabular-nums ${
              message.isNat20
                ? "text-[#FFD700]"
                : message.isNat1
                  ? "text-brand-danger"
                  : "text-brand-text"
            }`}
          >
            {message.rollResult}
            {message.isNat20 && (
              <span className="ml-1.5 text-[10px] font-bold uppercase text-[#FFD700]">
                NAT 20!
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
