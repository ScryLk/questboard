import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerQuestHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("quest:create", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem criar quests" } });
    }

    try {
      const quest = await prisma.quest.create({
        data: {
          sessionId: socket.ctx.sessionId,
          name: data.title,
          description: data.description ?? "",
          questType: (data.questType as any) ?? "MAIN",
          status: "ACTIVE",
          objectives: (data.objectives ?? []) as any,
          rewards: (data.rewards ?? {}) as any,
          isSecret: data.isSecret ?? false,
          visibleTo: data.visibleTo ?? [],
          sortOrder: 0,
          createdById: socket.ctx.userId!,
        },
      });

      // Broadcast to visible players
      if (quest.isSecret && quest.visibleTo.length > 0) {
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (!ctx) continue;
          if (quest.visibleTo.includes(ctx.userId) || ["GM", "CO_GM"].includes(ctx.role)) {
            s.emit("quest:created", {
              id: quest.id,
              name: quest.name,
              description: quest.description ?? "",
              questType: quest.questType,
              status: quest.status,
              objectives: quest.objectives as any[],
            });
          }
        }
      } else if (!quest.isSecret) {
        io.to(socket.ctx.sessionId).emit("quest:created", {
          id: quest.id,
          name: quest.name,
          description: quest.description ?? "",
          questType: quest.questType,
          status: quest.status,
          objectives: quest.objectives as any[],
        });
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao criar quest" } });
    }
  });

  socket.on("quest:update-objective", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem atualizar objetivos" } });
    }

    try {
      const quest = await prisma.quest.findFirst({
        where: { id: data.questId, sessionId: socket.ctx.sessionId },
      });
      if (!quest) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Quest não encontrada" } });
      }

      const objectives = (quest.objectives as any[]) ?? [];
      const idx = objectives.findIndex((o: any) => o.id === data.objectiveId);
      if (idx === -1) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Objetivo não encontrado" } });
      }

      objectives[idx].completed = data.completed;
      objectives[idx].completedAt = data.completed ? new Date().toISOString() : null;

      const allDone = objectives.every((o: any) => o.optional || o.completed);
      const updateData: any = { objectives };
      if (allDone && quest.status === "ACTIVE") {
        updateData.status = "COMPLETED";
        updateData.completedAt = new Date();
      }

      await prisma.quest.update({
        where: { id: data.questId },
        data: updateData,
      });

      io.to(socket.ctx.sessionId).emit("quest:objective-completed", {
        questId: data.questId,
        objectiveId: data.objectiveId,
        completed: data.completed,
      });

      if (allDone && quest.status === "ACTIVE") {
        io.to(socket.ctx.sessionId).emit("quest:completed", {
          questId: data.questId,
          name: quest.name,
          rewards: quest.rewards as any,
        });
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao atualizar objetivo" } });
    }
  });

  socket.on("quest:complete", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem completar quests" } });
    }

    try {
      const quest = await prisma.quest.findFirst({
        where: { id: data.questId, sessionId: socket.ctx.sessionId },
      });
      if (!quest) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Quest não encontrada" } });
      }

      await prisma.quest.update({
        where: { id: data.questId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      io.to(socket.ctx.sessionId).emit("quest:completed", {
        questId: data.questId,
        name: quest.name,
        rewards: quest.rewards as any,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao completar quest" } });
    }
  });
}
