"use client";

import { useState, useRef, useEffect } from "react";
import {
  Eye,
  Send,
  Settings,
  Square,
  MessageCircle,
  Brain,
  BookOpen,
  Shuffle,
} from "lucide-react";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";
import {
  MOOD_LABELS,
  MOOD_COLORS,
  getReputationLabel,
} from "@/lib/npc-conversation-types";
import type { NpcConversation } from "@/lib/npc-conversation-types";

const MODE_CONFIG = {
  SCRIPTED: { label: "Roteiro", icon: BookOpen, color: "#FDCB6E" },
  AI: { label: "IA", icon: Brain, color: "#7c5cfc" },
  HYBRID: { label: "Híbrido", icon: Shuffle, color: "#00B894" },
} as const;

export function GmConversationMonitor() {
  const activeConversations = useNpcConversationStore((s) => s.activeConversations);
  const watchId = useNpcConversationStore((s) => s.activeGmWatchConversationId);
  const openGmWatch = useNpcConversationStore((s) => s.openGmWatch);
  const closeGmWatch = useNpcConversationStore((s) => s.closeGmWatch);
  const gmOverrideMessage = useNpcConversationStore((s) => s.gmOverrideMessage);
  const endConversation = useNpcConversationStore((s) => s.endConversation);

  const conversationList = Object.values(activeConversations);

  if (conversationList.length === 0) return null;

  const watchedConv = watchId ? activeConversations[watchId] : null;

  return (
    <div className="flex flex-col border-t border-brand-border bg-[#0d0d12]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-brand-border">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5 text-[#7c5cfc]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-text">
            Conversas Ativas
          </span>
          <span className="rounded-full bg-[#7c5cfc]/20 px-1.5 text-[10px] font-bold text-[#7c5cfc]">
            {conversationList.length}
          </span>
        </div>
      </div>

      {/* Conversation list */}
      {!watchedConv && (
        <div className="max-h-40 overflow-y-auto">
          {conversationList.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conv={conv}
              onWatch={() => openGmWatch(conv.id)}
              onEnd={() => endConversation(conv.id)}
            />
          ))}
        </div>
      )}

      {/* Watched conversation detail */}
      {watchedConv && (
        <ConversationDetail
          conv={watchedConv}
          onBack={closeGmWatch}
          onOverride={(text) => gmOverrideMessage(watchedConv.id, text)}
          onEnd={() => {
            endConversation(watchedConv.id);
            closeGmWatch();
          }}
        />
      )}
    </div>
  );
}

function ConversationListItem({
  conv,
  onWatch,
  onEnd,
}: {
  conv: NpcConversation;
  onWatch: () => void;
  onEnd: () => void;
}) {
  const modeConf = MODE_CONFIG[conv.mode];
  const ModeIcon = modeConf.icon;
  const lastMsg = conv.messages[conv.messages.length - 1];

  return (
    <div className="group flex items-center gap-2 border-b border-brand-border/50 px-3 py-2 hover:bg-white/[0.02]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-brand-text truncate">
            {conv.npcName}
          </span>
          <span className="text-[9px] text-brand-muted">↔</span>
          <span className="text-[11px] text-brand-muted truncate">
            {conv.characterName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="inline-flex items-center gap-0.5 text-[9px]" style={{ color: modeConf.color }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#00B894" }} />
            AO VIVO
          </span>
          <span className="text-[9px]" style={{ color: modeConf.color }}>
            <ModeIcon className="inline h-2.5 w-2.5" /> {modeConf.label}
          </span>
        </div>
        {lastMsg && (
          <p className="mt-1 text-[10px] text-[#555] truncate">
            [{lastMsg.role === "NPC" ? conv.npcName : conv.characterName}]: {lastMsg.text}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onWatch}
          className="flex h-6 w-6 items-center justify-center rounded text-brand-muted hover:bg-white/10 hover:text-brand-text"
          title="Observar"
        >
          <Eye className="h-3 w-3" />
        </button>
        <button
          onClick={onEnd}
          className="flex h-6 w-6 items-center justify-center rounded text-brand-muted hover:bg-red-500/20 hover:text-red-400"
          title="Encerrar"
        >
          <Square className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function ConversationDetail({
  conv,
  onBack,
  onOverride,
  onEnd,
}: {
  conv: NpcConversation;
  onBack: () => void;
  onOverride: (text: string) => void;
  onEnd: () => void;
}) {
  const [overrideText, setOverrideText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv.messages.length]);

  const repLabel = getReputationLabel(conv.reputation);
  const modeConf = MODE_CONFIG[conv.mode];

  function handleSendOverride() {
    if (!overrideText.trim()) return;
    onOverride(overrideText.trim());
    setOverrideText("");
  }

  return (
    <div className="flex flex-col" style={{ maxHeight: "320px" }}>
      {/* Detail header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-brand-border/50">
        <button
          onClick={onBack}
          className="text-[10px] text-brand-muted hover:text-brand-text"
        >
          ← Voltar
        </button>
        <div className="flex-1 text-center">
          <span className="text-[11px] font-medium text-brand-text">
            {conv.npcName} ↔ {conv.characterName}
          </span>
        </div>
        <span
          className="text-[9px] font-semibold"
          style={{ color: modeConf.color }}
        >
          {modeConf.label}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {conv.messages.map((msg) => (
          <div key={msg.id} className="text-[11px]">
            {msg.role === "SYSTEM" ? (
              <span className="italic text-[#444]">{msg.text}</span>
            ) : (
              <>
                <span className={msg.role === "NPC" ? "font-semibold text-[#7c5cfc]" : "font-semibold text-[#74B9FF]"}>
                  [{msg.role === "NPC" ? conv.npcName : conv.characterName}]
                </span>
                <span className="text-[#999]">: {msg.text}</span>
                {msg.gmOverride && <span className="ml-1 text-[9px] text-[#E17055]">(GM)</span>}
              </>
            )}
          </div>
        ))}
        {conv.isNpcThinking && (
          <div className="text-[11px]">
            <span className="font-semibold text-[#7c5cfc]">[{conv.npcName}]</span>
            <span className="text-[#555]">: ● digitando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* GM override input */}
      <div className="shrink-0 border-t border-brand-border/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={overrideText}
            onChange={(e) => setOverrideText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendOverride();
              }
            }}
            placeholder={`Digitar como ${conv.npcName} →`}
            className="flex-1 bg-transparent text-[11px] text-white placeholder:text-[#444] focus:outline-none"
          />
          <button
            onClick={handleSendOverride}
            disabled={!overrideText.trim()}
            className="flex h-5 w-5 items-center justify-center rounded bg-[#7c5cfc] text-white disabled:opacity-30"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Footer with reputation + actions */}
      <div className="flex items-center justify-between border-t border-brand-border/50 px-3 py-1.5">
        <span className="text-[10px]" style={{ color: repLabel.color }}>
          Reputação: {conv.reputation > 0 ? "+" : ""}{conv.reputation} {repLabel.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onEnd}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-brand-muted hover:bg-red-500/10 hover:text-red-400"
          >
            <Square className="h-3 w-3" />
            Encerrar
          </button>
        </div>
      </div>
    </div>
  );
}
