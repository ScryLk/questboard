import type { PrismaClient, Prisma } from "@questboard/db";
import type { ContextualDiceRollInput } from "@questboard/shared";
import { roll } from "@questboard/game-engine";
import type { FormulaContext } from "@questboard/game-engine";
import { resolveDiceNotation } from "@questboard/game-engine";
import { NotFoundError, ForbiddenError } from "../../errors/app-error.js";

export function createCharacterDiceService(prisma: PrismaClient) {
  return {
    async rollContextual(sessionId: string, userId: string, input: ContextualDiceRollInput) {
      // Load character if provided
      let characterName: string | null = null;
      let resolvedNotation = input.notation;

      if (input.characterId) {
        const character = await prisma.character.findUnique({
          where: { id: input.characterId },
          include: { template: true },
        });
        if (!character) throw new NotFoundError("Personagem");
        if (character.userId !== userId) throw new ForbiddenError("Não é dono deste personagem");

        characterName = character.name;

        // Resolve field references in notation
        const charData = (character.data as Record<string, unknown>) || {};
        const ctx: FormulaContext = {
          data: charData,
          level: character.level,
          experience: character.experience,
        };
        resolvedNotation = resolveDiceNotation(input.notation, ctx);
      }

      // Roll the dice
      const result = roll(resolvedNotation);

      // Get display name
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true },
      });

      // Save to database
      const diceRoll = await prisma.characterDiceRoll.create({
        data: {
          sessionId,
          userId,
          characterId: input.characterId || null,
          notation: resolvedNotation,
          label: input.label,
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
          rollType: input.rollType as any ?? "MANUAL",
          rollContext: input.context ? (input.context as Prisma.InputJsonValue) : undefined,
          visibility: input.visibility as any ?? "PUBLIC",
          whisperTo: input.whisperTo ?? [],
        },
      });

      return {
        ...diceRoll,
        characterName,
        displayName: user?.displayName ?? "Unknown",
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
      };
    },

    async getSessionRolls(
      sessionId: string,
      options?: {
        characterId?: string;
        rollType?: string;
        limit?: number;
        offset?: number;
      }
    ) {
      const where: Prisma.CharacterDiceRollWhereInput = { sessionId };
      if (options?.characterId) where.characterId = options.characterId;
      if (options?.rollType) where.rollType = options.rollType as any;

      const [rolls, total] = await Promise.all([
        prisma.characterDiceRoll.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: options?.limit ?? 50,
          skip: options?.offset ?? 0,
          include: {
            character: { select: { name: true } },
          },
        }),
        prisma.characterDiceRoll.count({ where }),
      ]);

      return { rolls, total };
    },
  };
}
