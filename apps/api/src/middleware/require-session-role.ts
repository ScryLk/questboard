// ── Middleware: papel do usuário na sessão ─────────────────────
//
// Centraliza o `if (session.ownerId !== userId)` que vivia espalhado
// em service handlers. Resolve o role do user na sessão (`GM` /
// `CO_GM` / `PLAYER` / `SPECTATOR`) e bloqueia se não estiver na
// lista permitida. Anexa `request.sessionRole` pra handlers que
// precisem do role pra ramificar lógica.
//
// Lê `sessionId` na seguinte ordem: params.id, params.sessionId,
// body.sessionId, query.sessionId.

import type {
  FastifyRequest,
  FastifyReply,
  preHandlerAsyncHookHandler,
} from "fastify";
import { prisma } from "@questboard/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error.js";

export type SessionRole = "GM" | "CO_GM" | "PLAYER" | "SPECTATOR";

declare module "fastify" {
  interface FastifyRequest {
    /** Papel do usuário autenticado na sessão alvo, resolvido pelo
     *  middleware `requireSessionRole`. Não disponível antes do
     *  middleware rodar. */
    sessionRole?: SessionRole;
    sessionId?: string;
  }
}

function extractSessionId(request: FastifyRequest): string | undefined {
  const params = (request.params ?? {}) as Record<string, unknown>;
  if (typeof params.id === "string") return params.id;
  if (typeof params.sessionId === "string") return params.sessionId;
  const body = (request.body ?? {}) as Record<string, unknown>;
  if (typeof body.sessionId === "string") return body.sessionId;
  const query = (request.query ?? {}) as Record<string, unknown>;
  if (typeof query.sessionId === "string") return query.sessionId;
  return undefined;
}

/** Resolve o role do user dentro da sessão. Retorna null quando o user
 *  não pertence à sessão (nem é dono, nem aparece em SessionPlayer). */
export async function resolveSessionRole(
  sessionId: string,
  userId: string,
): Promise<SessionRole | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { ownerId: true, gmId: true },
  });
  if (!session) return null;
  // GM titular sempre prevalece.
  if (session.ownerId === userId || session.gmId === userId) return "GM";

  const player = await prisma.sessionPlayer.findFirst({
    where: { sessionId, userId, leftAt: null },
    select: { role: true },
  });
  return (player?.role as SessionRole | undefined) ?? null;
}

/** Cria um preHandler Fastify que exige um dos `roles` para a sessão
 *  identificada no request. Throws `ForbiddenError` (403) quando o
 *  user tem role diferente, e `NotFoundError` (404) quando a sessão
 *  não existe. */
export function requireSessionRole(roles: SessionRole[]): preHandlerAsyncHookHandler {
  if (roles.length === 0) {
    throw new Error("requireSessionRole: lista de roles não pode ser vazia");
  }
  return async function checkSessionRole(
    request: FastifyRequest,
    _reply: FastifyReply,
  ) {
    const sessionId = extractSessionId(request);
    if (!sessionId) {
      throw new BadRequestError(
        "Identificador da sessão ausente na requisição.",
      );
    }
    const role = await resolveSessionRole(sessionId, request.user.id);
    if (role === null) {
      // Não é dono nem player → tratamos como sessão inacessível
      // (404 evita enumeração de IDs por outsiders).
      throw new NotFoundError("Sessão");
    }
    if (!roles.includes(role)) {
      throw new ForbiddenError(
        `Ação requer papel ${roles.join(" ou ")} na sessão (atual: ${role}).`,
      );
    }
    request.sessionRole = role;
    request.sessionId = sessionId;
  };
}

/** Atalho: requer GM ou CO_GM. Cobre 90% dos handlers de mutação. */
export const requireGm = requireSessionRole(["GM", "CO_GM"]);

/** Atalho: requer apenas o GM titular (operações destrutivas como
 *  end/delete/transfer-ownership). */
export const requireGmOwner = requireSessionRole(["GM"]);

/** Atalho: qualquer participante ativo da sessão (inclui spectator). */
export const requireAnyParticipant = requireSessionRole([
  "GM",
  "CO_GM",
  "PLAYER",
  "SPECTATOR",
]);

/** Cria um preHandler que resolve a sessão a partir de `params.cId`
 *  (id de Conversation) e exige um dos `roles`. Usado por endpoints
 *  /conversations/:cId/* onde a sessão é indireta. Quando a conversa
 *  não tem sessão linkada, deixa passar (conversa avulsa do GM). */
export function requireRoleViaConversation(
  roles: SessionRole[],
): preHandlerAsyncHookHandler {
  if (roles.length === 0) {
    throw new Error(
      "requireRoleViaConversation: lista de roles não pode ser vazia",
    );
  }
  return async function checkConversationRole(
    request: FastifyRequest,
    _reply: FastifyReply,
  ) {
    const params = (request.params ?? {}) as Record<string, unknown>;
    const conversationId = typeof params.cId === "string" ? params.cId : null;
    if (!conversationId) {
      throw new BadRequestError(
        "Identificador da conversa ausente na requisição.",
      );
    }
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { sessionId: true },
    });
    if (!conversation) throw new NotFoundError("Conversation");

    // Conversa sem sessão (NPC standalone do GM) — só dono do NPC
    // pode mexer; service valida ownership. Middleware passa.
    if (!conversation.sessionId) return;

    const role = await resolveSessionRole(conversation.sessionId, request.user.id);
    if (role === null) {
      throw new NotFoundError("Conversation");
    }
    if (!roles.includes(role)) {
      throw new ForbiddenError(
        `Ação requer papel ${roles.join(" ou ")} na sessão (atual: ${role}).`,
      );
    }
    request.sessionRole = role;
    request.sessionId = conversation.sessionId;
  };
}

/** Atalho: GM ou CO_GM da sessão linkada à conversa. */
export const requireConversationGm = requireRoleViaConversation([
  "GM",
  "CO_GM",
]);
