import type { PrismaClient } from "@questboard/db";
import type { CreateTrackInput, SoundtrackQuery, UpdatePlaylistInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";

export function createSoundtrackService(prisma: PrismaClient) {
  return {
    // ── Track Library ──

    async listTracks(query: SoundtrackQuery) {
      const where: any = {};
      if (query.category) where.category = query.category;
      if (query.trackType) where.trackType = query.trackType;
      if (query.builtInOnly) where.isBuiltIn = true;
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: "insensitive" } },
          { tags: { hasSome: [query.search] } },
          { artist: { contains: query.search, mode: "insensitive" } },
        ];
      }

      const [tracks, total] = await Promise.all([
        prisma.soundtrackTrack.findMany({
          where,
          orderBy: [{ category: "asc" }, { name: "asc" }],
          take: query.limit ?? 50,
          skip: query.offset ?? 0,
        }),
        prisma.soundtrackTrack.count({ where }),
      ]);

      return {
        tracks: tracks.map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          tags: t.tags,
          audioUrl: t.audioUrl,
          duration: t.duration,
          fileSize: t.fileSize,
          format: t.format,
          trackType: t.trackType,
          isBuiltIn: t.isBuiltIn,
          uploadedById: t.uploadedById,
          coverUrl: t.coverUrl,
          artist: t.artist,
          license: t.license,
        })),
        total,
      };
    },

    async getTrackById(trackId: string) {
      const track = await prisma.soundtrackTrack.findUnique({ where: { id: trackId } });
      if (!track) throw new NotFoundError("Faixa de áudio");
      return {
        id: track.id,
        name: track.name,
        category: track.category,
        tags: track.tags,
        audioUrl: track.audioUrl,
        duration: track.duration,
        fileSize: track.fileSize,
        format: track.format,
        trackType: track.trackType,
        isBuiltIn: track.isBuiltIn,
        uploadedById: track.uploadedById,
        coverUrl: track.coverUrl,
        artist: track.artist,
        license: track.license,
      };
    },

    async createTrack(userId: string, input: CreateTrackInput) {
      const track = await prisma.soundtrackTrack.create({
        data: {
          name: input.name,
          category: input.category as any,
          tags: input.tags ?? [],
          audioUrl: input.audioUrl,
          duration: input.duration,
          fileSize: input.fileSize,
          format: input.format,
          trackType: (input.trackType ?? "MUSIC") as any,
          isBuiltIn: false,
          uploadedById: userId,
          coverUrl: input.coverUrl,
          artist: input.artist,
          license: input.license,
        },
      });

      return {
        id: track.id,
        name: track.name,
        category: track.category,
        tags: track.tags,
        audioUrl: track.audioUrl,
        duration: track.duration,
        fileSize: track.fileSize,
        format: track.format,
        trackType: track.trackType,
        isBuiltIn: track.isBuiltIn,
        uploadedById: track.uploadedById,
        coverUrl: track.coverUrl,
        artist: track.artist,
        license: track.license,
      };
    },

    async deleteTrack(trackId: string, userId: string) {
      const track = await prisma.soundtrackTrack.findUnique({ where: { id: trackId } });
      if (!track) throw new NotFoundError("Faixa de áudio");
      if (track.isBuiltIn) throw new ForbiddenError("Não é possível deletar faixas integradas");
      if (track.uploadedById !== userId) throw new ForbiddenError("Não é dono desta faixa");

      await prisma.soundtrackTrack.delete({ where: { id: trackId } });
    },

    // ── Session Soundtrack State ──

    async getSessionState(sessionId: string) {
      let state = await prisma.sessionSoundtrackState.findUnique({
        where: { sessionId },
      });

      if (!state) {
        state = await prisma.sessionSoundtrackState.create({
          data: { sessionId },
        });
      }

      let activeTrack = null;
      if (state.activeTrackId) {
        const track = await prisma.soundtrackTrack.findUnique({
          where: { id: state.activeTrackId },
        });
        if (track) {
          activeTrack = {
            id: track.id,
            name: track.name,
            category: track.category,
            tags: track.tags,
            audioUrl: track.audioUrl,
            duration: track.duration,
            fileSize: track.fileSize,
            format: track.format,
            trackType: track.trackType,
            isBuiltIn: track.isBuiltIn,
            uploadedById: track.uploadedById,
            coverUrl: track.coverUrl,
            artist: track.artist,
            license: track.license,
          };
        }
      }

      // Calculate current position for late joiners
      let position = state.position;
      if (state.isPlaying && activeTrack) {
        const elapsed = (Date.now() - state.updatedAt.getTime()) / 1000;
        position = state.position + elapsed;
        if (state.isLooping && activeTrack.duration > 0) {
          position = position % activeTrack.duration;
        }
      }

      return {
        activeTrackId: state.activeTrackId,
        activeTrack,
        isPlaying: state.isPlaying,
        volume: state.volume,
        position,
        isLooping: state.isLooping,
        playlist: state.playlist as Array<{ trackId: string; order: number }>,
        playlistMode: state.playlistMode,
        fadeInSeconds: state.fadeInSeconds,
        fadeOutSeconds: state.fadeOutSeconds,
        crossfade: state.crossfade,
      };
    },

    async play(sessionId: string, role: string, trackId: string, volume?: number, fadeIn?: number, isLooping?: boolean) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem controlar a trilha sonora");
      }

      const track = await prisma.soundtrackTrack.findUnique({ where: { id: trackId } });
      if (!track) throw new NotFoundError("Faixa de áudio");

      await prisma.sessionSoundtrackState.upsert({
        where: { sessionId },
        create: {
          sessionId,
          activeTrackId: trackId,
          isPlaying: true,
          volume: volume ?? 0.7,
          position: 0,
          isLooping: isLooping ?? true,
        },
        update: {
          activeTrackId: trackId,
          isPlaying: true,
          volume: volume ?? 0.7,
          position: 0,
          isLooping: isLooping ?? true,
        },
      });

      return {
        trackId: track.id,
        audioUrl: track.audioUrl,
        name: track.name,
        category: track.category,
        coverUrl: track.coverUrl,
        volume: volume ?? 0.7,
        fadeIn: fadeIn ?? 2,
        isLooping: isLooping ?? true,
        duration: track.duration,
      };
    },

    async stop(sessionId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem controlar a trilha sonora");
      }

      await prisma.sessionSoundtrackState.upsert({
        where: { sessionId },
        create: { sessionId, isPlaying: false },
        update: { isPlaying: false, position: 0 },
      });
    },

    async setVolume(sessionId: string, role: string, volume: number) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem controlar a trilha sonora");
      }

      await prisma.sessionSoundtrackState.upsert({
        where: { sessionId },
        create: { sessionId, volume },
        update: { volume },
      });
    },

    async seek(sessionId: string, role: string, position: number) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem controlar a trilha sonora");
      }

      await prisma.sessionSoundtrackState.upsert({
        where: { sessionId },
        create: { sessionId, position },
        update: { position },
      });
    },

    async updatePlaylist(sessionId: string, role: string, input: UpdatePlaylistInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem gerenciar a playlist");
      }

      await prisma.sessionSoundtrackState.upsert({
        where: { sessionId },
        create: {
          sessionId,
          playlist: input.playlist as any,
          playlistMode: input.playlistMode ?? "sequential",
          crossfade: input.crossfade ?? false,
          fadeInSeconds: input.fadeInSeconds ?? 2,
          fadeOutSeconds: input.fadeOutSeconds ?? 2,
        },
        update: {
          playlist: input.playlist as any,
          playlistMode: input.playlistMode ?? "sequential",
          crossfade: input.crossfade ?? false,
          fadeInSeconds: input.fadeInSeconds ?? 2,
          fadeOutSeconds: input.fadeOutSeconds ?? 2,
        },
      });
    },

    async nextTrack(sessionId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem controlar a trilha sonora");
      }

      const state = await prisma.sessionSoundtrackState.findUnique({
        where: { sessionId },
      });
      if (!state) throw new BadRequestError("Nenhuma trilha sonora configurada");

      const playlist = (state.playlist as Array<{ trackId: string; order: number }>) ?? [];
      if (playlist.length === 0) throw new BadRequestError("Playlist vazia");

      const currentIdx = playlist.findIndex((p) => p.trackId === state.activeTrackId);
      let nextIdx: number;

      if (state.playlistMode === "shuffle") {
        nextIdx = Math.floor(Math.random() * playlist.length);
      } else {
        nextIdx = currentIdx + 1 >= playlist.length ? 0 : currentIdx + 1;
      }

      const nextTrack = await prisma.soundtrackTrack.findUnique({
        where: { id: playlist[nextIdx]!.trackId },
      });
      if (!nextTrack) throw new NotFoundError("Próxima faixa");

      await prisma.sessionSoundtrackState.update({
        where: { sessionId },
        data: { activeTrackId: nextTrack.id, position: 0, isPlaying: true },
      });

      return {
        trackId: nextTrack.id,
        audioUrl: nextTrack.audioUrl,
        name: nextTrack.name,
        category: nextTrack.category,
        coverUrl: nextTrack.coverUrl,
        volume: state.volume,
        fadeIn: state.fadeInSeconds,
        isLooping: state.isLooping,
        duration: nextTrack.duration,
      };
    },

    async prevTrack(sessionId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem controlar a trilha sonora");
      }

      const state = await prisma.sessionSoundtrackState.findUnique({
        where: { sessionId },
      });
      if (!state) throw new BadRequestError("Nenhuma trilha sonora configurada");

      const playlist = (state.playlist as Array<{ trackId: string; order: number }>) ?? [];
      if (playlist.length === 0) throw new BadRequestError("Playlist vazia");

      const currentIdx = playlist.findIndex((p) => p.trackId === state.activeTrackId);
      const prevIdx = currentIdx - 1 < 0 ? playlist.length - 1 : currentIdx - 1;

      const prevTrackRecord = await prisma.soundtrackTrack.findUnique({
        where: { id: playlist[prevIdx]!.trackId },
      });
      if (!prevTrackRecord) throw new NotFoundError("Faixa anterior");

      await prisma.sessionSoundtrackState.update({
        where: { sessionId },
        data: { activeTrackId: prevTrackRecord.id, position: 0, isPlaying: true },
      });

      return {
        trackId: prevTrackRecord.id,
        audioUrl: prevTrackRecord.audioUrl,
        name: prevTrackRecord.name,
        category: prevTrackRecord.category,
        coverUrl: prevTrackRecord.coverUrl,
        volume: state.volume,
        fadeIn: state.fadeInSeconds,
        isLooping: state.isLooping,
        duration: prevTrackRecord.duration,
      };
    },
  };
}
