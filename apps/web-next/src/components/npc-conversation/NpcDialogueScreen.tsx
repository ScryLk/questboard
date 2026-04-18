"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Pencil,
  Dice5,
  MessageCircle,
} from "lucide-react";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";
import { usePlayerViewStore } from "@/lib/player-view-store";
import {
  MOOD_LABELS,
  MOOD_COLORS,
  getReputationLabel,
} from "@/lib/npc-conversation-types";
import type { DialogueOption, SpeechStyle } from "@/lib/npc-conversation-types";
import {
  detectSpeechStyle,
  calculateReputationDelta,
  resolveNextNode,
  filterAvailableOptions,
} from "@/lib/npc-conversation-engine";
import { NpcThinkingIndicator } from "./NpcThinkingIndicator";
import { ReputationBar } from "./ReputationBar";

export function NpcDialogueScreen() {
  const conversationId = useNpcConversationStore((s) => s.activePlayerConversationId);
  const conversation = useNpcConversationStore((s) =>
    conversationId ? s.activeConversations[conversationId] : null,
  );
  const profile = useNpcConversationStore((s) =>
    conversation ? s.profiles[conversation.npcId] : null,
  );
  const closePlayerConversation = useNpcConversationStore((s) => s.closePlayerConversation);
  const endConversation = useNpcConversationStore((s) => s.endConversation);
  const addMessage = useNpcConversationStore((s) => s.addMessage);
  const setNpcThinking = useNpcConversationStore((s) => s.setNpcThinking);
  const updateReputation = useNpcConversationStore((s) => s.updateReputation);
  const setCurrentNode = useNpcConversationStore((s) => s.setCurrentNode);
  const setCurrentOptions = useNpcConversationStore((s) => s.setCurrentOptions);

  const [freeText, setFreeText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [urgentBanner, setUrgentBanner] = useState<string | null>(null);
  const [tokenMovedToast, setTokenMovedToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages.length, scrollToBottom]);

  // F-27: Combat started while in NPC conversation → auto-close with banner
  const combat = usePlayerViewStore((s) => s.combat);
  useEffect(() => {
    if (combat?.active && conversationId) {
      setUrgentBanner("⚔️ Combate iniciado! Saindo da conversa…");
      const timer = setTimeout(() => {
        endConversation(conversationId);
        closePlayerConversation();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [combat?.active, conversationId, endConversation, closePlayerConversation]);

  // F-38: Session ended while in NPC conversation
  const sessionEnded = usePlayerViewStore((s) => s.sessionEnded);
  useEffect(() => {
    if (sessionEnded && conversationId) {
      setUrgentBanner("Sessão encerrada pelo mestre.");
      const timer = setTimeout(() => {
        endConversation(conversationId);
        closePlayerConversation();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionEnded, conversationId, endConversation, closePlayerConversation]);

  // F-22: Token moved by GM while in NPC conversation
  const myToken = usePlayerViewStore((s) => s.myToken);
  const prevTokenPos = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!myToken) return;
    if (prevTokenPos.current && (prevTokenPos.current.x !== myToken.x || prevTokenPos.current.y !== myToken.y)) {
      setTokenMovedToast(true);
      const timer = setTimeout(() => setTokenMovedToast(false), 4000);
      return () => clearTimeout(timer);
    }
    prevTokenPos.current = { x: myToken.x, y: myToken.y };
  }, [myToken?.x, myToken?.y]);

  if (!conversationId || !conversation) return null;

  const repLabel = getReputationLabel(conversation.reputation);
  const isScripted = conversation.mode === "SCRIPTED";
  const isHybrid = conversation.mode === "HYBRID";
  const hasOptions = conversation.currentOptions.length > 0;
  const availableOptions = hasOptions
    ? filterAvailableOptions(conversation.currentOptions, conversation.reputation)
    : [];

  function handleClose() {
    const hasReputationChange = conversation!.messages.some((m) => m.reputationDelta !== 0);
    if (hasReputationChange) {
      setShowConfirmClose(true);
    } else {
      doClose();
    }
  }

  function doClose() {
    abortRef.current?.abort();
    endConversation(conversationId!);
    closePlayerConversation();
  }

  async function handleSendFreeText() {
    if (!freeText.trim() || isStreaming) return;
    const text = freeText.trim();
    setFreeText("");

    const style = detectSpeechStyle(text);
    const repDelta = calculateReputationDelta(style, conversation!.mood);

    addMessage(conversationId!, {
      role: "PLAYER",
      text,
      wasAI: false,
      gmOverride: false,
      detectedStyle: style,
      reputationDelta: repDelta,
    });

    if (repDelta !== 0) {
      updateReputation(conversationId!, repDelta);
    }

    if (isScripted && !isHybrid) {
      handleScriptedKeywordMatch(text, style);
    } else {
      await generateAIResponse(text, style);
    }
  }

  function handleOptionClick(option: DialogueOption) {
    if (isStreaming) return;

    const style = detectSpeechStyle(option.text);
    const repDelta = calculateReputationDelta(style, conversation!.mood);

    addMessage(conversationId!, {
      role: "PLAYER",
      text: option.text,
      wasAI: false,
      gmOverride: false,
      detectedStyle: style,
      reputationDelta: repDelta,
    });

    if (repDelta !== 0) {
      updateReputation(conversationId!, repDelta);
    }

    if (option.nextNodeId === null) {
      addMessage(conversationId!, {
        role: "SYSTEM",
        text: "A conversa chegou ao fim.",
        wasAI: false,
        gmOverride: false,
        reputationDelta: 0,
      });
      setCurrentOptions(conversationId!, []);
      return;
    }

    const nextNode = profile
      ? resolveNextNode(profile.dialogueTree, option.nextNodeId)
      : null;

    if (nextNode) {
      setCurrentNode(conversationId!, nextNode.id);
      setCurrentOptions(conversationId!, nextNode.options);
      addMessage(conversationId!, {
        role: "NPC",
        text: nextNode.npcText,
        nodeId: nextNode.id,
        wasAI: false,
        gmOverride: false,
        reputationDelta: 0,
      });
    } else if (isHybrid) {
      generateAIResponse(option.text, style);
    }
  }

  function handleScriptedKeywordMatch(_text: string, _style: SpeechStyle) {
    addMessage(conversationId!, {
      role: "NPC",
      text: "...",
      wasAI: false,
      gmOverride: false,
      reputationDelta: 0,
    });
  }

  async function generateAIResponse(playerText: string, _style: SpeechStyle) {
    if (!profile) return;
    setIsStreaming(true);
    setNpcThinking(conversationId!, true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // F-46: 10s timeout for AI response
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const historyForAI = conversation!.messages
        .filter((m) => m.role !== "SYSTEM")
        .slice(-10)
        .map((m) => ({
          role: (m.role === "PLAYER" ? "player" : "npc") as "player" | "npc",
          text: m.text,
        }));

      const body = {
        npcName: conversation!.npcName,
        profile,
        context: {
          character: {
            name: conversation!.characterName,
            race: "Humano",
            class: "Aventureiro",
            level: 5,
            background: "Herói Popular",
            alignment: "Neutro Bom",
            hpPercent: 100,
            conditions: [],
          },
          equipment: {
            weaponInHand: null,
            armorType: null,
            visibleItems: [],
            isWeaponDrawn: false,
          },
          reputation: {
            withNpc: conversation!.reputation,
            withFaction: 0,
            label: repLabel.label,
          },
          detectedSpeechStyle: _style,
          session: {
            locationName: "Taverna do Goblin Dourado",
            isInCombat: false,
            timeOfDay: "Tarde",
            partyNearby: [],
          },
          conversationHistory: historyForAI,
          previousEncounters: [],
        },
        playerMessage: playerText,
        conversationHistory: historyForAI,
      };

      const res = await fetch("/api/ai/npc-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream não disponível");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      setNpcThinking(conversationId!, false);
      addMessage(conversationId!, {
        role: "NPC",
        text: fullText,
        wasAI: true,
        gmOverride: false,
        reputationDelta: 0,
      });
    } catch (err: unknown) {
      setNpcThinking(conversationId!, false);
      if (err instanceof Error && err.name === "AbortError") {
        addMessage(conversationId!, {
          role: "NPC",
          text: "[O NPC parece distraído e não responde agora]",
          wasAI: false,
          gmOverride: false,
          reputationDelta: 0,
        });
      } else {
        addMessage(conversationId!, {
          role: "NPC",
          text: "*O NPC fica em silêncio por um momento.*",
          wasAI: false,
          gmOverride: false,
          reputationDelta: 0,
        });
      }
    } finally {
      clearTimeout(timeoutId);
      setIsStreaming(false);
    }
  }

  const initials = conversation.npcPortrait || conversation.npcName.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-[#0A0A0F]/80 backdrop-blur-xl" />

      {/* F-27/F-38: Urgent banner (combat started, session ended) */}
      {urgentBanner && (
        <div className="absolute left-1/2 top-8 z-30 -translate-x-1/2 rounded-xl border border-[#E17055]/40 bg-[#E17055]/20 px-6 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
          {urgentBanner}
        </div>
      )}

      {/* F-22: Token moved toast */}
      {tokenMovedToast && (
        <div className="absolute left-1/2 bottom-8 z-30 -translate-x-1/2 rounded-lg border border-white/10 bg-[#111116]/90 px-4 py-2 text-xs text-white/70 shadow-lg backdrop-blur-sm">
          Seu personagem foi movido pelo mestre enquanto você estava em conversa.
        </div>
      )}

      {/* Main panel */}
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#2a2a35] bg-[#0e0e14] shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        style={{ minHeight: "min(600px, 80vh)" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[#1a1a25] px-6 py-4">
          {/* NPC Portrait */}
          <div className="relative">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ring-2"
              style={{
                backgroundColor: conversation.npcPortraitColor + "40",
                ringColor: conversation.mode === "AI" ? "#7c5cfc" : "#FDCB6E",
              }}
            >
              {initials}
            </div>
            {conversation.mode === "AI" && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#7c5cfc] ring-2 ring-[#0e0e14]">
                <div className="h-full w-full animate-pulse rounded-full bg-[#7c5cfc]" />
              </div>
            )}
          </div>

          {/* NPC Info */}
          <div className="flex-1">
            <h2 className="text-base font-bold text-white">
              {conversation.npcName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#888]">
              <span
                className="inline-flex items-center gap-1"
                style={{ color: MOOD_COLORS[conversation.mood] }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: MOOD_COLORS[conversation.mood] }} />
                {MOOD_LABELS[conversation.mood]}
              </span>
              {conversation.factionName && (
                <>
                  <span>·</span>
                  <span>{conversation.factionName}</span>
                </>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {conversation.messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "SYSTEM" ? (
                <div className="text-center text-xs italic text-[#555]">
                  {msg.text}
                </div>
              ) : msg.role === "NPC" ? (
                <div className="flex gap-3">
                  <div
                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: conversation.npcPortraitColor + "40" }}
                  >
                    {initials}
                  </div>
                  <div className="max-w-[85%]">
                    <div className="rounded-xl rounded-tl-sm border-l-[3px] border-[#7c5cfc] bg-[#1a1520] px-4 py-3">
                      <p className="text-sm leading-relaxed text-[#ddd]" style={{ fontFamily: "Georgia, serif" }}>
                        &ldquo;{msg.text}&rdquo;
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#555]">
                      {msg.gmOverride && (
                        <span className="text-[#E17055]">GM</span>
                      )}
                      {msg.wasAI && (
                        <span className="text-[#7c5cfc]">IA</span>
                      )}
                      {msg.reputationDelta !== 0 && (
                        <span style={{ color: msg.reputationDelta > 0 ? "#00B894" : "#FF4444" }}>
                          {msg.reputationDelta > 0 ? "+" : ""}{msg.reputationDelta} rep
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[85%]">
                    <div className="rounded-xl rounded-tr-sm bg-[#1a1a2e] px-4 py-3">
                      <p className="text-sm leading-relaxed text-[#ccc]">
                        {msg.text}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-[#555]">
                      {msg.detectedStyle && msg.detectedStyle !== "CASUAL" && (
                        <span className="text-[#A29BFE]">{msg.detectedStyle}</span>
                      )}
                      {msg.reputationDelta !== 0 && (
                        <span style={{ color: msg.reputationDelta > 0 ? "#00B894" : "#FF4444" }}>
                          {msg.reputationDelta > 0 ? "+" : ""}{msg.reputationDelta} rep
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* NPC thinking indicator */}
          {conversation.isNpcThinking && <NpcThinkingIndicator npcName={conversation.npcName} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Response options (scripted mode) */}
        {availableOptions.length > 0 && !conversation.isNpcThinking && (
          <div className="shrink-0 border-t border-[#1a1a25] px-6 py-3 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">
              Respostas
            </div>
            {availableOptions.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt)}
                disabled={isStreaming}
                className="group flex w-full items-start gap-3 rounded-lg border border-[#1a1a25] bg-[#111118] px-4 py-2.5 text-left transition-all hover:border-[#7c5cfc]/40 hover:bg-[#16161f] disabled:opacity-50"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-[#7c5cfc] ring-1 ring-[#7c5cfc]/30">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-[#bbb] group-hover:text-white">
                  {opt.text}
                </span>
                {opt.condition?.type === "skill_check" && (
                  <span className="flex shrink-0 items-center gap-1 rounded bg-[#E17055]/10 px-2 py-0.5 text-[10px] font-semibold text-[#E17055]">
                    <Dice5 className="h-3 w-3" />
                    {opt.condition.skill} CD{opt.condition.dc}
                  </span>
                )}
                {opt.condition?.type === "reputation" && opt.condition.min !== undefined && (
                  <span className="shrink-0 rounded bg-[#6C5CE7]/10 px-2 py-0.5 text-[10px] font-semibold text-[#6C5CE7]">
                    Rep ≥ {opt.condition.min}
                  </span>
                )}
                {opt.condition?.type === "class" && (
                  <span className="shrink-0 rounded bg-[#00B894]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00B894]">
                    {opt.condition.value}
                  </span>
                )}
                {opt.condition?.type === "item" && (
                  <span className="shrink-0 rounded bg-[#FDCB6E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FDCB6E]">
                    Requer item
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Free text input (always available) */}
        <div className="shrink-0 border-t border-[#1a1a25] px-6 py-3">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 shrink-0 text-[#555]" />
            <input
              ref={inputRef}
              type="text"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFreeText();
                }
              }}
              placeholder="Escrever livremente..."
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-[#444] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSendFreeText}
              disabled={!freeText.trim() || isStreaming}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c5cfc] text-white transition-colors hover:bg-[#6C5CE7] disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reputation bar */}
        <div className="shrink-0 border-t border-[#1a1a25] px-6 py-2">
          <ReputationBar reputation={conversation.reputation} />
        </div>
      </div>

      {/* Close confirmation */}
      {showConfirmClose && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60">
          <div className="w-80 rounded-xl border border-[#2a2a35] bg-[#111116] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white">Encerrar conversa?</h3>
            <p className="mt-2 text-xs text-[#888]">
              A reputação com {conversation.npcName} mudou durante esta conversa.
              Deseja encerrar?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="rounded-lg border border-[#2a2a35] px-4 py-1.5 text-xs text-[#888] transition-colors hover:bg-white/5 hover:text-white"
              >
                Continuar
              </button>
              <button
                onClick={doClose}
                className="rounded-lg bg-[#FF4444] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#CC3333]"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
