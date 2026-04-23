import type { FastifyRequest, FastifyReply } from "fastify";
import { createHash } from "node:crypto";
import { createSuccessResponse, searchRequestSchema } from "@questboard/shared";
import type { SearchType } from "@questboard/shared";
import type { SearchService } from "./search.service.js";
import { redis } from "../../lib/redis.js";
import { BadRequestError } from "../../errors/app-error.js";

const CACHE_TTL_SECONDS = 30;
const ALL_TYPES: SearchType[] = ["map", "character", "note", "session"];

function parseTypes(raw: unknown): SearchType[] {
  if (raw == null) return ALL_TYPES;
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  const cleaned = list
    .map((t) => String(t).trim().toLowerCase())
    .filter((t): t is SearchType => (ALL_TYPES as string[]).includes(t));
  return cleaned.length > 0 ? cleaned : ALL_TYPES;
}

function cacheKey(campaignId: string, userId: string, q: string, types: SearchType[]): string {
  const norm = `${q.trim().toLowerCase()}|${[...types].sort().join(",")}`;
  const hash = createHash("sha1").update(norm).digest("hex");
  return `search:${campaignId}:${userId}:${hash}`;
}

export function createSearchController(searchService: SearchService) {
  return {
    async search(
      request: FastifyRequest<{
        Params: { campaignId: string };
        Querystring: { q?: string; types?: string | string[]; limit?: string };
      }>,
      reply: FastifyReply,
    ) {
      const { campaignId } = request.params;
      const { q, types: rawTypes, limit: rawLimit } = request.query;

      const parsed = searchRequestSchema.safeParse({
        q: q ?? "",
        types: parseTypes(rawTypes),
        limit: rawLimit ? Number(rawLimit) : undefined,
      });

      if (!parsed.success) {
        const first = parsed.error.errors[0];
        throw new BadRequestError(first?.message ?? "Parâmetros inválidos.");
      }

      const userId = request.user.id;
      const key = cacheKey(campaignId, userId, parsed.data.q, parsed.data.types);

      try {
        const cached = await redis.get(key);
        if (cached) {
          const payload = JSON.parse(cached);
          return reply.header("x-cache", "HIT").send(createSuccessResponse(payload));
        }
      } catch {
        // Cache miss não bloqueia a busca.
      }

      const result = await searchService.search(campaignId, userId, parsed.data);

      try {
        await redis.set(key, JSON.stringify(result), "EX", CACHE_TTL_SECONDS);
      } catch {
        // Falha de cache é silenciosa — não impede resposta.
      }

      return reply.header("x-cache", "MISS").send(createSuccessResponse(result));
    },
  };
}
