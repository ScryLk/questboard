import type {
  Plan,
  PlayerRole,
  ChatChannel,
  MessageType,
  FriendshipStatus,
  AchievementCategory,
  AchievementRarity,
  NotificationType,
  SubscriptionStatus,
  BillingCycle,
  PaymentStatus,
  SessionType,
  SessionStatus,
  SessionVisibility,
  InviteStatus,
  RsvpStatus,
  ScheduleStatus,
  ReportReason,
  ReportStatus,
} from "./enums.js";

// ── User DTOs ──

export interface UserProfileDTO {
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  plan: Plan;
  isOnline: boolean;
  lastSeenAt: string;
  createdAt: string;
}

export interface UserMeDTO extends UserProfileDTO {
  email: string;
  locale: string;
  timezone: string;
  preferences: Record<string, unknown>;
  onboardingCompleted: boolean;
  trialUsed: boolean;
}

// ── Session DTOs ──

export interface SessionDTO {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  bannerUrl: string | null;
  system: string;
  tags: string[];
  type: SessionType;
  status: SessionStatus;
  visibility: SessionVisibility;
  inviteCode: string;
  maxPlayers: number;
  allowSpectators: boolean;
  maxSpectators: number;
  scheduledAt: string | null;
  sessionNumber: number;
  lastPlayedAt: string | null;
  totalPlaytime: number;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  ownerId: string;
  owner: { id: string; displayName: string; avatarUrl: string | null; plan: Plan };
  playerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionDetailDTO extends SessionDTO {
  players: SessionPlayerDTO[];
  combatState: CombatStateDTO | null;
}

export interface SessionLobbyDTO {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  bannerUrl: string | null;
  system: string;
  tags: string[];
  type: SessionType;
  status: SessionStatus;
  maxPlayers: number;
  playerCount: number;
  onlineCount: number;
  openSlots: number;
  isLive: boolean;
  gmPlan: Plan;
  owner: { id: string; displayName: string; avatarUrl: string | null };
  scheduledAt: string | null;
  metadata: Record<string, unknown>;
}

export interface SessionPlayerDTO {
  id: string;
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  role: PlayerRole;
  characterId: string | null;
  characterName: string | null;
  isConnected: boolean;
  isMuted: boolean;
  nickname: string | null;
  color: string | null;
  rsvpStatus: RsvpStatus | null;
  joinedAt: string;
}

// ── Invite DTOs ──

export interface SessionInviteDTO {
  id: string;
  sessionId: string;
  sessionName: string;
  invitedById: string;
  invitedByName: string;
  invitedUserId: string | null;
  invitedEmail: string | null;
  status: InviteStatus;
  role: PlayerRole;
  message: string | null;
  token: string;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
}

// ── Schedule DTOs ──

export interface SessionScheduleDTO {
  id: string;
  sessionId: string;
  sessionName: string;
  scheduledFor: string;
  duration: number | null;
  status: ScheduleStatus;
  isRecurring: boolean;
  confirmedCount: number;
  declinedCount: number;
  pendingCount: number;
  reminderSent: boolean;
}

// ── Combat DTOs ──

export interface CombatStateDTO {
  id: string;
  sessionId: string;
  isActive: boolean;
  round: number;
  turnIndex: number;
  initiativeOrder: InitiativeEntry[];
  combatLog: CombatLogEntry[];
}

export interface InitiativeEntry {
  id: string;
  type: "player" | "npc" | "lair";
  name: string;
  userId: string | null;
  characterId: string | null;
  initiative: number;
  dexModifier: number;
  hp: { current: number; max: number };
  conditions: string[];
  isVisible: boolean;
  isDelayed: boolean;
  color: string | null;
}

export interface CombatLogEntry {
  round: number;
  turn: number;
  actor: string;
  action: string;
  result: string;
  timestamp: string;
}

// ── Map / Token DTOs ──

export interface TokenDTO {
  id: string;
  x: number;
  y: number;
  size: number;
  imageUrl: string | null;
  label: string | null;
  conditions: string[];
  currentHp: number | null;
  maxHp: number | null;
  isVisible: boolean;
  characterId: string | null;
}

export interface FogAreaDTO {
  id: string;
  type: string;
  points: unknown;
  revealed: boolean;
}

export interface LightSourceDTO {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
}

// ── Chat / Dice DTOs ──

export interface DiceRollDTO {
  id: string;
  formula: string;
  results: number[];
  total: number;
  context: string | null;
  isSecret: boolean;
  userId: string;
  displayName: string;
  createdAt: string;
}

export interface MessageDTO {
  id: string;
  channel: ChatChannel;
  content: string;
  type: MessageType;
  metadata: Record<string, unknown> | null;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  targetId: string | null;
  createdAt: string;
}

// ── Audio DTOs ──

export interface SessionAudioDTO {
  layer: string;
  trackId: string;
  trackName: string;
  trackUrl: string;
  volume: number;
  isPlaying: boolean;
}

// ── Timeline DTOs ──

export interface TimelineEventDTO {
  id: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

// ── Session Log DTOs ──

export interface SessionLogDTO {
  id: string;
  event: string;
  actorId: string | null;
  targetId: string | null;
  data: Record<string, unknown>;
  createdAt: string;
}

// ── Report DTOs ──

export interface SessionReportDTO {
  id: string;
  sessionId: string;
  reporterId: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
}

// ── Billing DTOs ──

export interface PlanInfoDTO {
  plan: Plan;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  limits: PlanLimitsDTO;
}

export interface PlanLimitsDTO {
  maxActiveSessions: number;
  maxPlayersPerSession: number;
  allowPublicSessions: boolean;
  allowAsyncSessions: boolean;
  maxMapUploadMb: number;
  maxAiMapsPerMonth: number;
  allowFogOfWar: boolean;
  allowDynamicLighting: boolean;
  allowLineOfSight: boolean;
  allowWhisper: boolean;
  allowSecretNotes: boolean;
  allowSoundtrack: boolean;
  allowNpcAssistant: boolean;
  allowInitiativeTracker: boolean;
  maxStorageMb: number;
  maxCharactersPerPlayer: number;
  allowPdfExport: boolean;
  maxFriends: number;
}

export interface SubscriptionDTO {
  id: string;
  plan: Plan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  priceAmountCents: number;
  currency: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelledAt: string | null;
}

export interface PaymentDTO {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface PlanUsageDTO {
  activeSessions: { used: number; limit: number };
  aiMapsThisMonth: { used: number; limit: number };
  storageMb: { used: number; limit: number };
  friends: { used: number; limit: number };
  characters: { used: number; limit: number };
}

// ── Friends DTOs ──

export interface FriendDTO {
  id: string;
  userId: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: string;
  friendsSince: string;
}

export interface FriendRequestDTO {
  id: string;
  senderId: string;
  senderDisplayName: string;
  senderUsername: string | null;
  senderAvatarUrl: string | null;
  status: FriendshipStatus;
  createdAt: string;
}

// ── Achievement DTOs ──

export interface AchievementDTO {
  id: string;
  key: string;
  name: string;
  description: string;
  iconUrl: string | null;
  category: AchievementCategory;
  rarity: AchievementRarity;
  sortOrder: number;
  isHidden: boolean;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: Record<string, unknown> | null;
}

// ── Stats DTOs ──

export interface UserStatsDTO {
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
  currentWeeklyStreak: number;
  longestWeeklyStreak: number;
}

export interface LeaderboardEntryDTO {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  value: number;
}

// ── Notification DTOs ──

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl: string | null;
  imageUrl: string | null;
  isRead: boolean;
  data: Record<string, unknown>;
  createdAt: string;
}

// ── Session Features ──

export interface SessionFeaturesDTO {
  fogOfWar: boolean;
  dynamicLighting: boolean;
  lineOfSight: boolean;
  whisper: boolean;
  secretNotes: boolean;
  soundtrack: boolean;
  initiativeTracker: boolean;
  npcAssistant: boolean;
  progressiveReveal: boolean;
  maxMapLayers: number;
  maxFileUploadMb: number;
}

// ── Generic Response Types ──

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
