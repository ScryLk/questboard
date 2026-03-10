import type { Namespace, Socket } from "socket.io";
import { prisma } from "@questboard/db";
import { redis } from "../../lib/redis.js";

export function registerChatHandler(nsp: Namespace, socket: Socket): void {
  const user = socket.data.user;

  socket.on("chat:message", async (data: {
    content: string; channel?: string; characterId?: string;
    characterName?: string; recipientIds?: string[];
  }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    const message = await prisma.message.create({
      data: {
        sessionId,
        userId: user.id,
        content: data.content,
        channel: (data.channel as "GENERAL" | "IN_CHARACTER" | "WHISPER" | "GM_ONLY" | "GROUP") ?? "GENERAL",
        characterId: data.characterId,
        characterName: data.characterName,
        recipientIds: data.recipientIds ?? [],
      },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    // Whisper: only send to sender + recipients
    if (data.channel === "WHISPER" && data.recipientIds?.length) {
      const sockets = await nsp.in(`session:${sessionId}`).fetchSockets();
      for (const s of sockets) {
        if (s.data.user.id === user.id || data.recipientIds.includes(s.data.user.id)) {
          s.emit("chat:message", message);
        }
      }
    } else {
      nsp.to(`session:${sessionId}`).emit("chat:message", message);
    }
  });

  socket.on("chat:typing", async () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    await redis.sadd(`session:${sessionId}:typing`, user.id);
    await redis.expire(`session:${sessionId}:typing`, 3);

    socket.to(`session:${sessionId}`).emit("chat:typing", {
      userId: user.id,
      displayName: user.displayName,
    });
  });
}
