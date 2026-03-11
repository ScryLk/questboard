import type { Namespace, Socket } from "socket.io";
import { prisma } from "@questboard/db";

export function registerPhaseHandler(nsp: Namespace, socket: Socket): void {
  socket.on("phase:changed", async (data: { type: string; label: string; notes?: string }) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    // Only GM can change phase
    const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
    if (session?.ownerId !== socket.data.user.id) return;

    // End current phase
    const activePhase = await prisma.phaseEvent.findFirst({
      where: { sessionId, endedAt: null },
      orderBy: { startedAt: "desc" },
    });
    if (activePhase) {
      const duration = Math.round((Date.now() - activePhase.startedAt.getTime()) / 60000);
      await prisma.phaseEvent.update({
        where: { id: activePhase.id },
        data: { endedAt: new Date(), durationMin: duration },
      });
    }

    // Create new phase
    const phase = await prisma.phaseEvent.create({
      data: {
        sessionId,
        type: data.type as "EXPLORATION" | "COMBAT" | "ROLEPLAY" | "INVESTIGATION" | "TRAVEL" | "REST_SHORT" | "REST_LONG" | "NARRATION",
        label: data.label,
        notes: data.notes,
        startedAt: new Date(),
      },
    });

    nsp.to(`session:${sessionId}`).emit("phase:changed", phase);
  });
}
