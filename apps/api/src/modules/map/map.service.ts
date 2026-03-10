import type { PrismaClient } from "@questboard/db";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";
import { uploadFile, deleteFile } from "../../lib/r2.js";

export function createMapService(prisma: PrismaClient) {
  // Helper to check GM ownership
  async function assertGM(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
    if (!session) throw new NotFoundError("Session");
    if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode gerenciar mapas");
    return session;
  }

  return {
    async list(sessionId: string) {
      return prisma.map.findMany({
        where: { sessionId, deletedAt: null },
        include: { _count: { select: { tokens: true, fogAreas: true } } },
        orderBy: { order: "asc" },
      });
    },

    async create(sessionId: string, userId: string, input: {
      name: string; width: number; height: number; gridType?: string;
      gridSize?: number; gridCols?: number; gridRows?: number;
    }, imageBuffer?: Buffer, contentType?: string) {
      await assertGM(sessionId, userId);

      let imageUrl: string | undefined;
      if (imageBuffer && contentType) {
        const key = `maps/${sessionId}/${Date.now()}.${contentType.split("/")[1] ?? "png"}`;
        imageUrl = await uploadFile(key, imageBuffer, contentType);
      }

      return prisma.map.create({
        data: {
          sessionId,
          creatorId: userId,
          name: input.name,
          width: input.width,
          height: input.height,
          gridType: (input.gridType as "SQUARE" | "HEX") ?? "SQUARE",
          gridSize: input.gridSize ?? 50,
          gridCols: input.gridCols ?? 20,
          gridRows: input.gridRows ?? 20,
          imageUrl,
        },
      });
    },

    async update(sessionId: string, userId: string, mapId: string, input: {
      name?: string; gridSize?: number; gridCols?: number; gridRows?: number;
      settings?: Record<string, unknown>; order?: number;
    }) {
      await assertGM(sessionId, userId);
      const map = await prisma.map.findFirst({ where: { id: mapId, sessionId, deletedAt: null } });
      if (!map) throw new NotFoundError("Map");

      return prisma.map.update({ where: { id: mapId }, data: input as Record<string, unknown> });
    },

    async delete(sessionId: string, userId: string, mapId: string) {
      await assertGM(sessionId, userId);
      const map = await prisma.map.findFirst({ where: { id: mapId, sessionId, deletedAt: null } });
      if (!map) throw new NotFoundError("Map");

      if (map.imageUrl) {
        const key = map.imageUrl.split("/").slice(-2).join("/");
        await deleteFile(key).catch(() => {});
      }

      return prisma.map.update({ where: { id: mapId }, data: { deletedAt: new Date() } });
    },

    async activate(sessionId: string, userId: string, mapId: string) {
      await assertGM(sessionId, userId);

      // Deactivate all maps
      await prisma.map.updateMany({ where: { sessionId }, data: { isActive: false } });
      // Activate target
      return prisma.map.update({ where: { id: mapId }, data: { isActive: true } });
    },

    // ─── Tokens ──────────────────────────────────────
    async listTokens(mapId: string) {
      return prisma.token.findMany({ where: { mapId }, orderBy: { createdAt: "asc" } });
    },

    async createToken(sessionId: string, userId: string, mapId: string, input: {
      label?: string; x: number; y: number; size?: number;
      characterId?: string; imageUrl?: string; color?: string;
      currentHp?: number; maxHp?: number; ac?: number; isHidden?: boolean;
    }) {
      await assertGM(sessionId, userId);
      return prisma.token.create({
        data: { mapId, ownerId: userId, ...input },
      });
    },

    async updateToken(_sessionId: string, userId: string, tokenId: string, input: Record<string, unknown>) {
      const token = await prisma.token.findUnique({ where: { id: tokenId }, include: { map: { select: { sessionId: true } } } });
      if (!token) throw new NotFoundError("Token");

      // Owner or GM can update
      const session = await prisma.session.findUnique({ where: { id: token.map.sessionId }, select: { ownerId: true } });
      const isGM = session?.ownerId === userId;
      const isOwner = token.ownerId === userId;
      if (!isGM && !isOwner) throw new ForbiddenError("Sem permissão para editar este token");

      return prisma.token.update({ where: { id: tokenId }, data: input });
    },

    async deleteToken(sessionId: string, userId: string, tokenId: string) {
      await assertGM(sessionId, userId);
      return prisma.token.delete({ where: { id: tokenId } });
    },

    // ─── Fog ─────────────────────────────────────────
    async listFog(mapId: string) {
      return prisma.fogArea.findMany({ where: { mapId } });
    },

    async updateFog(sessionId: string, userId: string, mapId: string, areas: { type: string; cells: unknown }[]) {
      await assertGM(sessionId, userId);

      // Replace all fog for this map
      await prisma.fogArea.deleteMany({ where: { mapId } });
      if (areas.length > 0) {
        await prisma.fogArea.createMany({
          data: areas.map((a) => ({
            mapId,
            type: a.type as "HIDDEN" | "REVEALED" | "PARTIAL",
            cells: a.cells as Record<string, unknown>,
          })),
        });
      }

      return prisma.fogArea.findMany({ where: { mapId } });
    },

    // ─── Walls ───────────────────────────────────────
    async listWalls(mapId: string) {
      return prisma.mapWall.findMany({ where: { mapId } });
    },

    async setWalls(sessionId: string, userId: string, mapId: string, walls: { x1: number; y1: number; x2: number; y2: number; type?: string }[]) {
      await assertGM(sessionId, userId);
      await prisma.mapWall.deleteMany({ where: { mapId } });
      if (walls.length > 0) {
        await prisma.mapWall.createMany({
          data: walls.map((w) => ({
            mapId,
            x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2,
            type: (w.type as "SOLID" | "TRANSPARENT" | "DOOR" | "DOOR_OPEN" | "SECRET") ?? "SOLID",
          })),
        });
      }
      return prisma.mapWall.findMany({ where: { mapId } });
    },

    // ─── Lights ──────────────────────────────────────
    async listLights(mapId: string) {
      return prisma.mapLight.findMany({ where: { mapId } });
    },

    async setLights(sessionId: string, userId: string, mapId: string, lights: { col: number; row: number; radius?: number; dimRadius?: number; color?: string; intensity?: number }[]) {
      await assertGM(sessionId, userId);
      await prisma.mapLight.deleteMany({ where: { mapId } });
      if (lights.length > 0) {
        await prisma.mapLight.createMany({
          data: lights.map((l) => ({ mapId, ...l })),
        });
      }
      return prisma.mapLight.findMany({ where: { mapId } });
    },
  };
}

export type MapService = ReturnType<typeof createMapService>;
