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
  GridType,
  TokenType,
  FogShapeType,
  WallType,
  DoorState,
  LightType,
  LayerContentType,
  AnnotationType,
  AnnotationVisibility,
  MapGenerationStatus,
  MapGenMode,
  InteractionType,
  ZoneType,
  ExplorationEvent,
  TemplateTier,
  CharacterStatus,
  VaultFileType,
  DiceRollType,
  DiceVisibility,
  ShareTargetType,
  MessageAuthorType,
  MessageContentType,
  HandoutType,
  SoundCategory,
  TrackType,
  ModerationAction,
  ModerationStatus,
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

// ── Map DTOs ──

export interface MapDTO {
  id: string;
  sessionId: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  sortOrder: number;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  fileSizeMb: number;
  gridType: GridType;
  gridSize: number;
  gridOffsetX: number;
  gridOffsetY: number;
  gridColor: string;
  gridVisible: boolean;
  cellsWide: number;
  cellsHigh: number;
  isActive: boolean;
  isLocked: boolean;
  aiGenerated: boolean;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MapDetailDTO extends MapDTO {
  tokens: TokenDTO[];
  fogAreas: FogAreaDTO[];
  walls: WallDTO[];
  lightSources: LightSourceDTO[];
  layers: MapLayerDTO[];
  annotations: MapAnnotationDTO[];
}

export interface MapFullStateDTO {
  map: MapDTO;
  tokens: TokenDTO[];
  fogAreas: FogAreaDTO[];
  walls: WallDTO[];
  lightSources: LightSourceDTO[];
  layers: MapLayerDTO[];
  annotations: MapAnnotationDTO[];
}

// ── Token DTOs ──

export interface TokenDTO {
  id: string;
  mapId: string;
  name: string;
  type: TokenType;
  imageUrl: string | null;
  color: string | null;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  ownerId: string | null;
  characterId: string | null;
  isVisible: boolean;
  isLocked: boolean;
  layer: number;
  hp: { current: number; max: number; temp?: number } | null;
  conditions: string[];
  statusRing: string | null;
  auraRadius: number | null;
  auraColor: string | null;
  elevation: number;
  label: string | null;
  metadata: Record<string, unknown>;
}

// ── Fog DTOs ──

export interface FogAreaDTO {
  id: string;
  mapId: string;
  isRevealed: boolean;
  shapeType: FogShapeType;
  geometry: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// ── Wall DTOs ──

export interface WallDTO {
  id: string;
  mapId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  wallType: WallType;
  blocksMovement: boolean;
  blocksVision: boolean;
  blocksLight: boolean;
  isDoor: boolean;
  doorState: DoorState;
  doorLocked: boolean;
  metadata: Record<string, unknown>;
}

// ── Light Source DTOs ──

export interface LightSourceDTO {
  id: string;
  mapId: string;
  x: number;
  y: number;
  brightRadius: number;
  dimRadius: number;
  color: string;
  intensity: number;
  lightType: LightType;
  coneAngle: number | null;
  coneDirection: number | null;
  isEnabled: boolean;
  flickers: boolean;
  flickerIntensity: number;
  tokenId: string | null;
  isStatic: boolean;
}

// ── Layer DTOs ──

export interface MapLayerDTO {
  id: string;
  mapId: string;
  name: string;
  sortOrder: number;
  isVisible: boolean;
  isLocked: boolean;
  opacity: number;
  layerType: LayerContentType;
  imageUrl: string | null;
  objects: unknown[];
}

// ── Annotation DTOs ──

export interface MapAnnotationDTO {
  id: string;
  mapId: string;
  authorId: string;
  type: AnnotationType;
  data: Record<string, unknown>;
  visibleTo: AnnotationVisibility;
  isPersistent: boolean;
  createdAt: string;
}

// ── Map Generation DTOs ──

export interface MapGenerationDTO {
  id: string;
  sessionId: string;
  requestedById: string;
  mode: MapGenMode;
  prompt: string | null;
  parameters: Record<string, unknown>;
  status: MapGenerationStatus;
  resultUrl: string | null;
  resultWidth: number | null;
  resultHeight: number | null;
  mapId: string | null;
  provider: string | null;
  errorMessage: string | null;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  metadata: Record<string, unknown>;
}

export interface AiUsageDTO {
  mapsGenerated: { used: number; limit: number };
  inpaintsUsed: number;
  totalCostCents: number;
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

export interface ChatMessageDTO {
  id: string;
  sessionId: string;
  authorId: string | null;
  authorType: MessageAuthorType;
  channel: ChatChannel;
  content: string;
  contentType: MessageContentType;
  characterId: string | null;
  characterName: string | null;
  characterAvatar: string | null;
  recipientIds: string[];
  groupName: string | null;
  attachments: ChatAttachmentDTO[];
  embed: Record<string, unknown> | null;
  reactions: Record<string, string[]>;
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  isPinned: boolean;
  isAsyncPost: boolean;
  asyncTurnNumber: number | null;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ChatAttachmentDTO {
  id: string;
  type: "image" | "file" | "audio" | "handout";
  url: string;
  fileName: string;
  fileSizeMb: number;
  mimeType: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  caption?: string;
}

// ── Handout DTOs ──

export interface HandoutDTO {
  id: string;
  sessionId: string;
  name: string;
  description: string | null;
  handoutType: HandoutType;
  sections: HandoutSectionDTO[];
  coverImageUrl: string | null;
  style: string;
  visibleTo: string[];
  isPinned: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface HandoutSectionDTO {
  id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  isRevealed: boolean;
  revealedAt?: string;
  revealedTo: string[];
  revealCondition?: string;
  sortOrder: number;
}

export interface HandoutListDTO {
  id: string;
  name: string;
  handoutType: HandoutType;
  coverImageUrl: string | null;
  style: string;
  isPinned: boolean;
  revealedSectionCount: number;
  totalSectionCount: number;
  createdAt: string;
}

// ── Soundtrack DTOs ──

export interface SoundtrackTrackDTO {
  id: string;
  name: string;
  category: SoundCategory;
  tags: string[];
  audioUrl: string;
  duration: number;
  fileSize: number;
  format: string;
  trackType: TrackType;
  isBuiltIn: boolean;
  uploadedById: string | null;
  coverUrl: string | null;
  artist: string | null;
  license: string | null;
}

export interface SessionSoundtrackStateDTO {
  activeTrackId: string | null;
  activeTrack: SoundtrackTrackDTO | null;
  isPlaying: boolean;
  volume: number;
  position: number;
  isLooping: boolean;
  playlist: Array<{ trackId: string; order: number }>;
  playlistMode: string;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  crossfade: boolean;
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

// ── Moderation DTOs ──

export interface ChatModerationDTO {
  id: string;
  sessionId: string;
  messageId: string | null;
  userId: string | null;
  action: ModerationAction;
  reason: string | null;
  isAutomatic: boolean;
  confidence: number | null;
  categories: string[];
  status: ModerationStatus;
  expiresAt: string | null;
  performedById: string;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
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
  allowNpcAssistant: boolean;
  allowInitiativeTracker: boolean;
  maxStorageMb: number;
  // Characters
  maxCharactersPerPlayer: number;
  allowContextualRolls: boolean;
  allowPdfExport: boolean;
  allowCustomTemplates: boolean;
  allowPersonalVault: boolean;
  maxPersonalStorageMb: number;
  maxFriends: number;
  // Communication
  enabledChatChannels: string[];
  allowWhisper: boolean;
  allowSecretNotes: boolean;
  allowHandouts: boolean;
  maxFileUploadMb: number;
  allowPlayerFileSharing: boolean;
  allowProgressiveReveal: boolean;
  allowAsyncMode: boolean;
  allowGroupChannels: boolean;
  allowAutoModeration: boolean;
  chatSlowModeMin: number;
  allowSoundtrack: boolean;
  soundtrackTier: string;
  allowCustomAudioUpload: boolean;
  // Exploration
  allowExplorationMode: boolean;
  allowAutoRevealFog: boolean;
  allowInteractiveObjects: boolean;
  maxInteractiveObjects: number;
  allowMapZones: boolean;
  allowIndividualVision: boolean;
  allowPathTrail: boolean;
  allowAmbientSounds: boolean;
  allowMapTransitions: boolean;
  allowNpcDialogue: boolean;
  allowTriggerChains: boolean;
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
  // Exploration
  explorationMode: boolean;
  autoRevealFog: boolean;
  interactiveObjects: boolean;
  mapZones: boolean;
  individualVision: boolean;
  pathTrail: boolean;
  ambientSounds: boolean;
  npcDialogue: boolean;
  triggerChains: boolean;
}

// ── Exploration DTOs ──

export interface InteractiveObjectDTO {
  id: string;
  mapId: string;
  tokenId: string;
  interactionType: InteractionType;
  interactionRange: number;
  requiresLineOfSight: boolean;
  requiredRole: string[];
  requiredCheck: Record<string, unknown> | null;
  onInteract: Record<string, unknown>;
  isActive: boolean;
  isHidden: boolean;
  hasBeenUsed: boolean;
  usedById: string | null;
  usedAt: string | null;
  highlightOnHover: boolean;
  highlightColor: string;
  interactionIcon: string | null;
  metadata: Record<string, unknown>;
}

export interface MapZoneDTO {
  id: string;
  mapId: string;
  name: string;
  zoneType: ZoneType;
  shapeType: string;
  geometry: Record<string, unknown>;
  properties: Record<string, unknown>;
  isVisible: boolean;
  visibleToGmOnly: boolean;
  overlayColor: string | null;
  isActive: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
}

export interface ExplorationLogDTO {
  id: string;
  sessionId: string;
  mapId: string;
  event: ExplorationEvent;
  actorId: string | null;
  tokenId: string | null;
  data: Record<string, unknown>;
  visibleTo: string[];
  channel: string;
  createdAt: string;
}

export interface PlayerViewStateDTO {
  sessionId: string;
  userId: string;
  mapId: string;
  exploredCells: string[] | Record<string, unknown>;
  lastTokenX: number;
  lastTokenY: number;
  cameraX: number;
  cameraY: number;
  cameraZoom: number;
}

export interface ExplorationSettingsDTO {
  enabled: boolean;
  playerTokenControl: "free" | "request";
  showPathTrail: boolean;
  pathTrailDuration: number;
  pathTrailColor: string;
  autoRevealFog: boolean;
  revealMode: "token_vision" | "gm_manual";
  exploredFogOpacity: number;
  hiddenFogOpacity: number;
  defaultVisionRadius: number;
  visionRadiusUnit: "cells" | "ft" | "m";
  sharedVision: boolean;
  allowDoorInteraction: boolean;
  doorInteractionRange: number;
  allowObjectInteraction: boolean;
  objectInteractionRange: number;
  cameraFollowToken: boolean;
  cameraFollowSmoothing: number;
  allowFreeCamera: boolean;
  cameraBoundsRestrict: boolean;
  ambientSoundEnabled: boolean;
  footstepSoundEnabled: boolean;
  interactionSoundEnabled: boolean;
}

// ── Character Template DTOs ──

export interface CharacterTemplateDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  systemName: string;
  iconUrl: string | null;
  coverUrl: string | null;
  version: number;
  changelog: string | null;
  schema: TemplateSchemaDTO;
  layout: Record<string, unknown>;
  formulas: Record<string, string>;
  diceActions: DiceActionDTO[];
  defaults: Record<string, unknown>;
  settings: Record<string, unknown>;
  tier: TemplateTier;
  isOfficial: boolean;
  isActive: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterTemplateListDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  systemName: string;
  iconUrl: string | null;
  coverUrl: string | null;
  version: number;
  tier: TemplateTier;
  isOfficial: boolean;
}

export interface TemplateSchemaDTO {
  sections: TemplateSectionDTO[];
}

export interface TemplateSectionDTO {
  id: string;
  label: string;
  icon?: string;
  columns?: number;
  fields: TemplateFieldDTO[];
}

export interface TemplateFieldDTO {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  formula?: string;
  computed?: boolean;
  readOnly?: boolean;
  visibility?: "always" | "edit" | "view";
  width?: "full" | "half" | "third" | "quarter";
  condition?: string;
  group?: string;
  // HP-specific
  maxFormula?: string;
  tempHp?: boolean;
  // Spell slot specific
  slotLevels?: number[];
  // Currency specific
  denominations?: Array<{ key: string; label: string; rate: number }>;
  // Repeatable specific
  itemFields?: TemplateFieldDTO[];
  // Death save specific
  successCount?: number;
  failCount?: number;
}

export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "boolean"
  | "hp"
  | "proficiency"
  | "ability_score"
  | "skill"
  | "spell_slot"
  | "death_saves"
  | "currency"
  | "condition_tracker"
  | "repeatable"
  | "computed"
  | "markdown"
  | "image"
  | "divider"
  | "stat_block"
  | "resource_counter"
  | "hit_dice"
  | "speed"
  | "armor_class"
  | "initiative"
  | "spell_list"
  | "feature_list"
  | "equipment_slot";

export interface DiceActionDTO {
  id: string;
  label: string;
  notation: string;
  rollType: DiceRollType;
  followUp?: {
    condition: string;
    label: string;
    notation: string;
    rollType: DiceRollType;
  };
}

// ── Character DTOs ──

export interface CharacterDTO {
  id: string;
  userId: string;
  templateId: string;
  templateVersion: number;
  templateName: string;
  systemName: string;
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  pronouns: string | null;
  status: CharacterStatus;
  isPublic: boolean;
  data: Record<string, unknown>;
  inventory: InventoryItemDTO[];
  spells: Record<string, unknown>;
  currency: Record<string, number>;
  backstory: string | null;
  notes: CharacterNoteDTO[];
  experience: number;
  level: number;
  activeSessionId: string | null;
  vaultUsageMb: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterListDTO {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: CharacterStatus;
  level: number;
  systemName: string;
  templateName: string;
  activeSessionId: string | null;
  createdAt: string;
}

export interface CharacterNoteDTO {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemDTO {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  attunement: boolean;
  rarity?: string;
  category?: string;
  properties?: Record<string, unknown>;
}

// ── Character Dice Roll DTOs ──

export interface CharacterDiceRollDTO {
  id: string;
  sessionId: string;
  userId: string;
  characterId: string | null;
  characterName: string | null;
  displayName: string;
  notation: string;
  label: string | null;
  results: {
    terms: Array<{
      count: number;
      sides: number;
      rolls: number[];
      kept: number[];
      subtotal: number;
    }>;
    flatBonus: number;
    total: number;
  };
  rollType: DiceRollType;
  rollContext: Record<string, unknown> | null;
  visibility: DiceVisibility;
  whisperTo: string[];
  createdAt: string;
}

// ── Character Vault DTOs ──

export interface CharacterVaultFileDTO {
  id: string;
  characterId: string;
  fileName: string;
  fileUrl: string;
  fileSizeMb: number;
  mimeType: string;
  fileType: VaultFileType;
  folder: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
}

// ── Character Share DTOs ──

export interface CharacterSharePermissionDTO {
  id: string;
  characterId: string;
  sessionId: string;
  targetType: ShareTargetType;
  targetUserId: string | null;
  visibleSections: string[];
  canEdit: boolean;
}

// ── Level Up DTOs ──

export interface LevelUpChoicesDTO {
  hpMethod: "roll" | "average" | "manual";
  hpRoll?: number;
  hpManual?: number;
  abilityScoreImprovements?: Record<string, number>;
  featChoice?: string;
  classFeatureChoices?: Record<string, string>;
  newSpells?: string[];
  skillProficiencies?: string[];
}

export interface LevelUpResultDTO {
  previousLevel: number;
  newLevel: number;
  hpGained: number;
  newFeatures: string[];
  spellSlotsGained: Record<string, number>;
  changes: Record<string, unknown>;
}

// ── Rest DTOs ──

export interface RestResultDTO {
  type: "short" | "long";
  hpRestored: number;
  hitDiceUsed: number;
  resourcesReset: string[];
  spellSlotsRecovered: Record<string, number>;
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
