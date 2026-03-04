// ── Types ────────────────────────────────────────────

export type PlayerStatus = "online" | "offline" | "away";
export type TokenAlignment = "player" | "hostile" | "neutral" | "ally";
export type CombatantStatus = "active" | "dead" | "unconscious";
export type ChatChannel = "geral" | "mesa-gm" | "sussurro";
export type ChatMessageType = "normal" | "system" | "whisper" | "roll";
export type MapTool =
  | "pointer"
  | "pan"
  | "ruler"
  | "fog"
  | "grid"
  | "aoe"
  | "draw"
  | "region"
  | "wall"
  | "vision";
export type RightPanelTab = "chat" | "dice" | "sheet";
export type DieType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";
export type TokenVisibility = "visible" | "hidden" | "invisible";
export type FogStyle = "solid" | "fog" | "shadows";
export type FogColor = "gray" | "blue" | "red" | "green";

export interface FogSettings {
  style: FogStyle;
  color: FogColor;
  density: number;
  speed: number;
  softEdges: boolean;
  revealAnimation: boolean;
}

export const FOG_COLOR_THEMES: Record<
  FogColor,
  {
    base: string;
    accent: string;
    /** Base fill RGB (dark) */
    r: number; g: number; b: number;
    /** Smoke wisp RGB (lighter — must contrast with base for visible noise) */
    sr: number; sg: number; sb: number;
  }
> = {
  gray: { base: "#1a1a1a", accent: "#333333", r: 16, g: 16, b: 20, sr: 80, sg: 75, sb: 95 },
  blue: { base: "#0a1628", accent: "#1a3050", r: 8, g: 14, b: 30, sr: 35, sg: 65, sb: 120 },
  red: { base: "#1a0a0a", accent: "#3a1a1a", r: 22, g: 8, b: 8, sr: 85, sg: 30, sb: 35 },
  green: { base: "#0a1a0a", accent: "#1a3a1a", r: 8, g: 22, b: 10, sr: 35, sg: 85, sb: 40 },
};

export const DEFAULT_FOG_SETTINGS: FogSettings = {
  style: "fog",
  color: "gray",
  density: 0.9,
  speed: 1.0,
  softEdges: true,
  revealAnimation: true,
};
export type AOEShape = "circle" | "cone" | "line" | "cube";
export type AOEColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "white";
export type ConditionType =
  | "blinded"
  | "charmed"
  | "deafened"
  | "frightened"
  | "grappled"
  | "incapacitated"
  | "invisible"
  | "paralyzed"
  | "petrified"
  | "poisoned"
  | "prone"
  | "restrained"
  | "stunned"
  | "unconscious"
  | "concentrating";

export const ALL_CONDITIONS: { key: ConditionType; label: string }[] = [
  { key: "blinded", label: "Cego" },
  { key: "charmed", label: "Enfeiticado" },
  { key: "deafened", label: "Surdo" },
  { key: "frightened", label: "Amedrontado" },
  { key: "grappled", label: "Agarrado" },
  { key: "incapacitated", label: "Incapacitado" },
  { key: "invisible", label: "Invisivel" },
  { key: "paralyzed", label: "Paralisado" },
  { key: "petrified", label: "Petrificado" },
  { key: "poisoned", label: "Envenenado" },
  { key: "prone", label: "Caido" },
  { key: "restrained", label: "Contido" },
  { key: "stunned", label: "Atordoado" },
  { key: "unconscious", label: "Inconsciente" },
  { key: "concentrating", label: "Concentrando" },
];

export interface GamePlayer {
  id: string;
  name: string;
  character: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  status: PlayerStatus;
  avatarInitials: string;
  color: string;
}

export interface GameToken {
  id: string;
  name: string;
  alignment: TokenAlignment;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  size: number; // grid cells
  x: number; // grid col
  y: number; // grid row
  onMap: boolean;
  conditions: ConditionType[];
  visibility: TokenVisibility;
  speed: number; // ft (movement per turn)
  playerId?: string;
  icon?: string;
  label?: string;
  elevation?: number;
}

export interface Combatant {
  tokenId: string;
  initiative: number;
  status: CombatantStatus;
}

export interface CombatState {
  active: boolean;
  round: number;
  turnIndex: number;
  order: Combatant[];
}

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  type: ChatMessageType;
  sender: string;
  senderInitials: string;
  isGM: boolean;
  content: string;
  timestamp: string;
  rollFormula?: string;
  rollResult?: number;
  rollDetails?: string;
  isNat20?: boolean;
  isNat1?: boolean;
  whisperTo?: string;
}

export interface MapConfig {
  name: string;
  gridCols: number;
  gridRows: number;
  cellSize: number; // px
  cellSizeFt: number; // ft per cell
}

export interface SessionInfo {
  id: string;
  number: number;
  name: string;
  campaign: string;
  startedAt: Date;
  status: "live";
}

export interface RulerPoint {
  x: number;
  y: number;
}

export interface AOEInstance {
  id: string;
  shape: AOEShape;
  color: AOEColor;
  originX: number;
  originY: number;
  radius?: number;
  endX?: number;
  endY?: number;
  width?: number;
  fixed: boolean;
}

export interface PingEffect {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface DamageFloat {
  id: string;
  tokenId: string;
  amount: number;
  isHeal: boolean;
  isCrit: boolean;
  timestamp: number;
}

export type DrawingTool = "freehand" | "line" | "rect" | "eraser";
export type TerrainType = "normal" | "difficult" | "water" | "lava" | "pit" | "ice";

export interface DrawStroke {
  id: string;
  tool: DrawingTool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface TerrainCell {
  x: number;
  y: number;
  type: TerrainType;
}

export const TERRAIN_TYPES: { key: TerrainType; label: string; color: string }[] = [
  { key: "normal", label: "Normal", color: "transparent" },
  { key: "difficult", label: "Terreno Dificil", color: "rgba(253, 203, 110, 0.2)" },
  { key: "water", label: "Agua", color: "rgba(68, 136, 255, 0.2)" },
  { key: "lava", label: "Lava", color: "rgba(255, 68, 68, 0.2)" },
  { key: "pit", label: "Fosso", color: "rgba(0, 0, 0, 0.4)" },
  { key: "ice", label: "Gelo", color: "rgba(200, 240, 255, 0.2)" },
];

export interface MapPin {
  id: string;
  x: number;
  y: number;
  type: "flag" | "alert" | "question" | "star" | "skull" | "heart";
  color: string;
  label?: string;
  gmOnly: boolean;
}

export type NoteColor = "yellow" | "blue" | "green" | "pink";

export interface MapNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: NoteColor;
  gmOnly: boolean;
}

export interface Toast {
  id: string;
  text: string;
  timestamp: number;
}

// ── Vision System ────────────────────────────────────

export type VisionType = "normal" | "darkvision" | "blindsight" | "truesight" | "tremorsense";
export type LightType = "none" | "torch" | "lamp" | "light_cantrip" | "custom";
export type FogMode = "manual" | "dynamic" | "hybrid";
export type WallSide = "top" | "right" | "bottom" | "left";

export interface VisionConfig {
  enabled: boolean;
  normal: number;
  darkvision: number;
  blindsight: number;
  truesight: number;
  tremorsense: number;
  lightType: LightType;
  lightBright: number;
  lightDim: number;
}

export const DEFAULT_VISION: VisionConfig = {
  enabled: true,
  normal: 12,
  darkvision: 0,
  blindsight: 0,
  truesight: 0,
  tremorsense: 0,
  lightType: "none",
  lightBright: 0,
  lightDim: 0,
};

export const VISION_PRESETS: Record<string, Partial<VisionConfig>> = {
  human: { normal: 12 },
  elf: { normal: 12, darkvision: 12 },
  dwarf: { normal: 12, darkvision: 12 },
  deep_gnome: { normal: 12, darkvision: 24 },
  torch: { lightType: "torch", lightBright: 8, lightDim: 8 },
  lamp: { lightType: "lamp", lightBright: 6, lightDim: 6 },
  light_cantrip: { lightType: "light_cantrip", lightBright: 8, lightDim: 8 },
};

export interface WallSegment {
  x: number;
  y: number;
  side: WallSide;
  isDoor: boolean;
  doorOpen: boolean;
}

export interface LightSourceFixed {
  id: string;
  x: number;
  y: number;
  type: string;
  brightRadius: number;
  dimRadius: number;
  color: string;
}

// ── Mock Data ────────────────────────────────────────

export const MOCK_SESSION: SessionInfo = {
  id: "sess_s04",
  number: 13,
  name: "A Torre de Ravenloft",
  campaign: "A Maldicao de Strahd",
  startedAt: new Date(Date.now() - 92 * 60 * 1000),
  status: "live",
};

export const MOCK_PLAYERS: GamePlayer[] = [
  {
    id: "p1",
    name: "Maria Santos",
    character: "Eldrin",
    class: "Mago",
    level: 5,
    hp: 25,
    maxHp: 32,
    ac: 14,
    status: "online",
    avatarInitials: "MS",
    color: "#6C5CE7",
  },
  {
    id: "p2",
    name: "Pedro Costa",
    character: "Kira Ironfist",
    class: "Ladina",
    level: 5,
    hp: 12,
    maxHp: 28,
    ac: 16,
    status: "online",
    avatarInitials: "PC",
    color: "#00CEC9",
  },
  {
    id: "p3",
    name: "Ana Costa",
    character: "Zael",
    class: "Ranger",
    level: 5,
    hp: 35,
    maxHp: 35,
    ac: 15,
    status: "offline",
    avatarInitials: "AC",
    color: "#FDCB6E",
  },
  {
    id: "p4",
    name: "Joao Oliveira",
    character: "Theron",
    class: "Clerigo",
    level: 5,
    hp: 38,
    maxHp: 42,
    ac: 18,
    status: "online",
    avatarInitials: "JO",
    color: "#FF6B6B",
  },
];

export const MOCK_TOKENS: GameToken[] = [
  {
    id: "tok_eldrin",
    name: "Eldrin",
    alignment: "player",
    hp: 25,
    maxHp: 32,
    ac: 14,
    initiative: 18,
    size: 1,
    x: 8,
    y: 10,
    onMap: true,
    conditions: ["concentrating"],
    visibility: "visible",
    speed: 30,
    playerId: "p1",
  },
  {
    id: "tok_kira",
    name: "Kira",
    alignment: "player",
    hp: 12,
    maxHp: 28,
    ac: 16,
    initiative: 22,
    size: 1,
    x: 10,
    y: 11,
    onMap: true,
    conditions: [],
    visibility: "visible",
    speed: 30,
    playerId: "p2",
  },
  {
    id: "tok_zael",
    name: "Zael",
    alignment: "player",
    hp: 35,
    maxHp: 35,
    ac: 15,
    initiative: 15,
    size: 1,
    x: 7,
    y: 12,
    onMap: true,
    conditions: [],
    visibility: "visible",
    speed: 35,
    playerId: "p3",
  },
  {
    id: "tok_theron",
    name: "Theron",
    alignment: "player",
    hp: 38,
    maxHp: 42,
    ac: 18,
    initiative: 12,
    size: 1,
    x: 9,
    y: 13,
    onMap: true,
    conditions: [],
    visibility: "visible",
    speed: 30,
    playerId: "p4",
  },
  {
    id: "tok_skel1",
    name: "Esqueleto 1",
    alignment: "hostile",
    hp: 8,
    maxHp: 13,
    ac: 13,
    initiative: 16,
    size: 1,
    x: 12,
    y: 9,
    onMap: true,
    conditions: [],
    visibility: "visible",
    speed: 30,
  },
  {
    id: "tok_skel2",
    name: "Esqueleto 2",
    alignment: "hostile",
    hp: 0,
    maxHp: 13,
    ac: 13,
    initiative: 14,
    size: 1,
    x: 13,
    y: 10,
    onMap: true,
    conditions: [],
    visibility: "visible",
    speed: 30,
  },
  {
    id: "tok_wolf",
    name: "Lobo Sombrio",
    alignment: "hostile",
    hp: 22,
    maxHp: 22,
    ac: 13,
    initiative: 0,
    size: 1,
    x: 0,
    y: 0,
    onMap: false,
    conditions: [],
    visibility: "visible",
    speed: 40,
  },
  {
    id: "tok_chest",
    name: "Bau Misterioso",
    alignment: "neutral",
    hp: 10,
    maxHp: 10,
    ac: 15,
    initiative: 0,
    size: 1,
    x: 0,
    y: 0,
    onMap: false,
    conditions: [],
    visibility: "visible",
    speed: 0,
  },
];

export const MOCK_COMBAT: CombatState = {
  active: true,
  round: 3,
  turnIndex: 0,
  order: [
    { tokenId: "tok_kira", initiative: 22, status: "active" },
    { tokenId: "tok_eldrin", initiative: 18, status: "active" },
    { tokenId: "tok_skel1", initiative: 16, status: "active" },
    { tokenId: "tok_zael", initiative: 15, status: "active" },
    { tokenId: "tok_skel2", initiative: 14, status: "dead" },
    { tokenId: "tok_theron", initiative: 12, status: "active" },
  ],
};

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "msg1",
    channel: "geral",
    type: "system",
    sender: "Sistema",
    senderInitials: "S",
    isGM: false,
    content: "Combate iniciado — Rodada 1",
    timestamp: "19:45",
  },
  {
    id: "msg2",
    channel: "geral",
    type: "roll",
    sender: "Maria Santos",
    senderInitials: "MS",
    isGM: false,
    content: "Eldrin ataca com Bola de Fogo!",
    timestamp: "19:48",
    rollFormula: "8d6",
    rollResult: 34,
    rollDetails: "4+6+5+3+6+2+5+3",
  },
  {
    id: "msg3",
    channel: "geral",
    type: "roll",
    sender: "Pedro Costa",
    senderInitials: "PC",
    isGM: false,
    content: "Kira tenta ataque furtivo",
    timestamp: "19:52",
    rollFormula: "1d20+7",
    rollResult: 27,
    rollDetails: "20+7",
    isNat20: true,
  },
  {
    id: "msg4",
    channel: "mesa-gm",
    type: "normal",
    sender: "GM",
    senderInitials: "GM",
    isGM: true,
    content: "O esqueleto 2 cai em pedacos. Faltam 1 esqueleto na sala.",
    timestamp: "19:53",
  },
  {
    id: "msg5",
    channel: "geral",
    type: "normal",
    sender: "Joao Oliveira",
    senderInitials: "JO",
    isGM: false,
    content: "Theron se posiciona para curar Kira no proximo turno",
    timestamp: "19:55",
  },
];

export const MOCK_MAP: MapConfig = {
  name: "Torre de Ravenloft — Andar 3",
  gridCols: 25,
  gridRows: 25,
  cellSize: 40,
  cellSizeFt: 5,
};

// ── Helpers ──────────────────────────────────────────

export function getElapsedTime(startedAt: Date): string {
  const diff = Date.now() - startedAt.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h${m.toString().padStart(2, "0")}m`;
}

export function getTokenById(id: string): GameToken | undefined {
  return MOCK_TOKENS.find((t) => t.id === id);
}

export function getPlayerById(id: string): GamePlayer | undefined {
  return MOCK_PLAYERS.find((p) => p.id === id);
}

export function getAlignmentColor(alignment: TokenAlignment): string {
  switch (alignment) {
    case "player":
      return "#6C5CE7";
    case "hostile":
      return "#FF4444";
    case "ally":
      return "#00B894";
    case "neutral":
      return "#FDCB6E";
  }
}

export function getHpPercent(hp: number, maxHp: number): number {
  if (maxHp === 0) return 0;
  return Math.max(0, Math.min(100, (hp / maxHp) * 100));
}

export function getHpColor(percent: number): string {
  if (percent > 50) return "#00B894";
  if (percent > 25) return "#FDCB6E";
  return "#FF6B6B";
}

export function gridDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cellSizeFt: number,
): number {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  return Math.max(dx, dy) * cellSizeFt;
}

export function cellsInRadius(
  cx: number,
  cy: number,
  radiusCells: number,
  gridCols: number,
  gridRows: number,
): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  const r = Math.ceil(radiusCells);
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= radiusCells) {
        cells.push({ x: nx, y: ny });
      }
    }
  }
  return cells;
}
