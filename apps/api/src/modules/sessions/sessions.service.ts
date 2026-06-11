import type { PrismaClient } from "@questboard/db";
import { randomInt } from "node:crypto";
import type { CreateSessionInput, UpdateSessionInput } from "./sessions.schema.js";
import { NotFoundError, BadRequestError } from "../../errors/app-error.js";
import { redis } from "../../lib/redis.js";
import {
  emitSessionStatusChanged,
  emitSessionSettingsUpdated,
  emitSessionPlayerJoined,
  emitTokenAdded,
  emitTokenUpdated,
  emitPlayerForceResync,
  emitMissionContextUpdated,
} from "../../lib/socket-events.js";
import { invalidateCampaignDashboardCache } from "../campaign/dashboard.service.js";

// Sem ambíguos (0/O, 1/I) pra facilitar leitura humana de invite code.
const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateShortCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(0, INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

export function createSessionsService(prisma: PrismaClient) {
  return {
    async list(userId: string) {
      const sessions = await prisma.session.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { players: { some: { userId } } },
          ],
        },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true } },
          _count: { select: { players: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
      return sessions;
    },

    async getById(sessionId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true } },
          players: {
            include: {
              user: { select: { id: true, displayName: true, avatarUrl: true } },
              character: { select: { id: true, name: true } },
            },
          },
        },
      });
      if (!session) throw new NotFoundError("Session");
      return session;
    },

    async create(userId: string, input: CreateSessionInput) {
      const created = await prisma.session.create({
        data: {
          ...input,
          ownerId: userId,
          gmId: userId,
          inviteCode: generateShortCode(),
          players: {
            create: {
              userId,
              role: "GM",
            },
          },
        },
      });

      // Mapa default — toda sessão precisa de pelo menos um mapa pra
      // colocar tokens quando players entrarem. GM customiza depois.
      await prisma.map.create({
        data: {
          sessionId: created.id,
          creatorId: userId,
          name: "Mesa principal",
          width: 1280,
          height: 1280,
          gridType: "SQUARE",
          gridSize: 64,
          gridCols: 20,
          gridRows: 20,
          isActive: true,
        },
      });

      // Próxima sessão / contadores no dashboard mudaram.
      if (created.campaignId) {
        void invalidateCampaignDashboardCache(created.campaignId);
      }

      return created;
    },

    async findByCode(inviteCode: string) {
      const session = await prisma.session.findUnique({
        where: { inviteCode },
        include: {
          owner: { select: { id: true, displayName: true, avatarUrl: true } },
          _count: { select: { players: true } },
        },
      });
      if (!session) throw new NotFoundError("Session");
      return session;
    },

    // Permissão (`requireGmOwner`) já validada no router. Service
    // foca em regras de negócio.
    async update(sessionId: string, userId: string, input: UpdateSessionInput) {
      const updated = await prisma.session.update({
        where: { id: sessionId },
        data: input,
      });
      emitSessionSettingsUpdated({
        sessionId,
        settings: input as Record<string, unknown>,
        by: userId,
        at: updated.updatedAt.toISOString(),
      });
      return updated;
    },

    async delete(sessionId: string, _userId: string) {
      return prisma.session.delete({ where: { id: sessionId } });
    },

    /** Briefing/contexto da missão. Escrita restrita a GM/CO_GM (router
     *  valida via `requireGmOwner`). Texto é mesclado em
     *  `Session.settings.missionContext` pra não pisar nas outras
     *  chaves de settings (`activeMedia` já vive lá, futuras chaves
     *  idem). Broadcast via socket pra players verem em tempo real. */
    async setMissionContext(
      sessionId: string,
      userId: string,
      content: string,
    ) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { settings: true },
      });
      if (!session) throw new NotFoundError("Session");

      const current =
        (session.settings as Record<string, unknown> | null) ?? {};
      const nextSettings = { ...current, missionContext: content };

      const updated = await prisma.session.update({
        where: { id: sessionId },
        data: { settings: nextSettings },
        select: { updatedAt: true },
      });

      emitMissionContextUpdated({
        sessionId,
        content,
        by: userId,
        at: updated.updatedAt.toISOString(),
      });

      return { content, updatedAt: updated.updatedAt.toISOString() };
    },

    async getMissionContext(sessionId: string) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { settings: true },
      });
      if (!session) throw new NotFoundError("Session");
      const settings =
        (session.settings as Record<string, unknown> | null) ?? {};
      const raw = settings.missionContext;
      return { content: typeof raw === "string" ? raw : "" };
    },

    async join(
      inviteCode: string,
      userId: string,
      opts: { characterId?: string } = {},
    ) {
      const session = await prisma.session.findUnique({
        where: { inviteCode },
        select: { id: true, maxPlayers: true, _count: { select: { players: true } } },
      });
      if (!session) throw new NotFoundError("Session");

      // Valida que o character (se passado) pertence ao usuário.
      let character: { id: string; name: string; avatarUrl: string | null } | null = null;
      if (opts.characterId) {
        const c = await prisma.character.findFirst({
          where: { id: opts.characterId, userId, deletedAt: null },
          select: { id: true, name: true, avatarUrl: true },
        });
        if (c) character = c;
      }

      const existing = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId, sessionId: session.id } },
      });

      // ── Upsert path: já é membro ─────────────────────────────
      // Em vez de 409 estéril, reaproveita a entrada e garante que
      // characterId/Token estão atualizados. Cobre o caso comum:
      // player entrou antes do feature flag, agora vem com char.
      if (existing) {
        if (character && existing.characterId !== character.id) {
          await prisma.sessionPlayer.update({
            where: { id: existing.id },
            data: { characterId: character.id },
          });
        }
        await ensurePlayerToken(prisma, session.id, userId, character);
        const refreshed = await prisma.sessionPlayer.findUnique({
          where: { id: existing.id },
          include: {
            user: { select: { id: true, displayName: true, avatarUrl: true } },
          },
        });
        return refreshed ?? existing;
      }

      // ── Primeira entrada ─────────────────────────────────────
      if (session._count.players >= session.maxPlayers) {
        throw new BadRequestError("Sessão cheia");
      }

      const created = await prisma.sessionPlayer.create({
        data: {
          userId,
          sessionId: session.id,
          role: "PLAYER",
          characterId: character?.id,
        },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      });

      emitSessionPlayerJoined({
        sessionId: session.id,
        player: {
          userId: created.userId,
          role: created.role,
          user: created.user,
        },
      });

      await ensurePlayerToken(prisma, session.id, userId, character);

      return created;
    },

    async leave(sessionId: string, userId: string) {
      // Middleware já confirmou que user é participante. Bloqueio
      // específico de GM titular fica aqui (regra de negócio).
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { ownerId: true },
      });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId === userId) {
        throw new BadRequestError("O GM não pode sair da própria sessão");
      }

      return prisma.sessionPlayer.delete({
        where: { userId_sessionId: { userId, sessionId } },
      });
    },

    // ─── State Transitions ────────────────────────────
    // Permissão GM (`requireGmOwner`) validada nos routes. Service
    // valida apenas transições de estado válidas.
    async start(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { status: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.status !== "IDLE" && session.status !== "PAUSED") {
        throw new BadRequestError(`Não pode iniciar sessão com status ${session.status}`);
      }

      const updated = await prisma.session.update({
        where: { id: sessionId },
        data: { status: "LIVE", startedAt: new Date() },
      });

      await redis.hset(`session:${sessionId}:state`, { status: "LIVE", startedAt: Date.now().toString() });
      await this.logAudit(sessionId, userId, "session:started", {});
      emitSessionStatusChanged({
        sessionId,
        status: "LIVE",
        by: userId,
        at: updated.updatedAt.toISOString(),
      });

      return updated;
    },

    async end(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { status: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.status !== "LIVE" && session.status !== "PAUSED") {
        throw new BadRequestError(`Não pode encerrar sessão com status ${session.status}`);
      }

      const updated = await prisma.session.update({
        where: { id: sessionId },
        data: { status: "ENDED", endedAt: new Date() },
      });

      // Cleanup Redis state
      const keys = await redis.keys(`session:${sessionId}:*`);
      if (keys.length > 0) await redis.del(...keys);

      // Dashboard cache stale — total/duração/sessões recentes mudaram.
      if (updated.campaignId) {
        void invalidateCampaignDashboardCache(updated.campaignId);
      }

      await this.logAudit(sessionId, userId, "session:ended", {});
      emitSessionStatusChanged({
        sessionId,
        status: "ENDED",
        by: userId,
        at: updated.updatedAt.toISOString(),
      });
      return updated;
    },

    async pause(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { status: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.status !== "LIVE") throw new BadRequestError("Sessão não está LIVE");

      const updated = await prisma.session.update({ where: { id: sessionId }, data: { status: "PAUSED" } });
      await redis.hset(`session:${sessionId}:state`, "status", "PAUSED");
      await this.logAudit(sessionId, userId, "session:paused", {});
      emitSessionStatusChanged({
        sessionId,
        status: "PAUSED",
        by: userId,
        at: updated.updatedAt.toISOString(),
      });
      return updated;
    },

    async resume(sessionId: string, userId: string) {
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { status: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.status !== "PAUSED") throw new BadRequestError("Sessão não está pausada");

      const updated = await prisma.session.update({ where: { id: sessionId }, data: { status: "LIVE" } });
      await redis.hset(`session:${sessionId}:state`, "status", "LIVE");
      await this.logAudit(sessionId, userId, "session:resumed", {});
      emitSessionStatusChanged({
        sessionId,
        status: "LIVE",
        by: userId,
        at: updated.updatedAt.toISOString(),
      });
      return updated;
    },

    // ─── Players ─────────────────────────────────────
    async listPlayers(sessionId: string) {
      return prisma.sessionPlayer.findMany({
        where: { sessionId },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          character: { select: { id: true, name: true, avatarUrl: true } },
        },
      });
    },

    async kick(sessionId: string, userId: string, targetUserId: string) {
      // Permissão GM/CO_GM validada no router (`requireGm`).
      const session = await prisma.session.findUnique({ where: { id: sessionId }, select: { ownerId: true } });
      if (!session) throw new NotFoundError("Session");
      if (session.ownerId === targetUserId) throw new BadRequestError("O GM não pode se expulsar");

      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
      });
      if (!player) throw new NotFoundError("SessionPlayer");

      await prisma.sessionPlayer.update({ where: { id: player.id }, data: { leftAt: new Date() } });
      await this.logAudit(sessionId, userId, "player:kicked", { targetUserId });
    },

    // Lista personagens do jogador-alvo pro GM atribuir um sem precisar
    // pedir pro player refazer o join. Permissão GM/CO_GM no router.
    async listPlayerAvailableCharacters(
      sessionId: string,
      targetUserId: string,
    ) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
        select: { characterId: true },
      });
      if (!player) throw new NotFoundError("SessionPlayer");

      const characters = await prisma.character.findMany({
        where: { userId: targetUserId, deletedAt: null },
        select: { id: true, name: true, avatarUrl: true, system: true, level: true },
        orderBy: { updatedAt: "desc" },
      });
      return { currentCharacterId: player.characterId, characters };
    },

    // Atribui personagem do próprio jogador-alvo ao SessionPlayer dele.
    // Cria/garante o Token na mapa ativa e dispara force-resync pro
    // player recarregar. Resolve o caso "Sem personagem atribuído".
    async assignPlayerCharacter(
      sessionId: string,
      requesterId: string,
      targetUserId: string,
      characterId: string,
    ) {
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
      });
      if (!player) throw new NotFoundError("SessionPlayer");

      const character = await prisma.character.findFirst({
        where: { id: characterId, userId: targetUserId, deletedAt: null },
        select: { id: true, name: true, avatarUrl: true },
      });
      if (!character) {
        throw new BadRequestError(
          "Personagem não pertence ao jogador-alvo ou foi removido",
        );
      }

      const updated = await prisma.sessionPlayer.update({
        where: { id: player.id },
        data: { characterId: character.id },
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
          character: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      await ensurePlayerToken(prisma, sessionId, targetUserId, character);

      await this.logAudit(sessionId, requesterId, "player:character-assigned", {
        targetUserId,
        characterId: character.id,
      });

      emitPlayerForceResync({
        sessionId,
        targetUserId,
        by: requesterId,
        at: new Date().toISOString(),
      });

      return updated;
    },

    async updatePlayerRole(sessionId: string, _userId: string, targetUserId: string, role: string) {
      // Permissão GM titular validada no router (`requireGmOwner`).
      const player = await prisma.sessionPlayer.findUnique({
        where: { userId_sessionId: { userId: targetUserId, sessionId } },
      });
      if (!player) throw new NotFoundError("SessionPlayer");

      return prisma.sessionPlayer.update({
        where: { id: player.id },
        data: { role: role as "GM" | "CO_GM" | "PLAYER" | "SPECTATOR" },
      });
    },

    // ─── Audit Log ───────────────────────────────────
    async logAudit(sessionId: string, actorId: string | null, event: string, data: Record<string, unknown>) {
      return prisma.sessionAuditLog.create({
        data: {
          sessionId,
          actorId,
          event,
          data: data as unknown as object,
        },
      });
    },

    async getAuditLog(sessionId: string, _userId: string, limit = 50) {
      // Permissão GM/CO_GM validada no router (`requireGm`).
      return prisma.sessionAuditLog.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    },

    // ─── Phases ──────────────────────────────────────
    async listPhases(sessionId: string) {
      return prisma.phaseEvent.findMany({
        where: { sessionId },
        orderBy: { startedAt: "desc" },
      });
    },

    async createPhase(sessionId: string, _userId: string, input: { type: string; label: string; notes?: string }) {
      // Permissão GM/CO_GM validada no router (`requireGm`).
      // End current active phase
      const activePhase = await prisma.phaseEvent.findFirst({
        where: { sessionId, endedAt: null },
        orderBy: { startedAt: "desc" },
      });
      if (activePhase) {
        const duration = Math.round((Date.now() - activePhase.startedAt.getTime()) / 60000);
        await prisma.phaseEvent.update({
          where: { id: activePhase.id },
          data: { endedAt: new Date(), durationMin: duration },
        });
      }

      return prisma.phaseEvent.create({
        data: {
          sessionId,
          type: input.type as "EXPLORATION" | "COMBAT" | "ROLEPLAY" | "INVESTIGATION" | "TRAVEL" | "REST_SHORT" | "REST_LONG" | "NARRATION",
          label: input.label,
          notes: input.notes,
          startedAt: new Date(),
        },
      });
    },

    async listPublic(page: number, pageSize: number) {
      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where: { isPublic: true, status: { in: ["IDLE", "LIVE"] } },
          include: {
            owner: { select: { id: true, displayName: true, avatarUrl: true } },
            _count: { select: { players: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.session.count({
          where: { isPublic: true, status: { in: ["IDLE", "LIVE"] } },
        }),
      ]);

      return {
        sessions,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    },
  };
}

export type SessionsService = ReturnType<typeof createSessionsService>;

/** HP mínimo de fallback quando o Character não tem `resources.hp`/
 *  `resources.maxHp` setado. Evita que o player joine com token 0/0
 *  e fique impossível de jogar (regra: jogadores nunca são bloqueados,
 *  CLAUDE.md §1). */
const FALLBACK_TOKEN_HP = 10;

/** Wrapper que busca o Character via SessionPlayer e chama
 *  ensurePlayerToken. Pra ser usado em pontos que não têm o character
 *  carregado em memória — ex: socket `session:join` no reconnect. */
export async function syncPlayerTokenOnConnect(
  prisma: PrismaClient,
  sessionId: string,
  userId: string,
): Promise<void> {
  const sp = await prisma.sessionPlayer.findUnique({
    where: { userId_sessionId: { userId, sessionId } },
    select: {
      character: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
  if (!sp?.character) return;
  await ensurePlayerToken(prisma, sessionId, userId, sp.character);
}

function extractHpFromResources(resources: unknown): {
  currentHp: number;
  maxHp: number;
} {
  if (resources && typeof resources === "object") {
    const r = resources as Record<string, unknown>;
    // Aceita vários layouts comuns (D&D 5e: hp/maxHp; cosmic horror:
    // hitPoints/hitPointsMax). Pegamos o primeiro positivo encontrado.
    const maxCandidates = [r.maxHp, r.hpMax, r.hitPointsMax, r.maxHitPoints];
    const curCandidates = [r.hp, r.currentHp, r.hpCurrent, r.hitPoints];
    const maxHp =
      maxCandidates.find((v) => typeof v === "number" && v > 0) ?? null;
    const currentHp =
      curCandidates.find((v) => typeof v === "number" && v > 0) ?? maxHp;
    if (typeof maxHp === "number") {
      return {
        maxHp,
        currentHp: typeof currentHp === "number" ? currentHp : maxHp,
      };
    }
  }
  return { currentHp: FALLBACK_TOKEN_HP, maxHp: FALLBACK_TOKEN_HP };
}

/** Garante que o player tem 1 Token na mapa ativa. Idempotente —
 *  se já existe (mesmo char ou outro), só backfila HP se estiver
 *  null/0 (cobre tokens criados antes do fix de HP).
 *
 *  Exportado pra ser chamado também no socket `session:join` —
 *  reconnects não passam pelo endpoint REST de join, então sem isso
 *  tokens antigos com HP nulo nunca seriam corrigidos. */
export async function ensurePlayerToken(
  prisma: PrismaClient,
  sessionId: string,
  userId: string,
  character: { id: string; name: string; avatarUrl: string | null } | null,
): Promise<void> {
  if (!character) return;
  const activeMap = await prisma.map.findFirst({
    where: { sessionId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!activeMap) return;

  // HP vem das resources do Character (sistemas guardam em layouts
  // diferentes — D&D em `hp`/`maxHp`, cosmic horror em `hitPoints*`).
  const fullCharacter = await prisma.character.findUnique({
    where: { id: character.id },
    select: { resources: true },
  });
  const hp = extractHpFromResources(fullCharacter?.resources);

  // Já tem um Token desse owner nesse map? Backfila HP se 0/null,
  // mantém o resto. Cobre tokens criados antes desse fix.
  const existingToken = await prisma.token.findFirst({
    where: { mapId: activeMap.id, ownerId: userId },
    select: { id: true, currentHp: true, maxHp: true },
  });
  if (existingToken) {
    const needsBackfill =
      (existingToken.maxHp ?? 0) <= 0 || (existingToken.currentHp ?? 0) <= 0;
    if (needsBackfill) {
      await prisma.token.update({
        where: { id: existingToken.id },
        data: { currentHp: hp.currentHp, maxHp: hp.maxHp },
      });
      emitTokenUpdated({
        sessionId,
        tokenId: existingToken.id,
        changes: { currentHp: hp.currentHp, maxHp: hp.maxHp },
      });
    }
    return;
  }

  const initials = character.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const token = await prisma.token.create({
    data: {
      mapId: activeMap.id,
      characterId: character.id,
      ownerId: userId,
      label: character.name,
      initials,
      imageUrl: character.avatarUrl,
      x: 0,
      y: 0,
      size: 1,
      currentHp: hp.currentHp,
      maxHp: hp.maxHp,
    },
  });
  emitTokenAdded({
    sessionId,
    token: {
      id: token.id,
      mapId: token.mapId,
      characterId: token.characterId,
      ownerId: token.ownerId,
      label: token.label,
      initials: token.initials,
      imageUrl: token.imageUrl,
      color: token.color,
      x: token.x,
      y: token.y,
      size: token.size,
    },
  });
}
