import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username pode conter apenas letras, números e underscore")
    .optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  locale: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
    })
    .optional(),
  privacy: z
    .object({
      profilePublic: z.boolean().optional(),
      showOnlineStatus: z.boolean().optional(),
      allowFriendRequests: z.boolean().optional(),
    })
    .optional(),
  audio: z
    .object({
      masterVolume: z.number().min(0).max(1).optional(),
      sfxVolume: z.number().min(0).max(1).optional(),
    })
    .optional(),
  display: z
    .object({
      language: z.string().max(10).optional(),
      diceAnimation: z.boolean().optional(),
      reducedMotion: z.boolean().optional(),
    })
    .optional(),
});

export const searchUsersSchema = z.object({
  q: z.string().min(1).max(100),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
