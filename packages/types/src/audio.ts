// ── Audio Types ──

export interface AudioTrack {
  id: string;
  category: string;
  name: string;
  url: string;
  duration: number;
  isBuiltin: boolean;
}

export interface SessionAudio {
  id: string;
  layer: string;
  volume: number;
  isPlaying: boolean;
  sessionId: string;
  trackId: string;
}
