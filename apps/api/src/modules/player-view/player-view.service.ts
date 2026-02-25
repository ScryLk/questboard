import type { PrismaClient, Prisma } from "@questboard/db";
import { ForbiddenError } from "../../errors/app-error.js";

export function createPlayerViewService(prisma: PrismaClient) {
  async function assertSessionPlayer(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player) throw new ForbiddenError("Não é jogador");
    return player;
  }

  return {
    async getMyView(sessionId: string, userId: string, mapId: string) {
      await assertSessionPlayer(sessionId, userId);

      return prisma.playerViewState.upsert({
        where: { sessionId_userId_mapId: { sessionId, userId, mapId } },
        create: { sessionId, userId, mapId },
        update: {},
      });
    },

    async saveCamera(sessionId: string, userId: string, mapId: string, camera: {
      cameraX: number;
      cameraY: number;
      cameraZoom: number;
    }) {
      await assertSessionPlayer(sessionId, userId);

      return prisma.playerViewState.upsert({
        where: { sessionId_userId_mapId: { sessionId, userId, mapId } },
        create: {
          sessionId,
          userId,
          mapId,
          cameraX: camera.cameraX,
          cameraY: camera.cameraY,
          cameraZoom: camera.cameraZoom,
        },
        update: {
          cameraX: camera.cameraX,
          cameraY: camera.cameraY,
          cameraZoom: camera.cameraZoom,
        },
      });
    },

    async updateExploredCells(sessionId: string, userId: string, mapId: string, cells: string[]) {
      const existing = await prisma.playerViewState.findUnique({
        where: { sessionId_userId_mapId: { sessionId, userId, mapId } },
      });

      const existingCells = existing?.exploredCells
        ? (Array.isArray(existing.exploredCells) ? existing.exploredCells as string[] : [])
        : [];

      const merged = [...new Set([...existingCells, ...cells])];

      return prisma.playerViewState.upsert({
        where: { sessionId_userId_mapId: { sessionId, userId, mapId } },
        create: {
          sessionId,
          userId,
          mapId,
          exploredCells: merged as Prisma.InputJsonValue,
        },
        update: {
          exploredCells: merged as Prisma.InputJsonValue,
        },
      });
    },

    async updateTokenPosition(sessionId: string, userId: string, mapId: string, x: number, y: number) {
      return prisma.playerViewState.upsert({
        where: { sessionId_userId_mapId: { sessionId, userId, mapId } },
        create: { sessionId, userId, mapId, lastTokenX: x, lastTokenY: y },
        update: { lastTokenX: x, lastTokenY: y },
      });
    },
  };
}

export type PlayerViewService = ReturnType<typeof createPlayerViewService>;
