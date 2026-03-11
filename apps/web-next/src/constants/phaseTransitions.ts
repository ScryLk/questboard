import {
  Compass,
  Swords,
  MessageSquare,
  Search,
  Map,
  Coffee,
  Moon,
  BookOpen,
} from "lucide-react";
import type { PhaseType, PhaseTransitionRule } from "@/types/phase";

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
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15",
    description: "Party se move e investiga o ambiente",
  },
  combat: {
    label: "Combate",
    icon: Swords,
    color: "text-red-400",
    bgColor: "bg-red-500/15",
    description: "Iniciativa ativa — turnos em andamento",
  },
  roleplay: {
    label: "Roleplay",
    icon: MessageSquare,
    color: "text-blue-400",
    bgColor: "bg-blue-500/15",
    description: "Interação social e diálogos",
  },
  investigation: {
    label: "Investigação",
    icon: Search,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/15",
    description: "Resolvendo puzzles e coletando pistas",
  },
  travel: {
    label: "Viagem",
    icon: Map,
    color: "text-purple-400",
    bgColor: "bg-purple-500/15",
    description: "Deslocamento entre locais",
  },
  rest_short: {
    label: "Descanso Curto",
    icon: Coffee,
    color: "text-orange-400",
    bgColor: "bg-orange-500/15",
    description: "Descanso de 1 hora — recuperação parcial",
  },
  rest_long: {
    label: "Descanso Longo",
    icon: Moon,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/15",
    description: "Descanso de 8 horas — recuperação completa",
  },
  narration: {
    label: "Narração",
    icon: BookOpen,
    color: "text-gray-400",
    bgColor: "bg-gray-500/15",
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
