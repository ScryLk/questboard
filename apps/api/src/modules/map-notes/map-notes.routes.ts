import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createMapNotesService } from "./map-notes.service.js";
import { createMapNoteSchema } from "@questboard/shared";
import { createSuccessResponse } from "@questboard/shared";

export async function mapNotesRoutes(app: FastifyInstance) {
  const service = createMapNotesService(prisma);

  async function getUserRole(sessionId: string, userId: string): Promise<string> {
    const sp = await prisma.sessionPlayer.findFirst({
      where: { sessionId, userId },
      select: { role: true },
    });
    return sp?.role ?? "PLAYER";
  }

  // ── List Map Notes ──

  app.get("/sessions/:sessionId/maps/:mapId/notes", async (request, reply) => {
    const { sessionId, mapId } = request.params as { sessionId: string; mapId: string };
    const role = await getUserRole(sessionId, request.user.id);
    const notes = await service.list(mapId, request.user.id, role);
    return reply.send(createSuccessResponse(notes));
  });

  // ── Create Map Note ──

  app.post("/sessions/:sessionId/maps/:mapId/notes", async (request, reply) => {
    const { sessionId, mapId } = request.params as { sessionId: string; mapId: string };
    const input = createMapNoteSchema.parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const note = await service.create(mapId, request.user.id, role, input);
    return reply.status(201).send(createSuccessResponse(note));
  });

  // ── Update Map Note ──

  app.patch("/sessions/:sessionId/maps/:mapId/notes/:noteId", async (request, reply) => {
    const { sessionId, noteId } = request.params as {
      sessionId: string; mapId: string; noteId: string;
    };
    const input = createMapNoteSchema.partial().parse(request.body);
    const role = await getUserRole(sessionId, request.user.id);
    const note = await service.update(noteId, request.user.id, role, input);
    return reply.send(createSuccessResponse(note));
  });

  // ── Delete Map Note ──

  app.delete("/sessions/:sessionId/maps/:mapId/notes/:noteId", async (request, reply) => {
    const { sessionId, noteId } = request.params as {
      sessionId: string; mapId: string; noteId: string;
    };
    const role = await getUserRole(sessionId, request.user.id);
    await service.delete(noteId, request.user.id, role);
    return reply.send(createSuccessResponse(null));
  });
}
