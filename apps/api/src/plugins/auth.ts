import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@questboard/db";
import { UnauthorizedError } from "../errors/app-error.js";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      clerkId: string;
      email: string;
      displayName: string;
      username: string | null;
      avatarUrl: string | null;
      plan: string;
    };
  }
}

export async function authPlugin(app: FastifyInstance) {
  app.decorateRequest("user", null);

  app.addHook("preHandler", async (request: FastifyRequest, _reply: FastifyReply) => {

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token não fornecido");
    }

    const token = authHeader.slice(7);

    try {
      // In production, verify with Clerk:
      // const clerkPayload = await clerkClient.verifyToken(token);
      // const clerkId = clerkPayload.sub;

      // For development, we accept clerkId directly as the token
      // TODO: Replace with actual Clerk verification in production
      const clerkId = token;

      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: {
          id: true,
          clerkId: true,
          email: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          plan: true,
          deletedAt: true,
        },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedError("Usuário não encontrado");
      }

      request.user = {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError("Token inválido");
    }
  });
}
