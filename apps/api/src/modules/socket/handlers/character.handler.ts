import type { PrismaClient, Prisma } from "@questboard/db";
import type { TypedIO, TypedSocket } from "../socket.gateway.js";
import {
  evaluateFormula,
  computeAllFields,
  getDependents,
  setNestedValue,
  resolveDiceNotation,
  roll,
  applyShortRest,
  applyLongRest,
} from "@questboard/game-engine";
import type { TemplateSchema, FormulaContext, RestConfig } from "@questboard/game-engine";

export function registerCharacterHandlers(io: TypedIO, socket: TypedSocket, prisma: PrismaClient) {

  // ── character:update-field ──
  socket.on("character:update-field", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    try {
      const character = await prisma.character.findUnique({
        where: { id: data.characterId },
        include: { template: true },
      });

      if (!character) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Personagem não encontrado" } });
      }

      if (character.userId !== socket.ctx.userId) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Não é dono deste personagem" } });
      }

      const charData = (character.data as Record<string, unknown>) || {};
      const formulas = (character.template.formulas as Record<string, string>) || {};
      const schema = character.template.schema as unknown as TemplateSchema;

      // Apply field change
      setNestedValue(charData, data.fieldPath, data.value);

      // Compute dependents
      const dependents = getDependents(data.fieldPath, formulas, schema);
      const ctx: FormulaContext = { data: charData, level: character.level, experience: character.experience };
      const computedChanges: Record<string, unknown> = {};

      for (const depPath of dependents) {
        const formula = formulas[depPath];
        if (formula) {
          const computed = evaluateFormula(formula, ctx);
          setNestedValue(charData, depPath, computed);
          computedChanges[depPath] = computed;
        }
      }

      // Persist
      await prisma.character.update({
        where: { id: data.characterId },
        data: { data: charData as Prisma.InputJsonValue },
      });

      // Broadcast to session
      io.to(socket.ctx.sessionId).emit("character:updated", {
        characterId: data.characterId,
        userId: socket.ctx.userId,
        changes: { [data.fieldPath]: data.value },
        computedChanges: Object.keys(computedChanges).length > 0 ? computedChanges : undefined,
      });

      // HP sync to token
      if (data.fieldPath.startsWith("hp.")) {
        const hp = charData["hp"] as Record<string, unknown> | undefined;
        if (hp) {
          await syncHpToTokens(prisma, io, socket.ctx.sessionId, data.characterId, {
            current: (hp["current"] as number) || 0,
            max: (hp["max"] as number) || 0,
            temp: (hp["temp"] as number) || 0,
          });
        }
      }

      ack({ success: true, data: { computedChanges } });
    } catch (error) {
      console.error("character:update-field error:", error);
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao atualizar campo" } });
    }
  });

  // ── character:roll-dice ──
  socket.on("character:roll-dice", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    try {
      const character = await prisma.character.findUnique({
        where: { id: data.characterId },
        include: { template: true },
      });

      if (!character) {
        return ack({ success: false, error: { code: "NOT_FOUND", message: "Personagem não encontrado" } });
      }
      if (character.userId !== socket.ctx.userId) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Não é dono deste personagem" } });
      }

      // Resolve field references in notation
      const charData = (character.data as Record<string, unknown>) || {};
      const ctx: FormulaContext = { data: charData, level: character.level, experience: character.experience };
      const resolvedNotation = resolveDiceNotation(data.notation, ctx);

      // Roll
      const result = roll(resolvedNotation);

      // Get user display name
      const user = await prisma.user.findUnique({
        where: { id: socket.ctx.userId },
        select: { displayName: true },
      });

      // Save to DB
      const diceRoll = await prisma.characterDiceRoll.create({
        data: {
          sessionId: socket.ctx.sessionId,
          userId: socket.ctx.userId,
          characterId: data.characterId,
          notation: resolvedNotation,
          label: data.label,
          results: {
            terms: result.terms.map((t) => ({
              count: t.count,
              sides: t.sides,
              rolls: t.rolls,
              kept: t.kept,
              subtotal: t.subtotal,
            })),
            flatBonus: result.flatBonus,
            total: result.total,
          } as Prisma.InputJsonValue,
          rollType: data.rollType as any,
          visibility: data.visibility as any,
          whisperTo: data.whisperTo ?? [],
        },
      });

      const rollDTO = {
        id: diceRoll.id,
        sessionId: socket.ctx.sessionId,
        userId: socket.ctx.userId,
        characterId: data.characterId,
        characterName: character.name,
        displayName: user?.displayName ?? "Unknown",
        notation: resolvedNotation,
        label: data.label ?? null,
        results: {
          terms: result.terms.map((t) => ({
            count: t.count,
            sides: t.sides,
            rolls: t.rolls,
            kept: t.kept,
            subtotal: t.subtotal,
          })),
          flatBonus: result.flatBonus,
          total: result.total,
        },
        rollType: data.rollType,
        rollContext: null,
        visibility: data.visibility,
        whisperTo: data.whisperTo ?? [],
        createdAt: diceRoll.createdAt.toISOString(),
      };

      // Broadcast based on visibility
      switch (data.visibility) {
        case "PUBLIC":
          io.to(socket.ctx.sessionId).emit("dice:character-result", rollDTO as any);
          break;
        case "GM_ONLY": {
          const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
          for (const s of sockets) {
            const sCtx = (s as any).ctx;
            if (sCtx && (["GM", "CO_GM"].includes(sCtx.role) || sCtx.userId === socket.ctx.userId)) {
              s.emit("dice:character-result", rollDTO as any);
            }
          }
          break;
        }
        case "WHISPER": {
          const targetIds = new Set([socket.ctx.userId, ...(data.whisperTo ?? [])]);
          const sockets = await io.in(socket.ctx.sessionId).fetchSockets();
          for (const s of sockets) {
            const sCtx = (s as any).ctx;
            if (sCtx && (targetIds.has(sCtx.userId) || ["GM", "CO_GM"].includes(sCtx.role))) {
              s.emit("dice:character-result", rollDTO as any);
            }
          }
          break;
        }
        case "SELF":
          socket.emit("dice:character-result", rollDTO as any);
          break;
      }

      // Check for follow-up dice action
      const diceActions = (character.template.diceActions as unknown as Array<{
        id: string;
        followUp?: { condition: string; label: string; notation: string; rollType: string };
      }>) || [];

      const action = diceActions.find((a) => a.id === data.actionId);
      if (action?.followUp) {
        const { condition, label, notation, rollType } = action.followUp;
        // Simple condition check: "hit" means total >= some threshold
        let shouldFollowUp = false;
        if (condition === "hit" && result.total >= 0) {
          shouldFollowUp = true; // Client determines if hit actually lands
        } else if (condition === "always") {
          shouldFollowUp = true;
        }

        if (shouldFollowUp) {
          socket.emit("dice:follow-up-prompt", {
            originalRollId: diceRoll.id,
            label,
            notation,
            rollType: rollType as any,
            characterId: data.characterId,
          });
        }
      }

      ack({ success: true, data: rollDTO as any });
    } catch (error) {
      console.error("character:roll-dice error:", error);
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao rolar dados" } });
    }
  });

  // ── character:use-resource ──
  socket.on("character:use-resource", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    try {
      const character = await prisma.character.findUnique({
        where: { id: data.characterId },
      });

      if (!character || character.userId !== socket.ctx.userId) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
      }

      const charData = (character.data as Record<string, unknown>) || {};
      const parts = data.resourcePath.split(".");
      let current: unknown = charData;
      for (let i = 0; i < parts.length - 1; i++) {
        current = (current as Record<string, unknown>)?.[parts[i]!];
      }
      const lastKey = parts[parts.length - 1]!;
      const currentValue = (current as Record<string, unknown>)?.[lastKey];

      if (typeof currentValue === "number") {
        const newValue = currentValue - data.amount;
        if (newValue < 0) {
          return ack({ success: false, error: { code: "INSUFFICIENT", message: "Recurso insuficiente" } });
        }
        setNestedValue(charData, data.resourcePath, newValue);
      }

      await prisma.character.update({
        where: { id: data.characterId },
        data: { data: charData as Prisma.InputJsonValue },
      });

      io.to(socket.ctx.sessionId).emit("character:updated", {
        characterId: data.characterId,
        userId: socket.ctx.userId,
        changes: { [data.resourcePath]: (currentValue as number) - data.amount },
      });

      ack({ success: true });
    } catch (error) {
      console.error("character:use-resource error:", error);
      ack({ success: false, error: { code: "INTERNAL", message: "Erro ao usar recurso" } });
    }
  });

  // ── character:short-rest ──
  socket.on("character:short-rest", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    try {
      const character = await prisma.character.findUnique({
        where: { id: data.characterId },
        include: { template: true },
      });

      if (!character || character.userId !== socket.ctx.userId) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
      }

      const charData = (character.data as Record<string, unknown>) || {};
      const settings = (character.template.settings as Record<string, unknown>) || {};
      const hp = (charData["hp"] as Record<string, unknown>) || { current: 0, max: 0 };
      const hitDice = (charData["hitDice"] as Record<string, unknown>) || { current: character.level, max: character.level };

      const config: RestConfig = {
        type: "short",
        hitDie: (settings["hitDie"] as number) || 8,
        maxHitDice: character.level,
        currentHitDice: (hitDice["current"] as number) || character.level,
        currentHp: (hp["current"] as number) || 0,
        maxHp: (hp["max"] as number) || 0,
        constitutionModifier: (charData["abilities.constitution.modifier"] as number) || 0,
      };

      const result = applyShortRest(config, data.hitDiceToSpend);

      // Apply changes
      const newCurrentHp = Math.min(config.maxHp, config.currentHp + result.hpRestored);
      setNestedValue(charData, "hp.current", newCurrentHp);
      setNestedValue(charData, "hitDice.current", config.currentHitDice - result.hitDiceUsed);

      await prisma.character.update({
        where: { id: data.characterId },
        data: { data: charData as Prisma.InputJsonValue },
      });

      io.to(socket.ctx.sessionId).emit("character:rest-completed", {
        characterId: data.characterId,
        userId: socket.ctx.userId,
        result,
      });

      // Sync HP to token
      await syncHpToTokens(prisma, io, socket.ctx.sessionId, data.characterId, {
        current: newCurrentHp,
        max: config.maxHp,
      });

      ack({ success: true, data: result });
    } catch (error) {
      console.error("character:short-rest error:", error);
      ack({ success: false, error: { code: "INTERNAL", message: "Erro no descanso curto" } });
    }
  });

  // ── character:long-rest ──
  socket.on("character:long-rest", async (data, ack) => {
    if (!socket.ctx.sessionId) {
      return ack({ success: false, error: { code: "NOT_IN_SESSION", message: "Não está em uma sessão" } });
    }

    try {
      const character = await prisma.character.findUnique({
        where: { id: data.characterId },
        include: { template: true },
      });

      if (!character || character.userId !== socket.ctx.userId) {
        return ack({ success: false, error: { code: "FORBIDDEN", message: "Sem permissão" } });
      }

      const charData = (character.data as Record<string, unknown>) || {};
      const settings = (character.template.settings as Record<string, unknown>) || {};
      const hp = (charData["hp"] as Record<string, unknown>) || { current: 0, max: 0 };

      const config: RestConfig = {
        type: "long",
        hitDie: (settings["hitDie"] as number) || 8,
        maxHitDice: character.level,
        currentHitDice: (charData["hitDice.current"] as number) || character.level,
        currentHp: (hp["current"] as number) || 0,
        maxHp: (hp["max"] as number) || 0,
        constitutionModifier: 0,
      };

      const result = applyLongRest(config);

      // Full HP recovery
      setNestedValue(charData, "hp.current", config.maxHp);
      // Recover hit dice
      const hitDiceRecovered = Math.max(1, Math.floor(character.level / 2));
      const currentHitDice = (charData["hitDice.current"] as number) || 0;
      setNestedValue(charData, "hitDice.current", Math.min(character.level, currentHitDice + hitDiceRecovered));
      // Reset death saves
      setNestedValue(charData, "deathSaves.successes", 0);
      setNestedValue(charData, "deathSaves.failures", 0);

      await prisma.character.update({
        where: { id: data.characterId },
        data: { data: charData as Prisma.InputJsonValue },
      });

      io.to(socket.ctx.sessionId).emit("character:rest-completed", {
        characterId: data.characterId,
        userId: socket.ctx.userId,
        result,
      });

      // Sync HP to token
      await syncHpToTokens(prisma, io, socket.ctx.sessionId, data.characterId, {
        current: config.maxHp,
        max: config.maxHp,
      });

      ack({ success: true, data: result });
    } catch (error) {
      console.error("character:long-rest error:", error);
      ack({ success: false, error: { code: "INTERNAL", message: "Erro no descanso longo" } });
    }
  });
}

// ── HP Sync Helper ──

async function syncHpToTokens(
  prisma: PrismaClient,
  io: TypedIO,
  sessionId: string,
  characterId: string,
  hp: { current: number; max: number; temp?: number }
) {
  const tokens = await prisma.token.findMany({
    where: { characterId },
  });

  for (const token of tokens) {
    await prisma.token.update({
      where: { id: token.id },
      data: { hp: { current: hp.current, max: hp.max, temp: hp.temp ?? 0 } as Prisma.InputJsonValue },
    });

    io.to(sessionId).emit("character:hp-synced", {
      characterId,
      tokenId: token.id,
      hp,
    });
  }
}
