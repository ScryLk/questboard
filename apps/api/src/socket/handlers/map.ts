import type { Namespace, Socket } from "socket.io";

export function registerMapHandler(nsp: Namespace, socket: Socket): void {
  socket.on("map:activated", (data: { mapId: string }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    // Broadcast to all in session
    nsp.to(`session:${sessionId}`).emit("map:activated", {
      mapId: data.mapId,
      activatedBy: socket.data.user.id,
    });
  });
}
