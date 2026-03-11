import type { Namespace, Socket } from "socket.io";
import { redis } from "../../lib/redis.js";

export function registerCombatHandler(nsp: Namespace, socket: Socket): void {
  socket.on("combat:started", (data: { combatState: unknown }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    redis.set(`session:${sessionId}:combat`, JSON.stringify(data.combatState));
    nsp.to(`session:${sessionId}`).emit("combat:started", data);
  });

  socket.on("combat:turn-changed", (data: { activeIndex: number; round: number }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    nsp.to(`session:${sessionId}`).emit("combat:turn-changed", data);
  });

  socket.on("combat:participant-updated", (data: { participantId: string; changes: Record<string, unknown> }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    nsp.to(`session:${sessionId}`).emit("combat:participant-updated", data);
  });

  socket.on("combat:ended", () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    redis.del(`session:${sessionId}:combat`);
    nsp.to(`session:${sessionId}`).emit("combat:ended", {});
  });
}
