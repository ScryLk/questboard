// ═══ Sistema de Áudio — Constantes compartilhadas ═══
// AudioChannel:
//   AMBIENT → loop eterno (chuva, taverna, floresta)
//   MUSIC   → tema da cena (combate, exploração)
//   SFX     → one-shot curto (trovão, sino, espada)

import type { AudioChannel } from "@questboard/types";

export const AUDIO_CHANNELS = ["AMBIENT", "MUSIC", "SFX"] as const satisfies readonly AudioChannel[];

// Limites de upload acumulado por plano (MB).
// FREE não sobe nada — usa apenas a biblioteca oficial.
export const AUDIO_UPLOAD_LIMITS_MB = {
  FREE: 0,
  AVENTUREIRO: 100,
  LENDARIO: 2048, // 2GB
} as const;

// Duração máxima permitida por canal (ms).
// SFX é one-shot, por isso curto.
export const AUDIO_DURATION_LIMITS_MS = {
  AMBIENT: 10 * 60 * 1000,
  MUSIC: 10 * 60 * 1000,
  SFX: 15 * 1000,
} as const;

// Tamanho máximo de um arquivo individual (MB).
export const AUDIO_MAX_FILE_SIZE_MB = 15;

// Crossfade padrão ao trocar faixa de cada canal (ms).
export const AUDIO_DEFAULT_FADE_MS = {
  AMBIENT: 2000,
  MUSIC: 1500,
  SFX: 0,
} as const;

// Controlled vocabulary de tags oficiais.
// Evita duplicatas tipo "caverna" / "Caverna" / "cave".
export const AUDIO_OFFICIAL_TAGS = [
  // ambientes
  "floresta", "caverna", "taverna", "cidade", "castelo", "masmorra",
  "deserto", "oceano", "montanha", "subterraneo", "ruinas", "cemiterio",
  // climas
  "chuva", "tempestade", "vento", "fogueira", "noite", "dia",
  // moods musicais
  "combate", "exploracao", "tenso", "misterioso", "epico", "melancolico",
  "triunfante", "calmo", "sombrio", "boss",
  // sfx
  "trovao", "sino", "rugido", "espada", "magia", "porta", "grito", "passos",
] as const;

export type AudioOfficialTag = (typeof AUDIO_OFFICIAL_TAGS)[number];
