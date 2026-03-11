import { create } from "zustand";
import type { UserProfile } from "@questboard/types";
import { MOCK_OWN_PROFILE, MOCK_OTHER_PROFILE } from "./profile-mock-data";

const MOCK_PROFILES: Record<string, UserProfile> = {
  voce: MOCK_OWN_PROFILE,
  eldrin_mago: MOCK_OTHER_PROFILE,
};

function buildFallbackProfile(username: string): UserProfile {
  return {
    ...MOCK_OTHER_PROFILE,
    id: `user-${username}`,
    username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    isFollowing: false,
  };
}

interface ProfileState {
  profiles: Record<string, UserProfile>;
  currentUsername: string | null;
  isLoading: boolean;

  openProfile: (username: string) => void;
  closeProfile: () => void;
  toggleFollow: (username: string) => void;
  fetchProfile: (username: string) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: {},
  currentUsername: null,
  isLoading: false,

  openProfile: (username) => {
    set({ currentUsername: username });
    get().fetchProfile(username);
  },

  closeProfile: () => {
    set({ currentUsername: null });
  },

  toggleFollow: (username) => {
    set((s) => {
      const profile = s.profiles[username];
      if (!profile) return s;
      const isFollowing = !profile.isFollowing;
      return {
        profiles: {
          ...s.profiles,
          [username]: {
            ...profile,
            isFollowing,
            followersCount:
              profile.followersCount + (isFollowing ? 1 : -1),
          },
        },
      };
    });
  },

  fetchProfile: (username) => {
    const existing = get().profiles[username];
    if (existing) return;

    set({ isLoading: true });
    setTimeout(() => {
      const mock = MOCK_PROFILES[username] ?? buildFallbackProfile(username);
      set((s) => ({
        profiles: { ...s.profiles, [username]: mock },
        isLoading: false,
      }));
    }, 400);
  },
}));
