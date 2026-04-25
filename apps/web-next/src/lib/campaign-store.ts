"use client";

// Campaign store — frontend-only por enquanto. Mock + persistência no
// localStorage. Quando o backend de campaigns subir, substituir as
// operações por chamadas via api-client (manter assinaturas).

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CampaignDetailed,
  CampaignDraft,
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
const MOCK_OWNER_ID = "dev-user-default";

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
    createdAt: new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 30),
    updatedAt: new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 2),
    archivedAt: null,
    memberCount: 4,
    sessionCount: 12,
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
    createdAt: new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(NOW.getTime() - 1000 * 60 * 60 * 24 * 1),
    archivedAt: null,
    memberCount: 3,
    sessionCount: 1,
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

  setActiveCampaignId: (id: string | null) => void;

  getCampaignById: (id: string) => CampaignDetailed | undefined;
  getCampaignByCode: (code: string) => CampaignDetailed | undefined;
  getCampaignBySlug: (slug: string) => CampaignDetailed | undefined;
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
          memberCount: 1, // só o owner inicialmente
          sessionCount: 0,
        };

        set((s) => ({ campaigns: [campaign, ...s.campaigns] }));
        return campaign;
      },

      updateCampaign: (id, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date() } : c,
          ),
        })),

      archiveCampaign: (id) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: "archived" as CampaignStatus,
                  archivedAt: new Date(),
                  updatedAt: new Date(),
                }
              : c,
          ),
        })),

      restoreCampaign: (id) =>
        // TODO(plan-limits): em backend, validar limite do plano antes de
        // permitir restaurar. Aqui só reativa.
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: "active" as CampaignStatus,
                  archivedAt: null,
                  updatedAt: new Date(),
                }
              : c,
          ),
        })),

      deleteCampaign: (id) =>
        set((s) => ({
          campaigns: s.campaigns.filter((c) => c.id !== id),
          activeCampaignId:
            s.activeCampaignId === id ? null : s.activeCampaignId,
        })),

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
      version: 1,
      // Date fields são serializados pelo persist; ao rehidratar voltam
      // como strings. Reviver recompõe os Date.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.campaigns = state.campaigns.map((c) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          archivedAt: c.archivedAt ? new Date(c.archivedAt) : null,
        }));
      },
    },
  ),
);
