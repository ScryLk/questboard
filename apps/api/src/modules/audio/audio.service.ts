import type { PrismaClient, Prisma } from "@questboard/db";
import type { ListAudioTracksQuery } from "@questboard/validators";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createAudioService(prisma: PrismaClient) {
  async function assertGM(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
    if (!session) throw new NotFoundError("Session");
    if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode controlar áudio");
  }

  return {
    async listTracks(userId: string, query: ListAudioTracksQuery) {
      const { channel, tags, search, scope, cursor, limit } = query;

      const scopeWhere: Prisma.AudioTrackWhereInput =
        scope === "official"
          ? { isOfficial: true }
          : scope === "mine"
            ? { ownerId: userId }
            : { OR: [{ isOfficial: true }, { ownerId: userId }] };

      const where: Prisma.AudioTrackWhereInput = {
        ...scopeWhere,
        ...(channel ? { channel } : {}),
        ...(tags && tags.length > 0 ? { tags: { hasEvery: tags } } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      };

      const tracks = await prisma.audioTrack.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      const hasMore = tracks.length > limit;
      if (hasMore) tracks.pop();
      const last = tracks.at(-1);

      return {
        items: tracks,
        nextCursor: hasMore && last ? last.id : null,
      };
    },

    async getState(sessionId: string) {
      return prisma.sessionAudio.findUnique({ where: { sessionId } });
    },

    async play(sessionId: string, userId: string, track: Record<string, unknown>, volume?: number) {
      await assertGM(sessionId, userId);

      return prisma.sessionAudio.upsert({
        where: { sessionId },
        create: { sessionId, isPlaying: true, currentTrack: track, volume: volume ?? 0.7 },
        update: { isPlaying: true, currentTrack: track, volume: volume ?? undefined },
      });
    },

    async stop(sessionId: string, userId: string) {
      await assertGM(sessionId, userId);

      return prisma.sessionAudio.upsert({
        where: { sessionId },
        create: { sessionId, isPlaying: false },
        update: { isPlaying: false },
      });
    },

    async setVolume(sessionId: string, userId: string, volume: number) {
      await assertGM(sessionId, userId);

      return prisma.sessionAudio.upsert({
        where: { sessionId },
        create: { sessionId, volume },
        update: { volume },
      });
    },

    async getLibrary() {
      return prisma.audioTrack.findMany({
        where: { isBuiltin: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      });
    },
  };
}

export type AudioService = ReturnType<typeof createAudioService>;
