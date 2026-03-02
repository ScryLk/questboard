import type {
  SessionPlayerDTO,
  TokenDTO,
  FogAreaDTO,
  DiceRollDTO,
  MessageDTO,
  SessionAudioDTO,
  InitiativeEntry,
} from "./dto.js";
import type { SessionStatus, ChatChannel, DiceRollMode } from "./enums.js";
import type {
  TerrainTile,
  MapObject,
  Wall,
  Door,
  DoorState,
  LightSource,
  FogTile,
  GameMapLayers,
} from "./map-editor.js";

export interface ServerToClientEvents {
  "session:player-joined": (data: { player: SessionPlayerDTO }) => void;
  "session:player-left": (data: { userId: string }) => void;
  "session:status-changed": (data: { status: SessionStatus }) => void;

  "token:moved": (data: { tokenId: string; x: number; y: number }) => void;
  "token:added": (data: { token: TokenDTO }) => void;
  "token:removed": (data: { tokenId: string }) => void;
  "token:updated": (data: {
    tokenId: string;
    changes: Partial<TokenDTO>;
  }) => void;

  "fog:updated": (data: { areas: FogAreaDTO[] }) => void;

  "dice:result": (data: DiceRollDTO) => void;

  "chat:message": (data: MessageDTO) => void;

  "audio:sync": (data: SessionAudioDTO[]) => void;

  "initiative:updated": (data: InitiativeEntry[]) => void;

  "cursor:position": (data: {
    userId: string;
    x: number;
    y: number;
  }) => void;

  // Map editor events
  "map:terrain-updated": (data: {
    mapId: string;
    tiles: TerrainTile[];
  }) => void;
  "map:object-added": (data: { mapId: string; object: MapObject }) => void;
  "map:object-moved": (data: {
    mapId: string;
    objectId: string;
    x: number;
    y: number;
  }) => void;
  "map:object-removed": (data: {
    mapId: string;
    objectId: string;
  }) => void;
  "map:wall-added": (data: { mapId: string; wall: Wall }) => void;
  "map:wall-removed": (data: { mapId: string; wallId: string }) => void;
  "map:door-added": (data: { mapId: string; door: Door }) => void;
  "map:door-state-changed": (data: {
    mapId: string;
    doorId: string;
    state: DoorState;
  }) => void;
  "map:light-added": (data: {
    mapId: string;
    light: LightSource;
  }) => void;
  "map:light-removed": (data: {
    mapId: string;
    lightId: string;
  }) => void;
  "map:fog-updated": (data: { mapId: string; fogTiles: FogTile[] }) => void;
  "map:layers-synced": (data: {
    mapId: string;
    layers: GameMapLayers;
  }) => void;
}

export interface ClientToServerEvents {
  "session:join": (data: { sessionId: string }) => void;
  "session:leave": () => void;

  "token:move": (data: { tokenId: string; x: number; y: number }) => void;

  "dice:roll": (data: {
    formula: string;
    context?: string;
    mode: DiceRollMode;
  }) => void;

  "chat:send": (data: {
    channel: ChatChannel;
    content: string;
    targetId?: string;
  }) => void;

  "cursor:move": (data: { x: number; y: number }) => void;

  // Map editor events
  "map:update-terrain": (data: {
    mapId: string;
    tiles: TerrainTile[];
  }) => void;
  "map:add-object": (data: { mapId: string; object: MapObject }) => void;
  "map:move-object": (data: {
    mapId: string;
    objectId: string;
    x: number;
    y: number;
  }) => void;
  "map:remove-object": (data: {
    mapId: string;
    objectId: string;
  }) => void;
  "map:add-wall": (data: { mapId: string; wall: Wall }) => void;
  "map:remove-wall": (data: { mapId: string; wallId: string }) => void;
  "map:add-door": (data: { mapId: string; door: Door }) => void;
  "map:change-door-state": (data: {
    mapId: string;
    doorId: string;
    state: DoorState;
  }) => void;
  "map:add-light": (data: { mapId: string; light: LightSource }) => void;
  "map:remove-light": (data: {
    mapId: string;
    lightId: string;
  }) => void;
  "map:update-fog": (data: { mapId: string; fogTiles: FogTile[] }) => void;
  "map:request-sync": (data: { mapId: string }) => void;
}
