import { create } from "zustand";
import type {
  PublicProfile,
  CosmeticCategory,
  EquippedCosmetics,
} from "@/types/profile";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { getLevelFromXP, getXPProgress, getNextReward } from "@/lib/profile-level";

// ── Mock Profile Data ──

const MOCK_PROFILE: PublicProfile = {
  id: "user-1",
  username: "lucas",
  displayName: "Lucas",
  bio: "Mestre de RPG desde 2015. Apaixonado por narrativas sombrias e combate tático.",
  avatarUrl: undefined,
  memberSince: "2025-04-01",
  xp: 4850,

  adventurerStats: {
    sessionsPlayed: 42,
    hoursPlayed: 136,
    campaignsJoined: 4,
    charactersCreated: 7,
    questsCompleted: 28,
    criticalHits: 14,
  },

  gmStats: {
    sessionsRun: 35,
    hoursRun: 112,
    campaignsCreated: 3,
    playersHosted: 18,
    encountersDesigned: 28,
    averageRating: 4.7,
    totalReviews: 12,
  },

  characters: [
    {
      id: "char-1",
      name: "Thalion Sombravento",
      class: "Guerreiro",
      level: 8,
      race: "Meio-Elfo",
      campaignName: "A Maldição de Strahd",
      status: "active",
    },
    {
      id: "char-2",
      name: "Miriel Luzeterna",
      class: "Clériga",
      level: 12,
      race: "Humana",
      campaignName: "Tumba da Aniquilação",
      status: "retired",
    },
    {
      id: "char-3",
      name: "Vex Shadowmere",
      class: "Ladino",
      level: 5,
      race: "Tiefling",
      campaignName: "Waterdeep: Dragon Heist",
      status: "deceased",
    },
  ],

  campaigns: [
    {
      id: "camp-1",
      name: "A Maldição de Strahd",
      system: "D&D 5e",
      coverGradient: "linear-gradient(135deg, #1A0A20 0%, #4A1040 50%, #2A0A30 100%)",
      playerCount: 5,
      sessionCount: 12,
      status: "active",
      progress: 65,
      role: "gm",
    },
    {
      id: "camp-2",
      name: "Tumba da Aniquilação",
      system: "D&D 5e",
      coverGradient: "linear-gradient(135deg, #0A1A0A 0%, #1A4A1A 50%, #0A2A0A 100%)",
      playerCount: 4,
      sessionCount: 24,
      status: "completed",
      progress: 100,
      role: "player",
    },
    {
      id: "camp-3",
      name: "Waterdeep: Dragon Heist",
      system: "D&D 5e",
      coverGradient: "linear-gradient(135deg, #0A0A1A 0%, #1A1A4A 50%, #0A0A2A 100%)",
      playerCount: 6,
      sessionCount: 8,
      status: "paused",
      progress: 35,
      role: "player",
    },
  ],

  achievements: ACHIEVEMENTS,

  reviews: [
    {
      id: "rev-1",
      authorName: "Ana",
      rating: 5,
      comment: "Melhor mestre que já joguei! Narrativas incríveis e sempre bem preparado.",
      campaignName: "A Maldição de Strahd",
      date: "2026-02-15",
    },
    {
      id: "rev-2",
      authorName: "Pedro",
      rating: 5,
      comment: "Mapas detalhados e encontros desafiadores. Recomendo demais!",
      campaignName: "A Maldição de Strahd",
      date: "2026-01-20",
    },
    {
      id: "rev-3",
      authorName: "Mariana",
      rating: 4,
      comment: "Ótimo mestre, sessões sempre divertidas. Às vezes corre um pouco com o ritmo.",
      campaignName: "Tumba da Aniquilação",
      date: "2025-11-10",
    },
    {
      id: "rev-4",
      authorName: "Carlos",
      rating: 5,
      comment: "Atmosfera de horror perfeita em Strahd. Cada sessão me dá arrepios!",
      campaignName: "A Maldição de Strahd",
      date: "2026-03-01",
    },
    {
      id: "rev-5",
      authorName: "Juliana",
      rating: 4,
      comment: "Muito criativo com homebrew. Personagens NPCs memoráveis.",
      campaignName: "A Maldição de Strahd",
      date: "2025-12-05",
    },
  ],

  equipped: {
    frameId: "frame-arcane-glow",
    bannerId: "banner-crimson-throne",
    titleId: "title-hero",
    backgroundId: null,
    diceSkinId: "dice-obsidian",
  },

  gmStyleTags: ["narrativo", "horror", "mapas-detalhados", "tático"],
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
