import type { PrismaClient } from "@questboard/db";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/app-error.js";
import { redis } from "../../lib/redis.js";

export function createCombatService(prisma: PrismaClient) {
  async function assertGM(sessionId: string, userId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
    if (!session) throw new NotFoundError("Session");
    if (session.ownerId !== userId) throw new ForbiddenError("Apenas o GM pode controlar combate");
    return session;
  }

  return {
    async start(sessionId: string, userId: string, participants: {
      name: string; initiative: number; isNPC?: boolean; tokenId?: string;
      hpCurrent: number; hpMax: number; ac?: number; movementMax?: number;
    }[]) {
      await assertGM(sessionId, userId);

      // End existing combat if any
      await prisma.combatState.deleteMany({ where: { sessionId } });

      const sorted = [...participants].sort((a, b) => b.initiative - a.initiative);

      const combat = await prisma.combatState.create({
        data: {
          sessionId,
          isActive: true,
          round: 1,
          activeIndex: 0,
          participants: {
            create: sorted.map((p, i) => ({
              name: p.name,
              initiative: p.initiative,
              isNPC: p.isNPC ?? false,
              tokenId: p.tokenId,
              hpCurrent: p.hpCurrent,
              hpMax: p.hpMax,
              ac: p.ac ?? 10,
              movementMax: p.movementMax ?? 6,
              order: i,
            })),
          },
        },
        include: { participants: { orderBy: { order: "asc" } } },
      });

      await redis.set(`session:${sessionId}:combat`, JSON.stringify(combat));
      return combat;
    },

    async end(sessionId: string, userId: string) {
      await assertGM(sessionId, userId);

      const combat = await prisma.combatState.findUnique({ where: { sessionId } });
      if (!combat) throw new NotFoundError("CombatState");

      await prisma.combatState.delete({ where: { sessionId } });
      await redis.del(`session:${sessionId}:combat`);

      return { ended: true };
    },

    async nextTurn(sessionId: string, userId: string) {
      await assertGM(sessionId, userId);

      const combat = await prisma.combatState.findUnique({
        where: { sessionId },
        include: { participants: { orderBy: { order: "asc" } } },
      });
      if (!combat) throw new NotFoundError("CombatState");

      let nextIndex = combat.activeIndex + 1;
      let round = combat.round;

      if (nextIndex >= combat.participants.length) {
        nextIndex = 0;
        round += 1;
      }

      // Reset turn resources for new active participant
      const activeParticipant = combat.participants[nextIndex];
      if (activeParticipant) {
        await prisma.combatParticipant.update({
          where: { id: activeParticipant.id },
          data: { actionUsed: false, bonusUsed: false, reactionUsed: false, movementUsed: 0, isDashing: false },
        });
      }

      const updated = await prisma.combatState.update({
        where: { sessionId },
        data: { activeIndex: nextIndex, round },
        include: { participants: { orderBy: { order: "asc" } } },
      });

      await redis.set(`session:${sessionId}:combat`, JSON.stringify(updated));
      return updated;
    },

    async updateParticipant(sessionId: string, userId: string, participantId: string, changes: Record<string, unknown>) {
      await assertGM(sessionId, userId);

      const participant = await prisma.combatParticipant.findUnique({ where: { id: participantId } });
      if (!participant) throw new NotFoundError("CombatParticipant");

      return prisma.combatParticipant.update({ where: { id: participantId }, data: changes });
    },

    async damage(_sessionId: string, _userId: string, participantId: string, amount: number) {
      if (amount <= 0) throw new BadRequestError("Dano deve ser positivo");

      const participant = await prisma.combatParticipant.findUnique({ where: { id: participantId } });
      if (!participant) throw new NotFoundError("CombatParticipant");

      // Apply to temp HP first
      let remaining = amount;
      let hpTemp = participant.hpTemp;
      if (hpTemp > 0) {
        const absorbed = Math.min(hpTemp, remaining);
        hpTemp -= absorbed;
        remaining -= absorbed;
      }

      const hpCurrent = Math.max(0, participant.hpCurrent - remaining);
      const isDead = hpCurrent === 0;

      return prisma.combatParticipant.update({
        where: { id: participantId },
        data: { hpCurrent, hpTemp, isDead },
      });
    },

    async heal(_sessionId: string, _userId: string, participantId: string, amount: number) {
      if (amount <= 0) throw new BadRequestError("Cura deve ser positiva");

      const participant = await prisma.combatParticipant.findUnique({ where: { id: participantId } });
      if (!participant) throw new NotFoundError("CombatParticipant");

      const hpCurrent = Math.min(participant.hpMax, participant.hpCurrent + amount);

      return prisma.combatParticipant.update({
        where: { id: participantId },
        data: { hpCurrent, isDead: false },
      });
    },
  };
}

export type CombatService = ReturnType<typeof createCombatService>;
