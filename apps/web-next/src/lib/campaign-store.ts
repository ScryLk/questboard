"use client";

// Campaign store — frontend-only por enquanto. Mock + persistência no
// localStorage. Quando o backend de campaigns subir, substituir as
// operações por chamadas via api-client (manter assinaturas).

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CampaignDetailed,
  CampaignDraft,
  CampaignMember,
  CampaignMemberRole,
  CampaignStatus,
} from "@questboard/types";
import { JOIN_CODE_ALPHABET, JOIN_CODE_LENGTH } from "@questboard/constants";

// ── Helpers ──

function makeId(prefix = "camp"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function makeJoinCode(): string {
  let out = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    out += JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)];
  }
  return out;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function makeSlug(name: string): string {
  // Sufixo curto pra evitar colisão visual entre campanhas com o mesmo nome.
  const suffix = Math.random().toString(36).slice(2, 8);
  const base = slugify(name) || "campanha";
  return `${base}-${suffix}`;
}

// ── Mock seed ──

const NOW = new Date();
export const MOCK_OWNER_ID = "dev-user-default";
export const MOCK_OWNER_NAME = "Lucas (você)";

function ownerMember(at: Date): CampaignMember {
  return {
    userId: MOCK_OWNER_ID,
    displayName: MOCK_OWNER_NAME,
    avatarUrl: null,
    role: "GM",
    characterId: null,
    joinedAt: at,
    invitedBy: null,
  };
}

const STRAHD_CREATED = new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 30);
const TORMENTA_CREATED = new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 5);

const MOCK_CAMPAIGNS: CampaignDetailed[] = [
  {
    id: "camp_seed_strahd",
    ownerId: MOCK_OWNER_ID,
    name: "A Maldição de Strahd",
    slug: null,
    system: "dnd5e",
    visibility: "PRIVATE",
    joinCode: null,
    coverImageUrl: null,
    synopsis:
      "Um pesadelo gótico em Barovia. Os jogadores chegam à terra amaldiçoada do conde Strahd e precisam reunir os artefatos sagrados para enfrentá-lo.",
    tags: ["horror", "dark-fantasy", "investigacao"],
    language: "pt-BR",
    frequency: "WEEKLY",
    expectedLength: "LONG",
    ageRating: "T16",
    contentWarnings: ["horror", "death"],
    safetyTools: ["OPEN_DOOR", "X_CARD"],
    isSoloStory: false,
    externalChat: { discord: "https://discord.gg/strahd-mock" },
    publicPitch: null,
    status: "active",
    createdAt: STRAHD_CREATED,
    updatedAt: new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 2),
    archivedAt: null,
    memberCount: 4,
    sessionCount: 12,
    members: [
      ownerMember(STRAHD_CREATED),
      {
        userId: "u_ana",
        displayName: "Ana Carolina",
        avatarUrl: null,
        role: "CO_GM",
        characterId: null,
        joinedAt: new Date(STRAHD_CREATED.getTime() + 1000 * 60 * 60 * 24),
        invitedBy: MOCK_OWNER_ID,
      },
      {
        userId: "u_bia",
        displayName: "Beatriz Lima",
        avatarUrl: null,
        role: "PLAYER",
        characterId: null,
        joinedAt: new Date(STRAHD_CREATED.getTime() + 1000 * 60 * 60 * 24 * 2),
        invitedBy: MOCK_OWNER_ID,
      },
      {
        userId: "u_caio",
        displayName: "Caio Mendes",
        avatarUrl: null,
        role: "PLAYER",
        characterId: null,
        joinedAt: new Date(STRAHD_CREATED.getTime() + 1000 * 60 * 60 * 24 * 3),
        invitedBy: MOCK_OWNER_ID,
      },
    ],
  },
  {
    id: "camp_seed_tormenta_oneshot",
    ownerId: MOCK_OWNER_ID,
    name: "Os Caçadores de Lenore",
    slug: null,
    system: "tormenta20",
    visibility: "CODE",
    joinCode: "TRMN24XK",
    coverImageUrl: null,
    synopsis:
      "Um one-shot intenso na Vila de Lenore. Lobos rondam a floresta e algo pior dorme nas catacumbas.",
    tags: ["high-fantasy", "investigacao"],
    language: "pt-BR",
    frequency: "ONESHOT",
    expectedLength: "ONESHOT",
    ageRating: "T14",
    contentWarnings: [],
    safetyTools: ["OPEN_DOOR", "X_CARD"],
    isSoloStory: false,
    externalChat: null,
    publicPitch: null,
    status: "active",
    createdAt: TORMENTA_CREATED,
    updatedAt: new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 1),
    archivedAt: null,
    memberCount: 3,
    sessionCount: 1,
    members: [
      ownerMember(TORMENTA_CREATED),
      {
        userId: "u_dani",
        displayName: "Danielle Costa",
        avatarUrl: null,
        role: "PLAYER",
        characterId: null,
        joinedAt: new Date(TORMENTA_CREATED.getTime() + 1000 * 60 * 60 * 12),
        invitedBy: null, // entrou por código
      },
      {
        userId: "u_eduardo",
        displayName: "Eduardo Soares",
        avatarUrl: null,
        role: "PLAYER",
        characterId: null,
        joinedAt: new Date(TORMENTA_CREATED.getTime() + 1000 * 60 * 60 * 24),
        invitedBy: null,
      },
    ],
  },
];

// ── State ──

interface CampaignStoreState {
  campaigns: CampaignDetailed[];
  /** Id da campanha "ativa" (selecionada no contexto do dashboard).
   *  Persistida pra abrir nessa ao recarregar. */
  activeCampaignId: string | null;

  createCampaign: (draft: CampaignDraft, ownerId?: string) => CampaignDetailed;
  updateCampaign: (id: string, patch: Partial<CampaignDetailed>) => void;
  archiveCampaign: (id: string) => void;
  restoreCampaign: (id: string) => void;
  deleteCampaign: (id: string) => void;
  regenerateJoinCode: (id: string) => string | null;

  // Membros
  inviteMember: (
    campaignId: string,
    member: Omit<CampaignMember, "joinedAt" | "invitedBy">,
    invitedBy?: string,
  ) => void;
  removeMember: (campaignId: string, userId: string) => void;
  changeMemberRole: (
    campaignId: string,
    userId: string,
    role: CampaignMemberRole,
  ) => void;
  /** Sai da campanha (remove o próprio user do members). Owner não pode sair. */
  leaveCampaign: (campaignId: string, userId?: string) => void;

  setActiveCampaignId: (id: string | null) => void;

  getCampaignById: (id: string) => CampaignDetailed | undefined;
  getCampaignByCode: (code: string) => CampaignDetailed | undefined;
  getCampaignBySlug: (slug: string) => CampaignDetailed | undefined;
}

function patchCampaign(
  state: CampaignStoreState,
  id: string,
  fn: (c: CampaignDetailed) => CampaignDetailed,
): Partial<CampaignStoreState> {
  return {
    campaigns: state.campaigns.map((c) =>
      c.id === id ? { ...fn(c), updatedAt: new Date() } : c,
    ),
  };
}

export const useCampaignStore = create<CampaignStoreState>()(
  persist(
    (set, get) => ({
      campaigns: MOCK_CAMPAIGNS,
      activeCampaignId: null,

      createCampaign: (draft, ownerId = MOCK_OWNER_ID) => {
        const now = new Date();
        const visibility = draft.visibility;
        const joinCode =
          visibility === "CODE" || visibility === "PUBLIC"
            ? makeJoinCode()
            : null;
        const slug = visibility === "PUBLIC" ? makeSlug(draft.name) : null;

        const campaign: CampaignDetailed = {
          id: makeId(),
          ownerId,
          name: draft.name,
          slug,
          system: draft.system,
          visibility,
          joinCode,
          coverImageUrl: draft.coverImageUrl ?? null,
          synopsis: draft.synopsis ?? null,
          tags: draft.tags,
          language: draft.language,
          frequency: draft.frequency ?? null,
          expectedLength: draft.expectedLength ?? null,
          ageRating: draft.ageRating,
          contentWarnings: draft.contentWarnings,
          safetyTools: draft.safetyTools,
          isSoloStory: draft.isSoloStory,
          externalChat: draft.externalChat ?? null,
          publicPitch: draft.publicPitch ?? null,
          status: "active",
          createdAt: now,
          updatedAt: now,
          archivedAt: null,
          memberCount: 1,
          sessionCount: 0,
          members: [ownerMember(now)],
        };

        set((s) => ({ campaigns: [campaign, ...s.campaigns] }));
        return campaign;
      },

      updateCampaign: (id, patch) =>
        set((s) =>
          patchCampaign(s, id, (c) => ({ ...c, ...patch })),
        ),

      archiveCampaign: (id) =>
        set((s) =>
          patchCampaign(s, id, (c) => ({
            ...c,
            status: "archived" as CampaignStatus,
            archivedAt: new Date(),
          })),
        ),

      restoreCampaign: (id) =>
        // TODO(plan-limits): em backend, validar limite do plano antes de
        // permitir restaurar. Aqui só reativa.
        set((s) =>
          patchCampaign(s, id, (c) => ({
            ...c,
            status: "active" as CampaignStatus,
            archivedAt: null,
          })),
        ),

      deleteCampaign: (id) =>
        set((s) => ({
          campaigns: s.campaigns.filter((c) => c.id !== id),
          activeCampaignId:
            s.activeCampaignId === id ? null : s.activeCampaignId,
        })),

      regenerateJoinCode: (id) => {
        const c = get().campaigns.find((x) => x.id === id);
        if (!c) return null;
        if (c.visibility === "PRIVATE") return null;
        const code = makeJoinCode();
        set((s) =>
          patchCampaign(s, id, (cur) => ({ ...cur, joinCode: code })),
        );
        return code;
      },

      inviteMember: (campaignId, member, invitedBy = MOCK_OWNER_ID) =>
        set((s) =>
          patchCampaign(s, campaignId, (c) => {
            // Idempotente: ignora se userId já é membro.
            if (c.members.some((m) => m.userId === member.userId)) return c;
            const next: CampaignMember = {
              ...member,
              joinedAt: new Date(),
              invitedBy,
            };
            const members = [...c.members, next];
            return { ...c, members, memberCount: members.length };
          }),
        ),

      removeMember: (campaignId, userId) =>
        set((s) =>
          patchCampaign(s, campaignId, (c) => {
            // Owner não pode ser removido — backend recusará; frontend evita
            // estado inválido. Pra trocar de owner, usar fluxo dedicado (futuro).
            if (userId === c.ownerId) return c;
            const members = c.members.filter((m) => m.userId !== userId);
            return { ...c, members, memberCount: members.length };
          }),
        ),

      changeMemberRole: (campaignId, userId, role) =>
        set((s) =>
          patchCampaign(s, campaignId, (c) => {
            // Owner não muda role (sempre GM no mock; backend manterá ownership).
            if (userId === c.ownerId) return c;
            const members = c.members.map((m) =>
              m.userId === userId ? { ...m, role } : m,
            );
            return { ...c, members };
          }),
        ),

      leaveCampaign: (campaignId, userId = MOCK_OWNER_ID) =>
        set((s) =>
          patchCampaign(s, campaignId, (c) => {
            // Dono não pode sair sem transferir ownership — fluxo futuro.
            if (userId === c.ownerId) return c;
            const members = c.members.filter((m) => m.userId !== userId);
            return { ...c, members, memberCount: members.length };
          }),
        ),

      setActiveCampaignId: (id) => set({ activeCampaignId: id }),

      getCampaignById: (id) => get().campaigns.find((c) => c.id === id),

      getCampaignByCode: (code) =>
        get().campaigns.find(
          (c) => c.joinCode?.toUpperCase() === code.toUpperCase(),
        ),

      getCampaignBySlug: (slug) =>
        get().campaigns.find((c) => c.slug === slug),
    }),
    {
      name: "questboard-campaigns",
      version: 2,
      // v1 → v2: adiciona `members: []` em campanhas persistidas que não
      // tinham o campo. Zustand persist exige `migrate` explícito quando
      // a versão sobe.
      migrate: (persisted: unknown, version: number) => {
        if (
          !persisted ||
          typeof persisted !== "object" ||
          !("campaigns" in persisted)
        ) {
          return persisted as CampaignStoreState;
        }
        const state = persisted as { campaigns?: unknown[] } & Record<
          string,
          unknown
        >;
        if (version < 2 && Array.isArray(state.campaigns)) {
          state.campaigns = state.campaigns.map((c) => {
            const camp = c as Record<string, unknown>;
            return camp.members ? camp : { ...camp, members: [] };
          });
        }
        return state as unknown as CampaignStoreState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Rehydrate Date fields. Members já existem após migrate.
        state.campaigns = state.campaigns.map((c) => {
          const members = (c.members ?? []).map((m) => ({
            ...m,
            joinedAt: new Date(m.joinedAt),
          }));
          return {
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
            archivedAt: c.archivedAt ? new Date(c.archivedAt) : null,
            members,
            memberCount:
              members.length > 0 ? members.length : c.memberCount,
          };
        });
      },
    },
  ),
);
