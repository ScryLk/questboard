import type { FastifyRequest, FastifyReply } from "fastify";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { prisma } from "@questboard/db";
import { env } from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "../errors/app-error.js";
import { createUserService } from "../modules/user/user.service.js";

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
const userService = createUserService(prisma);

export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  plan: string;
  role: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user: AuthUser;
  }
}

export async function verifyAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  // Dev bypass: skip Clerk verification when using placeholder key
  if (env.NODE_ENV === "development" && env.CLERK_SECRET_KEY === "sk_test_placeholder") {
    const devUserId = (request.headers["x-user-id"] as string | undefined) ?? "dev-user-default";
    {
      let user = await prisma.user.findFirst({
        where: { OR: [{ id: devUserId }, { externalId: devUserId }] },
        select: { id: true, externalId: true, email: true, plan: true, role: true, isBanned: true },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            externalId: devUserId,
            email: `${devUserId}@dev.local`,
            username: devUserId.slice(0, 16).replace(/[^a-z0-9_-]/gi, "") || "devuser",
            tag: "DEV1",
            displayName: "Dev User",
          },
          select: { id: true, externalId: true, email: true, plan: true, role: true, isBanned: true },
        });
      }
      request.user = {
        id: user.id,
        clerkId: user.externalId,
        email: user.email,
        plan: user.plan,
        role: user.role,
      };
      return;
    }
  }

  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token ausente");
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });
    const clerkId = payload.sub;

    let user = await prisma.user.findUnique({
      where: { externalId: clerkId },
      select: { id: true, externalId: true, email: true, plan: true, role: true, isBanned: true },
    });

    // Lazy-create: token Clerk válido mas usuário ainda não existe no
    // nosso DB. Em produção, isso seria criado via webhook user.created
    // — em dev local o webhook não chega no localhost. Buscamos os
    // dados via Clerk SDK e fazemos o sync agora.
    if (!user) {
      const clerkUser = await clerk.users.getUser(clerkId);
      const synced = await userService.syncFromClerk({
        id: clerkUser.id,
        email_addresses: clerkUser.emailAddresses.map((e) => ({
          email_address: e.emailAddress,
          id: e.id,
        })),
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        image_url: clerkUser.imageUrl,
        username: clerkUser.username,
      });
      user = {
        id: synced.id,
        externalId: synced.externalId,
        email: synced.email,
        plan: synced.plan,
        role: synced.role,
        isBanned: synced.isBanned,
      };
    }

    if (user.isBanned) {
      throw new ForbiddenError("Conta banida");
    }

    request.user = {
      id: user.id,
      clerkId: user.externalId,
      email: user.email,
      plan: user.plan,
      role: user.role,
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    if (err instanceof ForbiddenError) throw err;
    throw new UnauthorizedError("Token inválido");
  }
}
