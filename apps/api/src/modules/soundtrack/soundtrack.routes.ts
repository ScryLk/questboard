import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSoundtrackService } from "./soundtrack.service.js";
import {
  soundtrackQuerySchema,
  createTrackSchema,
  playTrackSchema,
  updatePlaylistSchema,
} from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function soundtrackRoutes(app: FastifyInstance) {
  const service = createSoundtrackService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── Track Library ──

  app.get("/soundtrack/tracks", async (request, reply) => {
    const query = soundtrackQuerySchema.parse(request.query);
    const result = await service.listTracks(query);
    return reply.send(createSuccessResponse(result));
  });

  app.get("/soundtrack/tracks/:trackId", async (request, reply) => {
    const { trackId } = request.params as { trackId: string };
    const track = await service.getTrackById(trackId);
    return reply.send(createSuccessResponse(track));
  });

  app.post("/soundtrack/tracks", async (request, reply) => {
    const input = createTrackSchema.parse(request.body);
    const track = await service.createTrack(request.user.id, input);
    return reply.status(201).send(createSuccessResponse(track));
  });

  app.delete("/soundtrack/tracks/:trackId", async (request, reply) => {
    const { trackId } = request.params as { trackId: string };
    await service.deleteTrack(trackId, request.user.id);
    return reply.send(createSuccessResponse(null));
  });

  // ── Session Soundtrack State ──

  app.get("/sessions/:sessionId/soundtrack", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const state = await service.getSessionState(sessionId);
    return reply.send(createSuccessResponse(state));
  });

  // ── Playback Controls ──

  app.post("/sessions/:sessionId/soundtrack/play", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = playTrackSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const result = await service.play(sessionId, role, input.trackId, input.volume, input.fadeIn, input.isLooping);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:sessionId/soundtrack/stop", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const role = await getUserRole(sessionId, request.user.id);
    await service.stop(sessionId, role);
    return reply.send(createSuccessResponse(null));
  });

  app.post("/sessions/:sessionId/soundtrack/volume", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const body = request.body as { volume: number };
    const role = await getUserRole(sessionId, request.user.id);
    await service.setVolume(sessionId, role, body.volume);
    return reply.send(createSuccessResponse(null));
  });

  app.post("/sessions/:sessionId/soundtrack/seek", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const body = request.body as { position: number };
    const role = await getUserRole(sessionId, request.user.id);
    await service.seek(sessionId, role, body.position);
    return reply.send(createSuccessResponse(null));
  });

  // ── Playlist ──

  app.put("/sessions/:sessionId/soundtrack/playlist", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const input = updatePlaylistSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    await service.updatePlaylist(sessionId, role, input);
    return reply.send(createSuccessResponse(null));
  });

  app.post("/sessions/:sessionId/soundtrack/next", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const result = await service.nextTrack(sessionId, role);
    return reply.send(createSuccessResponse(result));
  });

  app.post("/sessions/:sessionId/soundtrack/prev", async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const result = await service.prevTrack(sessionId, role);
    return reply.send(createSuccessResponse(result));
  });
}
