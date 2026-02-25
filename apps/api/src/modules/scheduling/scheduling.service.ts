import type { PrismaClient } from "@questboard/db";
import type { CreateScheduleInput, UpdateScheduleInput, RsvpInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createSchedulingService(prisma: PrismaClient) {
  return {
    async create(sessionId: string, userId: string, input: CreateScheduleInput) {
      // Verify caller is GM/CO_GM
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão para agendar");
      }

      const playerCount = await prisma.sessionPlayer.count({
        where: { sessionId, isBanned: false },
      });

      return prisma.sessionSchedule.create({
        data: {
          sessionId,
          scheduledFor: input.scheduledFor,
          duration: input.duration,
          isRecurring: input.isRecurring,
          metadata: input.metadata ?? {},
          pendingCount: playerCount,
        },
      });
    },

    async listBySession(sessionId: string) {
      return prisma.sessionSchedule.findMany({
        where: { sessionId, status: { in: ["SCHEDULED", "STARTED"] } },
        orderBy: { scheduledFor: "asc" },
      });
    },

    async update(scheduleId: string, userId: string, input: UpdateScheduleInput) {
      const schedule = await prisma.sessionSchedule.findUnique({
        where: { id: scheduleId },
        include: { session: { select: { ownerId: true } } },
      });
      if (!schedule) throw new NotFoundError("Agendamento");

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId: schedule.sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão");
      }

      return prisma.sessionSchedule.update({
        where: { id: scheduleId },
        data: {
          scheduledFor: input.scheduledFor,
          duration: input.duration,
          metadata: input.metadata,
        },
      });
    },

    async cancel(scheduleId: string, userId: string, reason?: string) {
      const schedule = await prisma.sessionSchedule.findUnique({
        where: { id: scheduleId },
        include: { session: { select: { id: true } } },
      });
      if (!schedule) throw new NotFoundError("Agendamento");

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId: schedule.sessionId } },
      });
      if (!player || !["GM", "CO_GM"].includes(player.role)) {
        throw new ForbiddenError("Sem permissão");
      }

      return prisma.sessionSchedule.update({
        where: { id: scheduleId },
        data: { status: "CANCELLED", cancelReason: reason },
      });
    },

    async rsvp(scheduleId: string, userId: string, input: RsvpInput) {
      const schedule = await prisma.sessionSchedule.findUnique({
        where: { id: scheduleId },
        include: { session: { select: { id: true } } },
      });
      if (!schedule) throw new NotFoundError("Agendamento");

      // Update player's RSVP
      await prisma.sessionPlayer.update({
        where: { userId_sessionId: { userId, sessionId: schedule.sessionId } },
        data: { rsvpStatus: input.status },
      });

      // Recalculate counts
      const counts = await prisma.sessionPlayer.groupBy({
        by: ["rsvpStatus"],
        where: { sessionId: schedule.sessionId, isBanned: false },
        _count: true,
      });

      await prisma.sessionSchedule.update({
        where: { id: scheduleId },
        data: {
          confirmedCount: counts.find((c) => c.rsvpStatus === "CONFIRMED")?._count ?? 0,
          declinedCount: counts.find((c) => c.rsvpStatus === "DECLINED")?._count ?? 0,
          pendingCount: counts.find((c) => c.rsvpStatus === "PENDING")?._count ?? 0,
        },
      });
    },

    async getUpcoming(userId: string) {
      const sessionIds = await prisma.sessionPlayer.findMany({
        where: { userId, isBanned: false },
        select: { sessionId: true },
      });

      return prisma.sessionSchedule.findMany({
        where: {
          sessionId: { in: sessionIds.map((s) => s.sessionId) },
          status: "SCHEDULED",
          scheduledFor: { gte: new Date() },
        },
        include: {
          session: { select: { id: true, name: true, system: true } },
        },
        orderBy: { scheduledFor: "asc" },
        take: 20,
      });
    },

    async markCompleted(sessionId: string) {
      // Mark the most recent scheduled occurrence as completed
      const schedule = await prisma.sessionSchedule.findFirst({
        where: { sessionId, status: "SCHEDULED", scheduledFor: { lte: new Date() } },
        orderBy: { scheduledFor: "desc" },
      });
      if (schedule) {
        await prisma.sessionSchedule.update({
          where: { id: schedule.id },
          data: { status: "COMPLETED" },
        });
      }
    },

    async generateOccurrences(sessionId: string, count: number = 8) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { recurringRule: true },
      });
      if (!session?.recurringRule) return [];

      const rule = session.recurringRule as {
        frequency: string;
        dayOfWeek: number;
        time: string;
        timezone: string;
        exceptions?: string[];
        endsAt?: string;
      };

      const [hours, minutes] = rule.time.split(":").map(Number);
      const occurrences: Date[] = [];
      const now = new Date();

      let current = new Date(now);
      current.setHours(hours, minutes, 0, 0);

      // Adjust to next matching day
      while (current.getDay() !== rule.dayOfWeek || current <= now) {
        current.setDate(current.getDate() + 1);
        current.setHours(hours, minutes, 0, 0);
      }

      const intervalDays = rule.frequency === "biweekly" ? 14 : rule.frequency === "monthly" ? 28 : 7;

      while (occurrences.length < count) {
        if (rule.endsAt && current > new Date(rule.endsAt)) break;
        const dateStr = current.toISOString().split("T")[0];
        if (!rule.exceptions?.includes(dateStr)) {
          occurrences.push(new Date(current));
        }
        current.setDate(current.getDate() + intervalDays);
        current.setHours(hours, minutes, 0, 0);
      }

      const schedules = await Promise.all(
        occurrences.map((date) =>
          prisma.sessionSchedule.upsert({
            where: { sessionId_scheduledFor: { sessionId, scheduledFor: date } },
            create: { sessionId, scheduledFor: date, isRecurring: true },
            update: {},
          })
        )
      );

      return schedules;
    },
  };
}

export type SchedulingService = ReturnType<typeof createSchedulingService>;
