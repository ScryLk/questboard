import type { FastifyRequest, FastifyReply } from "fastify";
import { ForbiddenError } from "../errors/app-error.js";

export async function requireAdmin(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const role = request.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Acesso restrito a administradores");
  }
}

export async function requireSuperAdmin(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (request.user.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Acesso restrito a super administradores");
  }
}
