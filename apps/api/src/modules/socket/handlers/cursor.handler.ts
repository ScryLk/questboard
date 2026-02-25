import type { TypedIO, TypedSocket } from "../socket.gateway.js";

// In-memory cursor state per session
const cursorPositions = new Map<string, Map<string, { x: number; y: number }>>();

// Broadcast cursor positions at a throttled rate
const BROADCAST_INTERVAL_MS = 100;
const broadcastTimers = new Map<string, NodeJS.Timeout>();

function scheduleBroadcast(io: TypedIO, sessionId: string) {
  if (broadcastTimers.has(sessionId)) return;

  const timer = setTimeout(() => {
    broadcastTimers.delete(sessionId);

    const positions = cursorPositions.get(sessionId);
    if (!positions || positions.size === 0) return;

    const data: Record<string, { x: number; y: number }> = {};
    for (const [userId, pos] of positions) {
      data[userId] = pos;
    }

    io.to(sessionId).emit("cursor:positions", data);
  }, BROADCAST_INTERVAL_MS);

  broadcastTimers.set(sessionId, timer);
}

export function registerCursorHandlers(io: TypedIO, socket: TypedSocket) {
  socket.on("cursor:move", (data) => {
    if (!socket.ctx.sessionId) return;

    const sessionId = socket.ctx.sessionId;

    if (!cursorPositions.has(sessionId)) {
      cursorPositions.set(sessionId, new Map());
    }

    cursorPositions.get(sessionId)!.set(socket.ctx.userId, { x: data.x, y: data.y });
    scheduleBroadcast(io, sessionId);
  });

  socket.on("token:move", (data) => {
    if (!socket.ctx.sessionId) return;

    // Broadcast token movement to all other clients in the session
    socket.to(socket.ctx.sessionId).emit("token:moved", {
      tokenId: data.tokenId,
      x: data.x,
      y: data.y,
      animate: true,
    });
  });

  socket.on("disconnect", () => {
    if (socket.ctx.sessionId) {
      const positions = cursorPositions.get(socket.ctx.sessionId);
      if (positions) {
        positions.delete(socket.ctx.userId);
        if (positions.size === 0) {
          cursorPositions.delete(socket.ctx.sessionId);
          const timer = broadcastTimers.get(socket.ctx.sessionId);
          if (timer) {
            clearTimeout(timer);
            broadcastTimers.delete(socket.ctx.sessionId);
          }
        }
      }
    }
  });
}
