import type { Socket } from "socket.io";
import { verifyToken } from "@clerk/backend";
import { prisma } from "@questboard/db";
import { env } from "../config/env.js";

export interface SocketUser {
  id: string;
  clerkId: string;
  email: string;
  plan: string;
  displayName: string;
}

declare module "socket.io" {
  interface SocketData {
    user: SocketUser;
    sessionId?: string;
  }
}

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error("Token ausente"));

    const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
    const clerkId = payload.sub;

    const user = await prisma.user.findUnique({
      where: { externalId: clerkId },
      select: { id: true, externalId: true, email: true, plan: true, displayName: true },
    });

    if (!user) return next(new Error("Usuário não encontrado"));

    socket.data.user = {
      id: user.id,
      clerkId: user.externalId,
      email: user.email,
      plan: user.plan,
      displayName: user.displayName,
    };

    next();
  } catch {
    next(new Error("Token inválido"));
  }
}
