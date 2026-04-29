import type { FastifyInstance } from "fastify";
import { prisma } from "@questboard/db";
import { createNpcService } from "./npc.service.js";
import { createNpcController } from "./npc.controller.js";
import {
  requireAnyParticipant,
  requireConversationGm,
} from "../../middleware/require-session-role.js";

type CharacterParams = { Params: { id: string } };
type CharacterBranchParams = { Params: { id: string; branchId: string } };
type SessionParams = { Params: { id: string } };
type ConversationParams = { Params: { cId: string } };

export async function npcRoutes(app: FastifyInstance) {
  const service = createNpcService(prisma);
  const controller = createNpcController(service);

  // ── Branches do NPC ──────────────────────────────
  // Permissão é por ownership do Character (validada no service).
  // Não exige role na sessão porque é gerenciado fora de sessão também.
  app.get<CharacterParams>(
    "/characters/:id/dialogue-branches",
    controller.listBranches,
  );
  app.post<CharacterParams>(
    "/characters/:id/dialogue-branches",
    controller.createBranch,
  );
  app.patch<CharacterBranchParams>(
    "/characters/:id/dialogue-branches/:branchId",
    controller.updateBranch,
  );
  app.delete<CharacterBranchParams>(
    "/characters/:id/dialogue-branches/:branchId",
    controller.deleteBranch,
  );
  app.patch<CharacterParams>(
    "/characters/:id/dialogue-branches/reorder",
    controller.reorderBranches,
  );

  // ── Conversas escopadas em sessão ────────────────
  // Listagem e abertura: qualquer participante (Player precisa
  // pra abrir conversa quando clica "Conversar" no NPC).
  app.get<SessionParams>(
    "/sessions/:id/conversations",
    { preHandler: requireAnyParticipant },
    controller.listConversations,
  );
  app.post<SessionParams>(
    "/sessions/:id/conversations",
    { preHandler: requireAnyParticipant },
    controller.openConversation,
  );

  // Operações por conversa — requireRole rodaria via lookup do
  // sessionId associado, mas como Conversation guarda sessionId
  // próprio, fazemos check no service. Por ora deixamos sem o
  // middleware de sessão (futura sprint adiciona resolveSessionFromConversation).
  app.get<ConversationParams>(
    "/conversations/:cId",
    controller.getConversation,
  );
  app.post<ConversationParams>(
    "/conversations/:cId/messages",
    controller.sendMessage,
  );
  // gm-override exige GM/CO_GM da sessão linkada à conversa.
  // Middleware resolve sessionId via Conversation.sessionId.
  app.post<ConversationParams>(
    "/conversations/:cId/gm-override",
    { preHandler: requireConversationGm },
    controller.gmOverride,
  );
  app.patch<ConversationParams>(
    "/conversations/:cId/finish",
    controller.finishConversation,
  );
}
