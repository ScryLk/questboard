import type { Namespace, Socket } from "socket.io";
import { prisma } from "@questboard/db";

export function registerTokenHandler(_nsp: Namespace, socket: Socket): void {
  const user = socket.data.user;

  socket.on("token:moved", async (data: { tokenId: string; x: number; y: number }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    // Validate ownership or GM
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
  });

  socket.on("token:updated", async (data: { tokenId: string; changes: Record<string, unknown> }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    await prisma.token.update({ where: { id: data.tokenId }, data: data.changes });

    socket.to(`session:${sessionId}`).emit("token:updated", {
      tokenId: data.tokenId,
      changes: data.changes,
      updatedBy: user.id,
    });
  });

  socket.on("token:added", (data: { token: Record<string, unknown> }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    socket.to(`session:${sessionId}`).emit("token:added", {
      token: data.token,
      addedBy: user.id,
    });
  });

  socket.on("token:removed", (data: { tokenId: string }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    socket.to(`session:${sessionId}`).emit("token:removed", {
      tokenId: data.tokenId,
      removedBy: user.id,
    });
  });
}
