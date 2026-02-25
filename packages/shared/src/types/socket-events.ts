import type {
  SessionPlayerDTO,
  TokenDTO,
  FogAreaDTO,
  WallDTO,
  LightSourceDTO,
  MapLayerDTO,
  MapAnnotationDTO,
  MapFullStateDTO,
  DiceRollDTO,
  MessageDTO,
  SessionAudioDTO,
  InitiativeEntry,
  CombatStateDTO,
  TimelineEventDTO,
} from "./dto.js";
import type { SessionStatus, PlayerRole, ChatChannel, RsvpStatus, DoorState, FogShapeType, AnnotationType, AnnotationVisibility } from "./enums.js";

// ╔══════════════════════════════════════════════════════════════════╗
// ║  SERVER → CLIENT (broadcast para a room da sessão)              ║
// ╚══════════════════════════════════════════════════════════════════╝

export interface ServerToClientEvents {
  // ── Sessão ──
  "session:status-changed": (data: { status: SessionStatus; changedBy: string }) => void;
  "session:settings-updated": (data: { changes: Record<string, unknown>; changedBy: string }) => void;
  "session:deleted": () => void;

  // ── Jogadores ──
  "player:joined": (data: { player: SessionPlayerDTO }) => void;
  "player:left": (data: { userId: string; reason: "voluntary" | "disconnect" | "kick" }) => void;
  "player:connected": (data: { userId: string }) => void;
  "player:disconnected": (data: { userId: string }) => void;
  "player:role-changed": (data: { userId: string; newRole: PlayerRole; changedBy: string }) => void;
  "player:muted": (data: { userId: string; muted: boolean }) => void;

  // ── Combate ──
  "combat:started": (data: { combatState: CombatStateDTO }) => void;
  "combat:ended": (data: { rounds: number; duration: number }) => void;
  "combat:turn-changed": (data: { round: number; turnIndex: number; currentActor: InitiativeEntry }) => void;
  "combat:initiative-updated": (data: { order: InitiativeEntry[] }) => void;
  "combat:hp-changed": (data: { entryId: string; hp: { current: number; max: number } }) => void;
  "combat:condition-changed": (data: { entryId: string; conditions: string[] }) => void;

  // ── Dados ──
  "dice:result": (data: DiceRollDTO) => void;
  "dice:secret-result": (data: DiceRollDTO) => void;

  // ── Chat ──
  "chat:message": (data: MessageDTO) => void;
  "chat:typing": (data: { userId: string; channel: ChatChannel }) => void;

  // ── Mapa ──
  "map:changed": (data: { mapId: string }) => void;
  "token:moved": (data: { tokenId: string; x: number; y: number; animate: boolean }) => void;
  "token:added": (data: TokenDTO) => void;
  "token:removed": (data: { tokenId: string }) => void;
  "token:updated": (data: { tokenId: string; changes: Partial<TokenDTO> }) => void;
  "token:batch-moved": (data: Array<{ tokenId: string; x: number; y: number }>) => void;

  "fog:area-added": (data: FogAreaDTO) => void;
  "fog:area-removed": (data: { fogAreaId: string }) => void;
  "fog:area-updated": (data: { fogAreaId: string; isRevealed: boolean }) => void;
  "fog:batch-revealed": (data: { fogAreaIds: string[] }) => void;
  "fog:all-hidden": () => void;
  "fog:auto-reveal": (data: { revealedCells: string[] }) => void;

  "wall:door-toggled": (data: { wallId: string; doorState: DoorState }) => void;
  "wall:added": (data: WallDTO) => void;
  "wall:removed": (data: { wallId: string }) => void;

  "light:added": (data: LightSourceDTO) => void;
  "light:removed": (data: { lightId: string }) => void;
  "light:updated": (data: { lightId: string; changes: Partial<LightSourceDTO> }) => void;
  "light:map-updated": (data: { lightMap: Record<string, number> }) => void;

  "layer:visibility-changed": (data: { layerId: string; isVisible: boolean }) => void;

  "annotation:added": (data: MapAnnotationDTO) => void;
  "annotation:cleared": (data: { persistent: boolean }) => void;

  "map:generation-progress": (data: { generationId: string; progress: number; previewUrl?: string }) => void;
  "map:generation-complete": (data: { generationId: string; resultUrl: string }) => void;
  "map:generation-failed": (data: { generationId: string; error: string }) => void;

  // ── Áudio ──
  "audio:sync": (data: SessionAudioDTO[]) => void;

  // ── Timeline ──
  "timeline:event": (data: TimelineEventDTO) => void;

  // ── Cursores (high frequency) ──
  "cursor:positions": (data: Record<string, { x: number; y: number }>) => void;

  // ── Sistema ──
  "error": (data: { code: string; message: string }) => void;
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  CLIENT → SERVER (ações do jogador)                             ║
// ╚══════════════════════════════════════════════════════════════════╝

export interface ClientToServerEvents {
  // ── Sessão ──
  "session:join": (data: { sessionId: string; password?: string }, ack: AckFn<JoinResult>) => void;
  "session:leave": () => void;
  "session:start": (ack: AckFn<void>) => void;
  "session:pause": (ack: AckFn<void>) => void;
  "session:resume": (ack: AckFn<void>) => void;
  "session:end": (ack: AckFn<void>) => void;

  // ── Jogadores (GM only) ──
  "player:kick": (data: { userId: string; reason?: string }, ack: AckFn<void>) => void;
  "player:change-role": (data: { userId: string; role: PlayerRole }, ack: AckFn<void>) => void;
  "player:mute": (data: { userId: string; muted: boolean }, ack: AckFn<void>) => void;

  // ── Combate ──
  "combat:start": (data: { entries: InitiativeInput[] }, ack: AckFn<void>) => void;
  "combat:end": (ack: AckFn<void>) => void;
  "combat:next-turn": (ack: AckFn<void>) => void;
  "combat:prev-turn": (ack: AckFn<void>) => void;
  "combat:update-hp": (data: { entryId: string; delta: number }, ack: AckFn<void>) => void;
  "combat:add-entry": (data: InitiativeInput, ack: AckFn<void>) => void;
  "combat:remove-entry": (data: { entryId: string }, ack: AckFn<void>) => void;
  "combat:set-condition": (data: { entryId: string; conditions: string[] }, ack: AckFn<void>) => void;

  // ── Dados ──
  "dice:roll": (data: { formula: string; context?: string; isSecret?: boolean }, ack: AckFn<DiceRollDTO>) => void;

  // ── Chat ──
  "chat:send": (data: { channel: ChatChannel; content: string; targetId?: string }, ack: AckFn<MessageDTO>) => void;
  "chat:typing": (data: { channel: ChatChannel }) => void;

  // ── Mapa ──
  "token:move": (data: { tokenId: string; x: number; y: number }) => void;
  "token:batch-move": (data: Array<{ tokenId: string; x: number; y: number }>) => void;
  "cursor:move": (data: { x: number; y: number }) => void;

  "fog:reveal": (data: { fogAreaId: string }) => void;
  "fog:hide": (data: { fogAreaId: string }) => void;
  "fog:batch-reveal": (data: { fogAreaIds: string[] }) => void;
  "fog:reveal-at": (data: { shape: FogShapeType; geometry: Record<string, unknown> }) => void;

  "wall:toggle-door": (data: { wallId: string }) => void;

  "annotation:draw": (data: { type: AnnotationType; data: Record<string, unknown>; visibility: AnnotationVisibility }) => void;
  "annotation:clear": (data: { persistent?: boolean }) => void;

  "map:request-state": (ack: AckFn<MapFullStateDTO>) => void;

  // ── Áudio (GM only) ──
  "audio:play": (data: { trackId: string; layer: string; volume?: number }) => void;
  "audio:stop": (data: { layer: string }) => void;
  "audio:volume": (data: { layer: string; volume: number }) => void;

  // ── RSVP ──
  "schedule:rsvp": (data: { scheduleId: string; status: RsvpStatus }, ack: AckFn<void>) => void;
}

// ── Types auxiliares ──

export type AckFn<T> = (response: {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}) => void;

export interface JoinResult {
  sessionId: string;
  player: SessionPlayerDTO;
  players: SessionPlayerDTO[];
  combatState: CombatStateDTO | null;
  activeMapId: string | null;
}

export interface InitiativeInput {
  type: "player" | "npc" | "lair";
  name: string;
  userId?: string;
  characterId?: string;
  initiative: number;
  dexModifier?: number;
  hp: { current: number; max: number };
  conditions?: string[];
  isVisible?: boolean;
  color?: string;
}
