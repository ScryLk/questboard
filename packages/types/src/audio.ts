// ── Audio Types ──

export type AudioChannel = "AMBIENT" | "MUSIC" | "SFX";

export interface AudioTrack {
  id: string;
  ownerId: string | null;
  name: string;
  description: string | null;
  url: string;
  durationMs: number;
  fileSizeBytes: number;
  channel: AudioChannel;
  tags: string[];
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Legacy — mantidos em sincronia durante seed para o audio-panel web atual.
  // Remover em fatia futura junto com o rewrite do panel.
  category: string;
  duration: number;
  isBuiltin: boolean;
}

export interface AudioTrackListResponse {
  items: AudioTrack[];
  nextCursor: string | null;
}

// Legacy — shape espelha o modelo Prisma antigo. Não reflete o SessionAudio
// real (que tem currentTrack:Json, isMuted, volume:Float). Preservado para
// não quebrar imports existentes; será atualizado em fatia futura.
export interface SessionAudio {
  id: string;
  layer: string;
  volume: number;
  isPlaying: boolean;
  sessionId: string;
  trackId: string;
}
