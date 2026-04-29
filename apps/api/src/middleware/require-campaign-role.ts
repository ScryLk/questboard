// ── Middleware: papel do usuário na campanha ─────────────────
//
// Análogo ao `requireSessionRole` mas escopado em Campaign. Resolve
// o role do user (`OWNER` titular, ou `CampaignMember.role`) e
// bloqueia se não estiver na lista permitida. Anexa
// `request.campaignRole` pra handlers ramificarem lógica.

import type {
  FastifyRequest,
  FastifyReply,
  preHandlerAsyncHookHandler,
} from "fastify";
import { prisma } from "@questboard/db";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error.js";

/** Espelha enum CampaignRole do schema + OWNER. OWNER é virtual:
 *  user que é dono titular da campanha (Campaign.ownerId), sempre
 *  prevalece sobre membership explícita. */
export type CampaignRole = "OWNER" | "CO_GM" | "PLAYER" | "SPECTATOR";

declare module "fastify" {
  interface FastifyRequest {
    campaignRole?: CampaignRole;
    campaignId?: string;
  }
}

function extractCampaignId(request: FastifyRequest): string | undefined {
  const params = (request.params ?? {}) as Record<string, unknown>;
  if (typeof params.campaignId === "string") return params.campaignId;
  if (typeof params.id === "string") return params.id;
  const body = (request.body ?? {}) as Record<string, unknown>;
  if (typeof body.campaignId === "string") return body.campaignId;
  return undefined;
}

export async function resolveCampaignRole(
  campaignId: string,
  userId: string,
): Promise<CampaignRole | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { ownerId: true },
  });
  if (!campaign) return null;
  if (campaign.ownerId === userId) return "OWNER";

  const member = await prisma.campaignMember.findFirst({
    where: { campaignId, userId, leftAt: null },
    select: { role: true },
  });
  if (!member) return null;
  // Mapping: schema usa GM | CO_GM | PLAYER | SPECTATOR. Tratamos
  // GM como OWNER (não há GM titular além do ownerId, mas o enum
  // permite — defensivo).
  if (member.role === "GM") return "OWNER";
  return member.role as CampaignRole;
}

export function requireCampaignRole(
  roles: CampaignRole[],
): preHandlerAsyncHookHandler {
  if (roles.length === 0) {
    throw new Error("requireCampaignRole: lista de roles não pode ser vazia");
  }
  return async function check(
    request: FastifyRequest,
    _reply: FastifyReply,
  ) {
    const campaignId = extractCampaignId(request);
    if (!campaignId) {
      throw new BadRequestError(
        "Identificador da campanha ausente na requisição.",
      );
    }
    const role = await resolveCampaignRole(campaignId, request.user.id);
    if (role === null) {
      throw new NotFoundError("Campanha");
    }
    if (!roles.includes(role)) {
      throw new ForbiddenError(
        `Ação requer papel ${roles.join(" ou ")} na campanha (atual: ${role}).`,
      );
    }
    request.campaignRole = role;
    request.campaignId = campaignId;
  };
}

/** OWNER ou CO_GM — quem pode editar conteúdo da campanha. */
export const requireCampaignGm = requireCampaignRole(["OWNER", "CO_GM"]);

/** Qualquer membro (inclui SPECTATOR) — visualização. */
export const requireCampaignMember = requireCampaignRole([
  "OWNER",
  "CO_GM",
  "PLAYER",
  "SPECTATOR",
]);

/** Resolve campaignId via lookup numa tabela secundária (Note,
 *  WorldEntity). `lookup` recebe o id do params e devolve o
 *  campaignId associado, ou null se não existir. */
export function requireCampaignRoleViaResource(
  paramName: string,
  lookup: (resourceId: string) => Promise<string | null>,
  roles: CampaignRole[],
): preHandlerAsyncHookHandler {
  if (roles.length === 0) {
    throw new Error(
      "requireCampaignRoleViaResource: lista de roles não pode ser vazia",
    );
  }
  return async function check(
    request: FastifyRequest,
    _reply: FastifyReply,
  ) {
    const params = (request.params ?? {}) as Record<string, unknown>;
    const resourceId = params[paramName];
    if (typeof resourceId !== "string") {
      throw new BadRequestError(`Parâmetro \`${paramName}\` ausente.`);
    }
    const campaignId = await lookup(resourceId);
    if (!campaignId) {
      throw new NotFoundError("Recurso");
    }
    const role = await resolveCampaignRole(campaignId, request.user.id);
    if (role === null) {
      throw new NotFoundError("Recurso");
    }
    if (!roles.includes(role)) {
      throw new ForbiddenError(
        `Ação requer papel ${roles.join(" ou ")} na campanha (atual: ${role}).`,
      );
    }
    request.campaignRole = role;
    request.campaignId = campaignId;
  };
}
