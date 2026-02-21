import { Plan } from "../types/enums.js";

export interface PlanFeatures {
  maxSessions: number;
  maxPlayersPerSession: number;
  mapUpload: boolean;
  gridOverlay: boolean;
  fogOfWar: boolean;
  aiMapGeneration: number; // per month, 0 = disabled
  aiInpainting: boolean;
  dynamicLighting: boolean;
  lineOfSight: boolean;
  aiAssistant: boolean;
  sessionSummaries: boolean;
  contextualRolling: boolean;
  initiativeTracker: boolean;
  whisperChat: boolean;
  builtinSoundtrack: boolean;
  customSoundtrackUpload: boolean;
  basicCharacterSheet: boolean;
  advancedCharacterSheet: boolean;
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  [Plan.FREE]: {
    maxSessions: 2,
    maxPlayersPerSession: 5,
    mapUpload: true,
    gridOverlay: true,
    fogOfWar: false,
    aiMapGeneration: 0,
    aiInpainting: false,
    dynamicLighting: false,
    lineOfSight: false,
    aiAssistant: false,
    sessionSummaries: false,
    contextualRolling: false,
    initiativeTracker: false,
    whisperChat: false,
    builtinSoundtrack: false,
    customSoundtrackUpload: false,
    basicCharacterSheet: true,
    advancedCharacterSheet: false,
  },
  [Plan.ADVENTURER]: {
    maxSessions: 8,
    maxPlayersPerSession: 10,
    mapUpload: true,
    gridOverlay: true,
    fogOfWar: true,
    aiMapGeneration: 20,
    aiInpainting: false,
    dynamicLighting: false,
    lineOfSight: false,
    aiAssistant: false,
    sessionSummaries: false,
    contextualRolling: true,
    initiativeTracker: true,
    whisperChat: true,
    builtinSoundtrack: true,
    customSoundtrackUpload: false,
    basicCharacterSheet: true,
    advancedCharacterSheet: false,
  },
  [Plan.LEGENDARY]: {
    maxSessions: Infinity,
    maxPlayersPerSession: Infinity,
    mapUpload: true,
    gridOverlay: true,
    fogOfWar: true,
    aiMapGeneration: Infinity,
    aiInpainting: true,
    dynamicLighting: true,
    lineOfSight: true,
    aiAssistant: true,
    sessionSummaries: true,
    contextualRolling: true,
    initiativeTracker: true,
    whisperChat: true,
    builtinSoundtrack: true,
    customSoundtrackUpload: true,
    basicCharacterSheet: true,
    advancedCharacterSheet: true,
  },
} as const;

/**
 * Check if a specific feature is available for a given plan.
 */
export function hasFeature(
  plan: Plan,
  feature: keyof PlanFeatures
): boolean {
  const value = PLAN_FEATURES[plan][feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return false;
}

/**
 * Get the numeric limit for a feature (e.g., maxSessions, aiMapGeneration).
 */
export function getFeatureLimit(
  plan: Plan,
  feature: keyof PlanFeatures
): number {
  const value = PLAN_FEATURES[plan][feature];
  if (typeof value === "number") return value;
  return value ? 1 : 0;
}

/**
 * Check if a GM can create a new session given their current session count.
 */
export function canCreateSession(
  plan: Plan,
  currentSessionCount: number
): boolean {
  return currentSessionCount < PLAN_FEATURES[plan].maxSessions;
}

/**
 * Check if a session can accept more players.
 */
export function canAddPlayer(
  plan: Plan,
  currentPlayerCount: number
): boolean {
  return currentPlayerCount < PLAN_FEATURES[plan].maxPlayersPerSession;
}
