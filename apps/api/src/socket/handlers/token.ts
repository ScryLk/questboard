import type { Namespace, Socket } from "socket.io";
import { prisma } from "@questboard/db";

async function isSessionGM(socket: Socket, sessionId: string): Promise<boolean> {
  const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
  return session?.ownerId === socket.data.user.id;
}

export function registerTokenHandler(_nsp: Namespace, socket: Socket): void {
  const user = socket.data.user;

  socket.on("token:moved", async (data: { tokenId: string; x: number; y: number }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      const token = await prisma.token.findUnique({
        where: { id: data.tokenId },
        select: { ownerId: true, map: { select: { session: { select: { ownerId: true } } } } },
      });
      if (!token) return;

      const isGM = token.map.session?.ownerId === user.id;
      const isOwner = token.ownerId === user.id;
      if (!isGM && !isOwner) return;

      await prisma.token.update({
        where: { id: data.tokenId },
        data: { x: data.x, y: data.y },
      });

      socket.to(`session:${sessionId}`).emit("token:moved", {
        tokenId: data.tokenId,
        x: data.x,
        y: data.y,
        movedBy: user.id,
      });
    } catch (err) {
      console.error("[token:moved] Error:", err);
    }
  });

  socket.on("token:updated", async (data: { tokenId: string; changes: Record<string, unknown> }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      const token = await prisma.token.findUnique({
        where: { id: data.tokenId },
        select: { ownerId: true, map: { select: { session: { select: { ownerId: true } } } } },
      });
      if (!token) return;

      const isGM = token.map.session?.ownerId === user.id;
      const isOwner = token.ownerId === user.id;
      if (!isGM && !isOwner) return;

      const ALLOWED_FIELDS = new Set(["name", "hp", "maxHp", "ac", "conditions", "visible", "locked", "size", "label", "notes", "aura"]);
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(data.changes)) {
        if (ALLOWED_FIELDS.has(key)) sanitized[key] = val;
      }

      if (Object.keys(sanitized).length > 0) {
        await prisma.token.update({ where: { id: data.tokenId }, data: sanitized });
      }

      socket.to(`session:${sessionId}`).emit("token:updated", {
        tokenId: data.tokenId,
        changes: sanitized,
        updatedBy: user.id,
      });
    } catch (err) {
      console.error("[token:updated] Error:", err);
    }
  });

  socket.on("token:added", async (data: { token: Record<string, unknown> }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      if (!(await isSessionGM(socket, sessionId))) return;

      socket.to(`session:${sessionId}`).emit("token:added", {
        token: data.token,
        addedBy: user.id,
      });
    } catch (err) {
      console.error("[token:added] Error:", err);
    }
  });

  socket.on("token:removed", async (data: { tokenId: string }) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;

      if (!(await isSessionGM(socket, sessionId))) return;

      socket.to(`session:${sessionId}`).emit("token:removed", {
        tokenId: data.tokenId,
        removedBy: user.id,
      });
    } catch (err) {
      console.error("[token:removed] Error:", err);
    }
  });
}
