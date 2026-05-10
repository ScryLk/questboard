import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createBehaviorService } from "./behavior.service.js";
import { createBehaviorController } from "./behavior.controller.js";
import {
  requireAnyParticipant,
  requireGm,
} from "../../middleware/require-session-role.js";

type SessionParams = { Params: { id: string } };
type BehaviorParamsT = { Params: { bId: string } };

/** Helper: descobre sessionId via BehaviorInstance.id. */
async function lookupBehaviorSession(bId: string): Promise<string | null> {
  const inst = await prisma.behaviorInstance.findUnique({
    where: { id: bId },
    select: { sessionId: true },
  });
  return inst?.sessionId ?? null;
}

import {
  type SessionRole,
  resolveSessionRole,
} from "../../middleware/require-session-role.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/app-error.js";
import type { preHandlerAsyncHookHandler, FastifyRequest } from "fastify";

/** Inline middleware: resolve sessão via behavior id, exige role. */
function requireRoleViaBehavior(
  roles: SessionRole[],
): preHandlerAsyncHookHandler {
  return async function check(request: FastifyRequest) {
    const params = (request.params ?? {}) as Record<string, unknown>;
    const bId = params.bId;
    if (typeof bId !== "string") {
      throw new BadRequestError("Identificador da behavior ausente.");
    }
    const sessionId = await lookupBehaviorSession(bId);
    if (!sessionId) throw new NotFoundError("BehaviorInstance");
    const role = await resolveSessionRole(sessionId, request.user.id);
    if (role === null) throw new NotFoundError("BehaviorInstance");
    if (!roles.includes(role)) {
      throw new ForbiddenError(
        `Ação requer papel ${roles.join(" ou ")} (atual: ${role}).`,
      );
    }
    request.sessionRole = role;
    request.sessionId = sessionId;
  };
}

const requireGmViaBehavior = requireRoleViaBehavior(["GM", "CO_GM"]);
const requireAnyViaBehavior = requireRoleViaBehavior([
  "GM",
  "CO_GM",
  "PLAYER",
  "SPECTATOR",
]);

export async function behaviorRoutes(app: FastifyInstance) {
  const service = createBehaviorService(prisma);
  const controller = createBehaviorController(service);

  // ── Sessão ────────────────────────────────────────
  // Listar: qualquer participante (players veem o que está rodando).
  app.get<SessionParams>(
    "/sessions/:id/behaviors",
    { preHandler: requireAnyParticipant },
    controller.list,
  );
  // Iniciar: GM ou CO_GM.
  app.post<SessionParams>(
    "/sessions/:id/behaviors",
    { preHandler: requireGm },
    controller.start,
  );

  // ── Por behavior individual ──────────────────────
  app.get<BehaviorParamsT>(
    "/behaviors/:bId",
    { preHandler: requireAnyViaBehavior },
    controller.getById,
  );
  app.patch<BehaviorParamsT>(
    "/behaviors/:bId",
    { preHandler: requireGmViaBehavior },
    controller.update,
  );
  app.post<BehaviorParamsT>(
    "/behaviors/:bId/pause",
    { preHandler: requireGmViaBehavior },
    controller.pause,
  );
  app.post<BehaviorParamsT>(
    "/behaviors/:bId/resume",
    { preHandler: requireGmViaBehavior },
    controller.resume,
  );
  app.delete<BehaviorParamsT>(
    "/behaviors/:bId",
    { preHandler: requireGmViaBehavior },
    controller.delete,
  );
}
