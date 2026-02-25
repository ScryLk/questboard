import { Worker, type ConnectionOptions } from "bullmq";
import { prisma } from "@questboard/db";

/**
 * Scheduling checker worker.
 * Runs every minute via a repeating job.
 * - Marks SCHEDULED sessions as STARTED if their scheduledFor is now or past.
 * - Sends reminder notifications for upcoming sessions.
 */
export function createSchedulingCheckerWorker(connection: ConnectionOptions) {
  const worker = new Worker(
    "scheduling-checker",
    async () => {
      const now = new Date();

      // 1. Find schedules that should have started
      const dueSchedules = await prisma.sessionSchedule.findMany({
        where: {
          status: "SCHEDULED",
          scheduledFor: { lte: now },
        },
        include: {
          session: { select: { id: true, name: true, status: true } },
        },
      });

      for (const schedule of dueSchedules) {
        await prisma.sessionSchedule.update({
          where: { id: schedule.id },
          data: { status: "STARTED" },
        });

        console.log(`Schedule ${schedule.id} for session "${schedule.session.name}" marked as STARTED`);
      }

      // 2. Send reminders for sessions starting soon (within 30 minutes)
      const reminderWindow = new Date(now.getTime() + 30 * 60 * 1000);
      const upcomingSchedules = await prisma.sessionSchedule.findMany({
        where: {
          status: "SCHEDULED",
          reminderSent: false,
          scheduledFor: { gt: now, lte: reminderWindow },
        },
        include: {
          session: {
            select: {
              id: true,
              name: true,
              players: { where: { isBanned: false }, select: { userId: true } },
            },
          },
        },
      });

      for (const schedule of upcomingSchedules) {
        // Create notifications for all players
        const notifications = schedule.session.players.map((p) => ({
          userId: p.userId,
          type: "SESSION_STARTING" as const,
          title: "Sessão começando em breve!",
          body: `A sessão "${schedule.session.name}" está agendada para começar em breve.`,
          actionUrl: `/sessions/${schedule.session.id}`,
          data: { sessionId: schedule.session.id, scheduleId: schedule.id },
        }));

        if (notifications.length > 0) {
          await prisma.notification.createMany({ data: notifications });
        }

        await prisma.sessionSchedule.update({
          where: { id: schedule.id },
          data: { reminderSent: true },
        });

        console.log(`Reminder sent for schedule ${schedule.id} (session: "${schedule.session.name}")`);
      }
    },
    {
      connection,
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Scheduling checker job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Scheduling checker job ${job?.id} failed:`, error);
  });

  return worker;
}
