import { z } from "zod";
import { SoundCategory, TrackType } from "../types/enums.js";

// ── Play Track ──

export const playTrackSchema = z.object({
  trackId: z.string(),
  volume: z.number().min(0).max(1).default(0.7),
  fadeIn: z.number().min(0).max(30).default(2),
  isLooping: z.boolean().default(true),
});

export type PlayTrackInput = z.infer<typeof playTrackSchema>;

// ── Stop Playback ──

export const stopPlaybackSchema = z.object({
  fadeOut: z.number().min(0).max(30).default(2),
});

// ── Set Volume ──

export const setVolumeSchema = z.object({
  volume: z.number().min(0).max(1),
});

// ── Seek Position ──

export const seekPositionSchema = z.object({
  position: z.number().min(0),
});

// ── Create/Upload Track ──

export const createTrackSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.nativeEnum(SoundCategory).default(SoundCategory.AMBIENT),
  tags: z.array(z.string().max(50)).max(20).default([]),
  audioUrl: z.string().url(),
  duration: z.number().min(1),
  fileSize: z.number().min(0),
  format: z.string().max(20),
  trackType: z.nativeEnum(TrackType).default(TrackType.MUSIC),
  coverUrl: z.string().url().optional(),
  artist: z.string().max(200).optional(),
  license: z.string().max(200).optional(),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;

// ── Soundtrack Library Query ──

export const soundtrackQuerySchema = z.object({
  category: z.nativeEnum(SoundCategory).optional(),
  trackType: z.nativeEnum(TrackType).optional(),
  search: z.string().max(200).optional(),
  builtInOnly: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SoundtrackQuery = z.infer<typeof soundtrackQuerySchema>;

// ── Playlist Management ──

export const updatePlaylistSchema = z.object({
  playlist: z.array(z.object({
    trackId: z.string(),
    order: z.number().int().min(0),
  })).max(100),
  playlistMode: z.enum(["sequential", "shuffle", "single"]).default("sequential"),
  crossfade: z.boolean().default(false),
  fadeInSeconds: z.number().min(0).max(30).default(2),
  fadeOutSeconds: z.number().min(0).max(30).default(2),
});

export type UpdatePlaylistInput = z.infer<typeof updatePlaylistSchema>;
