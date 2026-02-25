import type { PrismaClient, Prisma } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";
import { checkPermission } from "@questboard/shared";
import type { PlayerRole, InitiativeEntry } from "@questboard/shared";

export function registerCombatHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {
  function generateEntryId() {
    return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  socket.on("combat:start", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("combat:start", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      const sessionId = socket.ctx.sessionId;

      const sorted = data.entries
        .map((e) => ({ ...e, id: generateEntryId(), conditions: e.conditions ?? [], isVisible: e.isVisible ?? true, isDelayed: false, dexModifier: e.dexModifier ?? 0 }))
        .sort((a, b) => b.initiative - a.initiative || (b.dexModifier ?? 0) - (a.dexModifier ?? 0));

      const stateData = {
        sessionId,
        isActive: true,
        round: 1,
        turnIndex: 0,
        initiativeOrder: sorted as unknown as Prisma.InputJsonValue,
        combatLog: [] as unknown as Prisma.InputJsonValue,
      };

      const existing = await prisma.combatState.findUnique({ where: { sessionId } });
      const combatState = existing
        ? await prisma.combatState.update({ where: { sessionId }, data: stateData })
        : await prisma.combatState.create({ data: stateData });

      io.to(sessionId).emit("combat:started", {
        combatState: {
          id: combatState.id,
          sessionId: combatState.sessionId,
          isActive: combatState.isActive,
          round: combatState.round,
          turnIndex: combatState.turnIndex,
          initiativeOrder: combatState.initiativeOrder as any,
          combatLog: combatState.combatLog as any,
        },
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao iniciar combate" } });
    }
  });

  socket.on("combat:end", async (ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("combat:end", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      const sessionId = socket.ctx.sessionId;
      const state = await prisma.combatState.findUnique({ where: { sessionId } });

      if (!state?.isActive) {
        return ack({ success: false, error: { code: "CONFLICT", message: "Nenhum combate ativo" } });
      }

      await prisma.combatState.update({
        where: { sessionId },
        data: { isActive: false },
      });

      io.to(sessionId).emit("combat:ended", {
        rounds: state.round,
        duration: 0,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao encerrar combate" } });
    }
  });

  socket.on("combat:next-turn", async (ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("combat:next-turn", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      const sessionId = socket.ctx.sessionId;
      const state = await prisma.combatState.findUnique({ where: { sessionId } });

      if (!state?.isActive) {
        return ack({ success: false, error: { code: "CONFLICT", message: "Nenhum combate ativo" } });
      }

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

      io.to(sessionId).emit("combat:turn-changed", {
        round: nextRound,
        turnIndex: nextTurn,
        currentActor: order[nextTurn],
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao avançar turno" } });
    }
  });

  socket.on("combat:prev-turn", async (ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("combat:next-turn", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      const sessionId = socket.ctx.sessionId;
      const state = await prisma.combatState.findUnique({ where: { sessionId } });

      if (!state?.isActive) {
        return ack({ success: false, error: { code: "CONFLICT", message: "Nenhum combate ativo" } });
      }

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

      io.to(sessionId).emit("combat:turn-changed", {
        round: prevRound,
        turnIndex: prevTurn,
        currentActor: order[prevTurn],
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao voltar turno" } });
    }
  });

  socket.on("combat:update-hp", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    try {
      const sessionId = socket.ctx.sessionId;
      const state = await prisma.combatState.findUnique({ where: { sessionId } });

      if (!state?.isActive) {
        return ack({ success: false, error: { code: "CONFLICT", message: "Nenhum combate ativo" } });
      }

      const order = state.initiativeOrder as unknown as InitiativeEntry[];
      const entry = order.find((e) => e.id === data.entryId);

      if (!entry) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Entrada não encontrada" } });
      }

      // Check permission: own HP or GM/CO_GM
      const isOwn = entry.userId === socket.ctx.userId;
      const canUpdateAny = checkPermission("combat:update-any-hp", socket.ctx.role as PlayerRole);
      const canUpdateOwn = checkPermission("combat:update-own-hp", socket.ctx.role as PlayerRole);

      if (!isOwn && !canUpdateAny) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
      }
      if (isOwn && !canUpdateOwn && !canUpdateAny) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
      }

      entry.hp.current = Math.max(0, Math.min(entry.hp.max, entry.hp.current + data.delta));

      await prisma.combatState.update({
        where: { sessionId },
        data: { initiativeOrder: order as unknown as Prisma.InputJsonValue },
      });

      io.to(sessionId).emit("combat:hp-changed", {
        entryId: data.entryId,
        hp: entry.hp,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao atualizar HP" } });
    }
  });

  socket.on("combat:add-entry", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("combat:add-npc", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      const sessionId = socket.ctx.sessionId;
      const state = await prisma.combatState.findUnique({ where: { sessionId } });

      if (!state?.isActive) {
        return ack({ success: false, error: { code: "CONFLICT", message: "Nenhum combate ativo" } });
      }

      const order = state.initiativeOrder as unknown as InitiativeEntry[];
      const newEntry = {
        ...data,
        id: generateEntryId(),
        conditions: data.conditions ?? [],
        isVisible: data.isVisible ?? true,
        isDelayed: false,
        dexModifier: data.dexModifier ?? 0,
        userId: data.userId ?? null,
        characterId: data.characterId ?? null,
        color: data.color ?? null,
      };

      order.push(newEntry as InitiativeEntry);
      order.sort((a, b) => b.initiative - a.initiative || (b.dexModifier ?? 0) - (a.dexModifier ?? 0));

      await prisma.combatState.update({
        where: { sessionId },
        data: { initiativeOrder: order as unknown as Prisma.InputJsonValue },
      });

      io.to(sessionId).emit("combat:initiative-updated", { order });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao adicionar entrada" } });
    }
  });

  socket.on("combat:remove-entry", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("combat:add-npc", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      const sessionId = socket.ctx.sessionId;
      const state = await prisma.combatState.findUnique({ where: { sessionId } });

      if (!state?.isActive) {
        return ack({ success: false, error: { code: "CONFLICT", message: "Nenhum combate ativo" } });
      }

      const order = (state.initiativeOrder as unknown as InitiativeEntry[]).filter(
        (e) => e.id !== data.entryId
      );

      let turnIndex = state.turnIndex;
      if (turnIndex >= order.length) turnIndex = 0;

      await prisma.combatState.update({
        where: { sessionId },
        data: {
          initiativeOrder: order as unknown as Prisma.InputJsonValue,
          turnIndex,
        },
      });

      io.to(sessionId).emit("combat:initiative-updated", { order });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao remover entrada" } });
    }
  });

  socket.on("combat:set-condition", async (data, ack) => {
    if (!socket.ctx.sessionId || !socket.ctx.role) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    if (!checkPermission("combat:update-any-hp", socket.ctx.role as PlayerRole)) {
      return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
    }

    try {
      const sessionId = socket.ctx.sessionId;
      const state = await prisma.combatState.findUnique({ where: { sessionId } });

      if (!state?.isActive) {
        return ack({ success: false, error: { code: "CONFLICT", message: "Nenhum combate ativo" } });
      }

      const order = state.initiativeOrder as unknown as InitiativeEntry[];
      const entry = order.find((e) => e.id === data.entryId);

      if (!entry) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Entrada não encontrada" } });
      }

      entry.conditions = data.conditions;

      await prisma.combatState.update({
        where: { sessionId },
        data: { initiativeOrder: order as unknown as Prisma.InputJsonValue },
      });

      io.to(sessionId).emit("combat:condition-changed", {
        entryId: data.entryId,
        conditions: data.conditions,
      });

      ack({ success: true });
    } catch {
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao definir condição" } });
    }
  });
}
