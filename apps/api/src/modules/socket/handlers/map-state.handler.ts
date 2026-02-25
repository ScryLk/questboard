import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerMapStateHandlers(_io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  // Client requests full map state (on join or reconnect)
  socket.on("map:request-state" as any, async (data: { mapId: string }) => {
    if (!socket.ctx.sessionId) return;

    try {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId } },
      });
      if (!player) return;

      const map = await prisma.map.findUnique({
        where: { id: data.mapId, deletedAt: null },
        include: {
          tokens: true,
          fogAreas: true,
          walls: true,
          lightSources: true,
          layers: { orderBy: { sortOrder: "asc" } },
          annotations: true,
        },
      });

      if (!map) return;

      const isGm = ["GM", "CO_GM"].includes(player.role);

      // Filter annotations by visibility for non-GM players
      const filteredAnnotations = isGm
        ? map.annotations
        : map.annotations.filter(
            (a) => a.visibleTo === "ALL" || (a.visibleTo === "SPECIFIC" && a.authorId === socket.ctx.userId)
          );

      // Filter hidden tokens for non-GM players
      const filteredTokens = isGm
        ? map.tokens
        : map.tokens.filter((t) => t.isVisible);

      socket.emit("map:full-state" as any, {
        map: {
          ...map,
          tokens: filteredTokens,
          annotations: filteredAnnotations,
        },
      });
    } catch {
      // Map may not exist
    }
  });
}
