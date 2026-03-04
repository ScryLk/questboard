// ── Settings Store ── Complete QuestBoard Settings with Zustand Persist

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ──

export interface ProfileSettings {
  displayName: string;
  email: string;
  avatar: string | null;
  bio: string;
  pronouns: "masculine" | "feminine" | "neutral";
  defaultRole: "gm" | "player" | "both";
}

export interface AppearanceSettings {
  theme: "dark" | "light" | "auto" | "amoled";
  accentColor: string;
  fontSize: "small" | "normal" | "large" | "xlarge";
  fontFamily: "inter" | "system" | "mono" | "serif";
  density: "compact" | "comfortable" | "spacious";
  borderRadius: number;
  enableAnimations: boolean;
  enableParticles: boolean;
  reducedMotion: boolean;
  appBackground: "solid" | "gradient" | "parchment" | "leather";
}

export interface SessionSettings {
  autoNameSessions: boolean;
  defaultMap: string;
  autoLoadCharacters: boolean;
  autoRollInitiative: boolean;
  showSessionTimer: boolean;
  sessionTimerAlarm: number | null;
  autoSaveInterval: number;
  createBackups: boolean;
  inviteMethod: "code" | "link" | "qr";
  joinPolicy: "anytime" | "before_start" | "approval";
  maxPlayers: number;
  allowSpectators: boolean;
  allowReconnect: boolean;
  ruleSystem: string;
}

export interface MapSettings {
  gridType: "square" | "hex-flat" | "hex-pointy" | "none";
  defaultGridSize: { width: number; height: number };
  cellScale: number;
  gridColor: string;
  gridOpacity: number;
  gridThickness: number;
  gridStyle: "solid" | "dashed" | "dots";
  showCoordinates: boolean;
  showLineNumbers: boolean;
  snapToGrid: boolean;
  hoverHighlight: boolean;
  selectedCellHighlight: boolean;
  zoomMin: number;
  zoomMax: number;
  zoomSpeed: "slow" | "normal" | "fast";
  smoothZoom: boolean;
  pinchToZoom: boolean;
  showMinimap: boolean;
  minimapPosition: "bl" | "br" | "tl" | "tr";
  minimapSize: "small" | "medium" | "large";
  minimapOpacity: number;
  canvasBackground: "solid" | "gradient" | "texture" | "transparent";
  canvasBackgroundColor: string;
  diagonalRule: "5ft" | "alternating" | "euclidean";
  tokenStyle: "circle-initials" | "circle-icon" | "square-initials" | "portrait";
  tokenBaseSize: number;
  showHPBar: boolean;
  hpBarPosition: "below" | "inside" | "above";
  hpBarWidth: number;
  showTokenName: boolean;
  tokenNameSize: number;
  truncateTokenNames: boolean;
  showConditionIcons: boolean;
  showConditionTint: boolean;
  conditionIconPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  tokenColors: {
    player: string;
    hostile: string;
    ally: string;
    neutral: string;
    object: string;
  };
}

export interface CombatSettings {
  initiativeMethod: "auto" | "manual" | "player_roll";
  tieBreaker: "dex" | "reroll" | "gm";
  showNextTurn: boolean;
  skipDeadCreatures: boolean;
  groupEnemies: boolean;
  turnChangeSound: boolean;
  turnTimer: boolean;
  turnTimerDuration: number;
  turnTimerAction: "warn" | "skip" | "none";
  measureUnit: "feet" | "meters" | "cells";
  showMovementBadge: boolean;
  showMovementRange: boolean;
  snapMovementToGrid: boolean;
  allowWaypoints: boolean;
  difficultTerrainCost: number;
  autoRollAttack: boolean;
  autoCompareAC: boolean;
  autoRollDamage: boolean;
  autoApplyDamage: boolean;
  confirmDamage: boolean;
  criticalRule: "double_dice" | "max_plus_roll" | "double_result";
  showFloatingDamage: boolean;
  floatingDamageDuration: number;
  autoDeathSaves: boolean;
  moveDeadToEnd: boolean;
  markDeadVisually: boolean;
  showOppAttackIndicator: boolean;
  showOppAttackPopup: boolean;
  trackConcentration: boolean;
  concentrationWarning: boolean;
  autoRemoveConcentration: boolean;
  optionalRules: {
    flanking: boolean;
    cleaving: boolean;
    lingeringInjuries: boolean;
    simplifiedExhaustion: boolean;
    potionBonusAction: boolean;
    shortRest10min: boolean;
  };
}

export interface PlayerViewSettings {
  fogMode: "manual" | "dynamic" | "hybrid" | "disabled";
  fogStyle: "mist" | "shadow" | "solid";
  fogColor: string;
  fogOpacity: number;
  softEdges: boolean;
  fogAnimation: boolean;
  showExplored: boolean;
  showTokensInExplored: boolean;
  exploredOpacity: number;
  enemyNameDisplay: "real" | "generic" | "type";
  revealNameAfterAttack: boolean;
  enemyHPDisplay: "description" | "bar" | "numeric" | "hidden";
  showEnemyConditions: boolean;
  showEnemyAC: boolean;
  showAllyHP: boolean;
  showAllyConditions: boolean;
  showAllySheets: boolean;
  playerMoveOutOfCombat: boolean;
  playerMoveOnTurn: boolean;
  playerMoveOffTurn: boolean;
  showPlayerMovementRange: boolean;
  limitPlayerMovement: boolean;
  playerCanZoom: boolean;
  playerCanRuler: boolean;
  playerCanSeeCoordinates: boolean;
  playerCanPing: boolean;
  autoCenterOnTurn: boolean;
  autoCenterOnConnect: boolean;
  forcedCamera: boolean;
}

export interface ChatSettings {
  enableGeneralChannel: boolean;
  enableGMTable: boolean;
  enableWhisperGMPlayer: boolean;
  enableWhisperBetweenPlayers: boolean;
  enableInCharacterChannel: boolean;
  enableOOCChannel: boolean;
  showTimestamp: boolean;
  timestampFormat: "HH:mm" | "HH:mm:ss" | "relative";
  showAvatar: boolean;
  groupMessages: boolean;
  messageSound: boolean;
  autoScroll: boolean;
  showDiceInChat: boolean;
  highlightNat20: boolean;
  showRollFormula: boolean;
  showSecretRollHint: boolean;
  enableEmojis: boolean;
  enableReactions: boolean;
  keepHistory: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  effectsVolume: number;
  enableSoundtrack: boolean;
  syncSoundtrack: boolean;
  showTrackName: boolean;
  loopMusic: boolean;
  crossfade: boolean;
  turnChangeSound: boolean;
  diceSound: boolean;
  damageSound: boolean;
  healSound: boolean;
  nat20Sound: boolean;
  nat1Sound: boolean;
  chatSound: boolean;
  joinSound: boolean;
  notificationSound: boolean;
  muteAll: boolean;
  respectSilentMode: boolean;
  personalVolume: number;
  personalMuteMusic: boolean;
  personalMuteEffects: boolean;
}

export interface DiceSettings {
  rollStyle: "numeric" | "3d" | "styled";
  animateResult: boolean;
  animationSpeed: "fast" | "normal" | "dramatic";
  showQuickRollButtons: boolean;
  keepHistory: boolean;
  historyLimit: number;
  enableFavorites: boolean;
  enableSecretRoll: boolean;
  showSecretRollToPlayers: boolean;
  noSecretRollNotification: boolean;
  autoProficiency: boolean;
  autoSuggestModifier: boolean;
}

export interface NotificationSettings {
  enablePush: boolean;
  sessionStarted: boolean;
  myTurn: boolean;
  whisperReceived: boolean;
  allChatMessages: boolean;
  campaignInvite: boolean;
  sessionReminder: boolean;
  characterDamaged: boolean;
  sessionPaused: boolean;
  dndEnabled: boolean;
  dndStart: string;
  dndEnd: string;
  showTurnBanner: boolean;
  showActionToast: boolean;
  showUnreadBadge: boolean;
  toastPosition: "bl" | "br" | "tl" | "tr";
  toastDuration: number;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  largerTokens: boolean;
  thickerBorders: boolean;
  detailedTooltips: boolean;
  reducedMotion: boolean;
  disableScreenShake: boolean;
  disableParticles: boolean;
  disableFlash: boolean;
  largerTapTargets: boolean;
  confirmDestructiveActions: boolean;
  enableUndo: boolean;
  screenReaderMode: boolean;
  hapticFeedback: boolean;
  textDescriptionsForSounds: boolean;
}

export interface PerformanceSettings {
  quality: "high" | "medium" | "low" | "auto";
  fogQuality: "animated" | "static" | "solid";
  particleLimit: number;
  renderer: "webgl" | "webgpu" | "canvas2d";
  viewportCulling: boolean;
  throttleMousemove: boolean;
  fpsTarget: number;
  showFPS: boolean;
  showPerfInfo: boolean;
  lowResWhileDragging: boolean;
  lowBatteryOptimizations: boolean;
  batterySaverMode: boolean;
}

export interface LanguageSettings {
  appLanguage: "pt-BR" | "en-US" | "es";
  rpgTerms: "portuguese" | "english" | "mixed";
  measureUnit: "feet" | "meters" | "cells";
}

// ── Full Settings State ──

export interface SettingsState {
  profile: ProfileSettings;
  appearance: AppearanceSettings;
  session: SessionSettings;
  map: MapSettings;
  combat: CombatSettings;
  playerView: PlayerViewSettings;
  chat: ChatSettings;
  audio: AudioSettings;
  dice: DiceSettings;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
  performance: PerformanceSettings;
  language: LanguageSettings;

  // Actions
  updateProfile: (updates: Partial<ProfileSettings>) => void;
  updateAppearance: (updates: Partial<AppearanceSettings>) => void;
  updateSession: (updates: Partial<SessionSettings>) => void;
  updateMap: (updates: Partial<MapSettings>) => void;
  updateCombat: (updates: Partial<CombatSettings>) => void;
  updatePlayerView: (updates: Partial<PlayerViewSettings>) => void;
  updateChat: (updates: Partial<ChatSettings>) => void;
  updateAudio: (updates: Partial<AudioSettings>) => void;
  updateDice: (updates: Partial<DiceSettings>) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  updateAccessibility: (updates: Partial<AccessibilitySettings>) => void;
  updatePerformance: (updates: Partial<PerformanceSettings>) => void;
  updateLanguage: (updates: Partial<LanguageSettings>) => void;
  updateCombatOptionalRules: (updates: Partial<CombatSettings["optionalRules"]>) => void;
  updateTokenColors: (updates: Partial<MapSettings["tokenColors"]>) => void;
  resetSection: (section: keyof Omit<SettingsState, "updateProfile" | "updateAppearance" | "updateSession" | "updateMap" | "updateCombat" | "updatePlayerView" | "updateChat" | "updateAudio" | "updateDice" | "updateNotifications" | "updateAccessibility" | "updatePerformance" | "updateLanguage" | "updateCombatOptionalRules" | "updateTokenColors" | "resetSection" | "resetAll">) => void;
  resetAll: () => void;
}

// ── Default Values ──

const defaultProfile: ProfileSettings = {
  displayName: "",
  email: "",
  avatar: null,
  bio: "",
  pronouns: "masculine",
  defaultRole: "gm",
};

const defaultAppearance: AppearanceSettings = {
  theme: "dark",
  accentColor: "#6C5CE7",
  fontSize: "normal",
  fontFamily: "inter",
  density: "comfortable",
  borderRadius: 12,
  enableAnimations: true,
  enableParticles: true,
  reducedMotion: false,
  appBackground: "solid",
};

const defaultSession: SessionSettings = {
  autoNameSessions: true,
  defaultMap: "last_used",
  autoLoadCharacters: true,
  autoRollInitiative: true,
  showSessionTimer: true,
  sessionTimerAlarm: null,
  autoSaveInterval: 5,
  createBackups: true,
  inviteMethod: "code",
  joinPolicy: "anytime",
  maxPlayers: 6,
  allowSpectators: false,
  allowReconnect: true,
  ruleSystem: "dnd5e",
};

const defaultMap: MapSettings = {
  gridType: "square",
  defaultGridSize: { width: 25, height: 25 },
  cellScale: 5,
  gridColor: "#FFFFFF",
  gridOpacity: 8,
  gridThickness: 1,
  gridStyle: "solid",
  showCoordinates: false,
  showLineNumbers: false,
  snapToGrid: true,
  hoverHighlight: false,
  selectedCellHighlight: true,
  zoomMin: 25,
  zoomMax: 400,
  zoomSpeed: "normal",
  smoothZoom: true,
  pinchToZoom: true,
  showMinimap: true,
  minimapPosition: "bl",
  minimapSize: "medium",
  minimapOpacity: 70,
  canvasBackground: "solid",
  canvasBackgroundColor: "#111116",
  diagonalRule: "5ft",
  tokenStyle: "circle-initials",
  tokenBaseSize: 40,
  showHPBar: true,
  hpBarPosition: "below",
  hpBarWidth: 60,
  showTokenName: true,
  tokenNameSize: 11,
  truncateTokenNames: true,
  showConditionIcons: true,
  showConditionTint: true,
  conditionIconPosition: "top-right",
  tokenColors: {
    player: "#6C5CE7",
    hostile: "#FF4444",
    ally: "#00B894",
    neutral: "#FDCB6E",
    object: "#636E72",
  },
};

const defaultCombat: CombatSettings = {
  initiativeMethod: "auto",
  tieBreaker: "dex",
  showNextTurn: true,
  skipDeadCreatures: true,
  groupEnemies: false,
  turnChangeSound: true,
  turnTimer: false,
  turnTimerDuration: 90,
  turnTimerAction: "warn",
  measureUnit: "feet",
  showMovementBadge: true,
  showMovementRange: true,
  snapMovementToGrid: true,
  allowWaypoints: true,
  difficultTerrainCost: 2,
  autoRollAttack: true,
  autoCompareAC: true,
  autoRollDamage: true,
  autoApplyDamage: true,
  confirmDamage: false,
  criticalRule: "double_dice",
  showFloatingDamage: true,
  floatingDamageDuration: 1.5,
  autoDeathSaves: true,
  moveDeadToEnd: true,
  markDeadVisually: true,
  showOppAttackIndicator: false,
  showOppAttackPopup: false,
  trackConcentration: true,
  concentrationWarning: true,
  autoRemoveConcentration: true,
  optionalRules: {
    flanking: false,
    cleaving: false,
    lingeringInjuries: false,
    simplifiedExhaustion: false,
    potionBonusAction: false,
    shortRest10min: false,
  },
};

const defaultPlayerView: PlayerViewSettings = {
  fogMode: "manual",
  fogStyle: "mist",
  fogColor: "gray",
  fogOpacity: 85,
  softEdges: true,
  fogAnimation: true,
  showExplored: true,
  showTokensInExplored: false,
  exploredOpacity: 45,
  enemyNameDisplay: "real",
  revealNameAfterAttack: false,
  enemyHPDisplay: "description",
  showEnemyConditions: true,
  showEnemyAC: false,
  showAllyHP: true,
  showAllyConditions: true,
  showAllySheets: false,
  playerMoveOutOfCombat: true,
  playerMoveOnTurn: true,
  playerMoveOffTurn: false,
  showPlayerMovementRange: true,
  limitPlayerMovement: true,
  playerCanZoom: true,
  playerCanRuler: false,
  playerCanSeeCoordinates: false,
  playerCanPing: false,
  autoCenterOnTurn: true,
  autoCenterOnConnect: true,
  forcedCamera: false,
};

const defaultChat: ChatSettings = {
  enableGeneralChannel: true,
  enableGMTable: true,
  enableWhisperGMPlayer: true,
  enableWhisperBetweenPlayers: false,
  enableInCharacterChannel: false,
  enableOOCChannel: false,
  showTimestamp: true,
  timestampFormat: "HH:mm",
  showAvatar: true,
  groupMessages: true,
  messageSound: false,
  autoScroll: true,
  showDiceInChat: true,
  highlightNat20: true,
  showRollFormula: true,
  showSecretRollHint: true,
  enableEmojis: true,
  enableReactions: false,
  keepHistory: true,
};

const defaultAudio: AudioSettings = {
  masterVolume: 70,
  effectsVolume: 50,
  enableSoundtrack: true,
  syncSoundtrack: true,
  showTrackName: true,
  loopMusic: false,
  crossfade: false,
  turnChangeSound: true,
  diceSound: true,
  damageSound: true,
  healSound: false,
  nat20Sound: true,
  nat1Sound: false,
  chatSound: true,
  joinSound: true,
  notificationSound: true,
  muteAll: false,
  respectSilentMode: false,
  personalVolume: 80,
  personalMuteMusic: false,
  personalMuteEffects: false,
};

const defaultDice: DiceSettings = {
  rollStyle: "numeric",
  animateResult: true,
  animationSpeed: "normal",
  showQuickRollButtons: true,
  keepHistory: true,
  historyLimit: 50,
  enableFavorites: true,
  enableSecretRoll: true,
  showSecretRollToPlayers: true,
  noSecretRollNotification: false,
  autoProficiency: true,
  autoSuggestModifier: true,
};

const defaultNotifications: NotificationSettings = {
  enablePush: true,
  sessionStarted: true,
  myTurn: true,
  whisperReceived: true,
  allChatMessages: false,
  campaignInvite: true,
  sessionReminder: true,
  characterDamaged: false,
  sessionPaused: false,
  dndEnabled: false,
  dndStart: "22:00",
  dndEnd: "08:00",
  showTurnBanner: true,
  showActionToast: true,
  showUnreadBadge: true,
  toastPosition: "br",
  toastDuration: 3,
};

const defaultAccessibility: AccessibilitySettings = {
  highContrast: false,
  colorBlindMode: "none",
  largerTokens: false,
  thickerBorders: false,
  detailedTooltips: true,
  reducedMotion: false,
  disableScreenShake: false,
  disableParticles: false,
  disableFlash: false,
  largerTapTargets: false,
  confirmDestructiveActions: false,
  enableUndo: true,
  screenReaderMode: false,
  hapticFeedback: false,
  textDescriptionsForSounds: false,
};

const defaultPerformance: PerformanceSettings = {
  quality: "high",
  fogQuality: "animated",
  particleLimit: 40,
  renderer: "webgl",
  viewportCulling: true,
  throttleMousemove: true,
  fpsTarget: 60,
  showFPS: false,
  showPerfInfo: false,
  lowResWhileDragging: true,
  lowBatteryOptimizations: true,
  batterySaverMode: false,
};

const defaultLanguage: LanguageSettings = {
  appLanguage: "pt-BR",
  rpgTerms: "portuguese",
  measureUnit: "feet",
};

// ── Defaults map for resetSection ──

const defaults = {
  profile: defaultProfile,
  appearance: defaultAppearance,
  session: defaultSession,
  map: defaultMap,
  combat: defaultCombat,
  playerView: defaultPlayerView,
  chat: defaultChat,
  audio: defaultAudio,
  dice: defaultDice,
  notifications: defaultNotifications,
  accessibility: defaultAccessibility,
  performance: defaultPerformance,
  language: defaultLanguage,
} as const;

// ── Store ──

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      appearance: defaultAppearance,
      session: defaultSession,
      map: defaultMap,
      combat: defaultCombat,
      playerView: defaultPlayerView,
      chat: defaultChat,
      audio: defaultAudio,
      dice: defaultDice,
      notifications: defaultNotifications,
      accessibility: defaultAccessibility,
      performance: defaultPerformance,
      language: defaultLanguage,

      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
      updateAppearance: (updates) =>
        set((state) => ({ appearance: { ...state.appearance, ...updates } })),
      updateSession: (updates) =>
        set((state) => ({ session: { ...state.session, ...updates } })),
      updateMap: (updates) =>
        set((state) => ({ map: { ...state.map, ...updates } })),
      updateCombat: (updates) =>
        set((state) => ({ combat: { ...state.combat, ...updates } })),
      updatePlayerView: (updates) =>
        set((state) => ({ playerView: { ...state.playerView, ...updates } })),
      updateChat: (updates) =>
        set((state) => ({ chat: { ...state.chat, ...updates } })),
      updateAudio: (updates) =>
        set((state) => ({ audio: { ...state.audio, ...updates } })),
      updateDice: (updates) =>
        set((state) => ({ dice: { ...state.dice, ...updates } })),
      updateNotifications: (updates) =>
        set((state) => ({ notifications: { ...state.notifications, ...updates } })),
      updateAccessibility: (updates) =>
        set((state) => ({ accessibility: { ...state.accessibility, ...updates } })),
      updatePerformance: (updates) =>
        set((state) => ({ performance: { ...state.performance, ...updates } })),
      updateLanguage: (updates) =>
        set((state) => ({ language: { ...state.language, ...updates } })),
      updateCombatOptionalRules: (updates) =>
        set((state) => ({
          combat: {
            ...state.combat,
            optionalRules: { ...state.combat.optionalRules, ...updates },
          },
        })),
      updateTokenColors: (updates) =>
        set((state) => ({
          map: {
            ...state.map,
            tokenColors: { ...state.map.tokenColors, ...updates },
          },
        })),
      resetSection: (section) =>
        set({ [section]: defaults[section] }),
      resetAll: () => set({ ...defaults }),
    }),
    {
      name: "questboard-settings",
      version: 1,
    }
  )
);
