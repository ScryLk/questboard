import type { PrismaClient } from "@questboard/db";
import type { CreateQuestInput, UpdateQuestInput, QuestQuery } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createQuestsService(prisma: PrismaClient) {
  return {
    async create(sessionId: string, userId: string, role: string, input: CreateQuestInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem criar quests");
      }

      const quest = await prisma.quest.create({
        data: {
          sessionId,
          name: input.name,
          description: input.description,
          questType: input.questType as any,
          status: "ACTIVE",
          objectives: (input.objectives ?? []) as any,
          rewards: (input.rewards ?? {}) as any,
          isSecret: input.isSecret ?? false,
          visibleTo: input.visibleTo ?? [],
          sortOrder: input.sortOrder ?? 0,
          isPinned: input.isPinned ?? false,
          createdById: userId,
        },
      });

      return this.format(quest, userId, role);
    },

    async getById(sessionId: string, questId: string, userId: string, role: string) {
      const quest = await prisma.quest.findFirst({
        where: { id: questId, sessionId },
      });
      if (!quest) throw new NotFoundError("Quest");

      const isGm = ["GM", "CO_GM"].includes(role);
      if (!isGm && quest.isSecret) {
        if (quest.visibleTo.length > 0 && !quest.visibleTo.includes(userId)) {
          throw new NotFoundError("Quest");
        }
      }

      return this.format(quest, userId, role);
    },

    async list(sessionId: string, userId: string, role: string, query: QuestQuery) {
      const isGm = ["GM", "CO_GM"].includes(role);
      const where: any = { sessionId };

      if (query.status) where.status = query.status;
      if (query.type) where.questType = query.type;

      const quests = await prisma.quest.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: query.limit ?? 50,
        skip: query.offset ?? 0,
      });

      // Filter visibility for players
      const visible = isGm
        ? quests
        : quests.filter((q) => {
            if (q.isSecret && q.visibleTo.length > 0 && !q.visibleTo.includes(userId)) {
              return false;
            }
            return !q.isSecret || q.visibleTo.includes(userId);
          });

      return visible.map((q) => this.format(q, userId, role));
    },

    async update(sessionId: string, questId: string, userId: string, role: string, input: UpdateQuestInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem editar quests");
      }

      const quest = await prisma.quest.findFirst({
        where: { id: questId, sessionId },
      });
      if (!quest) throw new NotFoundError("Quest");

      const data: any = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.status !== undefined) {
        data.status = input.status;
        if (input.status === "COMPLETED") data.completedAt = new Date();
      }
      if (input.objectives !== undefined) data.objectives = input.objectives;
      if (input.rewards !== undefined) data.rewards = input.rewards;
      if (input.isSecret !== undefined) data.isSecret = input.isSecret;
      if (input.visibleTo !== undefined) data.visibleTo = input.visibleTo;
      if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
      if (input.isPinned !== undefined) data.isPinned = input.isPinned;

      const updated = await prisma.quest.update({
        where: { id: questId },
        data,
      });

      return this.format(updated, userId, role);
    },

    async updateObjective(
      sessionId: string,
      questId: string,
      objectiveId: string,
      completed: boolean,
      role: string
    ) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem atualizar objetivos");
      }

      const quest = await prisma.quest.findFirst({
        where: { id: questId, sessionId },
      });
      if (!quest) throw new NotFoundError("Quest");

      const objectives = (quest.objectives as any[]) ?? [];
      const idx = objectives.findIndex((o: any) => o.id === objectiveId);
      if (idx === -1) throw new NotFoundError("Objetivo da quest");

      objectives[idx].completed = completed;
      objectives[idx].completedAt = completed ? new Date().toISOString() : null;

      // Check if all objectives completed
      const allDone = objectives.every((o: any) => o.optional || o.completed);
      const data: any = { objectives };
      if (allDone && quest.status === "ACTIVE") {
        data.status = "COMPLETED";
        data.completedAt = new Date();
      }

      const updated = await prisma.quest.update({
        where: { id: questId },
        data,
      });

      return { quest: this.format(updated, "", "GM"), objectiveId, completed, allComplete: allDone };
    },

    async delete(sessionId: string, questId: string, role: string) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem deletar quests");
      }
      const quest = await prisma.quest.findFirst({
        where: { id: questId, sessionId },
      });
      if (!quest) throw new NotFoundError("Quest");
      await prisma.quest.delete({ where: { id: questId } });
    },

    format(quest: any, _userId: string, role: string) {
      const isGm = ["GM", "CO_GM"].includes(role);
      const objectives = (quest.objectives as any[]) ?? [];

      return {
        id: quest.id,
        sessionId: quest.sessionId,
        name: quest.name,
        description: quest.description,
        questType: quest.questType,
        status: quest.status,
        objectives: isGm
          ? objectives
          : objectives.filter((o: any) => !o.hiddenFromPlayers),
        rewards: isGm ? quest.rewards : (quest.status === "COMPLETED" ? quest.rewards : {}),
        isSecret: isGm ? quest.isSecret : undefined,
        visibleTo: isGm ? quest.visibleTo : undefined,
        sortOrder: quest.sortOrder,
        isPinned: quest.isPinned,
        completedAt: quest.completedAt?.toISOString() ?? null,
        createdById: quest.createdById,
        createdAt: quest.createdAt.toISOString(),
        updatedAt: quest.updatedAt.toISOString(),
      };
    },
  };
}
