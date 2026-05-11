import { create } from "zustand";
import type {
  PublicProfile,
  CosmeticCategory,
  EquippedCosmetics,
} from "@/types/profile";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { getLevelFromXP, getXPProgress, getNextReward } from "@/lib/profile-level";

// ── Default profile ──
//
// Profile vazio padrão. Quando autenticado via Clerk, dados vêm de
// apps/api/src/modules/user (sync via webhook user.created).

const MOCK_PROFILE: PublicProfile = {
  id: "",
  username: "",
  displayName: "",
  bio: "",
  avatarUrl: undefined,
  memberSince: new Date().toISOString().slice(0, 10),
  xp: 0,
  adventurerStats: { sessionsPlayed: 0, hoursPlayed: 0, campaignsJoined: 0, charactersCreated: 0, questsCompleted: 0, criticalHits: 0 },
  gmStats: { sessionsRun: 0, hoursRun: 0, campaignsCreated: 0, playersHosted: 0, encountersDesigned: 0, averageRating: 0, totalReviews: 0 },
  characters: [],
  campaigns: [],
  achievements: [],
  reviews: [],
  equipped: {
    frameId: null,
    bannerId: null,
    titleId: null,
    backgroundId: null,
    diceSkinId: null,
  },
  gmStyleTags: [],
};

// ── Store ──

type ProfileTab = "adventurer" | "gm";

interface ProfileState {
  profile: PublicProfile;
  activeTab: ProfileTab;
  cosmeticSelectorOpen: boolean;
  cosmeticSelectorCategory: CosmeticCategory;

  setActiveTab: (tab: ProfileTab) => void;
  openCosmeticSelector: (category: CosmeticCategory) => void;
  closeCosmeticSelector: () => void;
  equipCosmetic: (category: CosmeticCategory, cosmeticId: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: MOCK_PROFILE,
  activeTab: "adventurer",
  cosmeticSelectorOpen: false,
  cosmeticSelectorCategory: "frame",

  setActiveTab: (tab) => set({ activeTab: tab }),

  openCosmeticSelector: (category) =>
    set({ cosmeticSelectorOpen: true, cosmeticSelectorCategory: category }),

  closeCosmeticSelector: () => set({ cosmeticSelectorOpen: false }),

  equipCosmetic: (category, cosmeticId) =>
    set((state) => {
      const key: keyof EquippedCosmetics =
        category === "frame"
          ? "frameId"
          : category === "banner"
            ? "bannerId"
            : category === "title"
              ? "titleId"
              : category === "background"
                ? "backgroundId"
                : "diceSkinId";

      return {
        profile: {
          ...state.profile,
          equipped: { ...state.profile.equipped, [key]: cosmeticId },
        },
      };
    }),
}));

// ── Derived Hooks ──

export function useProfileLevel() {
  const xp = useProfileStore((s) => s.profile.xp);
  const level = getLevelFromXP(xp);
  const progress = getXPProgress(xp);
  const nextReward = getNextReward(xp);
  return { level, xp, progress, nextReward };
}

export function useProfileStats() {
  const profile = useProfileStore((s) => s.profile);
  return {
    adventurer: profile.adventurerStats,
    gm: profile.gmStats,
  };
}
