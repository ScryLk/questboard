import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerMapTokenHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("token:move", async (data) => {
    if (!socket.ctx.sessionId) return;

    const { tokenId, x, y } = data;

    // Permission check: GM/CO_GM or token owner
    try {
      const token = await prisma.token.findUnique({ where: { id: tokenId } });
      if (!token) return;

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId } },
      });
      if (!player) return;

      const isGm = ["GM", "CO_GM"].includes(player.role);
      const isOwner = token.ownerId === socket.ctx.userId;
      if (!isGm && !isOwner) return;

      // Wall collision check for non-GM moves
      if (!isGm) {
        const walls = await prisma.wall.findMany({
          where: { mapId: token.mapId, blocksMovement: true },
        });

        for (const wall of walls) {
          if (wall.isDoor && (wall.doorState === "OPEN")) continue;
          if (segmentsIntersect(token.x, token.y, x, y, wall.x1, wall.y1, wall.x2, wall.y2)) {
            // Blocked by wall — don't broadcast
            socket.emit("token:move-rejected", { tokenId, reason: "wall" });
            return;
          }
        }
      }

      // Broadcast to all in session
      io.to(socket.ctx.sessionId).emit("token:moved", {
        tokenId,
        x,
        y,
        animate: true,
      });
    } catch {
      // Silently fail on socket errors
    }
  });

  socket.on("token:batch-move" as any, async (data: { moves: Array<{ tokenId: string; x: number; y: number }> }) => {
    if (!socket.ctx.sessionId) return;

    const player = await prisma.sessionPlayer.findUnique({
      where: { userId_sessionId: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId } },
    });
    if (!player || !["GM", "CO_GM"].includes(player.role)) return;

    io.to(socket.ctx.sessionId).emit("token:batch-moved" as any, {
      moves: data.moves.map((m) => ({ tokenId: m.tokenId, x: m.x, y: m.y })),
    });
  });
}

// Simple line segment intersection
function segmentsIntersect(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): boolean {
  const d1 = direction(bx1, by1, bx2, by2, ax1, ay1);
  const d2 = direction(bx1, by1, bx2, by2, ax2, ay2);
  const d3 = direction(ax1, ay1, ax2, ay2, bx1, by1);
  const d4 = direction(ax1, ay1, ax2, ay2, bx2, by2);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
}

function direction(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
