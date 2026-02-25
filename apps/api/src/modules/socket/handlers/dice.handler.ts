import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";
import { checkPermission } from "@questboard/shared";
import type { PlayerRole } from "@questboard/shared";

function parseDiceFormula(formula: string): { count: number; sides: number; modifier: number } {
  // Parse formulas like "2d6+3", "1d20-1", "4d8"
  const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) {
    return { count: 1, sides: 20, modifier: 0 };
  }
  return {
    count: Math.min(parseInt(match[1], 10), 100),
    sides: Math.min(parseInt(match[2], 10), 1000),
    modifier: match[3] ? parseInt(match[3], 10) : 0,
  };
}

function rollDice(count: number, sides: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }
  return results;
}

export function registerDiceHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("dice:roll", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    const isSecret = data.isSecret ?? false;

    if (isSecret && !checkPermission("dice:roll-secret", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão para rolagem secreta" } });
    }

    if (!checkPermission("dice:roll", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      const { count, sides, modifier } = parseDiceFormula(data.formula);
      const results = rollDice(count, sides);
      const total = results.reduce((a, b) => a + b, 0) + modifier;

      const user = await prisma.user.findUnique({
        where: { id: socket.ctx.userId },
        select: { displayName: true },
      });

      const rollDTO = {
        id: `roll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        formula: data.formula,
        results,
        total,
        context: data.context ?? null,
        isSecret,
        userId: socket.ctx.userId,
        displayName: user?.displayName ?? "Unknown",
        createdAt: new Date().toISOString(),
      };

      if (isSecret) {
        // Only send to GMs/CO_GMs in the room
        const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
        for (const s of sockets) {
          const ctx = (s as any).ctx;
          if (ctx && ["GM", "CO_GM"].includes(ctx.role)) {
            s.emit("dice:secret-result", rollDTO);
          }
        }
      } else {
        io.to(socket.ctx.sessionId).emit("dice:result", rollDTO);
      }

      // Update stats
      await prisma.sessionPlayer.updateMany({
        where: { userId: socket.ctx.userId, sessionId: socket.ctx.sessionId },
        data: { totalDiceRolled: { increment: count } },
      });

      ack({ success: true, data: rollDTO });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao rolar dados" } });
    }
  });
}
