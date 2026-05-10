// ── Service de NPC Behavior ──
//
// Cria BehaviorInstance no Postgres, registra estado vivo no
// `BehaviorRegistry` (worker), pausa/retoma/encerra. Permissão
// (GM/CO_GM) já validada pelo router via requireGm.
//
// Tick loop em si vive em `apps/api/src/workers/behavior-worker.ts`.
// Esse service é a fronteira HTTP — não toca em RAM diretamente.

import type { PrismaClient } from "@questboard/db";
import type {
  BehaviorParams,
  BehaviorStartInput,
  BehaviorUpdateInput,
} from "@questboard/validators";
import { BadRequestError, NotFoundError } from "../../errors/app-error.js";
import {
  emitBehaviorEnded,
  emitBehaviorStarted,
} from "../../lib/socket-events.js";
import { behaviorRegistry } from "../../workers/behavior-registry.js";

export function createBehaviorService(prisma: PrismaClient) {
  return {
    async start(
      sessionId: string,
      _userId: string,
      input: BehaviorStartInput,
    ) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true, status: true },
      });
      if (!session) throw new NotFoundError("Session");
      if (session.status !== "LIVE") {
        throw new BadRequestError(
          "Behaviors só podem ser iniciados em sessão LIVE.",
        );
      }

      const instance = await prisma.behaviorInstance.create({
        data: {
          sessionId,
          type: input.type,
          tokenIds: input.tokenIds,
          // Prisma InputJsonValue não acomoda passthrough do Zod
          // sem cast — shape é JSON-safe por construção.
          params: (input.params ?? {}) as unknown as object,
        },
      });

      // Registra no worker — começa o tick loop pra essa instância.
      behaviorRegistry.register({
        id: instance.id,
        sessionId,
        type: input.type,
        tokenIds: input.tokenIds,
        params: (input.params ?? {}) as BehaviorParams,
      });

      emitBehaviorStarted({
        behaviorId: instance.id,
        sessionId,
        type: input.type,
        at: instance.startedAt.toISOString(),
      });

      return instance;
    },

    async list(sessionId: string) {
      return prisma.behaviorInstance.findMany({
        where: { sessionId },
        orderBy: [{ status: "asc" }, { startedAt: "desc" }],
      });
    },

    async getById(id: string) {
      const instance = await prisma.behaviorInstance.findUnique({
        where: { id },
      });
      if (!instance) throw new NotFoundError("BehaviorInstance");
      return instance;
    },

    async update(id: string, input: BehaviorUpdateInput) {
      const existing = await prisma.behaviorInstance.findUnique({
        where: { id },
        select: { id: true, status: true },
      });
      if (!existing) throw new NotFoundError("BehaviorInstance");

      const updated = await prisma.behaviorInstance.update({
        where: { id },
        data: {
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.params !== undefined
            ? { params: input.params as unknown as object }
            : {}),
        },
      });

      // Espelhamento no worker.
      if (input.status === "PAUSED") {
        behaviorRegistry.pause(id);
      } else if (input.status === "ACTIVE" && existing.status !== "ACTIVE") {
        behaviorRegistry.resume(id);
      }
      if (input.params) {
        behaviorRegistry.updateParams(id, input.params);
      }

      return updated;
    },

    async pause(id: string) {
      return this.update(id, { status: "PAUSED" });
    },

    async resume(id: string) {
      return this.update(id, { status: "ACTIVE" });
    },

    async delete(id: string) {
      const existing = await prisma.behaviorInstance.findUnique({
        where: { id },
        select: { id: true, sessionId: true, type: true },
      });
      if (!existing) throw new NotFoundError("BehaviorInstance");

      // Tira do worker antes de marcar finished — evita tick fantasma.
      behaviorRegistry.unregister(id);

      const updated = await prisma.behaviorInstance.update({
        where: { id },
        data: { status: "FINISHED", endedAt: new Date() },
      });

      emitBehaviorEnded({
        behaviorId: id,
        sessionId: existing.sessionId,
        type: existing.type,
        at: updated.endedAt!.toISOString(),
      });

      return updated;
    },
  };
}

export type BehaviorService = ReturnType<typeof createBehaviorService>;
