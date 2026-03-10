export const PLAN_LIMITS = {
  FREE: {
    maxActiveCampaigns: 2,
    maxSessionsPerCampaign: 2,
    maxPlayersPerSession: 5,
    maxCharacters: 3,
    mapUploadMb: 5,
    fogOfWar: false,
    dynamicLighting: false,
    soundtrack: false,
    whisperChannel: false,
    aiMapGen: 0,
    asyncPlay: false,
    customTheme: false,
    characterVault: false,
    exportPdfCharacter: false,
    customAvatar: false,
  },
  ADVENTURER: {
    maxActiveCampaigns: 8,
    maxSessionsPerCampaign: -1,
    maxPlayersPerSession: 10,
    maxCharacters: -1,
    mapUploadMb: 50,
    fogOfWar: true,
    dynamicLighting: false,
    soundtrack: true,
    whisperChannel: true,
    aiMapGen: 20,
    asyncPlay: true,
    customTheme: false,
    characterVault: false,
    exportPdfCharacter: false,
    customAvatar: false,
  },
  LEGENDARY: {
    maxActiveCampaigns: -1,
    maxSessionsPerCampaign: -1,
    maxPlayersPerSession: -1,
    maxCharacters: -1,
    mapUploadMb: 200,
    fogOfWar: true,
    dynamicLighting: true,
    soundtrack: true,
    whisperChannel: true,
    aiMapGen: -1,
    asyncPlay: true,
    customTheme: true,
    characterVault: true,
    exportPdfCharacter: true,
    customAvatar: true,
  },
  PLAYER_PLUS: {
    maxActiveCampaigns: 2,
    maxSessionsPerCampaign: 2,
    maxPlayersPerSession: 5,
    maxCharacters: -1,
    mapUploadMb: 5,
    fogOfWar: false,
    dynamicLighting: false,
    soundtrack: false,
    whisperChannel: false,
    aiMapGen: 0,
    asyncPlay: false,
    customTheme: false,
    characterVault: true,
    exportPdfCharacter: true,
    customAvatar: true,
  },
} as const;

export type PlanLimits = (typeof PLAN_LIMITS)[keyof typeof PLAN_LIMITS];
export type PlanFeature = keyof PlanLimits;

export function getMinPlanForFeature(feature: PlanFeature): string {
  if (PLAN_LIMITS.ADVENTURER[feature]) return "ADVENTURER";
  if (PLAN_LIMITS.LEGENDARY[feature]) return "LEGENDARY";
  return "LEGENDARY";
}
