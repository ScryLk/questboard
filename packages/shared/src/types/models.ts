import type {
  Plan,
  SubscriptionStatus,
  BillingCycle,
  PaymentStatus,
  FriendshipStatus,
  AchievementCategory,
  AchievementRarity,
  NotificationType,
  SessionType,
  SessionStatus,
  PlayerRole,
  GridType,
  ChatChannel,
  MessageType,
} from "./enums.js";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  locale: string;
  timezone: string;
  plan: Plan;
  planExpiresAt: Date | null;
  trialUsed: boolean;
  isOnline: boolean;
  lastSeenAt: Date;
  onboardingCompleted: boolean;
  preferences: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Subscription {
  id: string;
  userId: string;
  mpPreapprovalId: string | null;
  mpPayerId: string | null;
  mpPlanId: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  priceAmountCents: number;
  currency: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  previousPlan: Plan | null;
  planChangedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  mpPaymentId: string | null;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paidAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  receiptUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface PlanLimit {
  id: string;
  plan: Plan;
  maxActiveSessions: number;
  maxPlayersPerSession: number;
  allowPublicSessions: boolean;
  allowAsyncSessions: boolean;
  maxMapUploadMb: number;
  maxAiMapsPerMonth: number;
  allowFogOfWar: boolean;
  maxMapLayers: number;
  allowDynamicLighting: boolean;
  allowLineOfSight: boolean;
  allowInpainting: boolean;
  maxCharactersPerPlayer: number;
  allowContextualRolls: boolean;
  allowPdfExport: boolean;
  availableSheetTemplates: unknown;
  allowWhisper: boolean;
  allowSecretNotes: boolean;
  maxFileUploadMb: number;
  allowPlayerFileSharing: boolean;
  allowProgressiveReveal: boolean;
  maxStorageMb: number;
  allowSoundtrack: boolean;
  soundtrackTier: string;
  allowCustomAudioUpload: boolean;
  allowNpcAssistant: boolean;
  allowAiTimeline: boolean;
  maxFriends: number;
  allowInitiativeTracker: boolean;
  maxPersonalStorageMb: number;
  allowPersonalVault: boolean;
  allowProfileBadge: boolean;
  badgeName: string | null;
  extras: Record<string, unknown>;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendshipStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  reason: string | null;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  iconUrl: string | null;
  category: AchievementCategory;
  rarity: AchievementRarity;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  reward: Record<string, unknown>;
  sortOrder: number;
  isHidden: boolean;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: Record<string, unknown>;
  notified: boolean;
}

export interface UserStats {
  id: string;
  userId: string;
  totalSessions: number;
  totalSessionsAsGm: number;
  totalSessionsAsPlayer: number;
  totalSessionMinutes: number;
  longestSessionMinutes: number;
  totalDiceRolled: number;
  totalNat20s: number;
  totalNat1s: number;
  totalCriticalHits: number;
  totalCharactersCreated: number;
  totalCharacterDeaths: number;
  totalMessagesInChat: number;
  totalFriendsAdded: number;
  totalMapsGenerated: number;
  totalCombatsParticipated: number;
  currentWeeklyStreak: number;
  longestWeeklyStreak: number;
  lastSessionAt: Date | null;
  extras: Record<string, unknown>;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  sourceType: string | null;
  sourceId: string | null;
  actionUrl: string | null;
  imageUrl: string | null;
  isRead: boolean;
  readAt: Date | null;
  channels: string[];
  groupKey: string | null;
  data: Record<string, unknown>;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: string;
  deviceName: string | null;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
}

export interface Session {
  id: string;
  name: string;
  system: string;
  type: SessionType;
  status: SessionStatus;
  inviteCode: string;
  maxPlayers: number;
  tags: string[];
  description: string | null;
  bannerUrl: string | null;
  scheduledAt: Date | null;
  ownerId: string;
  settings: Record<string, unknown>;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SessionPlayer {
  id: string;
  userId: string;
  sessionId: string;
  characterId: string | null;
  role: PlayerRole;
  joinedAt: Date;
  leftAt: Date | null;
  minutesPlayed: number;
  diceRolled: number;
  messagesCount: number;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  system: string;
  avatarUrl: string | null;
  isPublic: boolean;
  sheetData: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CharacterTemplate {
  id: string;
  system: string;
  name: string;
  schema: Record<string, unknown>;
  version: number;
}

export interface MapData {
  id: string;
  sessionId: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  gridType: GridType;
  gridSize: number;
  isActive: boolean;
  aiGenerated: boolean;
  aiPrompt: string | null;
  layers: unknown;
  tokens: unknown;
  fogAreas: unknown;
  lightSources: unknown;
  walls: unknown;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  userId: string;
  channel: ChatChannel;
  content: string;
  type: MessageType;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface DiceRoll {
  id: string;
  sessionId: string;
  userId: string;
  formula: string;
  results: number[];
  total: number;
  context: string | null;
  isSecret: boolean;
  createdAt: Date;
}

export interface AudioTrack {
  id: string;
  category: string;
  name: string;
  url: string;
  duration: number;
  isBuiltin: boolean;
}

export interface SessionAudio {
  id: string;
  sessionId: string;
  layer: string;
  trackId: string;
  volume: number;
  isPlaying: boolean;
}

export interface TimelineEvent {
  id: string;
  sessionId: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
