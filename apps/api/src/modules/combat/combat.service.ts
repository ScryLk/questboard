import type { PrismaClient, Prisma } from "@questboard/db";
import type { InitiativeEntry } from "@questboard/shared";
import { NotFoundError, ForbiddenError, ConflictError } from "../../errors/app-error.js";

export function createCombatService(prisma: PrismaClient) {
  function generateEntryId() {
    return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  return {
    async getState(sessionId: string) {
      return prisma.combatState.findUnique({ where: { sessionId } });
    },

    async start(sessionId: string, userId: string, entries: InitiativeEntry[]) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão para iniciar combate");
      }

      const existing = await prisma.combatState.findUnique({ where: { sessionId } });
      if (existing?.isActive) {
        throw new ConflictError("Combate já está ativo");
      }

      // Sort by initiative (desc), then dexModifier (desc)
      const sorted = entries
        .map((e) => ({ ...e, id: generateEntryId() }))
        .sort((a, b) => b.initiative - a.initiative || (b.dexModifier ?? 0) - (a.dexModifier ?? 0));

      const data = {
        sessionId,
        isActive: true,
        round: 1,
        turnIndex: 0,
        initiativeOrder: sorted as unknown as Prisma.InputJsonValue,
        combatLog: [] as unknown as Prisma.InputJsonValue,
      };

      const combatState = existing
        ? await prisma.combatState.update({ where: { sessionId }, data })
        : await prisma.combatState.create({ data });

      await prisma.sessionLog.create({
        data: { sessionId, event: "combat.started", actorId: userId },
      });

      return combatState;
    },

    async end(sessionId: string, userId: string) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão");
      }

      const state = await prisma.combatState.findUnique({ where: { sessionId } });
      if (!state?.isActive) throw new ConflictError("Nenhum combate ativo");

      await prisma.combatState.update({
        where: { sessionId },
        data: { isActive: false },
      });

      await prisma.sessionLog.create({
        data: {
          sessionId,
          event: "combat.ended",
          actorId: userId,
          data: { rounds: state.round } as Prisma.InputJsonValue,
        },
      });

      return { rounds: state.round };
    },

    async forceEnd(sessionId: string) {
      await prisma.combatState.update({
        where: { sessionId },
        data: { isActive: false },
      });
    },

    async nextTurn(sessionId: string, userId: string) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão");
      }

      const state = await prisma.combatState.findUnique({ where: { sessionId } });
      if (!state?.isActive) throw new ConflictError("Nenhum combate ativo");

      const order = state.initiativeOrder as unknown as InitiativeEntry[];
      let nextTurn = state.turnIndex + 1;
      let nextRound = state.round;

      if (nextTurn >= order.length) {
        nextTurn = 0;
        nextRound++;
      }

      await prisma.combatState.update({
        where: { sessionId },
        data: { turnIndex: nextTurn, round: nextRound },
      });

      return { round: nextRound, turnIndex: nextTurn, currentActor: order[nextTurn] };
    },

    async prevTurn(sessionId: string, userId: string) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão");
      }

      const state = await prisma.combatState.findUnique({ where: { sessionId } });
      if (!state?.isActive) throw new ConflictError("Nenhum combate ativo");

      const order = state.initiativeOrder as unknown as InitiativeEntry[];
      let prevTurn = state.turnIndex - 1;
      let prevRound = state.round;

      if (prevTurn < 0) {
        prevTurn = order.length - 1;
        prevRound = Math.max(1, prevRound - 1);
      }

      await prisma.combatState.update({
        where: { sessionId },
        data: { turnIndex: prevTurn, round: prevRound },
      });

      return { round: prevRound, turnIndex: prevTurn, currentActor: order[prevTurn] };
    },

    async updateHp(sessionId: string, userId: string, entryId: string, delta: number) {
      const state = await prisma.combatState.findUnique({ where: { sessionId } });
      if (!state?.isActive) throw new ConflictError("Nenhum combate ativo");

      const order = state.initiativeOrder as unknown as InitiativeEntry[];
      const entry = order.find((e) => e.id === entryId);
      if (!entry) throw new NotFoundError("Entrada de iniciativa");

      // Permission check: own HP or GM/CO_GM
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player) throw new ForbiddenError("Não é jogador");

      const isOwn = entry.userId === userId;
      const isGm = ["GM", "CO_GM"].includes(player.role);
      if (!isOwn && !isGm) throw new ForbiddenError("Sem permissão");

      entry.hp.current = Math.max(0, Math.min(entry.hp.max, entry.hp.current + delta));

      await prisma.combatState.update({
        where: { sessionId },
        data: { initiativeOrder: order as unknown as Prisma.InputJsonValue },
      });

      return { entryId, hp: entry.hp };
    },

    async addEntry(sessionId: string, userId: string, input: InitiativeEntry) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão");
      }

      const state = await prisma.combatState.findUnique({ where: { sessionId } });
      if (!state?.isActive) throw new ConflictError("Nenhum combate ativo");

      const order = state.initiativeOrder as unknown as InitiativeEntry[];
      const newEntry = { ...input, id: generateEntryId() };
      order.push(newEntry);
      order.sort((a, b) => b.initiative - a.initiative || (b.dexModifier ?? 0) - (a.dexModifier ?? 0));

      await prisma.combatState.update({
        where: { sessionId },
        data: { initiativeOrder: order as unknown as Prisma.InputJsonValue },
      });

      return order;
    },

    async removeEntry(sessionId: string, userId: string, entryId: string) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão");
      }

      const state = await prisma.combatState.findUnique({ where: { sessionId } });
      if (!state?.isActive) throw new ConflictError("Nenhum combate ativo");

      const order = (state.initiativeOrder as unknown as InitiativeEntry[]).filter((e) => e.id !== entryId);

      // Adjust turnIndex if needed
      let turnIndex = state.turnIndex;
      if (turnIndex >= order.length) turnIndex = 0;

      await prisma.combatState.update({
        where: { sessionId },
        data: {
          initiativeOrder: order as unknown as Prisma.InputJsonValue,
          turnIndex,
        },
      });

      return order;
    },

    async setConditions(sessionId: string, userId: string, entryId: string, conditions: string[]) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão");
      }

      const state = await prisma.combatState.findUnique({ where: { sessionId } });
      if (!state?.isActive) throw new ConflictError("Nenhum combate ativo");

      const order = state.initiativeOrder as unknown as InitiativeEntry[];
      const entry = order.find((e) => e.id === entryId);
      if (!entry) throw new NotFoundError("Entrada de iniciativa");

      entry.conditions = conditions;

      await prisma.combatState.update({
        where: { sessionId },
        data: { initiativeOrder: order as unknown as Prisma.InputJsonValue },
      });

      return { entryId, conditions };
    },
  };
}

export type CombatService = ReturnType<typeof createCombatService>;
