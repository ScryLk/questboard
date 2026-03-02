import type {
  TokenState,
  FogAreaState,
  CombatParticipant,
  ChatMessage,
  OnlinePlayer,
  GameplayStore,
  CharacterSheetData,
  NPCStatBlock,
  SoundtrackTrack,
  AmbientLayer,
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
    icon: "sword",
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
    ac: null,
    hostility: null,
  },
  "token-kira": {
    id: "token-kira",
    name: "Kira",
    imageUrl: null,
    icon: "crosshair",
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
    ac: null,
    hostility: null,
  },
  "token-zael": {
    id: "token-zael",
    name: "Zael",
    imageUrl: null,
    icon: "wand",
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
    ac: null,
    hostility: null,
  },
  "token-theron": {
    id: "token-theron",
    name: "Theron",
    imageUrl: null,
    icon: "shield",
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
    ac: null,
    hostility: null,
  },
  "token-skeleton1": {
    id: "token-skeleton1",
    name: "Esqueleto",
    imageUrl: null,
    icon: "skull",
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
    ac: 13,
    hostility: "hostile",
  },
  "token-skeleton2": {
    id: "token-skeleton2",
    name: "Esqueleto",
    imageUrl: null,
    icon: "skull",
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
    ac: 13,
    hostility: "hostile",
  },
  "token-boss": {
    id: "token-boss",
    name: "Strahd",
    imageUrl: null,
    icon: "skull",
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
    ac: 16,
    hostility: "hostile",
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
  { id: "init-1", tokenId: "token-eldrin", name: "Eldrin", icon: "sword", initiative: 17, isNPC: false, isDead: false },
  { id: "init-2", tokenId: "token-kira", name: "Kira", icon: "crosshair", initiative: 14, isNPC: false, isDead: false },
  { id: "init-3", tokenId: "token-skeleton1", name: "Esqueleto", icon: "skull", initiative: 12, isNPC: true, isDead: false },
  { id: "init-4", tokenId: "token-zael", name: "Zael", icon: "wand", initiative: 11, isNPC: false, isDead: false },
  { id: "init-5", tokenId: "token-skeleton2", name: "Esqueleto", icon: "skull", initiative: 8, isNPC: true, isDead: false },
  { id: "init-6", tokenId: "token-theron", name: "Theron", icon: "shield", initiative: 6, isNPC: false, isDead: false },
];

// ─── Mock Chat Messages ──────────────────────────────────

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    channel: "SYSTEM",
    type: "system",
    content: "Sessão iniciada! Boa aventura a todos.",
    senderName: "Sistema",
    senderIcon: "bot",
    timestamp: "19:32",
  },
  {
    id: "msg-2",
    channel: "GENERAL",
    type: "narrative",
    content: "Três esqueletos emergem das sombras, suas armaduras enferrujadas rangendo contra a pedra fria do corredor...",
    senderName: "GM",
    senderIcon: "crown",
    timestamp: "19:33",
  },
  {
    id: "msg-3",
    channel: "GENERAL",
    type: "text",
    content: "caraca 3 esqueletos? estamos ferrados kk",
    senderName: "Pedro",
    senderIcon: "user",
    timestamp: "19:33",
  },
  {
    id: "msg-4",
    channel: "IN_CHARACTER",
    type: "in_character",
    content: "Fiquem atrás de mim. Conheço esses mortos-vivos.",
    senderName: "Maria",
    senderIcon: "sword",
    characterName: "Eldrin",
    timestamp: "19:34",
  },
  {
    id: "msg-5",
    channel: "GENERAL",
    type: "dice_roll",
    content: "Ataque corpo a corpo",
    senderName: "Eldrin",
    senderIcon: "sword",
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
    senderIcon: "sword",
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
    senderIcon: "sword",
    targetName: "GM",
    timestamp: "19:35",
  },
  {
    id: "msg-8",
    channel: "SYSTEM",
    type: "system",
    content: "Combate iniciado — Rodada 3",
    senderName: "Sistema",
    senderIcon: "bot",
    timestamp: "19:36",
  },
  {
    id: "msg-9",
    channel: "IN_CHARACTER",
    type: "in_character",
    content: "Precisamos de uma bebida quente depois dessa...",
    senderName: "Ana",
    senderIcon: "wand",
    characterName: "Zael",
    timestamp: "19:37",
  },
  {
    id: "msg-10",
    channel: "GENERAL",
    type: "text",
    content: "Alguém viu algo estranho no canto do mapa?",
    senderName: "João",
    senderIcon: "shield",
    timestamp: "19:38",
  },
];

// ─── Mock Online Players ─────────────────────────────────

export const MOCK_ONLINE_PLAYERS: OnlinePlayer[] = [
  { id: "gm", name: "Lucas", icon: "crown", role: "gm", characterName: null, isOnline: true },
  { id: "player-1", name: "Maria", icon: "sword", role: "player", characterName: "Eldrin", isOnline: true },
  { id: "player-2", name: "Pedro", icon: "user", role: "player", characterName: "Kira", isOnline: true },
  { id: "player-3", name: "Ana", icon: "wand", role: "player", characterName: "Zael", isOnline: true },
  { id: "player-4", name: "João", icon: "shield", role: "player", characterName: "Theron", isOnline: true },
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

// ─── Mock Character Sheets ───────────────────────────────

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

export const MOCK_CHARACTER_SHEETS: Record<string, CharacterSheetData> = {
  "char-1": {
    ...MOCK_CHARACTER_SHEET,
    playerName: "Maria",
  },
  "char-2": {
    name: "Kira Ironfist",
    playerName: "Pedro",
    class: "Ranger",
    race: "Humana",
    level: 5,
    hp: { current: 62, max: 62 },
    ac: 16,
    initiative: 3,
    speed: 30,
    abilities: {
      str: { score: 14, modifier: 2, saveProficiency: true },
      dex: { score: 16, modifier: 3, saveProficiency: true },
      con: { score: 14, modifier: 2, saveProficiency: false },
      int: { score: 10, modifier: 0, saveProficiency: false },
      wis: { score: 14, modifier: 2, saveProficiency: false },
      cha: { score: 10, modifier: 0, saveProficiency: false },
    },
    skills: [
      { name: "Sobrevivência", modifier: 5, proficient: true },
      { name: "Percepção", modifier: 5, proficient: true },
      { name: "Furtividade", modifier: 6, proficient: true },
      { name: "Natureza", modifier: 3, proficient: true },
      { name: "Atletismo", modifier: 5, proficient: true },
    ],
    proficiencies: {
      armor: ["Leve", "Média", "Escudo"],
      weapons: ["Simples", "Marciais"],
      languages: ["Comum", "Goblin"],
    },
    features: [
      { name: "Inimigo Favorecido", description: "Mortos-vivos: +2 em dano e rastrear", uses: null },
      { name: "Explorador Natural", description: "Vantagem em testes de sobrevivência em florestas", uses: null },
      { name: "Ataque Extra", description: "Dois ataques por ação de Ataque", uses: null },
      { name: "Cura Primordial", description: "Restaura 5×nível de PV via toque", uses: { current: 25, max: 25 } },
    ],
  },
  "char-3": {
    name: "Zael",
    playerName: "Ana",
    class: "Feiticeiro",
    race: "Tiefling",
    level: 4,
    hp: { current: 18, max: 28 },
    ac: 13,
    initiative: 2,
    speed: 30,
    abilities: {
      str: { score: 8, modifier: -1, saveProficiency: false },
      dex: { score: 14, modifier: 2, saveProficiency: false },
      con: { score: 14, modifier: 2, saveProficiency: true },
      int: { score: 10, modifier: 0, saveProficiency: false },
      wis: { score: 12, modifier: 1, saveProficiency: false },
      cha: { score: 18, modifier: 4, saveProficiency: true },
    },
    skills: [
      { name: "Persuasão", modifier: 6, proficient: true },
      { name: "Enganação", modifier: 6, proficient: true },
      { name: "Arcanismo", modifier: 2, proficient: true },
    ],
    proficiencies: {
      armor: ["Nenhuma"],
      weapons: ["Adagas", "Dardos", "Fundas", "Bordões", "Bestas leves"],
      languages: ["Comum", "Infernal"],
    },
    features: [
      { name: "Origem Dracônica", description: "Dragão Vermelho — resistência a fogo", uses: null },
      { name: "Pontos de Feitiçaria", description: "Metamagia e slots flexíveis", uses: { current: 3, max: 4 } },
      { name: "Metamagia", description: "Magia Acelerada, Magia Sutil", uses: null },
    ],
  },
};

// ─── Mock NPC Stat Blocks ────────────────────────────────

export const MOCK_NPC_STAT_BLOCKS: Record<string, NPCStatBlock> = {
  "token-skeleton1": {
    name: "Esqueleto",
    type: "Morto-vivo",
    hp: { current: 13, max: 13 },
    ac: 13,
    speed: 30,
    passivePerception: 9,
    hostility: "hostile",
    abilities: {
      str: { score: 10, modifier: 0 },
      dex: { score: 14, modifier: 2 },
      con: { score: 15, modifier: 2 },
      int: { score: 6, modifier: -2 },
      wis: { score: 8, modifier: -1 },
      cha: { score: 5, modifier: -3 },
    },
    actions: [
      { name: "Espada Enferrujada", description: "Ataque corpo a corpo", attackBonus: 4, damage: "1d6+2 cortante" },
      { name: "Arco Curto", description: "Ataque à distância", attackBonus: 4, damage: "1d6+2 perfurante" },
    ],
    traits: [
      { name: "Vulnerabilidade", description: "Dano contundente" },
      { name: "Imunidade", description: "Veneno, exaustão" },
    ],
    conditions: [],
  },
  "token-skeleton2": {
    name: "Esqueleto",
    type: "Morto-vivo",
    hp: { current: 13, max: 13 },
    ac: 13,
    speed: 30,
    passivePerception: 9,
    hostility: "hostile",
    abilities: {
      str: { score: 10, modifier: 0 },
      dex: { score: 14, modifier: 2 },
      con: { score: 15, modifier: 2 },
      int: { score: 6, modifier: -2 },
      wis: { score: 8, modifier: -1 },
      cha: { score: 5, modifier: -3 },
    },
    actions: [
      { name: "Espada Enferrujada", description: "Ataque corpo a corpo", attackBonus: 4, damage: "1d6+2 cortante" },
      { name: "Arco Curto", description: "Ataque à distância", attackBonus: 4, damage: "1d6+2 perfurante" },
    ],
    conditions: [],
  },
  "token-boss": {
    name: "Strahd von Zarovich",
    type: "Vampiro",
    hp: { current: 144, max: 144 },
    ac: 16,
    speed: 30,
    passivePerception: 17,
    hostility: "hostile",
    abilities: {
      str: { score: 18, modifier: 4 },
      dex: { score: 18, modifier: 4 },
      con: { score: 18, modifier: 4 },
      int: { score: 20, modifier: 5 },
      wis: { score: 15, modifier: 2 },
      cha: { score: 18, modifier: 4 },
    },
    actions: [
      { name: "Ataque Desarmado", description: "Ataque corpo a corpo", attackBonus: 9, damage: "1d8+4 contundente" },
      { name: "Mordida", description: "Contra alvo agarrado ou incapacitado", attackBonus: 9, damage: "1d6+4 perfurante + 3d6 necrótico" },
      { name: "Encanto", description: "Alvo deve ter sucesso em SAB CD 17 ou ser encantado", attackBonus: undefined, damage: undefined },
    ],
    traits: [
      { name: "Regeneração", description: "Recupera 20 PV no início de seu turno" },
      { name: "Resistência Lendária", description: "3 usos por rodada" },
      { name: "Escalada de Aranha", description: "Pode escalar superfícies sem teste" },
    ],
    conditions: [],
  },
};

// ─── Mock GM Notes ───────────────────────────────────────

export const MOCK_GM_NOTES: Record<string, string> = {
  "char-1": "Eldrin tem uma conexão secreta com Strahd — era seu aprendiz em outra vida.",
  "token-boss": "Não revelar até a cena do castelo. Usar Encanto no jogador mais fraco.",
};

// ─── Mock Soundtrack ────────────────────────────────────

export const MOCK_SOUNDTRACK_TRACKS: SoundtrackTrack[] = [
  // Ambient
  { id: "track-01", name: "Taverna Aconchegante", category: "ambient", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-02", name: "Cidade Movimentada", category: "ambient", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-03", name: "Noite Calma", category: "ambient", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-04", name: "Templo Sagrado", category: "ambient", duration: 0, isLoop: true, isFavorite: false },
  // Combat
  { id: "track-05", name: "Batalha Épica", category: "combat", duration: 272, isLoop: false, isFavorite: false },
  { id: "track-06", name: "Escaramuça Rápida", category: "combat", duration: 135, isLoop: false, isFavorite: false },
  { id: "track-07", name: "Confronto Final", category: "combat", duration: 370, isLoop: false, isFavorite: false },
  { id: "track-08", name: "Perseguição", category: "combat", duration: 225, isLoop: false, isFavorite: false },
  // Exploration
  { id: "track-09", name: "Floresta Misteriosa", category: "exploration", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-10", name: "Caverna Profunda", category: "exploration", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-11", name: "Estrada Aberta", category: "exploration", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-12", name: "Mar Revolto", category: "exploration", duration: 0, isLoop: true, isFavorite: false },
  // Horror
  { id: "track-13", name: "Sussurros na Escuridão", category: "horror", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-14", name: "Castelo Assombrado", category: "horror", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-15", name: "Passo no Corredor", category: "horror", duration: 0, isLoop: true, isFavorite: false },
  // Dramatic
  { id: "track-16", name: "Revelação", category: "dramatic", duration: 150, isLoop: false, isFavorite: false },
  { id: "track-17", name: "Perda", category: "dramatic", duration: 180, isLoop: false, isFavorite: false },
  { id: "track-18", name: "Vitória", category: "dramatic", duration: 165, isLoop: false, isFavorite: false },
  { id: "track-19", name: "Despedida", category: "dramatic", duration: 200, isLoop: false, isFavorite: false },
  // Rest
  { id: "track-20", name: "Acampamento", category: "rest", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-21", name: "Amanhecer", category: "rest", duration: 0, isLoop: true, isFavorite: false },
  { id: "track-22", name: "Meditação", category: "rest", duration: 0, isLoop: true, isFavorite: false },
];

export const MOCK_AMBIENT_LAYERS: AmbientLayer[] = [
  { id: "ambient-music", name: "Música", icon: "music", volume: 0 },
  { id: "ambient-rain", name: "Chuva", icon: "cloud-rain", volume: 0 },
  { id: "ambient-wind", name: "Vento", icon: "wind", volume: 0 },
  { id: "ambient-fire", name: "Fogueira", icon: "flame", volume: 0 },
  { id: "ambient-crowd", name: "Multidão", icon: "users", volume: 0 },
  { id: "ambient-birds", name: "Pássaros", icon: "bird", volume: 0 },
  { id: "ambient-thunder", name: "Trovão", icon: "cloud-lightning", volume: 0 },
  { id: "ambient-waves", name: "Ondas", icon: "waves", volume: 0 },
  { id: "ambient-crickets", name: "Grilos", icon: "bug", volume: 0 },
  { id: "ambient-wolves", name: "Lobos", icon: "dog", volume: 0 },
];

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
    activeGMToolView: null,
    lastDiceResult: null,
    diceResultVisible: false,
    sceneCard: null,
    sceneCardVisible: false,
    sceneCardDrafts: [],

    soundtrack: {
      currentTrack: null,
      isPlaying: false,
      volume: 80,
      isMuted: false,
      activeCategory: "all",
      ambientLayers: [...MOCK_AMBIENT_LAYERS],
    },

    gmNotes: { ...MOCK_GM_NOTES },

    terrainTiles: MOCK_TERRAIN_TILES,
    viewingTerrainTile: null,
  });
}

// ─── Mock Terrain Tiles ─────────────────────────────────

const MOCK_TERRAIN_TILES: import("./gameplay-store").TerrainTileState[] = [
  {
    x: 4,
    y: 3,
    detail: {
      name: "Piso de Pedra Rachada",
      description:
        "Pedras antigas rachadas pelo tempo e pela umidade. Musgo escuro cresce entre as fendas, e marcas de arranhões sugerem que algo pesado foi arrastado por aqui.",
      detailImageUrl: null,
      difficulty: "Terreno Normal",
      elevation: 0,
      effect: null,
      perception: {
        dc: 14,
        description:
          "Você nota marcas de garras recentes no chão, como se uma criatura grande tivesse passado.",
        passed: true,
      },
      investigation: {
        dc: 16,
        description:
          "Há um mecanismo oculto sob uma das pedras. Ao pressionar na sequência correta, um compartimento se abre.",
        investigated: false,
        passed: null,
      },
      isInteractable: true,
      interactionLabel: "Examinar mais de perto",
      interactionResult:
        "Ao mover o musgo, você encontra runas anãs gravadas na pedra. Elas parecem ser um aviso: 'Não desperte o que jaz abaixo.'",
      interacted: false,
      lore: "Esta sala era a antecâmara de uma cripta anã. As runas foram gravadas há 300 anos como proteção contra intrusos.",
    },
  },
  {
    x: 7,
    y: 5,
    detail: {
      name: "Lareira Acesa",
      description:
        "Uma grande lareira de pedra com chamas crepitantes que iluminam o ambiente com tons dourados. O calor é reconfortante após o frio das catacumbas.",
      detailImageUrl: null,
      difficulty: "Terreno Normal",
      elevation: 0,
      effect: null,
      perception: null,
      investigation: null,
      isInteractable: true,
      interactionLabel: "Examinar a lareira",
      interactionResult:
        "Dentro das cinzas, entre os troncos queimando, você encontra um anel de metal escurecido pelo fogo. Parece valioso.",
      interacted: false,
      lore: null,
    },
  },
  {
    x: 10,
    y: 8,
    detail: {
      name: "Piso Escorregadio",
      description:
        "O chão está coberto por uma fina camada de musgo molhado. A umidade constante torna cada passo uma aposta.",
      detailImageUrl: null,
      difficulty: "Terreno Difícil",
      elevation: -1,
      effect: "Escorregadio: DC 12 DES ou cai",
      perception: {
        dc: 10,
        description: "O brilho na superfície indica que o chão está extremamente escorregadio.",
        passed: null,
      },
      investigation: null,
      isInteractable: false,
      interactionLabel: null,
      interactionResult: null,
      interacted: false,
      lore: null,
    },
  },
];
