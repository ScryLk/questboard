// ── HTTP API: campanhas ──
//
// Espelha apps/api/src/modules/campaign/campaign.routes.ts. Faz a
// ponte entre o shape do Prisma (canonical) e o `CampaignDetailed` que
// a UI consome.
//
// Campos ricos (visibility, ageRating, frequency, safetyTools, etc.)
// vivem em `Campaign.settings` (Json) — evita migration de 12+ colunas
// e mantém forward-compat: campos podem ser promovidos pra coluna real
// quando precisarmos indexar/filtrar.

import { apiRequest } from "./api-client";
import type {
  AgeRating,
  CampaignDetailed,
  CampaignFrequency,
  CampaignLength,
  CampaignMember,
  CampaignMemberRole,
  CampaignStatus,
  CampaignVisibility,
  SafetyTool,
} from "@questboard/types";

// ── DTOs do backend (espelham Prisma) ──

interface BackendUserBrief {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface BackendMemberDto {
  id: string;
  userId: string;
  role: CampaignMemberRole;
  joinedAt: string;
  leftAt: string | null;
  user?: BackendUserBrief;
}

export interface BackendCampaignDto {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  system: string;
  bannerUrl: string | null;
  coverUrl: string | null;
  code: string;
  isPublic: boolean;
  maxPlayers: number;
  tags: string[];
  settings: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  owner?: BackendUserBrief;
  members?: BackendMemberDto[];
  _count?: { members: number; sessions: number };
}

// ── Helpers ──

function asStringArray(v: unknown, fallback: string[] = []): string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string")
    ? (v as string[])
    : fallback;
}

function asString<T extends string>(
  v: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v)
    ? (v as T)
    : fallback;
}

const VISIBILITIES = ["PRIVATE", "CODE", "PUBLIC"] as const;
const FREQUENCIES = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "IRREGULAR",
  "ONESHOT",
] as const;
const LENGTHS = ["ONESHOT", "SHORT_ARC", "LONG", "INDEFINITE"] as const;
const AGE_RATINGS = ["ALL_AGES", "T14", "T16", "T18"] as const;
const SAFETY = ["OPEN_DOOR", "X_CARD", "LINES_AND_VEILS"] as const;

function mapMember(m: BackendMemberDto): CampaignMember {
  return {
    userId: m.userId,
    displayName: m.user?.displayName ?? m.userId,
    avatarUrl: m.user?.avatarUrl ?? null,
    role: m.role,
    characterId: null,
    joinedAt: new Date(m.joinedAt),
    invitedBy: null,
  };
}

/** Mapeia o DTO canônico do backend pra `CampaignDetailed` da UI. */
export function backendToDetailed(dto: BackendCampaignDto): CampaignDetailed {
  const s = (dto.settings ?? {}) as Record<string, unknown>;

  // Visibility: prefere settings.visibility; fallback derivado de isPublic.
  const visibility: CampaignVisibility = asString(
    s.visibility,
    VISIBILITIES,
    dto.isPublic ? "PUBLIC" : "PRIVATE",
  );

  const archivedAtRaw = s.archivedAt;
  const archivedAt =
    typeof archivedAtRaw === "string" ? new Date(archivedAtRaw) : null;
  const status: CampaignStatus = archivedAt ? "archived" : "active";

  const externalChatRaw = s.externalChat;
  const externalChat =
    externalChatRaw && typeof externalChatRaw === "object"
      ? (externalChatRaw as { discord?: string; whatsapp?: string })
      : null;

  return {
    id: dto.id,
    ownerId: dto.ownerId,
    name: dto.name,
    slug: typeof s.slug === "string" ? s.slug : null,
    system: dto.system,
    visibility,
    joinCode: visibility === "PRIVATE" ? null : dto.code,
    coverImageUrl: dto.coverUrl,
    synopsis: dto.description,
    tags: dto.tags ?? [],
    language: typeof s.language === "string" ? s.language : "pt-BR",
    frequency: asString(s.frequency, FREQUENCIES, "WEEKLY") as CampaignFrequency,
    expectedLength: asString(
      s.expectedLength,
      LENGTHS,
      "INDEFINITE",
    ) as CampaignLength,
    ageRating: asString(s.ageRating, AGE_RATINGS, "ALL_AGES") as AgeRating,
    contentWarnings: asStringArray(s.contentWarnings),
    safetyTools: asStringArray(s.safetyTools).filter((x): x is SafetyTool =>
      (SAFETY as readonly string[]).includes(x),
    ),
    isSoloStory: typeof s.isSoloStory === "boolean" ? s.isSoloStory : false,
    externalChat,
    publicPitch: typeof s.publicPitch === "string" ? s.publicPitch : null,
    status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    archivedAt,
    memberCount: dto._count?.members ?? dto.members?.length ?? 0,
    sessionCount: dto._count?.sessions ?? 0,
    members: (dto.members ?? []).map(mapMember),
  };
}

/** Constrói o payload de criação a partir do `CampaignDraft` da UI.
 *  Empacota fields ricos em `settings` JSON; canônicos viram colunas. */
export function detailedToCreatePayload(d: CampaignDetailed): {
  name: string;
  description?: string;
  system: string;
  isPublic: boolean;
  maxPlayers: number;
  coverUrl: string | null;
  tags: string[];
  settings: Record<string, unknown>;
} {
  return {
    name: d.name,
    description: d.synopsis ?? undefined,
    system: d.system,
    isPublic: d.visibility === "PUBLIC",
    maxPlayers: 5,
    coverUrl: d.coverImageUrl,
    tags: d.tags,
    settings: {
      visibility: d.visibility,
      slug: d.slug,
      language: d.language,
      frequency: d.frequency,
      expectedLength: d.expectedLength,
      ageRating: d.ageRating,
      contentWarnings: d.contentWarnings,
      safetyTools: d.safetyTools,
      isSoloStory: d.isSoloStory,
      externalChat: d.externalChat,
      publicPitch: d.publicPitch,
      archivedAt: d.archivedAt ? d.archivedAt.toISOString() : null,
    },
  };
}

// ── Operações REST ──

export async function listCampaigns(): Promise<CampaignDetailed[]> {
  const dtos = await apiRequest<BackendCampaignDto[]>(`/campaigns`);
  return dtos.map(backendToDetailed);
}

export async function getCampaign(id: string): Promise<CampaignDetailed> {
  const dto = await apiRequest<BackendCampaignDto>(`/campaigns/${id}`);
  return backendToDetailed(dto);
}

export async function createCampaign(
  draft: CampaignDetailed,
): Promise<CampaignDetailed> {
  const dto = await apiRequest<BackendCampaignDto>(`/campaigns`, {
    method: "POST",
    body: detailedToCreatePayload(draft),
  });
  return backendToDetailed(dto);
}

/** Atualiza campos canônicos + faz merge no `settings`. O backend hoje
 *  substitui `settings` por completo — então mandamos o JSON inteiro
 *  já mesclado. */
export async function updateCampaign(
  current: CampaignDetailed,
  patch: Partial<CampaignDetailed>,
): Promise<CampaignDetailed> {
  const merged: CampaignDetailed = { ...current, ...patch };
  const payload = detailedToCreatePayload(merged);
  const dto = await apiRequest<BackendCampaignDto>(`/campaigns/${current.id}`, {
    method: "PATCH",
    body: payload,
  });
  return backendToDetailed(dto);
}

export async function deleteCampaign(id: string): Promise<void> {
  await apiRequest<void>(`/campaigns/${id}`, { method: "DELETE" });
}

export async function joinCampaignByCode(code: string): Promise<void> {
  await apiRequest<unknown>(`/campaigns/join`, {
    method: "POST",
    body: { code },
  });
}

export async function removeMember(
  campaignId: string,
  userId: string,
): Promise<void> {
  await apiRequest<void>(`/campaigns/${campaignId}/members/${userId}`, {
    method: "DELETE",
  });
}

export async function updateMemberRole(
  campaignId: string,
  userId: string,
  role: CampaignMemberRole,
): Promise<CampaignMember> {
  const dto = await apiRequest<BackendMemberDto>(
    `/campaigns/${campaignId}/members/${userId}`,
    { method: "PATCH", body: { role } },
  );
  return mapMember(dto);
}
