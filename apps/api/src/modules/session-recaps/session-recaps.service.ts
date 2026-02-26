import type { PrismaClient } from "@questboard/db";
import type { CreateRecapInput, UpdateRecapInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createSessionRecapsService(prisma: PrismaClient) {
  return {
    async create(sessionId: string, userId: string, role: string, input: CreateRecapInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem criar recaps");
      }

      const recap = await prisma.sessionRecap.create({
        data: {
          sessionId,
          content: input.content,
          sessionNumber: input.sessionNumber,
          aiGenerated: false,
          createdById: userId,
        },
      });

      return this.format(recap);
    },

    async generateAi(sessionId: string, userId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem gerar recaps via IA");
      }

      // Gather source data: recent chat messages, quest changes
      const [recentMessages, quests, sessionInfo] = await Promise.all([
        prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: "desc" },
          take: 100,
          select: { content: true, senderName: true, channel: true, createdAt: true },
        }),
        prisma.quest.findMany({
          where: { sessionId },
          select: { name: true, status: true, objectives: true },
        }),
        prisma.session.findUnique({
          where: { id: sessionId },
          select: { name: true, sessionNumber: true },
        }),
      ]);

      const sourceData = {
        sessionName: sessionInfo?.name,
        messageCount: recentMessages.length,
        questSummaries: quests.map((q) => ({
          name: q.name,
          status: q.status,
          objectiveCount: (q.objectives as any[])?.length ?? 0,
        })),
        generatedAt: new Date().toISOString(),
      };

      // In production: call an AI API to generate the recap from sourceData
      const recap = await prisma.sessionRecap.create({
        data: {
          sessionId,
          content: `[AI recap placeholder] Session had ${recentMessages.length} messages and ${quests.length} quests.`,
          sessionNumber: sessionInfo?.sessionNumber ?? 0,
          aiGenerated: true,
          sourceData: sourceData as any,
          createdById: userId,
        },
      });

      return this.format(recap);
    },

    async list(sessionId: string) {
      const recaps = await prisma.sessionRecap.findMany({
        where: { sessionId },
        orderBy: { sessionNumber: "desc" },
      });
      return recaps.map(this.format);
    },

    async getById(sessionId: string, recapId: string) {
      const recap = await prisma.sessionRecap.findFirst({
        where: { id: recapId, sessionId },
      });
      if (!recap) throw new NotFoundError("Session recap");
      return this.format(recap);
    },

    async update(sessionId: string, recapId: string, role: string, input: UpdateRecapInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem editar recaps");
      }

      const recap = await prisma.sessionRecap.findFirst({
        where: { id: recapId, sessionId },
      });
      if (!recap) throw new NotFoundError("Session recap");

      const data: any = {};
      if (input.content !== undefined) data.content = input.content;

      const updated = await prisma.sessionRecap.update({
        where: { id: recapId },
        data,
      });

      return this.format(updated);
    },

    async delete(sessionId: string, recapId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem deletar recaps");
      }
      const recap = await prisma.sessionRecap.findFirst({
        where: { id: recapId, sessionId },
      });
      if (!recap) throw new NotFoundError("Session recap");
      await prisma.sessionRecap.delete({ where: { id: recapId } });
    },

    format(recap: any) {
      return {
        id: recap.id,
        sessionId: recap.sessionId,
        content: recap.content,
        sessionNumber: recap.sessionNumber,
        aiGenerated: recap.aiGenerated,
        createdById: recap.createdById,
        createdAt: recap.createdAt.toISOString(),
        updatedAt: recap.updatedAt.toISOString(),
      };
    },
  };
}
