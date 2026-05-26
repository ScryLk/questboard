// ── HTTP API: biblioteca de mapas (templates por campanha) ──
//
// Espelha apps/api/src/modules/map-library/map-library.routes.ts.
// O mapper converte entre o DTO do backend (campos enxutos, JSON cru)
// e o `QuestBoardMap` da UI (campos derivados como stats, timestamps
// em number ms, etc.).

import { apiRequest } from "./api-client";
import type {
  MapCategory,
  MapObjectSaveData,
  QuestBoardMap,
  WallSaveData,
} from "./map-types";
import type { MapCollection } from "./map-types";

export interface MapTemplateDto {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  tags: string[];
  category: string;
  thumbnail: string | null;
  width: number;
  height: number;
  cellSizeFt: number;
  terrain: Record<string, string>;
  walls: Record<string, WallSaveData>;
  objects: MapObjectSaveData[];
  background: string | null;
  bgOpacity: number;
  stats: { terrainCount?: number; wallCount?: number; objectCount?: number };
  collectionId: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface MapCollectionDto {
  id: string;
  campaignId: string;
  name: string;
  description: string | null;
  coverMapId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Mappers DTO ↔ UI ────────────────────────────────────────

const KNOWN_CATEGORIES = new Set<MapCategory>([
  "dungeon",
  "outdoor",
  "city",
  "cave",
  "custom",
]);

function asCategory(c: string): MapCategory {
  return KNOWN_CATEGORIES.has(c as MapCategory) ? (c as MapCategory) : "custom";
}

export function dtoToMap(dto: MapTemplateDto): QuestBoardMap {
  const terrainCount =
    typeof dto.stats?.terrainCount === "number"
      ? dto.stats.terrainCount
      : Object.keys(dto.terrain).length;
  const wallCount =
    typeof dto.stats?.wallCount === "number"
      ? dto.stats.wallCount
      : Object.keys(dto.walls).length;
  const objectCount =
    typeof dto.stats?.objectCount === "number"
      ? dto.stats.objectCount
      : dto.objects.length;

  return {
    id: dto.id,
    version: 1,
    name: dto.name,
    description: dto.description,
    tags: dto.tags,
    category: asCategory(dto.category),
    thumbnail: dto.thumbnail,
    width: dto.width,
    height: dto.height,
    cellSizeFt: dto.cellSizeFt,
    terrain: dto.terrain,
    walls: dto.walls,
    objects: dto.objects,
    backgroundImage: dto.background,
    backgroundOpacity: dto.bgOpacity,
    createdAt: new Date(dto.createdAt).getTime(),
    updatedAt: new Date(dto.updatedAt).getTime(),
    stats: { terrainCount, wallCount, objectCount },
    collectionId: dto.collectionId,
    order: dto.orderIndex,
    campaignId: dto.campaignId,
  };
}

export function dtoToCollection(dto: MapCollectionDto): MapCollection {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    coverMapId: dto.coverMapId,
    createdAt: new Date(dto.createdAt).getTime(),
    updatedAt: new Date(dto.updatedAt).getTime(),
  };
}

export function mapToCreateInput(m: QuestBoardMap) {
  return {
    name: m.name,
    description: m.description,
    tags: m.tags,
    category: m.category,
    thumbnail: m.thumbnail,
    width: m.width,
    height: m.height,
    cellSizeFt: m.cellSizeFt,
    terrain: m.terrain,
    walls: m.walls,
    objects: m.objects,
    background: m.backgroundImage,
    bgOpacity: m.backgroundOpacity,
    stats: m.stats,
    collectionId: m.collectionId,
    orderIndex: m.order,
  };
}

// ── Endpoints ───────────────────────────────────────────────

export async function listMapsForCampaign(
  campaignId: string,
): Promise<QuestBoardMap[]> {
  const dtos = await apiRequest<MapTemplateDto[]>(
    `/campaigns/${campaignId}/map-library`,
  );
  return dtos.map(dtoToMap);
}

export async function createMap(
  campaignId: string,
  map: QuestBoardMap,
): Promise<QuestBoardMap> {
  const dto = await apiRequest<MapTemplateDto>(
    `/campaigns/${campaignId}/map-library`,
    { method: "POST", body: mapToCreateInput(map) },
  );
  return dtoToMap(dto);
}

export async function updateMap(
  mapId: string,
  patch: Partial<QuestBoardMap>,
): Promise<QuestBoardMap> {
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.tags !== undefined) body.tags = patch.tags;
  if (patch.category !== undefined) body.category = patch.category;
  if (patch.thumbnail !== undefined) body.thumbnail = patch.thumbnail;
  if (patch.width !== undefined) body.width = patch.width;
  if (patch.height !== undefined) body.height = patch.height;
  if (patch.cellSizeFt !== undefined) body.cellSizeFt = patch.cellSizeFt;
  if (patch.terrain !== undefined) body.terrain = patch.terrain;
  if (patch.walls !== undefined) body.walls = patch.walls;
  if (patch.objects !== undefined) body.objects = patch.objects;
  if (patch.backgroundImage !== undefined)
    body.background = patch.backgroundImage;
  if (patch.backgroundOpacity !== undefined)
    body.bgOpacity = patch.backgroundOpacity;
  if (patch.stats !== undefined) body.stats = patch.stats;
  if (patch.collectionId !== undefined) body.collectionId = patch.collectionId;
  if (patch.order !== undefined) body.orderIndex = patch.order;

  const dto = await apiRequest<MapTemplateDto>(`/map-library/${mapId}`, {
    method: "PATCH",
    body,
  });
  return dtoToMap(dto);
}

export async function deleteMap(mapId: string): Promise<void> {
  await apiRequest<void>(`/map-library/${mapId}`, { method: "DELETE" });
}

// Collections

export async function listCollectionsForCampaign(
  campaignId: string,
): Promise<MapCollection[]> {
  const dtos = await apiRequest<MapCollectionDto[]>(
    `/campaigns/${campaignId}/map-collections`,
  );
  return dtos.map(dtoToCollection);
}

export async function createCollection(
  campaignId: string,
  input: { name: string; description?: string },
): Promise<MapCollection> {
  const dto = await apiRequest<MapCollectionDto>(
    `/campaigns/${campaignId}/map-collections`,
    { method: "POST", body: input },
  );
  return dtoToCollection(dto);
}

export async function updateCollection(
  collectionId: string,
  input: { name?: string; description?: string | null; coverMapId?: string | null },
): Promise<MapCollection> {
  const dto = await apiRequest<MapCollectionDto>(
    `/map-collections/${collectionId}`,
    { method: "PATCH", body: input },
  );
  return dtoToCollection(dto);
}

export async function deleteCollection(collectionId: string): Promise<void> {
  await apiRequest<void>(`/map-collections/${collectionId}`, {
    method: "DELETE",
  });
}
