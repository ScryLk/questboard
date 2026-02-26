import type { PrismaClient } from "@questboard/db";
import type { UpdateEnvironmentInput, SetTimeFlowInput } from "@questboard/shared";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createEnvironmentService(prisma: PrismaClient) {
  return {
    async getState(sessionId: string) {
      let state = await prisma.environmentState.findUnique({
        where: { sessionId },
      });

      if (!state) {
        state = await prisma.environmentState.create({
          data: {
            sessionId,
            timeOfDay: "DAY",
            hourInGame: 12,
            timeFlowRate: 0,
            weather: "CLEAR",
            weatherIntensity: 0.5,
            visualOverlay: {
              tint: null,
              brightness: 1.0,
              saturation: 1.0,
              particles: null,
            },
            mechanicalEffects: {
              visionMultiplier: 1.0,
              movementMultiplier: 1.0,
              stealthAdvantage: false,
              rangedDisadvantage: false,
            },
            autoSoundtrackEnabled: false,
            soundtrackMapping: {},
          },
        });
      }

      return this.format(state);
    },

    async update(sessionId: string, role: string, input: UpdateEnvironmentInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem alterar o ambiente");
      }

      const data: any = {};
      if (input.timeOfDay !== undefined) data.timeOfDay = input.timeOfDay;
      if (input.hourInGame !== undefined) data.hourInGame = input.hourInGame;
      if (input.weather !== undefined) data.weather = input.weather;
      if (input.weatherIntensity !== undefined) data.weatherIntensity = input.weatherIntensity;
      if (input.visualOverlay !== undefined) data.visualOverlay = input.visualOverlay;
      if (input.mechanicalEffects !== undefined) data.mechanicalEffects = input.mechanicalEffects;
      if (input.autoSoundtrackEnabled !== undefined) data.autoSoundtrackEnabled = input.autoSoundtrackEnabled;
      if (input.soundtrackMapping !== undefined) data.soundtrackMapping = input.soundtrackMapping;

      // Upsert environment state
      const state = await prisma.environmentState.upsert({
        where: { sessionId },
        update: data,
        create: {
          sessionId,
          timeOfDay: input.timeOfDay ?? "DAY",
          hourInGame: input.hourInGame ?? 12,
          timeFlowRate: 0,
          weather: input.weather ?? "CLEAR",
          weatherIntensity: input.weatherIntensity ?? 0.5,
          visualOverlay: input.visualOverlay ?? {},
          mechanicalEffects: input.mechanicalEffects ?? {},
          autoSoundtrackEnabled: input.autoSoundtrackEnabled ?? false,
          soundtrackMapping: input.soundtrackMapping ?? {},
        },
      });

      return this.format(state);
    },

    async setTimeFlow(sessionId: string, role: string, input: SetTimeFlowInput) {
      if (!["GM", "CO_GM"].includes(role)) {
        throw new ForbiddenError("Apenas GMs podem controlar o tempo");
      }

      const state = await prisma.environmentState.upsert({
        where: { sessionId },
        update: {
          timeFlowRate: input.rate,
          hourInGame: input.startHour ?? undefined,
        },
        create: {
          sessionId,
          timeOfDay: "DAY",
          hourInGame: input.startHour ?? 12,
          timeFlowRate: input.rate,
          weather: "CLEAR",
          weatherIntensity: 0.5,
          visualOverlay: {},
          mechanicalEffects: {},
          autoSoundtrackEnabled: false,
          soundtrackMapping: {},
        },
      });

      return this.format(state);
    },

    format(state: any) {
      return {
        sessionId: state.sessionId,
        timeOfDay: state.timeOfDay,
        hourInGame: state.hourInGame,
        timeFlowRate: state.timeFlowRate,
        weather: state.weather,
        weatherIntensity: state.weatherIntensity,
        visualOverlay: state.visualOverlay ?? {},
        mechanicalEffects: state.mechanicalEffects ?? {},
        autoSoundtrackEnabled: state.autoSoundtrackEnabled,
        soundtrackMapping: state.soundtrackMapping ?? {},
        updatedAt: state.updatedAt.toISOString(),
      };
    },
  };
}
