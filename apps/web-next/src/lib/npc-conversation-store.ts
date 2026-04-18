import { create } from "zustand";
import type {
  NpcConversation,
  NpcConversationMessage,
  NpcConversationProfile,
  NpcMood,
  DialogueNode,
  DialogueOption,
  SpeechStyle,
} from "./npc-conversation-types";

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface NpcConversationState {
  // All NPC conversation profiles (keyed by npcId)
  profiles: Record<string, NpcConversationProfile>;

  // Active conversations (keyed by conversationId)
  activeConversations: Record<string, NpcConversation>;

  // Currently open conversation for the player (fullscreen dialogue)
  activePlayerConversationId: string | null;

  // GM is watching this conversation
  activeGmWatchConversationId: string | null;

  // Conversation history (past conversations, keyed by npcId → array)
  history: Record<string, NpcConversation[]>;

  // ── Profile Management ──
  setProfile: (npcId: string, profile: NpcConversationProfile) => void;
  removeProfile: (npcId: string) => void;
  getProfile: (npcId: string) => NpcConversationProfile | null;
  updateProfileMood: (npcId: string, mood: NpcMood) => void;

  // ── Conversation Lifecycle ──
  startConversation: (params: {
    npcId: string;
    npcName: string;
    npcPortrait: string;
    npcPortraitColor: string;
    characterId: string;
    characterName: string;
  }) => string;

  endConversation: (conversationId: string) => void;

  // ── Messages ──
  addMessage: (conversationId: string, message: Omit<NpcConversationMessage, "id" | "createdAt">) => void;
  setNpcThinking: (conversationId: string, thinking: boolean) => void;

  // ── Dialogue Tree ──
  setCurrentNode: (conversationId: string, nodeId: string | null) => void;
  setCurrentOptions: (conversationId: string, options: DialogueOption[]) => void;
  resolveScriptedResponse: (conversationId: string, nodeId: string) => DialogueNode | null;

  // ── Reputation ──
  updateReputation: (conversationId: string, delta: number) => void;

  // ── Mood ──
  updateConversationMood: (conversationId: string, mood: NpcMood) => void;

  // ── UI State ──
  openPlayerConversation: (conversationId: string) => void;
  closePlayerConversation: () => void;
  openGmWatch: (conversationId: string) => void;
  closeGmWatch: () => void;

  // ── GM Override ──
  gmOverrideMessage: (conversationId: string, text: string) => void;
}

export const useNpcConversationStore = create<NpcConversationState>((set, get) => ({
  profiles: {},
  activeConversations: {},
  activePlayerConversationId: null,
  activeGmWatchConversationId: null,
  history: {},

  // ── Profile Management ──

  setProfile: (npcId, profile) =>
    set((s) => ({
      profiles: { ...s.profiles, [npcId]: profile },
    })),

  removeProfile: (npcId) =>
    set((s) => {
      const next = { ...s.profiles };
      delete next[npcId];
      return { profiles: next };
    }),

  getProfile: (npcId) => get().profiles[npcId] ?? null,

  updateProfileMood: (npcId, mood) =>
    set((s) => {
      const profile = s.profiles[npcId];
      if (!profile) return s;
      return {
        profiles: {
          ...s.profiles,
          [npcId]: { ...profile, aiMood: mood },
        },
      };
    }),

  // ── Conversation Lifecycle ──

  startConversation: (params) => {
    const profile = get().profiles[params.npcId];
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const existingHistory = get().history[params.npcId] ?? [];
    const lastReputation = existingHistory.length > 0
      ? existingHistory[existingHistory.length - 1].reputation
      : 0;

    const conversation: NpcConversation = {
      id: conversationId,
      npcId: params.npcId,
      npcName: params.npcName,
      npcPortrait: params.npcPortrait,
      npcPortraitColor: params.npcPortraitColor,
      characterId: params.characterId,
      characterName: params.characterName,
      mode: profile?.mode ?? "AI",
      mood: profile?.aiMood ?? "NEUTRAL",
      factionName: profile?.aiFactionName ?? "",
      reputation: lastReputation,
      messages: [],
      currentNodeId: null,
      currentOptions: [],
      isNpcThinking: false,
      startedAt: new Date().toISOString(),
      endedAt: null,
    };

    // If scripted/hybrid mode, find root node for opening message
    if (profile && (profile.mode === "SCRIPTED" || profile.mode === "HYBRID")) {
      const rootNode = profile.dialogueTree.find((n) => n.isRoot);
      if (rootNode) {
        conversation.currentNodeId = rootNode.id;
        conversation.currentOptions = rootNode.options;
        conversation.messages.push({
          id: generateId(),
          role: "NPC",
          text: rootNode.npcText,
          nodeId: rootNode.id,
          wasAI: false,
          gmOverride: false,
          reputationDelta: 0,
          createdAt: new Date().toISOString(),
        });
      }
    }

    set((s) => ({
      activeConversations: {
        ...s.activeConversations,
        [conversationId]: conversation,
      },
    }));

    return conversationId;
  },

  endConversation: (conversationId) =>
    set((s) => {
      const conv = s.activeConversations[conversationId];
      if (!conv) return s;

      const ended = { ...conv, endedAt: new Date().toISOString() };
      const next = { ...s.activeConversations };
      delete next[conversationId];

      const prevHistory = s.history[conv.npcId] ?? [];

      return {
        activeConversations: next,
        history: {
          ...s.history,
          [conv.npcId]: [...prevHistory, ended],
        },
        activePlayerConversationId:
          s.activePlayerConversationId === conversationId ? null : s.activePlayerConversationId,
        activeGmWatchConversationId:
          s.activeGmWatchConversationId === conversationId ? null : s.activeGmWatchConversationId,
      };
    }),

  // ── Messages ──

  addMessage: (conversationId, message) =>
    set((s) => {
      const conv = s.activeConversations[conversationId];
      if (!conv) return s;
      const newMessage: NpcConversationMessage = {
        ...message,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return {
        activeConversations: {
          ...s.activeConversations,
          [conversationId]: {
            ...conv,
            messages: [...conv.messages, newMessage],
            isNpcThinking: false,
          },
        },
      };
    }),

  setNpcThinking: (conversationId, thinking) =>
    set((s) => {
      const conv = s.activeConversations[conversationId];
      if (!conv) return s;
      return {
        activeConversations: {
          ...s.activeConversations,
          [conversationId]: { ...conv, isNpcThinking: thinking },
        },
      };
    }),

  // ── Dialogue Tree ──

  setCurrentNode: (conversationId, nodeId) =>
    set((s) => {
      const conv = s.activeConversations[conversationId];
      if (!conv) return s;
      return {
        activeConversations: {
          ...s.activeConversations,
          [conversationId]: { ...conv, currentNodeId: nodeId },
        },
      };
    }),

  setCurrentOptions: (conversationId, options) =>
    set((s) => {
      const conv = s.activeConversations[conversationId];
      if (!conv) return s;
      return {
        activeConversations: {
          ...s.activeConversations,
          [conversationId]: { ...conv, currentOptions: options },
        },
      };
    }),

  resolveScriptedResponse: (conversationId, nodeId) => {
    const conv = get().activeConversations[conversationId];
    if (!conv) return null;
    const profile = get().profiles[conv.npcId];
    if (!profile) return null;
    return profile.dialogueTree.find((n) => n.id === nodeId) ?? null;
  },

  // ── Reputation ──

  updateReputation: (conversationId, delta) =>
    set((s) => {
      const conv = s.activeConversations[conversationId];
      if (!conv) return s;
      const newRep = Math.max(-100, Math.min(100, conv.reputation + delta));
      return {
        activeConversations: {
          ...s.activeConversations,
          [conversationId]: { ...conv, reputation: newRep },
        },
      };
    }),

  // ── Mood ──

  updateConversationMood: (conversationId, mood) =>
    set((s) => {
      const conv = s.activeConversations[conversationId];
      if (!conv) return s;
      return {
        activeConversations: {
          ...s.activeConversations,
          [conversationId]: { ...conv, mood },
        },
      };
    }),

  // ── UI State ──

  openPlayerConversation: (conversationId) =>
    set({ activePlayerConversationId: conversationId }),

  closePlayerConversation: () =>
    set({ activePlayerConversationId: null }),

  openGmWatch: (conversationId) =>
    set({ activeGmWatchConversationId: conversationId }),

  closeGmWatch: () =>
    set({ activeGmWatchConversationId: null }),

  // ── GM Override ──

  gmOverrideMessage: (conversationId, text) => {
    get().addMessage(conversationId, {
      role: "NPC",
      text,
      wasAI: false,
      gmOverride: true,
      reputationDelta: 0,
    });
  },
}));
