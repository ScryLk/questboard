import type { Namespace, Socket } from "socket.io";
import { prisma } from "@questboard/db";

export function registerAudioHandler(nsp: Namespace, socket: Socket): void {
  // Only GM can control audio
  async function isGM(sessionId: string): Promise<boolean> {
    const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
    return session?.ownerId === socket.data.user.id;
  }

  socket.on("audio:play", async (data: { track: unknown; volume?: number }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId || !(await isGM(sessionId))) return;

    await prisma.sessionAudio.upsert({
      where: { sessionId },
      create: { sessionId, isPlaying: true, currentTrack: data.track as Record<string, unknown>, volume: data.volume ?? 0.7 },
      update: { isPlaying: true, currentTrack: data.track as Record<string, unknown>, volume: data.volume ?? 0.7 },
    });

    nsp.to(`session:${sessionId}`).emit("audio:play", data);
  });

  socket.on("audio:stop", async () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId || !(await isGM(sessionId))) return;

    await prisma.sessionAudio.updateMany({
      where: { sessionId },
      data: { isPlaying: false },
    });

    nsp.to(`session:${sessionId}`).emit("audio:stop", {});
  });

  socket.on("audio:volume", async (data: { volume: number }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId || !(await isGM(sessionId))) return;

    await prisma.sessionAudio.updateMany({
      where: { sessionId },
      data: { volume: data.volume },
    });

    nsp.to(`session:${sessionId}`).emit("audio:volume", data);
  });
}
