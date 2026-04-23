import { Prisma } from "@prisma/client";
import type { CampaignRole } from "@prisma/client";

export type Role = CampaignRole;

export function isGM(role: Role): boolean {
  return role === "GM" || role === "CO_GM";
}

/**
 * Filtros SQL por tipo. Cada função recebe o role do usuário na campanha
 * e retorna um Prisma.Sql que se concatena no WHERE da query principal.
 *
 * Os aliases assumidos pelas queries do search.service:
 *   - Map      → m
 *   - Character→ c
 *   - Note     → n
 *   - Session  → s
 *
 * NOTE v1: para PLAYER, mapas filtram apenas por visibility=PUBLIC. A regra
 * "ou já revelado no fog da sessão ativa" fica como TODO — exige conhecer
 * a sessão ativa e consultar o estado de fog; alto custo para v1.
 */

export function mapPermissionFilter(role: Role): Prisma.Sql {
  if (isGM(role)) return Prisma.sql`TRUE`;
  return Prisma.sql`m."visibility" = 'PUBLIC'`;
}

export function characterPermissionFilter(role: Role, userId: string): Prisma.Sql {
  if (isGM(role)) return Prisma.sql`TRUE`;
  return Prisma.sql`(c."hidden" = FALSE OR c."userId" = ${userId})`;
}

export function notePermissionFilter(role: Role, userId: string): Prisma.Sql {
  if (isGM(role)) return Prisma.sql`TRUE`;
  return Prisma.sql`(n."visibility" = 'PUBLIC' OR n."authorId" = ${userId})`;
}

export function sessionPermissionFilter(role: Role, userId: string): Prisma.Sql {
  if (isGM(role)) return Prisma.sql`TRUE`;
  return Prisma.sql`EXISTS (
    SELECT 1 FROM "SessionPlayer" sp
    WHERE sp."sessionId" = s."id" AND sp."userId" = ${userId}
  )`;
}
