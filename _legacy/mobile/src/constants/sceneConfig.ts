import {
  Clapperboard,
  BookOpen,
  MapPin,
  Search,
  AlertTriangle,
  Film,
  CloudRain,
} from "lucide-react-native";
import type {
  SceneType,
  AtmosphereConfig,
  TimingConfig,
  ParticleEffect,
  SceneReactionEmoji,
} from "../types/scene";

// ─── Scene Type Metadata ────────────────────────────────

export interface SceneTypeMeta {
  label: string;
  icon: typeof Clapperboard;
  color: string;
  bgColor: string;
  description: string;
}

export const SCENE_TYPE_META: Record<SceneType, SceneTypeMeta> = {
  cinematic: {
    label: "Cinemático",
    icon: Clapperboard,
    color: "#6C5CE7",
    bgColor: "rgba(108,92,231,0.15)",
    description: "Cena dramática com letterbox",
  },
  chapter: {
    label: "Capítulo",
    icon: BookOpen,
    color: "#D4A843",
    bgColor: "rgba(212,168,67,0.15)",
    description: "Cartão de título elegante",
  },
  location: {
    label: "Locação",
    icon: MapPin,
    color: "#00B894",
    bgColor: "rgba(0,184,148,0.15)",
    description: "Chegada a um lugar",
  },
  mystery: {
    label: "Mistério",
    icon: Search,
    color: "#A29BFE",
    bgColor: "rgba(162,155,254,0.15)",
    description: "Revelação progressiva",
  },
  danger: {
    label: "Perigo",
    icon: AlertTriangle,
    color: "#FF4444",
    bgColor: "rgba(255,68,68,0.15)",
    description: "Alerta de perigo",
  },
  flashback: {
    label: "Flashback",
    icon: Film,
    color: "#9CA3AF",
    bgColor: "rgba(156,163,175,0.15)",
    description: "Memória em preto e branco",
  },
  weather: {
    label: "Clima",
    icon: CloudRain,
    color: "#60A5FA",
    bgColor: "rgba(96,165,250,0.15)",
    description: "Evento climático com partículas",
  },
};

// Order for the builder grid (2 rows: 4 + 3)
export const SCENE_TYPE_ORDER: SceneType[] = [
  "cinematic",
  "chapter",
  "location",
  "mystery",
  "danger",
  "flashback",
  "weather",
];

// ─── Default Configs Per Type ───────────────────────────

export const DEFAULT_ATMOSPHERE: Record<SceneType, AtmosphereConfig> = {
  cinematic: {
    particles: null,
    colorGrade: { tint: "#000000", opacity: 0.85, saturation: 1.1, contrast: 1.2 },
    soundKey: "scene-cinematic",
    hapticPattern: "heavy",
  },
  chapter: {
    particles: null,
    colorGrade: { tint: "#1A1200", opacity: 0.9, saturation: 0.9, contrast: 1.0 },
    soundKey: "scene-chapter",
    hapticPattern: "medium",
  },
  location: {
    particles: "mist",
    colorGrade: { tint: "#0A1A0A", opacity: 0.8, saturation: 1.0, contrast: 1.0 },
    soundKey: "scene-location",
    hapticPattern: "light",
  },
  mystery: {
    particles: "dust",
    colorGrade: { tint: "#0A0A1A", opacity: 0.85, saturation: 0.8, contrast: 1.1 },
    soundKey: "scene-mystery",
    hapticPattern: "medium",
  },
  danger: {
    particles: "embers",
    colorGrade: { tint: "#1A0000", opacity: 0.9, saturation: 1.2, contrast: 1.3 },
    soundKey: "scene-danger",
    hapticPattern: "heavy",
  },
  flashback: {
    particles: "dust",
    colorGrade: { tint: "#1A1A1A", opacity: 0.85, saturation: 0.0, contrast: 1.4 },
    soundKey: "scene-flashback",
    hapticPattern: "light",
  },
  weather: {
    particles: "rain",
    colorGrade: { tint: "#0A0A1A", opacity: 0.8, saturation: 0.9, contrast: 1.0 },
    soundKey: "scene-weather",
    hapticPattern: "medium",
  },
};

export const DEFAULT_TIMING: Record<SceneType, TimingConfig> = {
  cinematic: { revealMode: "instant", holdDuration: 6, autoDismiss: true },
  chapter: { revealMode: "layers", holdDuration: 5, autoDismiss: true },
  location: { revealMode: "instant", holdDuration: 5, autoDismiss: true },
  mystery: { revealMode: "typewriter", holdDuration: 8, autoDismiss: false },
  danger: { revealMode: "instant", holdDuration: 4, autoDismiss: true },
  flashback: { revealMode: "progressive", holdDuration: 7, autoDismiss: true },
  weather: { revealMode: "instant", holdDuration: 5, autoDismiss: true },
};

// ─── Particle Options ───────────────────────────────────

export const PARTICLE_OPTIONS: { key: ParticleEffect | "none"; label: string }[] = [
  { key: "none", label: "Nenhum" },
  { key: "mist", label: "Névoa" },
  { key: "rain", label: "Chuva" },
  { key: "embers", label: "Brasas" },
  { key: "snow", label: "Neve" },
  { key: "dust", label: "Poeira" },
];

// ─── Atmosphere Tags ────────────────────────────────────

export const ATMOSPHERE_TAGS = [
  "Névoa",
  "Escuridão",
  "Frio",
  "Calor",
  "Chuva",
  "Vento",
  "Silêncio",
  "Sons de batalha",
  "Música distante",
  "Gritos",
  "Cheiro de morte",
  "Flores",
  "Pó",
  "Maresia",
  "Trovões",
  "Neblina",
  "Gelo",
  "Tempestade",
];

// ─── Sound Mappings ─────────────────────────────────────

export const SCENE_SOUND_MAP: Record<string, { uri: string; volume: number }> = {
  "scene-cinematic": { uri: "", volume: 0.6 },
  "scene-chapter": { uri: "", volume: 0.5 },
  "scene-location": { uri: "", volume: 0.4 },
  "scene-mystery": { uri: "", volume: 0.5 },
  "scene-danger": { uri: "", volume: 0.7 },
  "scene-flashback": { uri: "", volume: 0.4 },
  "scene-weather": { uri: "", volume: 0.5 },
};

// ─── Reaction Emojis ────────────────────────────────────

export const SCENE_REACTION_EMOJIS: {
  emoji: SceneReactionEmoji;
  label: string;
}[] = [
  { emoji: "😮", label: "Surpreso" },
  { emoji: "😱", label: "Assustado" },
  { emoji: "🔥", label: "Épico" },
  { emoji: "❤️", label: "Amei" },
  { emoji: "⚔️", label: "Combate" },
];
