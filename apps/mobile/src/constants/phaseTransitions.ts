import {
  Compass,
  Swords,
  MessageSquare,
  Search,
  Map,
  Coffee,
  Moon,
  BookOpen,
} from "lucide-react-native";
import type { PhaseType, PhaseTransitionRule } from "../types/phase";

export interface PhaseMeta {
  label: string;
  icon: typeof Compass;
  color: string;
  bgColor: string;
  description: string;
}

export const PHASE_META: Record<PhaseType, PhaseMeta> = {
  exploration: {
    label: "Exploração",
    icon: Compass,
    color: "#34D399",
    bgColor: "rgba(52, 211, 153, 0.15)",
    description: "Party se move e investiga o ambiente",
  },
  combat: {
    label: "Combate",
    icon: Swords,
    color: "#F87171",
    bgColor: "rgba(248, 113, 113, 0.15)",
    description: "Iniciativa ativa — turnos em andamento",
  },
  roleplay: {
    label: "Roleplay",
    icon: MessageSquare,
    color: "#60A5FA",
    bgColor: "rgba(96, 165, 250, 0.15)",
    description: "Interação social e diálogos",
  },
  investigation: {
    label: "Investigação",
    icon: Search,
    color: "#FBBF24",
    bgColor: "rgba(251, 191, 36, 0.15)",
    description: "Resolvendo puzzles e coletando pistas",
  },
  travel: {
    label: "Viagem",
    icon: Map,
    color: "#A78BFA",
    bgColor: "rgba(167, 139, 250, 0.15)",
    description: "Deslocamento entre locais",
  },
  rest_short: {
    label: "Descanso Curto",
    icon: Coffee,
    color: "#FB923C",
    bgColor: "rgba(251, 146, 60, 0.15)",
    description: "Descanso de 1 hora — recuperação parcial",
  },
  rest_long: {
    label: "Descanso Longo",
    icon: Moon,
    color: "#818CF8",
    bgColor: "rgba(129, 140, 248, 0.15)",
    description: "Descanso de 8 horas — recuperação completa",
  },
  narration: {
    label: "Narração",
    icon: BookOpen,
    color: "#9CA3AF",
    bgColor: "rgba(156, 163, 175, 0.15)",
    description: "GM narrando — jogadores em modo passivo",
  },
};

export const PHASE_TRANSITIONS: PhaseTransitionRule[] = [
  { from: "exploration", suggestions: ["combat", "roleplay", "investigation"] },
  { from: "combat", suggestions: ["rest_short", "exploration", "narration"] },
  { from: "roleplay", suggestions: ["exploration", "combat", "investigation"] },
  { from: "investigation", suggestions: ["roleplay", "exploration", "combat"] },
  { from: "travel", suggestions: ["exploration", "roleplay", "combat"] },
  { from: "rest_short", suggestions: ["exploration", "combat", "travel"] },
  { from: "rest_long", suggestions: ["exploration", "travel", "roleplay"] },
  { from: "narration", suggestions: ["exploration", "roleplay", "combat"] },
];

export const ALL_PHASE_TYPES: PhaseType[] = [
  "exploration",
  "combat",
  "roleplay",
  "investigation",
  "travel",
  "rest_short",
  "rest_long",
  "narration",
];
