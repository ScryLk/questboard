import type {
  TokenState,
  FogAreaState,
  CombatParticipant,
  ChatMessage,
  OnlinePlayer,
  GameplayStore,
} from "./gameplay-store";

// ─── Mock Map ────────────────────────────────────────────

export const MOCK_MAP = {
  url: "https://i.imgur.com/placeholder.jpg", // placeholder — replaced with local asset or real URL
  width: 1000, // 20 cells × 50px
  height: 750, // 15 cells × 50px
};

export const MOCK_GRID_SIZE = 50;

// ─── Mock Tokens ─────────────────────────────────────────

export const MOCK_TOKENS: Record<string, TokenState> = {
  "token-eldrin": {
    id: "token-eldrin",
    name: "Eldrin",
    imageUrl: null,
    emoji: "🧝",
    x: 5,
    y: 4,
    size: 1,
    layer: "character",
    visible: true,
    characterId: "char-1",
    hp: { current: 8, max: 8 },
    conditions: [],
    ownerId: "player-1",
    color: "#6C5CE7",
  },
  "token-kira": {
    id: "token-kira",
    name: "Kira",
    imageUrl: null,
    emoji: "👤",
    x: 6,
    y: 5,
    size: 1,
    layer: "character",
    visible: true,
    characterId: "char-2",
    hp: { current: 62, max: 62 },
    conditions: [],
    ownerId: "player-2",
    color: "#74B9FF",
  },
  "token-zael": {
    id: "token-zael",
    name: "Zael",
    imageUrl: null,
    emoji: "🧙",
    x: 4,
    y: 5,
    size: 1,
    layer: "character",
    visible: true,
    characterId: "char-3",
    hp: { current: 18, max: 28 },
    conditions: [],
    ownerId: "player-3",
    color: "#00B894",
  },
  "token-theron": {
    id: "token-theron",
    name: "Theron",
    imageUrl: null,
    emoji: "🛡️",
    x: 5,
    y: 6,
    size: 1,
    layer: "character",
    visible: true,
    characterId: null,
    hp: { current: 45, max: 45 },
    conditions: [],
    ownerId: "player-4",
    color: "#FDCB6E",
  },
  "token-skeleton1": {
    id: "token-skeleton1",
    name: "Esqueleto",
    imageUrl: null,
    emoji: "🧟",
    x: 8,
    y: 3,
    size: 1,
    layer: "npc",
    visible: true,
    characterId: null,
    hp: { current: 13, max: 13 },
    conditions: [],
    ownerId: "gm",
    color: "#FF6B6B",
  },
  "token-skeleton2": {
    id: "token-skeleton2",
    name: "Esqueleto",
    imageUrl: null,
    emoji: "🧟",
    x: 9,
    y: 4,
    size: 1,
    layer: "npc",
    visible: true,
    characterId: null,
    hp: { current: 13, max: 13 },
    conditions: [],
    ownerId: "gm",
    color: "#FF6B6B",
  },
  "token-boss": {
    id: "token-boss",
    name: "Strahd",
    imageUrl: null,
    emoji: "👹",
    x: 15,
    y: 8,
    size: 2,
    layer: "npc",
    visible: false, // hidden — GM only
    characterId: null,
    hp: { current: 144, max: 144 },
    conditions: [],
    ownerId: "gm",
    color: "#E94560",
  },
};

// ─── Mock Fog Areas ──────────────────────────────────────

export const MOCK_FOG_AREAS: FogAreaState[] = [
  {
    id: "fog-1",
    type: "rectangle",
    x: 10,
    y: 0,
    width: 10,
    height: 7,
    revealed: false,
  },
  {
    id: "fog-2",
    type: "rectangle",
    x: 12,
    y: 7,
    width: 8,
    height: 8,
    revealed: false,
  },
  {
    id: "fog-3",
    type: "rectangle",
    x: 0,
    y: 10,
    width: 6,
    height: 5,
    revealed: false,
  },
];

// ─── Mock Combat ─────────────────────────────────────────

export const MOCK_COMBAT_PARTICIPANTS: CombatParticipant[] = [
  { id: "init-1", tokenId: "token-eldrin", name: "Eldrin", emoji: "🧝", initiative: 17, isNPC: false, isDead: false },
  { id: "init-2", tokenId: "token-kira", name: "Kira", emoji: "👤", initiative: 14, isNPC: false, isDead: false },
  { id: "init-3", tokenId: "token-skeleton1", name: "Esqueleto", emoji: "🧟", initiative: 12, isNPC: true, isDead: false },
  { id: "init-4", tokenId: "token-zael", name: "Zael", emoji: "🧙", initiative: 11, isNPC: false, isDead: false },
  { id: "init-5", tokenId: "token-skeleton2", name: "Esqueleto", emoji: "🧟", initiative: 8, isNPC: true, isDead: false },
  { id: "init-6", tokenId: "token-theron", name: "Theron", emoji: "🛡️", initiative: 6, isNPC: false, isDead: false },
];

// ─── Mock Chat Messages ──────────────────────────────────

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    channel: "SYSTEM",
    type: "system",
    content: "Sessão iniciada! Boa aventura a todos.",
    senderName: "Sistema",
    senderEmoji: "🤖",
    timestamp: "19:32",
  },
  {
    id: "msg-2",
    channel: "GENERAL",
    type: "narrative",
    content: "Três esqueletos emergem das sombras, suas armaduras enferrujadas rangendo contra a pedra fria do corredor...",
    senderName: "GM",
    senderEmoji: "👑",
    timestamp: "19:33",
  },
  {
    id: "msg-3",
    channel: "GENERAL",
    type: "text",
    content: "caraca 3 esqueletos? estamos ferrados kk",
    senderName: "Pedro",
    senderEmoji: "👤",
    timestamp: "19:33",
  },
  {
    id: "msg-4",
    channel: "IN_CHARACTER",
    type: "in_character",
    content: "Fiquem atrás de mim. Conheço esses mortos-vivos.",
    senderName: "Maria",
    senderEmoji: "🧝",
    characterName: "Eldrin",
    timestamp: "19:34",
  },
  {
    id: "msg-5",
    channel: "GENERAL",
    type: "dice_roll",
    content: "Ataque corpo a corpo",
    senderName: "Eldrin",
    senderEmoji: "🧝",
    timestamp: "19:34",
    diceResult: {
      formula: "1d20+5",
      rolls: [17],
      total: 22,
      label: "Ataque (Espada Longa)",
    },
  },
  {
    id: "msg-6",
    channel: "GENERAL",
    type: "dice_roll",
    content: "Dano",
    senderName: "Eldrin",
    senderEmoji: "🧝",
    timestamp: "19:34",
    diceResult: {
      formula: "1d8+3",
      rolls: [6],
      total: 9,
      label: "Dano (Espada Longa)",
    },
  },
  {
    id: "msg-7",
    channel: "WHISPER",
    type: "whisper",
    content: "Posso tentar enganar o esqueleto líder?",
    senderName: "Maria",
    senderEmoji: "🧝",
    targetName: "GM",
    timestamp: "19:35",
  },
  {
    id: "msg-8",
    channel: "SYSTEM",
    type: "system",
    content: "Combate iniciado — Rodada 3",
    senderName: "Sistema",
    senderEmoji: "🤖",
    timestamp: "19:36",
  },
  {
    id: "msg-9",
    channel: "IN_CHARACTER",
    type: "in_character",
    content: "Precisamos de uma bebida quente depois dessa...",
    senderName: "Ana",
    senderEmoji: "🧙",
    characterName: "Zael",
    timestamp: "19:37",
  },
  {
    id: "msg-10",
    channel: "GENERAL",
    type: "text",
    content: "Alguém viu algo estranho no canto do mapa?",
    senderName: "João",
    senderEmoji: "🛡️",
    timestamp: "19:38",
  },
];

// ─── Mock Online Players ─────────────────────────────────

export const MOCK_ONLINE_PLAYERS: OnlinePlayer[] = [
  { id: "gm", name: "Lucas", emoji: "👑", role: "gm", characterName: null, isOnline: true },
  { id: "player-1", name: "Maria", emoji: "🧝", role: "player", characterName: "Eldrin", isOnline: true },
  { id: "player-2", name: "Pedro", emoji: "👤", role: "player", characterName: "Kira", isOnline: true },
  { id: "player-3", name: "Ana", emoji: "🧙", role: "player", characterName: "Zael", isOnline: true },
  { id: "player-4", name: "João", emoji: "🛡️", role: "player", characterName: "Theron", isOnline: true },
];

// ─── Mock Dice Presets ───────────────────────────────────

export const MOCK_DICE_PRESETS = [
  { label: "Ataque (Espada)", formula: "1d20+5", type: "attack" },
  { label: "Dano (Espada)", formula: "1d8+3", type: "damage" },
  { label: "Percepção", formula: "1d20+5", type: "skill" },
  { label: "Iniciativa", formula: "1d20+3", type: "initiative" },
  { label: "Salvaguarda FOR", formula: "1d20+5", type: "save" },
  { label: "Bola de Fogo", formula: "8d6", type: "damage" },
];

// ─── Mock Character Sheet ────────────────────────────────

export const MOCK_CHARACTER_SHEET = {
  name: "Eldrin, o Andarilho",
  class: "Mago",
  race: "Elfo",
  level: 1,
  hp: { current: 8, max: 8 },
  ac: 12,
  initiative: 3,
  speed: 30,
  abilities: {
    str: { score: 10, modifier: 0, saveProficiency: false },
    dex: { score: 16, modifier: 3, saveProficiency: false },
    con: { score: 13, modifier: 1, saveProficiency: false },
    int: { score: 16, modifier: 3, saveProficiency: true },
    wis: { score: 12, modifier: 1, saveProficiency: true },
    cha: { score: 8, modifier: -1, saveProficiency: false },
  },
  skills: [
    { name: "Arcana", modifier: 5, proficient: true },
    { name: "Investigação", modifier: 5, proficient: true },
    { name: "Percepção", modifier: 3, proficient: true },
    { name: "História", modifier: 5, proficient: true },
  ],
  proficiencies: {
    armor: ["Nenhuma"],
    weapons: ["Adagas", "Dardos", "Fundas", "Bordões", "Bestas leves"],
    languages: ["Comum", "Élfico", "Dracônico"],
  },
  features: [
    { name: "Conjuração Arcana", description: "Lança magias arcanas", uses: null },
    { name: "Recuperação Arcana", description: "Recupera slots em descanso curto", uses: { current: 1, max: 1 } },
  ],
};

// ─── Load Mock Data Into Store ───────────────────────────

export function loadMockGameplay(
  set: (partial: Partial<GameplayStore>) => void,
) {
  set({
    sessionId: "my-1",
    sessionName: "A Maldição de Strahd",
    sessionSystem: "dnd5e",
    sessionStatus: "LIVE",
    isGM: true,
    myPlayerId: "gm",
    myTokenId: null,

    mapImage: MOCK_MAP,
    gridSize: MOCK_GRID_SIZE,
    gridType: "SQUARE",
    gridVisible: true,
    viewport: { x: 0, y: 0, zoom: 1 },

    tokens: { ...MOCK_TOKENS },
    selectedTokenId: null,

    fogAreas: [...MOCK_FOG_AREAS],
    fogBrushActive: false,
    fogBrushMode: "reveal",

    combatActive: true,
    combatRound: 3,
    combatParticipants: [...MOCK_COMBAT_PARTICIPANTS],
    currentTurnIndex: 0,

    messages: [...MOCK_MESSAGES],
    activeChannel: "GENERAL",
    chatUnreadCount: 3,

    onlinePlayers: [...MOCK_ONLINE_PLAYERS],

    activePanel: null,
    lastDiceResult: null,
    diceResultVisible: false,
    sceneCard: null,
    sceneCardVisible: false,
  });
}
