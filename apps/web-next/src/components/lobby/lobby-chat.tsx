"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Megaphone } from "lucide-react";
import { useLobbyStore } from "@/lib/lobby-store";

export function LobbyChat() {
  const messages = useLobbyStore((s) => s.chatMessages);
  const sendMessage = useLobbyStore((s) => s.sendMessage);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText("");
  }

  return (
    <div className="flex flex-col">
      <span className="px-1 pb-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted">
        Chat da Sala
      </span>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex max-h-48 min-h-[120px] flex-col gap-1 overflow-y-auto rounded-lg border border-brand-border bg-white/[0.02] p-2"
      >
        {messages.length === 0 && (
          <p className="py-4 text-center text-xs italic text-brand-muted">
            Nenhuma mensagem ainda...
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === "system" ? (
              <p className="text-[10px] text-brand-muted">
                <span className="opacity-60">●</span> {msg.text}
              </p>
            ) : msg.type === "gm_announcement" ? (
              <div className="flex items-start gap-1 rounded bg-brand-accent/10 px-1.5 py-1">
                <Megaphone className="mt-0.5 h-3 w-3 flex-shrink-0 text-brand-accent" />
                <p className="text-[11px]">
                  <span className="font-semibold text-brand-accent">{msg.senderName}</span>{" "}
                  <span className="text-brand-text">{msg.text}</span>
                </p>
              </div>
            ) : (
              <p className="text-[11px]">
                <span className="font-semibold text-brand-text">{msg.senderName}:</span>{" "}
                <span className="text-brand-muted">{msg.text}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-1.5 flex gap-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Mensagem..."
          className="flex-1 rounded-lg border border-brand-border bg-white/[0.04] px-3 py-1.5 text-xs text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent text-white transition-colors hover:bg-brand-accent/80 disabled:opacity-30"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
