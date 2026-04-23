// ─── Scene Types ────────────────────────────────────────

export type SceneType =
  | "cinematic"
  | "chapter"
  | "location"
  | "mystery"
  | "danger"
  | "flashback"
  | "weather";

export type ParticleEffect = "mist" | "rain" | "embers" | "snow" | "dust";

export type RevealMode = "instant" | "typewriter" | "layers" | "progressive";

export interface ColorGrade {
  tint: string;
  opacity: number;
  saturation: number;
  contrast: number;
}

export interface AtmosphereConfig {
  particles: ParticleEffect | null;
  colorGrade: ColorGrade;
  soundKey: string | null;
  hapticPattern: "light" | "medium" | "heavy" | "sequence" | null;
}

export interface TimingConfig {
  revealMode: RevealMode;
  holdDuration: number; // seconds
  autoDismiss: boolean;
}

export type SceneReactionEmoji = "😮" | "😱" | "🔥" | "❤️" | "⚔️";

export interface SceneReaction {
  userId: string;
  characterName: string;
  emoji: SceneReactionEmoji;
  timestamp: Date;
}

export interface SceneCard {
  id: string;
  type: SceneType;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  atmosphere: AtmosphereConfig;
  timing: TimingConfig;
  tags?: string[];
  chapter?: string;
  reactions: SceneReaction[];
  createdAt: Date;
}

export interface SceneCardDraft {
  id: string;
  label: string;
  card: Omit<SceneCard, "id" | "reactions" | "createdAt">;
}
