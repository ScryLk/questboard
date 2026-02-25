import type { PrismaClient, Prisma } from "@questboard/db";
import { ForbiddenError } from "../../errors/app-error.js";

export function createExplorationService(prisma: PrismaClient) {
  async function assertGmOrCoGm(sessionId: string, userId: string) {
    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!player || !["GM", "CO_GM"].includes(player.role)) {
      throw new ForbiddenError("Sem permissão");
    }
    return player;
  }

  return {
    async getSettings(sessionId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { settings: true },
      });
      const settings = (session?.settings as Record<string, unknown>) ?? {};
      return settings.exploration ?? getDefaultExplorationSettings();
    },

    async updateSettings(sessionId: string, userId: string, input: Record<string, unknown>) {
      await assertGmOrCoGm(sessionId, userId);

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { settings: true },
      });
      const currentSettings = (session?.settings as Record<string, unknown>) ?? {};
      const currentExploration = (currentSettings.exploration as Record<string, unknown>) ?? getDefaultExplorationSettings();

      const updated = { ...currentExploration, ...input };

      await prisma.session.update({
        where: { id: sessionId },
        data: {
          settings: {
            ...currentSettings,
            exploration: updated,
          } as Prisma.InputJsonValue,
        },
      });

      return updated;
    },

    async initiateTransition(sessionId: string, userId: string, input: {
      targetMapId: string;
      tokenIds?: string[];
      spawnPoint?: { x: number; y: number };
      transitionEffect?: string;
      narrationText?: string;
    }) {
      await assertGmOrCoGm(sessionId, userId);

      // Verify target map exists and belongs to session
      const targetMap = await prisma.map.findFirst({
        where: { id: input.targetMapId, sessionId, deletedAt: null },
      });
      if (!targetMap) throw new ForbiddenError("Mapa destino não encontrado");

      // Activate target map
      await prisma.$transaction([
        prisma.map.updateMany({
          where: { sessionId, isActive: true },
          data: { isActive: false },
        }),
        prisma.map.update({
          where: { id: input.targetMapId },
          data: { isActive: true },
        }),
      ]);

      // If spawn point provided, move specified tokens
      if (input.spawnPoint && input.tokenIds) {
        for (const tokenId of input.tokenIds) {
          await prisma.token.update({
            where: { id: tokenId },
            data: { x: input.spawnPoint.x, y: input.spawnPoint.y },
          }).catch(() => {/* Token may not exist */});
        }
      }

      return {
        targetMapId: input.targetMapId,
        targetMapName: targetMap.name,
        transitionEffect: input.transitionEffect ?? "fade",
      };
    },

    async getSpawnPoints(mapId: string) {
      // Spawn points are tokens of type TELEPORT interactive objects
      const teleports = await prisma.interactiveObject.findMany({
        where: { mapId, interactionType: "TELEPORT", isActive: true },
        include: {
          // Get associated token position
        },
      });

      // Also get tokens with type OBJECT that are teleport markers
      const teleportTokens = await prisma.token.findMany({
        where: { mapId, type: "OBJECT", name: { contains: "spawn" } },
      });

      return [
        ...teleports.map((t) => ({
          id: t.id,
          type: "teleport" as const,
          tokenId: t.tokenId,
        })),
        ...teleportTokens.map((t) => ({
          id: t.id,
          type: "spawn_marker" as const,
          x: t.x,
          y: t.y,
          name: t.name,
        })),
      ];
    },
  };
}

function getDefaultExplorationSettings() {
  return {
    enabled: true,
    playerTokenControl: "free",
    showPathTrail: false,
    pathTrailDuration: 30,
    pathTrailColor: "#6C5CE740",
    autoRevealFog: false,
    revealMode: "gm_manual",
    exploredFogOpacity: 0.5,
    hiddenFogOpacity: 0.95,
    defaultVisionRadius: 12,
    visionRadiusUnit: "cells",
    sharedVision: true,
    allowDoorInteraction: true,
    doorInteractionRange: 1,
    allowObjectInteraction: true,
    objectInteractionRange: 1,
    cameraFollowToken: true,
    cameraFollowSmoothing: 0.1,
    allowFreeCamera: true,
    cameraBoundsRestrict: false,
    ambientSoundEnabled: false,
    footstepSoundEnabled: false,
    interactionSoundEnabled: false,
  };
}

export type ExplorationServiceType = ReturnType<typeof createExplorationService>;
