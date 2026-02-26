import type { PrismaClient } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";

export function registerEnvironmentHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  socket.on("environment:set", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem alterar o ambiente" } });
    }

    try {
      const updateData: any = {};
      if (data.timeOfDay !== undefined) updateData.timeOfDay = data.timeOfDay;
      if (data.weather !== undefined) updateData.weather = data.weather;
      if (data.weatherIntensity !== undefined) updateData.weatherIntensity = data.weatherIntensity;
      if (data.visualOverlay !== undefined) updateData.visualOverlay = data.visualOverlay;
      if (data.mechanicalEffects !== undefined) updateData.mechanicalEffects = data.mechanicalEffects;

      const state = await prisma.environmentState.upsert({
        where: { sessionId: socket.ctx.sessionId },
        update: updateData,
        create: {
          sessionId: socket.ctx.sessionId,
          timeOfDay: data.timeOfDay ?? "DAY",
          hourInGame: 12,
          timeFlowRate: 0,
          weather: data.weather ?? "CLEAR",
          weatherIntensity: data.weatherIntensity ?? 0.5,
          visualOverlay: data.visualOverlay ?? {},
          mechanicalEffects: data.mechanicalEffects ?? {},
          autoSoundtrackEnabled: false,
          soundtrackMapping: {},
        },
      });

      io.to(socket.ctx.sessionId).emit("environment:changed", {
        timeOfDay: state.timeOfDay,
        weather: state.weather,
        weatherIntensity: state.weatherIntensity,
        visualOverlay: state.visualOverlay as any,
        mechanicalEffects: state.mechanicalEffects as any,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao alterar ambiente" } });
    }
  });

  socket.on("environment:set-time-flow", async (data, ack) => {
    if (!socket.ctx.sessionId || !["GM", "CO_GM"].includes(socket.ctx.role!)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Apenas GMs podem controlar o tempo" } });
    }

    try {
      const state = await prisma.environmentState.upsert({
        where: { sessionId: socket.ctx.sessionId },
        update: {
          timeFlowRate: data.rate,
          ...(data.startHour !== undefined ? { hourInGame: data.startHour } : {}),
        },
        create: {
          sessionId: socket.ctx.sessionId,
          timeOfDay: "DAY",
          hourInGame: data.startHour ?? 12,
          timeFlowRate: data.rate,
          weather: "CLEAR",
          weatherIntensity: 0.5,
          visualOverlay: {},
          mechanicalEffects: {},
          autoSoundtrackEnabled: false,
          soundtrackMapping: {},
        },
      });

      // Emit time tick with current state
      io.to(socket.ctx.sessionId).emit("environment:time-tick", {
        hourInGame: state.hourInGame,
        timeOfDay: state.timeOfDay,
        timeFlowRate: state.timeFlowRate,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao configurar fluxo de tempo" } });
    }
  });
}
