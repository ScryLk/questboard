import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerSoundtrackHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  // ── Play Track ──

  socket.on("soundtrack:play", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem controlar a trilha sonora" } });
    }

    try {
      const track = await prisma.soundtrackTrack.findUnique({ where: { id: data.trackId } });
      if (!track) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Faixa não encontrada" } });
      }

      const volume = data.volume ?? 0.7;
      const fadeIn = data.fadeIn ?? 2;

      await prisma.sessionSoundtrackState.upsert({
        where: { sessionId: socket.ctx.sessionId },
        create: {
          sessionId: socket.ctx.sessionId,
          activeTrackId: track.id,
          isPlaying: true,
          volume,
          position: 0,
          isLooping: true,
        },
        update: {
          activeTrackId: track.id,
          isPlaying: true,
          volume,
          position: 0,
        },
      });

      io.to(socket.ctx.sessionId).emit("audio:soundtrack-play", {
        trackId: track.id,
        audioUrl: track.audioUrl,
        name: track.name,
        category: track.category,
        coverUrl: track.coverUrl ?? undefined,
        volume,
        fadeIn,
        isLooping: true,
        duration: track.duration,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao reproduzir faixa" } });
    }
  });

  // ── Stop Playback ──

  socket.on("soundtrack:stop", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem controlar a trilha sonora" } });
    }

    try {
      await prisma.sessionSoundtrackState.upsert({
        where: { sessionId: socket.ctx.sessionId },
        create: { sessionId: socket.ctx.sessionId, isPlaying: false },
        update: { isPlaying: false, position: 0 },
      });

      io.to(socket.ctx.sessionId).emit("audio:soundtrack-stop", {
        fadeOut: data.fadeOut ?? 2,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao parar trilha" } });
    }
  });

  // ── Volume ──

  socket.on("soundtrack:volume", (data) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) return;

    prisma.sessionSoundtrackState.upsert({
      where: { sessionId: socket.ctx.sessionId },
      create: { sessionId: socket.ctx.sessionId, volume: data.volume },
      update: { volume: data.volume },
    }).catch(() => {});

    io.to(socket.ctx.sessionId).emit("audio:soundtrack-volume", {
      volume: data.volume,
    });
  });

  // ── Seek ──

  socket.on("soundtrack:seek", (data) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) return;

    prisma.sessionSoundtrackState.upsert({
      where: { sessionId: socket.ctx.sessionId },
      create: { sessionId: socket.ctx.sessionId, position: data.position },
      update: { position: data.position },
    }).catch(() => {});

    // Broadcast sync to all players
    prisma.sessionSoundtrackState.findUnique({
      where: { sessionId: socket.ctx.sessionId },
    }).then(async (state) => {
      if (!state || !state.activeTrackId || !socket.ctx.sessionId) return;
      const track = await prisma.soundtrackTrack.findUnique({ where: { id: state.activeTrackId } });
      if (!track) return;

      io.to(socket.ctx.sessionId).emit("audio:soundtrack-sync", {
        trackId: track.id,
        audioUrl: track.audioUrl,
        name: track.name,
        volume: state.volume,
        position: data.position,
        isLooping: state.isLooping,
        isPlaying: state.isPlaying,
      });
    }).catch(() => {});
  });

  // ── Next Track ──

  socket.on("soundtrack:next-track", async (ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem controlar a trilha sonora" } });
    }

    try {
      const state = await prisma.sessionSoundtrackState.findUnique({
        where: { sessionId: socket.ctx.sessionId },
      });
      if (!state) return ack({ success: false, error: { code: "NOT_FOUND", message: "Nenhuma trilha configurada" } });

      const playlist = (state.playlist as Array<{ trackId: string; order: number }>) ?? [];
      if (playlist.length === 0) return ack({ success: false, error: { code: "EMPTY", message: "Playlist vazia" } });

      const currentIdx = playlist.findIndex((p) => p.trackId === state.activeTrackId);
      const nextIdx = currentIdx + 1 >= playlist.length ? 0 : currentIdx + 1;
      const nextTrack = await prisma.soundtrackTrack.findUnique({
        where: { id: playlist[nextIdx]!.trackId },
      });
      if (!nextTrack) return ack({ success: false, error: { code: "NOT_FOUND", message: "Faixa não encontrada" } });

      await prisma.sessionSoundtrackState.update({
        where: { sessionId: socket.ctx.sessionId },
        data: { activeTrackId: nextTrack.id, position: 0, isPlaying: true },
      });

      io.to(socket.ctx.sessionId).emit("audio:soundtrack-play", {
        trackId: nextTrack.id,
        audioUrl: nextTrack.audioUrl,
        name: nextTrack.name,
        category: nextTrack.category,
        coverUrl: nextTrack.coverUrl ?? undefined,
        volume: state.volume,
        fadeIn: state.fadeInSeconds,
        isLooping: state.isLooping,
        duration: nextTrack.duration,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao avançar faixa" } });
    }
  });

  // ── Previous Track ──

  socket.on("soundtrack:prev-track", async (ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem controlar a trilha sonora" } });
    }

    try {
      const state = await prisma.sessionSoundtrackState.findUnique({
        where: { sessionId: socket.ctx.sessionId },
      });
      if (!state) return ack({ success: false, error: { code: "NOT_FOUND", message: "Nenhuma trilha configurada" } });

      const playlist = (state.playlist as Array<{ trackId: string; order: number }>) ?? [];
      if (playlist.length === 0) return ack({ success: false, error: { code: "EMPTY", message: "Playlist vazia" } });

      const currentIdx = playlist.findIndex((p) => p.trackId === state.activeTrackId);
      const prevIdx = currentIdx - 1 < 0 ? playlist.length - 1 : currentIdx - 1;
      const prevTrack = await prisma.soundtrackTrack.findUnique({
        where: { id: playlist[prevIdx]!.trackId },
      });
      if (!prevTrack) return ack({ success: false, error: { code: "NOT_FOUND", message: "Faixa não encontrada" } });

      await prisma.sessionSoundtrackState.update({
        where: { sessionId: socket.ctx.sessionId },
        data: { activeTrackId: prevTrack.id, position: 0, isPlaying: true },
      });

      io.to(socket.ctx.sessionId).emit("audio:soundtrack-play", {
        trackId: prevTrack.id,
        audioUrl: prevTrack.audioUrl,
        name: prevTrack.name,
        category: prevTrack.category,
        coverUrl: prevTrack.coverUrl ?? undefined,
        volume: state.volume,
        fadeIn: state.fadeInSeconds,
        isLooping: state.isLooping,
        duration: prevTrack.duration,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao voltar faixa" } });
    }
  });
}
