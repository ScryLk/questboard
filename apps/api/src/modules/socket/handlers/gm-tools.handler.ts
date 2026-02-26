import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerGmToolsHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("gm:enable-player-view", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem usar player view" } });
    }

    try {
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        const ctx = (s as any).ctx;
        if (ctx?.userId === socket.ctx.userId) {
          s.emit("gm:player-view-enabled", { targetPlayerId: data.targetPlayerId });
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao ativar player view" } });
    }
  });

  socket.on("gm:disable-player-view", async (_data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem usar player view" } });
    }

    try {
      const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
      for (const s of sockets) {
        const ctx = (s as any).ctx;
        if (ctx?.userId === socket.ctx.userId) {
          s.emit("gm:player-view-disabled", {});
        }
      }

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao desativar player view" } });
    }
  });

  socket.on("recap:generate", async (_data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem gerar recaps" } });
    }

    try {
      const [recentMessages, quests, sessionInfo] = await Promise.all([
        prisma.chatMessage.findMany({
          where: { sessionId: socket.ctx.sessionId },
          orderBy: { createdAt: "desc" },
          take: 100,
          select: { content: true, senderName: true, channel: true },
        }),
        prisma.quest.findMany({
          where: { sessionId: socket.ctx.sessionId },
          select: { name: true, status: true },
        }),
        prisma.session.findUnique({
          where: { id: socket.ctx.sessionId },
          select: { name: true, sessionNumber: true },
        }),
      ]);

      const recap = await prisma.sessionRecap.create({
        data: {
          sessionId: socket.ctx.sessionId,
          content: `[AI recap placeholder] Session with ${recentMessages.length} messages and ${quests.length} quests.`,
          sessionNumber: sessionInfo?.sessionNumber ?? 0,
          aiGenerated: true,
          sourceData: {
            sessionName: sessionInfo?.name,
            messageCount: recentMessages.length,
            questCount: quests.length,
          } as any,
          createdById: socket.ctx.userId!,
        },
      });

      io.to(socket.ctx.sessionId).emit("recap:generated", {
        id: recap.id,
        content: recap.content,
        sessionNumber: recap.sessionNumber,
        aiGenerated: recap.aiGenerated,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao gerar recap" } });
    }
  });

  socket.on("npc:set-disposition", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem definir disposições" } });
    }

    try {
      const npc = await prisma.npcProfile.findFirst({
        where: { id: data.npcId, sessionId: socket.ctx.sessionId },
      });
      if (!npc) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "NPC não encontrado" } });
      }

      const dispositions = (npc.dispositions as Record<string, any>) ?? {};
      dispositions[data.characterId] = {
        attitude: data.attitude,
        description: data.description,
        updatedAt: new Date().toISOString(),
      };

      await prisma.npcProfile.update({
        where: { id: data.npcId },
        data: { dispositions: dispositions as any },
      });

      io.to(socket.ctx.sessionId).emit("npc:disposition-shown", {
        npcId: data.npcId,
        npcName: npc.name,
        characterId: data.characterId,
        attitude: data.attitude,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao definir disposição" } });
    }
  });

  socket.on("npc:speak", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem falar como NPC" } });
    }

    try {
      const npc = await prisma.npcProfile.findFirst({
        where: { id: data.npcId, sessionId: socket.ctx.sessionId },
      });
      if (!npc) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "NPC não encontrado" } });
      }

      const message = await prisma.chatMessage.create({
        data: {
          sessionId: socket.ctx.sessionId,
          senderId: socket.ctx.userId!,
          senderName: npc.name,
          content: data.message,
          channel: "IN_CHARACTER",
          isNpcMessage: true,
          npcName: npc.name,
        },
      });

      io.to(socket.ctx.sessionId).emit("chat:message", {
        id: message.id,
        sessionId: message.sessionId,
        senderId: message.senderId,
        senderName: npc.name,
        content: message.content,
        channel: message.channel,
        isNpcMessage: true,
        npcName: npc.name,
        createdAt: message.createdAt.toISOString(),
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao falar como NPC" } });
    }
  });
}
