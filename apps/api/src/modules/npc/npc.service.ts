// ── Service de conversa com NPC (modo SCRIPTED) ──
//
// Branches são CRUD puro. Conversas têm fluxo:
//   open  → registra greeting (se houver) no log
//   message (player escolhe branch) → empilha trigger + response
//   gm-override → GM digita como NPC
//   finish → anexa farewell (se houver), marca isOpen=false, emite
//
// Modos AI/HYBRID dependem de backend Gemini (sprint futura — por
// agora só SCRIPTED é aceito via npc.controller).

import type {
  Conversation,
  ConversationMessage,
  PrismaClient,
} from "@questboard/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/app-error.js";
import {
  emitNpcConversationClosed,
  emitNpcConversationOpened,
  emitNpcMessage,
} from "../../lib/socket-events.js";
import type {
  ConversationGmOverrideInput,
  ConversationMessageInput,
  ConversationOpenInput,
  DialogueBranchCreate,
  DialogueBranchReorder,
  DialogueBranchUpdate,
} from "@questboard/validators";

export function createNpcService(prisma: PrismaClient) {
  return {
    // ── Branches ─────────────────────────────────────

    async listBranches(characterId: string) {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: { id: true },
      });
      if (!character) throw new NotFoundError("Character");
      return prisma.npcDialogueBranch.findMany({
        where: { characterId },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      });
    },

    async createBranch(
      characterId: string,
      userId: string,
      input: DialogueBranchCreate,
    ) {
      await assertNpcOwnership(prisma, characterId, userId);
      return prisma.npcDialogueBranch.create({
        data: { ...input, characterId },
      });
    },

    async updateBranch(
      characterId: string,
      branchId: string,
      userId: string,
      input: DialogueBranchUpdate,
    ) {
      await assertNpcOwnership(prisma, characterId, userId);
      const branch = await prisma.npcDialogueBranch.findUnique({
        where: { id: branchId },
        select: { characterId: true },
      });
      if (!branch || branch.characterId !== characterId) {
        throw new NotFoundError("DialogueBranch");
      }
      return prisma.npcDialogueBranch.update({
        where: { id: branchId },
        data: input,
      });
    },

    async deleteBranch(
      characterId: string,
      branchId: string,
      userId: string,
    ) {
      await assertNpcOwnership(prisma, characterId, userId);
      const branch = await prisma.npcDialogueBranch.findUnique({
        where: { id: branchId },
        select: { characterId: true },
      });
      if (!branch || branch.characterId !== characterId) {
        throw new NotFoundError("DialogueBranch");
      }
      await prisma.npcDialogueBranch.delete({ where: { id: branchId } });
    },

    async reorderBranches(
      characterId: string,
      userId: string,
      input: DialogueBranchReorder,
    ) {
      await assertNpcOwnership(prisma, characterId, userId);
      // Atualiza `order` em batch — posição igual ao índice na lista.
      await prisma.$transaction(
        input.ids.map((id, idx) =>
          prisma.npcDialogueBranch.updateMany({
            where: { id, characterId },
            data: { order: idx },
          }),
        ),
      );
    },

    // ── Conversas ────────────────────────────────────

    async openConversation(
      sessionId: string,
      userId: string,
      input: ConversationOpenInput,
    ): Promise<Conversation> {
      // No MVP só aceitamos SCRIPTED. AI/HYBRID precisam de plan
      // gating + Gemini configurado (Sprint 6 do prompt).
      if (input.mode !== "SCRIPTED") {
        throw new BadRequestError(
          "Modo AI/HYBRID ainda não disponível. Use SCRIPTED.",
        );
      }

      const npc = await prisma.character.findUnique({
        where: { id: input.npcId },
        select: { id: true, dialogueEnabled: true, dialogueGreeting: true },
      });
      if (!npc) throw new NotFoundError("Character");
      if (!npc.dialogueEnabled) {
        throw new BadRequestError(
          "Diálogo desabilitado para esse personagem. Habilite no editor.",
        );
      }

      const conversation = await prisma.conversation.create({
        data: {
          sessionId,
          npcId: npc.id,
          initiatorId: userId,
          mode: "SCRIPTED",
        },
      });

      // Se o NPC tem saudação cadastrada, registra como primeira fala.
      if (npc.dialogueGreeting) {
        await prisma.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            speaker: "NPC",
            text: npc.dialogueGreeting,
          },
        });
      }

      emitNpcConversationOpened({
        conversationId: conversation.id,
        sessionId,
        npcId: npc.id,
        mode: "SCRIPTED",
        initiatorId: userId,
        greeting: npc.dialogueGreeting,
        at: conversation.startedAt.toISOString(),
      });

      return conversation;
    },

    async getConversation(conversationId: string) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          npc: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              dialogueEnabled: true,
              dialogueGreeting: true,
              dialogueFarewell: true,
              dialogueNotes: true,
            },
          },
        },
      });
      if (!conversation) throw new NotFoundError("Conversation");
      return conversation;
    },

    async listConversations(sessionId: string) {
      return prisma.conversation.findMany({
        where: { sessionId },
        include: {
          npc: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { messages: true } },
        },
        orderBy: [{ isOpen: "desc" }, { startedAt: "desc" }],
      });
    },

    async sendMessage(
      conversationId: string,
      userId: string,
      input: ConversationMessageInput,
    ): Promise<{ playerMessage: ConversationMessage; npcMessage: ConversationMessage; finished: boolean }> {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true, sessionId: true, isOpen: true, mode: true, npcId: true },
      });
      if (!conversation) throw new NotFoundError("Conversation");
      if (!conversation.isOpen) {
        throw new BadRequestError("Conversa já encerrada.");
      }

      // Modo SCRIPTED: branchId é obrigatório.
      if (conversation.mode === "SCRIPTED") {
        if (!input.branchId) {
          throw new BadRequestError(
            "Modo SCRIPTED exige `branchId`. Modo AI ainda não suportado.",
          );
        }
        const branch = await prisma.npcDialogueBranch.findUnique({
          where: { id: input.branchId },
          select: {
            id: true,
            trigger: true,
            response: true,
            isFinal: true,
            characterId: true,
          },
        });
        if (!branch || branch.characterId !== conversation.npcId) {
          throw new NotFoundError("DialogueBranch");
        }

        const playerMessage = await prisma.conversationMessage.create({
          data: {
            conversationId,
            speaker: "PLAYER",
            text: branch.trigger,
            branchId: branch.id,
          },
        });

        const npcMessage = await prisma.conversationMessage.create({
          data: {
            conversationId,
            speaker: "NPC",
            text: branch.response,
            branchId: branch.id,
          },
        });

        if (conversation.sessionId) {
          emitNpcMessage({
            conversationId,
            sessionId: conversation.sessionId,
            message: {
              id: npcMessage.id,
              speaker: "NPC",
              text: npcMessage.text,
              branchId: branch.id,
              createdAt: npcMessage.createdAt.toISOString(),
            },
            finished: branch.isFinal,
          });
        }

        if (branch.isFinal) {
          await this.finishConversation(conversationId, userId, "finished");
        }

        return { playerMessage, npcMessage, finished: branch.isFinal };
      }

      throw new BadRequestError(
        "Modo AI/HYBRID ainda não disponível.",
      );
    },

    async gmOverride(
      conversationId: string,
      userId: string,
      input: ConversationGmOverrideInput,
    ): Promise<ConversationMessage> {
      // Permissão GM/CO_GM já validada no router via requireGm.
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true, sessionId: true, isOpen: true },
      });
      if (!conversation) throw new NotFoundError("Conversation");
      if (!conversation.isOpen) {
        throw new BadRequestError("Conversa já encerrada.");
      }

      const message = await prisma.conversationMessage.create({
        data: {
          conversationId,
          speaker: "GM_OVERRIDE",
          text: input.text,
        },
      });

      if (conversation.sessionId) {
        emitNpcMessage({
          conversationId,
          sessionId: conversation.sessionId,
          message: {
            id: message.id,
            speaker: "GM_OVERRIDE",
            text: message.text,
            createdAt: message.createdAt.toISOString(),
          },
          finished: false,
        });
      }

      void userId; // já validado pelo middleware; campo aceito pra log futuro
      return message;
    },

    async finishConversation(
      conversationId: string,
      _userId: string,
      reason: "finished" | "interrupted" = "finished",
    ): Promise<Conversation> {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          npc: { select: { dialogueFarewell: true } },
        },
      });
      if (!conversation) throw new NotFoundError("Conversation");
      if (!conversation.isOpen) return conversation;

      const updated = await prisma.conversation.update({
        where: { id: conversationId },
        data: { isOpen: false, endedAt: new Date() },
      });

      // Anexa farewell ao log se houver, antes de fechar.
      if (conversation.npc?.dialogueFarewell) {
        await prisma.conversationMessage.create({
          data: {
            conversationId,
            speaker: "NPC",
            text: conversation.npc.dialogueFarewell,
          },
        });
      }

      if (conversation.sessionId) {
        emitNpcConversationClosed({
          conversationId,
          sessionId: conversation.sessionId,
          reason,
          at: updated.endedAt!.toISOString(),
        });
      }

      return updated;
    },
  };
}

/** Helper: confirma que o user é dono do Character (NPC). */
async function assertNpcOwnership(
  prisma: PrismaClient,
  characterId: string,
  userId: string,
): Promise<void> {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { userId: true },
  });
  if (!character) throw new NotFoundError("Character");
  if (character.userId !== userId) {
    throw new ForbiddenError("Apenas o dono do NPC pode editar diálogo.");
  }
}

export type NpcService = ReturnType<typeof createNpcService>;
