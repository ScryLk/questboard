// ── Service: biblioteca de mapas (templates por campanha) ──
//
// CRUD de MapTemplate + MapCollection. Distinto do `map.service.ts`,
// que cuida da instância de mapa em sessão (com tokens vivos, fog,
// lights). Aqui é o template reutilizável que o GM mantém no dashboard.
//
// Permissão é validada no router via requireCampaignGm/member.

import type { PrismaClient, Prisma } from "@questboard/db";
import { NotFoundError, BadRequestError } from "../../errors/app-error.js";

export interface CreateMapTemplateInput {
  name: string;
  description?: string;
  tags?: string[];
  category?: string;
  thumbnail?: string | null;
  width: number;
  height: number;
  cellSizeFt?: number;
  terrain?: Prisma.InputJsonValue;
  walls?: Prisma.InputJsonValue;
  objects?: Prisma.InputJsonValue;
  background?: string | null;
  bgOpacity?: number;
  stats?: Prisma.InputJsonValue;
  collectionId?: string | null;
  orderIndex?: number;
}

export type UpdateMapTemplateInput = Partial<CreateMapTemplateInput>;

export interface CreateMapCollectionInput {
  name: string;
  description?: string | null;
  coverMapId?: string | null;
}

export type UpdateMapCollectionInput = Partial<CreateMapCollectionInput>;

export function createMapLibraryService(prisma: PrismaClient) {
  return {
    // ── Maps ──────────────────────────────────────────────
    async listMaps(campaignId: string) {
      return prisma.mapTemplate.findMany({
        where: { campaignId },
        orderBy: [{ collectionId: "asc" }, { orderIndex: "asc" }],
      });
    },

    async getMap(mapId: string) {
      const map = await prisma.mapTemplate.findUnique({
        where: { id: mapId },
      });
      if (!map) throw new NotFoundError("MapTemplate");
      return map;
    },

    async createMap(campaignId: string, input: CreateMapTemplateInput) {
      // Se vier collectionId, valida que pertence à mesma campanha (evita
      // colocar o mapa em coleção de outro GM).
      if (input.collectionId) {
        const col = await prisma.mapCollection.findUnique({
          where: { id: input.collectionId },
          select: { campaignId: true },
        });
        if (!col || col.campaignId !== campaignId) {
          throw new BadRequestError(
            "Coleção não pertence a esta campanha.",
          );
        }
      }
      return prisma.mapTemplate.create({
        data: {
          campaignId,
          name: input.name,
          description: input.description ?? "",
          tags: input.tags ?? [],
          category: input.category ?? "custom",
          thumbnail: input.thumbnail ?? null,
          width: input.width,
          height: input.height,
          cellSizeFt: input.cellSizeFt ?? 5,
          terrain: input.terrain ?? {},
          walls: input.walls ?? {},
          objects: input.objects ?? [],
          background: input.background ?? null,
          bgOpacity: input.bgOpacity ?? 60,
          stats: input.stats ?? {},
          collectionId: input.collectionId ?? null,
          orderIndex: input.orderIndex ?? 0,
        },
      });
    },

    async updateMap(mapId: string, input: UpdateMapTemplateInput) {
      const map = await prisma.mapTemplate.findUnique({
        where: { id: mapId },
        select: { campaignId: true },
      });
      if (!map) throw new NotFoundError("MapTemplate");

      if (input.collectionId) {
        const col = await prisma.mapCollection.findUnique({
          where: { id: input.collectionId },
          select: { campaignId: true },
        });
        if (!col || col.campaignId !== map.campaignId) {
          throw new BadRequestError(
            "Coleção não pertence a esta campanha.",
          );
        }
      }

      return prisma.mapTemplate.update({
        where: { id: mapId },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.tags !== undefined ? { tags: input.tags } : {}),
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.thumbnail !== undefined
            ? { thumbnail: input.thumbnail }
            : {}),
          ...(input.width !== undefined ? { width: input.width } : {}),
          ...(input.height !== undefined ? { height: input.height } : {}),
          ...(input.cellSizeFt !== undefined
            ? { cellSizeFt: input.cellSizeFt }
            : {}),
          ...(input.terrain !== undefined ? { terrain: input.terrain } : {}),
          ...(input.walls !== undefined ? { walls: input.walls } : {}),
          ...(input.objects !== undefined ? { objects: input.objects } : {}),
          ...(input.background !== undefined
            ? { background: input.background }
            : {}),
          ...(input.bgOpacity !== undefined
            ? { bgOpacity: input.bgOpacity }
            : {}),
          ...(input.stats !== undefined ? { stats: input.stats } : {}),
          ...(input.collectionId !== undefined
            ? { collectionId: input.collectionId }
            : {}),
          ...(input.orderIndex !== undefined
            ? { orderIndex: input.orderIndex }
            : {}),
        },
      });
    },

    async deleteMap(mapId: string) {
      await prisma.mapTemplate.delete({ where: { id: mapId } });
    },

    // ── Collections ───────────────────────────────────────
    async listCollections(campaignId: string) {
      return prisma.mapCollection.findMany({
        where: { campaignId },
        orderBy: { name: "asc" },
      });
    },

    async createCollection(
      campaignId: string,
      input: CreateMapCollectionInput,
    ) {
      const trimmed = input.name.trim();
      if (!trimmed) throw new BadRequestError("Nome é obrigatório.");
      if (trimmed.length > 60) {
        throw new BadRequestError("Nome com máximo de 60 caracteres.");
      }

      try {
        return await prisma.mapCollection.create({
          data: {
            campaignId,
            name: trimmed,
            description: input.description?.trim() || null,
            coverMapId: input.coverMapId ?? null,
          },
        });
      } catch (err) {
        // P2002 = unique violation. O @@unique([campaignId,name]) já cobre
        // colisão case-sensitive; case-insensitive precisaria index raw.
        const code = (err as { code?: string }).code;
        if (code === "P2002") {
          throw new BadRequestError(
            "Já existe uma coleção com esse nome nesta campanha.",
          );
        }
        throw err;
      }
    },

    async updateCollection(
      collectionId: string,
      input: UpdateMapCollectionInput,
    ) {
      const col = await prisma.mapCollection.findUnique({
        where: { id: collectionId },
      });
      if (!col) throw new NotFoundError("MapCollection");

      const data: Prisma.MapCollectionUpdateInput = {};
      if (input.name !== undefined) {
        const trimmed = input.name.trim();
        if (!trimmed) throw new BadRequestError("Nome é obrigatório.");
        if (trimmed.length > 60) {
          throw new BadRequestError("Nome com máximo de 60 caracteres.");
        }
        data.name = trimmed;
      }
      if (input.description !== undefined) {
        data.description = input.description?.trim() || null;
      }
      if (input.coverMapId !== undefined) {
        data.coverMapId = input.coverMapId;
      }
      try {
        return await prisma.mapCollection.update({
          where: { id: collectionId },
          data,
        });
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "P2002") {
          throw new BadRequestError(
            "Já existe uma coleção com esse nome nesta campanha.",
          );
        }
        throw err;
      }
    },

    async deleteCollection(collectionId: string) {
      // ON DELETE SET NULL no fk de MapTemplate.collectionId — mapas
      // sobrevivem, só ficam órfãos. Comportamento intencional.
      await prisma.mapCollection.delete({ where: { id: collectionId } });
    },

    async getCollectionCampaign(
      collectionId: string,
    ): Promise<string | null> {
      const col = await prisma.mapCollection.findUnique({
        where: { id: collectionId },
        select: { campaignId: true },
      });
      return col?.campaignId ?? null;
    },

    async getMapCampaign(mapId: string): Promise<string | null> {
      const map = await prisma.mapTemplate.findUnique({
        where: { id: mapId },
        select: { campaignId: true },
      });
      return map?.campaignId ?? null;
    },
  };
}

export type MapLibraryService = ReturnType<typeof createMapLibraryService>;
