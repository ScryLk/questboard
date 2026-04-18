// ── NPC Conversation System Types ──

export type NpcMode = "SCRIPTED" | "AI" | "HYBRID";
export type NpcMood = "FRIENDLY" | "NEUTRAL" | "SUSPICIOUS" | "HOSTILE" | "AFRAID" | "DRUNK" | "GRIEVING";
export type MessageRole = "PLAYER" | "NPC" | "SYSTEM";
export type SpeechStyle = "FORMAL" | "CASUAL" | "AGGRESSIVE" | "DECEPTIVE" | "PLEADING" | "JOKING" | "INTIMIDATING";

// ── Voice / VAD Types ──

export type PlayerEmotion = "ANGRY" | "FEARFUL" | "SAD" | "JOYFUL" | "CALM" | "NERVOUS" | "DESPERATE" | "CONTEMPTUOUS" | "NEUTRAL";
export type VoiceVolume = "WHISPERING" | "NORMAL" | "LOUD";
export type VoicePace = "SLOW" | "NORMAL" | "FAST";
export type VoiceState = "idle" | "recording" | "processing";

export const EMOTION_ICONS: Record<PlayerEmotion, string> = {
  ANGRY: "😤",
  FEARFUL: "😰",
  SAD: "😢",
  JOYFUL: "😊",
  CALM: "😌",
  NERVOUS: "😟",
  DESPERATE: "🥺",
  CONTEMPTUOUS: "😒",
  NEUTRAL: "💬",
};

export const EMOTION_LABELS: Record<PlayerEmotion, string> = {
  ANGRY: "Raivoso",
  FEARFUL: "Com medo",
  SAD: "Triste",
  JOYFUL: "Alegre",
  CALM: "Calmo",
  NERVOUS: "Nervoso",
  DESPERATE: "Desesperado",
  CONTEMPTUOUS: "Desdenhoso",
  NEUTRAL: "Neutro",
};

export const VOLUME_ICONS: Record<VoiceVolume, string> = {
  WHISPERING: "🔇",
  NORMAL: "🔊",
  LOUD: "📢",
};

export const VOLUME_LABELS: Record<VoiceVolume, string> = {
  WHISPERING: "Sussurro",
  NORMAL: "Normal",
  LOUD: "Gritando",
};

export interface GeminiVoiceResult {
  playerText: string;
  playerEmotion: PlayerEmotion;
  playerVolume: VoiceVolume;
  playerPace: VoicePace;
  emotionIntensity: number;
  npcResponse: string;
  reputationDelta: number;
}

export const MOOD_LABELS: Record<NpcMood, string> = {
  FRIENDLY: "Amigável",
  NEUTRAL: "Neutro",
  SUSPICIOUS: "Desconfiado",
  HOSTILE: "Hostil",
  AFRAID: "Amedrontado",
  DRUNK: "Embriagado",
  GRIEVING: "Enlutado",
};

export const MOOD_COLORS: Record<NpcMood, string> = {
  FRIENDLY: "#00B894",
  NEUTRAL: "#FDCB6E",
  SUSPICIOUS: "#E17055",
  HOSTILE: "#FF4444",
  AFRAID: "#74B9FF",
  DRUNK: "#A29BFE",
  GRIEVING: "#636E72",
};

export const SPEECH_STYLE_LABELS: Record<SpeechStyle, string> = {
  FORMAL: "Formal",
  CASUAL: "Casual",
  AGGRESSIVE: "Agressivo",
  DECEPTIVE: "Enganoso",
  PLEADING: "Suplicante",
  JOKING: "Brincalhão",
  INTIMIDATING: "Intimidador",
};

export const REPUTATION_LABELS = [
  { min: -100, max: -60, label: "Inimigo Jurado", color: "#FF4444" },
  { min: -59, max: -20, label: "Hostil", color: "#E17055" },
  { min: -19, max: 19, label: "Neutro", color: "#FDCB6E" },
  { min: 20, max: 59, label: "Aliado", color: "#00B894" },
  { min: 60, max: 100, label: "Amigo Fiel", color: "#6C5CE7" },
] as const;

export function getReputationLabel(reputation: number): { label: string; color: string } {
  const clamped = Math.max(-100, Math.min(100, reputation));
  for (const tier of REPUTATION_LABELS) {
    if (clamped >= tier.min && clamped <= tier.max) {
      return { label: tier.label, color: tier.color };
    }
  }
  return { label: "Neutro", color: "#FDCB6E" };
}

// ── NPC Conversation Profile ──

export interface NpcConversationProfile {
  npcId: string;
  mode: NpcMode;
  aiPersonality: string;
  aiGoals: string;
  aiSecrets: string;
  aiMood: NpcMood;
  aiFactionName: string;
  aiKnowledge: string;
  voiceStyle: string;
  reputationEnabled: boolean;
  dialogueTree: DialogueNode[];
}

// ── Dialogue Tree ──

export interface DialogueCondition {
  type: "reputation" | "keyword" | "skill_check" | "item" | "class" | "race" | "always";
  value?: string;
  min?: number;
  max?: number;
  dc?: number;
  skill?: string;
}

export interface DialogueOnEnterAction {
  type: "give_item" | "start_combat" | "reveal_handout" | "change_mood" | "reputation_change";
  itemId?: string;
  handoutId?: string;
  mood?: NpcMood;
  delta?: number;
}

export interface DialogueOption {
  id: string;
  text: string;
  nextNodeId: string | null;
  condition?: DialogueCondition;
}

export interface DialogueNode {
  id: string;
  npcText: string;
  isRoot: boolean;
  conditions: DialogueCondition[];
  options: DialogueOption[];
  onEnterAction?: DialogueOnEnterAction;
}

// ── Conversation Message ──

export interface NpcConversationMessage {
  id: string;
  role: MessageRole;
  text: string;
  nodeId?: string;
  wasAI: boolean;
  gmOverride: boolean;
  detectedStyle?: SpeechStyle;
  reputationDelta: number;
  createdAt: string;
  // Voice metadata (player messages only)
  wasVoice?: boolean;
  detectedEmotion?: PlayerEmotion;
  detectedVolume?: VoiceVolume;
  detectedPace?: VoicePace;
  emotionIntensity?: number;
}

// ── Active Conversation State ──

export interface NpcConversation {
  id: string;
  npcId: string;
  npcName: string;
  npcPortrait: string;
  npcPortraitColor: string;
  characterId: string;
  characterName: string;
  mode: NpcMode;
  mood: NpcMood;
  factionName: string;
  reputation: number;
  messages: NpcConversationMessage[];
  currentNodeId: string | null;
  currentOptions: DialogueOption[];
  isNpcThinking: boolean;
  startedAt: string;
  endedAt: string | null;
}

// ── Player Context (sent to AI) ──

export interface PlayerConversationContext {
  character: {
    name: string;
    race: string;
    class: string;
    level: number;
    background: string;
    alignment: string;
    hpPercent: number;
    conditions: string[];
  };
  equipment: {
    weaponInHand: string | null;
    armorType: string | null;
    visibleItems: string[];
    isWeaponDrawn: boolean;
  };
  reputation: {
    withNpc: number;
    withFaction: number;
    label: string;
  };
  detectedSpeechStyle: SpeechStyle;
  session: {
    locationName: string;
    isInCombat: boolean;
    timeOfDay: string;
    partyNearby: string[];
  };
  conversationHistory: Array<{ role: "player" | "npc"; text: string }>;
  previousEncounters: Array<{ summary: string; reputationChange: number }>;
}

// ── Conversation API types ──

export interface StartConversationRequest {
  npcId: string;
  tokenId: string;
  characterId: string;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

export interface NpcConversationDialogueRequest {
  npcName: string;
  profile: NpcConversationProfile;
  context: PlayerConversationContext;
  playerMessage: string;
  conversationHistory: Array<{ role: "player" | "npc"; text: string }>;
}
