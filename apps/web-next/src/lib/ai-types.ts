import type { Creature } from "./creature-data";

// ── Personality (gerado pela IA junto com o NPC) ──

export interface CreaturePersonality {
  personalityTraits: string[];
  ideal: string;
  bond: string;
  flaw: string;
  backstory: string;
  voiceNotes: string;
  mannerisms: string;
  motivation: string;
}

// ── Custom Creature (extends Creature + IA metadata) ──

export interface CustomCreature extends Creature {
  isCustom: true;
  generatedAt: string;
  personality?: CreaturePersonality;
  sourcePrompt: string;
}

// ── API Request / Response ──

export interface GenerateNPCRequest {
  prompt: string;
}

export interface TacticalRequest {
  npcToken: {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    ac: number;
    x: number;
    y: number;
    conditions: string[];
    speed: number;
  };
  npcCreature: Creature | null;
  allTokens: Array<{
    id: string;
    name: string;
    alignment: string;
    hp: number;
    maxHp: number;
    ac: number;
    x: number;
    y: number;
    conditions: string[];
    size: number;
  }>;
  combatRound: number;
  gridCellSizeFt: number;
}

export interface TacticalResponse {
  action: string;
  target: string | null;
  reasoning: string;
  movement: { x: number; y: number } | null;
  secondaryAction?: string;
}

export interface DialogueRequest {
  npcName: string;
  personality: CreaturePersonality | null;
  creatureType: string;
  situation: string;
  recentMessages: Array<{ sender: string; content: string }>;
  combatActive: boolean;
}
