"use client";

// Campaign store — agora respaldado pelo backend (apps/api/src/modules/
// campaign). O cache local serve só pra dar resposta síncrona à UI;
// a fonte de verdade é o Postgres.
//
// Fluxo:
//   1. App boot → `useHydrateCampaigns` (em use-reconcile-campaigns) faz
//      GET /campaigns e chama `hydrateCampaigns()` pra popular o cache.
//   2. Mutações chamam `apiRequest` em background. UI atualiza local
//      otimistamente; em sucesso, troca o registro pelo canônico do
//      servidor; em falha, reverte e loga no console.
//   3. `createCampaign` é ASSYNC — o caller precisa do `id` real pra
//      navegar pra /campaigns/[id], então esperamos o backend antes de
//      retornar.

import { create } from "zustand";
import type {
  CampaignDetailed,
  CampaignDraft,
  CampaignMember,
  CampaignMemberRole,
  CampaignStatus,
} from "@questboard/types";
import {
  JOIN_CODE_ALPHABET,
  JOIN_CODE_LENGTH,
  MAX_CAMPAIGNS_BY_PLAN,
} from "@questboard/constants";
import * as campaignApi from "./campaign-api";

/** Plano do usuário corrente. Default `LENDARIO` no mock pra não
 *  bloquear features durante dev — backend será authoritative quando
 *  billing real chegar. */
export type UserPlan = keyof typeof MAX_CAMPAIGNS_BY_PLAN;

// ── Helpers ──

function makeJoinCode(): string {
  let out = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    out +=
      JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)];
  }
  return out;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function makeSlug(name: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  const base = slugify(name) || "campanha";
  return `${base}-${suffix}`;
}

// Owner fallback — só usado em cenários degradados (offline) onde o
// Clerk ainda não populou. Em fluxo normal o backend é quem define o
// `ownerId` real (request.user.id) ao criar.
export const MOCK_OWNER_ID = "dev-user-default";
export const MOCK_OWNER_NAME = "Lucas (você)";

// ── State ──

interface CampaignStoreState {
  campaigns: CampaignDetailed[];
  /** Id da campanha "ativa" selecionada no contexto do dashboard.
   *  Persistida em localStorage como `active_campaign_id` (chave isolada
   *  da lista — não precisa ressincronizar com backend). */
  activeCampaignId: string | null;
  currentPlan: UserPlan;
  /** `true` enquanto hidrata pela primeira vez. UI usa pra esconder
   *  empty states prematuros. */
  hydrating: boolean;

  // Hidratação
  hydrateCampaigns: (campaigns: CampaignDetailed[]) => void;
  setHydrating: (v: boolean) => void;

  // Mutações (sync na UI; async no backend)
  createCampaign: (draft: CampaignDraft) => Promise<CampaignDetailed>;
  updateCampaign: (id: string, patch: Partial<CampaignDetailed>) => void;
  archiveCampaign: (id: string) => void;
  restoreCampaign: (id: string) => { ok: true } | { ok: false; error: string };
  deleteCampaign: (id: string) => void;
  regenerateJoinCode: (id: string) => string | null;
  setCurrentPlan: (plan: UserPlan) => void;

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
  leaveCampaign: (campaignId: string, userId?: string) => void;

  setActiveCampaignId: (id: string | null) => void;

  /** Reconcilia o cache local com a lista do servidor: remove
   *  campanhas cujo id não aparece em `serverIds` e zera
   *  `activeCampaignId` se ele apontar pra uma campanha removida. */
  reconcileWithServer: (serverIds: string[]) => void;

  getCampaignById: (id: string) => CampaignDetailed | undefined;
  getCampaignByCode: (code: string) => CampaignDetailed | undefined;
  getCampaignBySlug: (slug: string) => CampaignDetailed | undefined;
}

function patchLocal(
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

const ACTIVE_ID_KEY = "active_campaign_id";

function readActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_ID_KEY);
  } catch {
    return null;
  }
}

function writeActiveId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(ACTIVE_ID_KEY, id);
    else window.localStorage.removeItem(ACTIVE_ID_KEY);
  } catch {
    // Quota / private mode — ignora silenciosamente.
  }
}

export const useCampaignStore = create<CampaignStoreState>()((set, get) => ({
  campaigns: [],
  activeCampaignId: readActiveId(),
  currentPlan: "LENDARIO" as UserPlan,
  hydrating: true,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  hydrateCampaigns: (incoming) => {
    set((s) => {
      const validIds = new Set(incoming.map((c) => c.id));
      const activeStillValid =
        s.activeCampaignId === null || validIds.has(s.activeCampaignId);
      const nextActive = activeStillValid ? s.activeCampaignId : null;
      if (!activeStillValid) writeActiveId(null);
      return {
        campaigns: incoming,
        activeCampaignId: nextActive,
        hydrating: false,
      };
    });
  },

  setHydrating: (v) => set({ hydrating: v }),

  createCampaign: async (draft) => {
    const now = new Date();
    const visibility = draft.visibility;
    const joinCode =
      visibility === "CODE" || visibility === "PUBLIC" ? makeJoinCode() : null;
    const slug = visibility === "PUBLIC" ? makeSlug(draft.name) : null;

    // Owner real vem do Clerk no backend (request.user.id). Em UI usamos
    // o draft pra criar e o backend devolve com ownerId canônico.
    const optimistic: CampaignDetailed = {
      id: `pending_${Date.now().toString(36)}`,
      ownerId: MOCK_OWNER_ID,
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
      members: [],
    };

    // Não inserimos optimistic na lista — esperamos o backend responder
    // pra usar o id real (caller usa .id pra navegar). Em latência alta
    // (>500ms), considerar inserir + reconciliar; hoje a UX é submitter
    // → spinner → redirect, então blocking-await está OK.
    try {
      const created = await campaignApi.createCampaign(optimistic);
      set((s) => ({ campaigns: [created, ...s.campaigns] }));
      return created;
    } catch (err) {
      console.error("[campaign-store] createCampaign failed", err);
      throw err;
    }
  },

  updateCampaign: (id, patch) => {
    const before = get().campaigns.find((c) => c.id === id);
    if (!before) return;
    set((s) => patchLocal(s, id, (c) => ({ ...c, ...patch })));
    void campaignApi
      .updateCampaign(before, patch)
      .then((canonical) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? canonical : c)),
        }));
      })
      .catch((err) => {
        console.error("[campaign-store] updateCampaign failed", err);
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? before : c)),
        }));
      });
  },

  archiveCampaign: (id) => {
    const before = get().campaigns.find((c) => c.id === id);
    if (!before) return;
    const archivedAt = new Date();
    set((s) =>
      patchLocal(s, id, (c) => ({
        ...c,
        status: "archived" as CampaignStatus,
        archivedAt,
      })),
    );
    void campaignApi
      .updateCampaign(before, {
        status: "archived",
        archivedAt,
      })
      .then((canonical) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? canonical : c)),
        }));
      })
      .catch((err) => {
        console.error("[campaign-store] archiveCampaign failed", err);
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? before : c)),
        }));
      });
  },

  restoreCampaign: (id) => {
    const s = get();
    const campaign = s.campaigns.find((c) => c.id === id);
    if (!campaign) {
      return { ok: false as const, error: "Campanha não encontrada." };
    }
    if (campaign.status !== "archived") {
      return { ok: false as const, error: "Esta campanha não está arquivada." };
    }
    const limit = MAX_CAMPAIGNS_BY_PLAN[s.currentPlan];
    const activeOwned = s.campaigns.filter(
      (c) => c.ownerId === campaign.ownerId && c.status !== "archived",
    ).length;
    if (activeOwned >= limit) {
      return {
        ok: false as const,
        error: `Limite do plano atingido (${limit} ${limit === 1 ? "campanha ativa" : "campanhas ativas"}). Arquive outra ou faça upgrade.`,
      };
    }

    const before = campaign;
    set((state) =>
      patchLocal(state, id, (c) => ({
        ...c,
        status: "active" as CampaignStatus,
        archivedAt: null,
      })),
    );
    void campaignApi
      .updateCampaign(before, { status: "active", archivedAt: null })
      .then((canonical) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? canonical : c)),
        }));
      })
      .catch((err) => {
        console.error("[campaign-store] restoreCampaign failed", err);
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? before : c)),
        }));
      });

    return { ok: true as const };
  },

  deleteCampaign: (id) => {
    const before = get().campaigns.find((c) => c.id === id);
    if (!before) return;
    set((s) => ({
      campaigns: s.campaigns.filter((c) => c.id !== id),
      activeCampaignId: s.activeCampaignId === id ? null : s.activeCampaignId,
    }));
    if (get().activeCampaignId === null && before.id === id) writeActiveId(null);
    // Ids "pending_*" são otimistas que nunca chegaram ao servidor — não
    // adianta chamar DELETE pra eles. Apenas remover do cache basta.
    if (id.startsWith("pending_") || id.startsWith("camp_")) return;
    void campaignApi.deleteCampaign(id).catch((err) => {
      console.error("[campaign-store] deleteCampaign failed", err);
      // Não revertemos — usuário viu confirm, prefere consistência
      // visual. Próximo hydrate vai puxar de volta se ainda existir.
    });
  },

  regenerateJoinCode: (id) => {
    const c = get().campaigns.find((x) => x.id === id);
    if (!c) return null;
    if (c.visibility === "PRIVATE") return null;
    // TODO(backend-rotate-code): o backend hoje não tem endpoint
    // dedicado pra rotacionar o `code`. Mantemos local-only por enquanto;
    // a UI mostra o novo código mas ele não persiste entre sessions.
    const code = makeJoinCode();
    set((s) => patchLocal(s, id, (cur) => ({ ...cur, joinCode: code })));
    return code;
  },

  inviteMember: (campaignId, member, invitedBy = MOCK_OWNER_ID) => {
    // TODO(backend-invite-by-user): backend hoje só suporta join-by-code.
    // Mantemos invite local; backend confirma quando o usuário entra
    // pelo código.
    set((s) =>
      patchLocal(s, campaignId, (c) => {
        if (c.members.some((m) => m.userId === member.userId)) return c;
        const next: CampaignMember = {
          ...member,
          joinedAt: new Date(),
          invitedBy,
        };
        const members = [...c.members, next];
        return { ...c, members, memberCount: members.length };
      }),
    );
  },

  removeMember: (campaignId, userId) => {
    const before = get().campaigns.find((c) => c.id === campaignId);
    if (!before) return;
    if (userId === before.ownerId) return;
    set((s) =>
      patchLocal(s, campaignId, (c) => {
        const members = c.members.filter((m) => m.userId !== userId);
        return { ...c, members, memberCount: members.length };
      }),
    );
    void campaignApi.removeMember(campaignId, userId).catch((err) => {
      console.error("[campaign-store] removeMember failed", err);
      set((s) => ({
        campaigns: s.campaigns.map((c) => (c.id === campaignId ? before : c)),
      }));
    });
  },

  changeMemberRole: (campaignId, userId, role) => {
    const before = get().campaigns.find((c) => c.id === campaignId);
    if (!before) return;
    if (userId === before.ownerId) return;
    set((s) =>
      patchLocal(s, campaignId, (c) => {
        const members = c.members.map((m) =>
          m.userId === userId ? { ...m, role } : m,
        );
        return { ...c, members };
      }),
    );
    void campaignApi
      .updateMemberRole(campaignId, userId, role)
      .catch((err) => {
        console.error("[campaign-store] changeMemberRole failed", err);
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId ? before : c,
          ),
        }));
      });
  },

  leaveCampaign: (campaignId, userId = MOCK_OWNER_ID) => {
    // Backend não tem endpoint "leave" — o `removeMember` exige owner.
    // Mantemos local até a fatia dedicada (provavelmente uma rota
    // POST /campaigns/:id/leave que valida userId == request.user.id).
    set((s) =>
      patchLocal(s, campaignId, (c) => {
        if (userId === c.ownerId) return c;
        const members = c.members.filter((m) => m.userId !== userId);
        return { ...c, members, memberCount: members.length };
      }),
    );
  },

  setActiveCampaignId: (id) => {
    set({ activeCampaignId: id });
    writeActiveId(id);
  },

  reconcileWithServer: (serverIds) => {
    const validSet = new Set(serverIds);
    set((s) => {
      const next = s.campaigns.filter((c) => validSet.has(c.id));
      const activeStillValid =
        s.activeCampaignId === null ||
        next.some((c) => c.id === s.activeCampaignId);
      if (!activeStillValid) writeActiveId(null);
      return {
        campaigns: next,
        activeCampaignId: activeStillValid ? s.activeCampaignId : null,
      };
    });
  },

  getCampaignById: (id) => get().campaigns.find((c) => c.id === id),

  getCampaignByCode: (code) =>
    get().campaigns.find(
      (c) => c.joinCode?.toUpperCase() === code.toUpperCase(),
    ),

  getCampaignBySlug: (slug) => get().campaigns.find((c) => c.slug === slug),
}));
