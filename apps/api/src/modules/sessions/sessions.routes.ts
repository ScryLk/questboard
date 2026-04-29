import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createSessionsService } from "./sessions.service.js";
import { createSessionsController } from "./sessions.controller.js";
import {
  requireGmOwner,
  requireGm,
  requireAnyParticipant,
} from "../../middleware/require-session-role.js";

type SessionParams = { Params: { id: string } };
type SessionUserParams = { Params: { id: string; userId: string } };

export async function sessionsRoutes(app: FastifyInstance) {
  const service = createSessionsService(prisma);
  const controller = createSessionsController(service);

  app.get("/sessions", controller.list);
  app.post("/sessions", controller.create);
  app.get("/sessions/public", controller.listPublic);
  app.get("/sessions/by-code/:code", controller.findByCode);

  // Visualização — qualquer participante (incluindo SPECTATOR).
  app.get<SessionParams>(
    "/sessions/:id",
    { preHandler: requireAnyParticipant },
    controller.getById,
  );

  // Mutação simples — apenas GM titular (não CO_GM).
  app.patch<SessionParams>(
    "/sessions/:id",
    { preHandler: requireGmOwner },
    controller.update,
  );
  app.delete<SessionParams>(
    "/sessions/:id",
    { preHandler: requireGmOwner },
    controller.delete,
  );

  // Join não passa pelo middleware (usuário ainda não tem role).
  // Leave qualquer participante (não-GM titular) pode chamar.
  app.post("/sessions/:id/join", controller.join);
  app.post<SessionParams>(
    "/sessions/:id/leave",
    { preHandler: requireAnyParticipant },
    controller.leave,
  );

  // ─── State transitions — apenas GM titular ────────
  app.post<SessionParams>(
    "/sessions/:id/start",
    { preHandler: requireGmOwner },
    controller.start,
  );
  app.post<SessionParams>(
    "/sessions/:id/end",
    { preHandler: requireGmOwner },
    controller.end,
  );
  app.post<SessionParams>(
    "/sessions/:id/pause",
    { preHandler: requireGmOwner },
    controller.pause,
  );
  app.post<SessionParams>(
    "/sessions/:id/resume",
    { preHandler: requireGmOwner },
    controller.resume,
  );

  // ─── Players ─────────────────────────────────────
  app.get<SessionParams>(
    "/sessions/:id/players",
    { preHandler: requireAnyParticipant },
    controller.listPlayers,
  );
  app.post<SessionUserParams>(
    "/sessions/:id/kick/:userId",
    { preHandler: requireGm },
    controller.kick,
  );
  app.patch<SessionUserParams>(
    "/sessions/:id/players/:userId/role",
    { preHandler: requireGmOwner },
    controller.updatePlayerRole,
  );

  // ─── Audit log & phases ──────────────────────────
  app.get<SessionParams>(
    "/sessions/:id/audit-log",
    { preHandler: requireGm },
    controller.getAuditLog,
  );
  app.get<SessionParams>(
    "/sessions/:id/phases",
    { preHandler: requireAnyParticipant },
    controller.listPhases,
  );
  app.post<SessionParams>(
    "/sessions/:id/phases",
    { preHandler: requireGm },
    controller.createPhase,
  );
}
