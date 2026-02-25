import type { PrismaClient } from "@questboard/db";
import type { Socket } from "socket.io";

export function socketAuthMiddleware(prisma: PrismaClient) {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(new Error("AUTH_REQUIRED"));
      }

      // In production, verify with Clerk:
      // const clerkPayload = await clerkClient.verifyToken(token);
      // const clerkId = clerkPayload.sub;
      // For development, accept clerkId directly
      const clerkId = token;

      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, deletedAt: true },
      });

      if (!user || user.deletedAt) {
        return next(new Error("USER_NOT_FOUND"));
      }

      socket.ctx = {
        userId: user.id,
        sessionId: null,
        role: null,
      };

      next();
    } catch {
      next(new Error("AUTH_FAILED"));
    }
  };
}
