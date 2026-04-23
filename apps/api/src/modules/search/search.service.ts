import type { PrismaClient, CampaignRole } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { SearchResultItem, SearchResponse, SearchType } from "@questboard/shared";
import { ForbiddenError } from "../../errors/app-error.js";
import {
  mapPermissionFilter,
  characterPermissionFilter,
  notePermissionFilter,
  sessionPermissionFilter,
} from "./search.permissions.js";

interface SearchParams {
  q: string;
  types: SearchType[];
  limit: number;
}

interface MapRow {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  score: number;
}

interface CharacterRow {
  id: string;
  name: string;
  avatarUrl: string | null;
  ownerName: string;
  klass: string | null;
  level: number;
  score: number;
}

interface NoteRow {
  id: string;
  title: string;
  content: string;
  category: string;
  score: number;
}

interface SessionRow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  scheduledAt: Date | null;
  score: number;
}

function snippet(text: string | null | undefined, max = 80): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function createSearchService(prisma: PrismaClient) {
  async function getRole(campaignId: string, userId: string): Promise<CampaignRole> {
    const member = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
      select: { role: true, leftAt: true },
    });
    if (!member || member.leftAt) {
      throw new ForbiddenError("Sem acesso a esta campanha.");
    }
    return member.role;
  }

  async function searchMaps(
    campaignId: string,
    role: CampaignRole,
    q: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const perm = mapPermissionFilter(role);
    const prefix = `${q}%`;
    const rows = await prisma.$queryRaw<MapRow[]>(Prisma.sql`
      SELECT
        m.id,
        m.name,
        m.description,
        m."thumbnailUrl",
        (
          (
            ts_rank_cd(m.search_vector, plainto_tsquery('portuguese', immutable_unaccent(${q}))) * 0.7
            + COALESCE(similarity(m.name, ${q}), 0) * 0.3
          )
          * CASE WHEN m.name ILIKE ${prefix} THEN 1.5 ELSE 1.0 END
          * (1.0 + 1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - m."updatedAt")) / 86400.0))
        )::float AS score
      FROM "Map" m
      JOIN "Session" s ON s.id = m."sessionId"
      WHERE s."campaignId" = ${campaignId}
        AND m."deletedAt" IS NULL
        AND s."deletedAt" IS NULL
        AND ${perm}
        AND (
          m.search_vector @@ plainto_tsquery('portuguese', immutable_unaccent(${q}))
          OR m.name % ${q}
        )
      ORDER BY score DESC
      LIMIT ${limit}
    `);

    return rows.map((r) => ({
      id: r.id,
      type: "map" as const,
      title: r.name,
      subtitle: snippet(r.description),
      thumbnail: r.thumbnailUrl ?? undefined,
      url: `/maps/editor?id=${r.id}`,
      score: r.score,
    }));
  }

  async function searchCharacters(
    campaignId: string,
    userId: string,
    role: CampaignRole,
    q: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const perm = characterPermissionFilter(role, userId);
    const prefix = `${q}%`;
    const rows = await prisma.$queryRaw<CharacterRow[]>(Prisma.sql`
      SELECT
        c.id,
        c.name,
        c."avatarUrl",
        u."displayName" AS "ownerName",
        c.class AS klass,
        c.level,
        (
          (
            ts_rank_cd(c.search_vector, plainto_tsquery('portuguese', immutable_unaccent(${q}))) * 0.7
            + COALESCE(similarity(c.name, ${q}), 0) * 0.3
          )
          * CASE WHEN c.name ILIKE ${prefix} THEN 1.5 ELSE 1.0 END
          * (1.0 + 1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - c."updatedAt")) / 86400.0))
        )::float AS score
      FROM "Character" c
      JOIN "User" u ON u.id = c."userId"
      WHERE c."campaignId" = ${campaignId}
        AND c."deletedAt" IS NULL
        AND ${perm}
        AND (
          c.search_vector @@ plainto_tsquery('portuguese', immutable_unaccent(${q}))
          OR c.name % ${q}
        )
      ORDER BY score DESC
      LIMIT ${limit}
    `);

    return rows.map((r) => {
      const klassPart = r.klass ? `${r.klass} nv. ${r.level}` : `Nv. ${r.level}`;
      return {
        id: r.id,
        type: "character" as const,
        title: r.name,
        subtitle: `${klassPart} · ${r.ownerName}`,
        thumbnail: r.avatarUrl ?? undefined,
        url: `/characters/${r.id}`,
        score: r.score,
      };
    });
  }

  async function searchNotes(
    campaignId: string,
    userId: string,
    role: CampaignRole,
    q: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const perm = notePermissionFilter(role, userId);
    const prefix = `${q}%`;
    const rows = await prisma.$queryRaw<NoteRow[]>(Prisma.sql`
      SELECT
        n.id,
        n.title,
        n.content,
        n.category::text AS category,
        (
          (
            ts_rank_cd(n.search_vector, plainto_tsquery('portuguese', immutable_unaccent(${q}))) * 0.7
            + COALESCE(similarity(n.title, ${q}), 0) * 0.3
          )
          * CASE WHEN n.title ILIKE ${prefix} THEN 1.5 ELSE 1.0 END
          * (1.0 + 1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - n."updatedAt")) / 86400.0))
        )::float AS score
      FROM "Note" n
      WHERE n."campaignId" = ${campaignId}
        AND n."deletedAt" IS NULL
        AND ${perm}
        AND (
          n.search_vector @@ plainto_tsquery('portuguese', immutable_unaccent(${q}))
          OR n.title % ${q}
        )
      ORDER BY score DESC
      LIMIT ${limit}
    `);

    return rows.map((r) => ({
      id: r.id,
      type: "note" as const,
      title: r.title,
      subtitle: snippet(r.content),
      url: `/notes#${r.id}`,
      score: r.score,
    }));
  }

  async function searchSessions(
    campaignId: string,
    userId: string,
    role: CampaignRole,
    q: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const perm = sessionPermissionFilter(role, userId);
    const prefix = `${q}%`;
    const rows = await prisma.$queryRaw<SessionRow[]>(Prisma.sql`
      SELECT
        s.id,
        s.name,
        s.description,
        s.status::text AS status,
        s."scheduledAt",
        (
          (
            ts_rank_cd(s.search_vector, plainto_tsquery('portuguese', immutable_unaccent(${q}))) * 0.7
            + COALESCE(similarity(s.name, ${q}), 0) * 0.3
          )
          * CASE WHEN s.name ILIKE ${prefix} THEN 1.5 ELSE 1.0 END
          * (1.0 + 1.0 / (1.0 + EXTRACT(EPOCH FROM (NOW() - s."updatedAt")) / 86400.0))
        )::float AS score
      FROM "Session" s
      WHERE s."campaignId" = ${campaignId}
        AND s."deletedAt" IS NULL
        AND ${perm}
        AND (
          s.search_vector @@ plainto_tsquery('portuguese', immutable_unaccent(${q}))
          OR s.name % ${q}
        )
      ORDER BY score DESC
      LIMIT ${limit}
    `);

    const dateFmt = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return rows.map((r) => {
      const statusLabel = (
        {
          IDLE: "Aguardando",
          LOBBY: "No lobby",
          LIVE: "Ao vivo",
          PAUSED: "Pausada",
          ENDED: "Encerrada",
          CANCELLED: "Cancelada",
        } as Record<string, string>
      )[r.status] ?? r.status;
      const datePart = r.scheduledAt ? ` · ${dateFmt.format(r.scheduledAt)}` : "";
      return {
        id: r.id,
        type: "session" as const,
        title: r.name,
        subtitle: `${statusLabel}${datePart}`,
        url: `/gameplay/${r.id}`,
        score: r.score,
      };
    });
  }

  return {
    async search(
      campaignId: string,
      userId: string,
      params: SearchParams,
    ): Promise<SearchResponse> {
      const start = Date.now();
      const role = await getRole(campaignId, userId);

      const want = (t: SearchType) => params.types.includes(t);

      const [maps, characters, notes, sessions] = await Promise.all([
        want("map") ? searchMaps(campaignId, role, params.q, params.limit) : Promise.resolve<SearchResultItem[]>([]),
        want("character")
          ? searchCharacters(campaignId, userId, role, params.q, params.limit)
          : Promise.resolve<SearchResultItem[]>([]),
        want("note")
          ? searchNotes(campaignId, userId, role, params.q, params.limit)
          : Promise.resolve<SearchResultItem[]>([]),
        want("session")
          ? searchSessions(campaignId, userId, role, params.q, params.limit)
          : Promise.resolve<SearchResultItem[]>([]),
      ]);

      const totalCount = maps.length + characters.length + notes.length + sessions.length;

      return {
        query: params.q,
        results: { maps, characters, notes, sessions },
        totalCount,
        tookMs: Date.now() - start,
      };
    },
  };
}

export type SearchService = ReturnType<typeof createSearchService>;
