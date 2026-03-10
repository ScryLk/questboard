import type { LucideIcon } from "lucide-react-native";
import {
  Sword,
  Flame,
  Search,
  Moon,
  Skull,
  Dice5,
  Settings,
  Rocket,
} from "lucide-react-native";

// ─── Shared ──────────────────────────────────────────────

export const SYSTEM_LABELS: Record<string, string> = {
  dnd5e: "D&D 5e",
  tormenta20: "Tormenta20",
  coc7: "Call of Cthulhu 7e",
  vampireV5: "Vampiro V5",
  generic: "Genérico",
  starfinder: "Starfinder",
};

export const SYSTEM_ICONS: Record<string, LucideIcon> = {
  dnd5e: Sword,
  tormenta20: Flame,
  coc7: Search,
  vampireV5: Moon,
  generic: Dice5,
  starfinder: Rocket,
};

// ─── Tab: Novidades ──────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  icon: string;
  type: "art" | "tip" | "highlight" | "news";
}

const TYPE_LABELS: Record<NewsItem["type"], string> = {
  art: "Arte",
  tip: "Dica",
  highlight: "Destaque",
  news: "Novidade",
};

export { TYPE_LABELS };

export const NEWS_ITEMS: NewsItem[] = [];

// ─── Tab: Sessões ────────────────────────────────────────

export interface FeedSession {
  id: string;
  name: string;
  system: string;
  gmName: string;
  playerCount: number;
  maxPlayers: number;
  tags: string[];
  accentColor: string;
  description: string;
  isLive: boolean;
}

export const FEED_SESSIONS: FeedSession[] = [];

// ─── Tab: Fórum ──────────────────────────────────────────

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  replies: number;
  lastActivity: string;
  tags: string[];
}

export const FORUM_THREADS: ForumThread[] = [];

// ─── User Sessions (authenticated) ─────────────────────

export interface UserSession extends FeedSession {
  role: "gm" | "player";
  nextSchedule?: string;
  sessionNumber: number;
  status: "live" | "scheduled" | "idle";
}

export const MY_SESSIONS_GM: UserSession[] = [];

export const MY_SESSIONS_PLAYER: UserSession[] = [];

// ─── Characters ─────────────────────────────────────────

export interface MockCharacter {
  id: string;
  name: string;
  class: string;
  level: number;
  currentHp: number;
  maxHp: number;
  system: string;
  avatar: string;
}

export const MY_CHARACTERS: MockCharacter[] = [];

// ─── Game Systems (Character Creation) ──────────────────

export interface GameSystem {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  accentColor: string;
  badge: "guided" | "template" | "creator";
  badgeLabel: string;
  characterCount: string;
  featured: boolean;
}

export const GAME_SYSTEMS: GameSystem[] = [
  {
    id: "dnd5e",
    name: "Dungeons & Dragons 5e",
    tagline: "Fantasia heroica clássica",
    icon: Sword,
    accentColor: "#6C5CE7",
    badge: "guided",
    badgeLabel: "Guiado",
    characterCount: "",
    featured: true,
  },
  {
    id: "tormenta20",
    name: "Tormenta 20",
    tagline: "Aventura no mundo de Arton",
    icon: Flame,
    accentColor: "#E94560",
    badge: "guided",
    badgeLabel: "Guiado",
    characterCount: "",
    featured: true,
  },
  {
    id: "coc7",
    name: "Call of Cthulhu 7e",
    tagline: "Horror cósmico e investigação",
    icon: Search,
    accentColor: "#00B894",
    badge: "guided",
    badgeLabel: "Guiado",
    characterCount: "",
    featured: true,
  },
  {
    id: "vampireV5",
    name: "Vampiro: A Máscara V5",
    tagline: "Drama pessoal e horror",
    icon: Moon,
    accentColor: "#FF6B6B",
    badge: "template",
    badgeLabel: "Template",
    characterCount: "",
    featured: false,
  },
  {
    id: "ordem",
    name: "Ordem Paranormal",
    tagline: "Investigação e paranormal",
    icon: Skull,
    accentColor: "#A29BFE",
    badge: "template",
    badgeLabel: "Template",
    characterCount: "",
    featured: false,
  },
  {
    id: "gurps",
    name: "GURPS",
    tagline: "Sistema universal genérico",
    icon: Dice5,
    accentColor: "#FDCB6E",
    badge: "template",
    badgeLabel: "Template",
    characterCount: "",
    featured: false,
  },
  {
    id: "homebrew",
    name: "Homebrew",
    tagline: "Crie seu próprio sistema",
    icon: Settings,
    accentColor: "#636E72",
    badge: "creator",
    badgeLabel: "Criador",
    characterCount: "",
    featured: false,
  },
];

// ─── Session Creation Constants ─────────────────────────

export const CAMPAIGN_TYPES = [
  { key: "oneshot", label: "One-Shot" },
  { key: "campaign", label: "Campanha" },
  { key: "westmarch", label: "West Marches" },
] as const;

export const VISIBILITY_OPTIONS = [
  { key: "private", label: "Privada" },
  { key: "public", label: "Pública" },
] as const;

export const HP_METHODS = [
  { key: "manual", label: "Manual", description: "O mestre controla os PVs manualmente" },
  { key: "auto-roll", label: "Rolagem Automática", description: "PVs rolados automaticamente ao subir de nível" },
  { key: "fixed", label: "Fixo", description: "Usa o valor fixo do dado de vida" },
] as const;

export const DICE_VISIBILITY_OPTIONS = [
  { key: "public", label: "Público", description: "Todos veem as rolagens" },
  { key: "gm-only", label: "Só o Mestre", description: "Apenas o mestre vê os resultados" },
] as const;

// ─── D&D 5e Alignments ─────────────────────────────────

export const DND_ALIGNMENTS = [
  { key: "LG", label: "Leal Bom", short: "LB" },
  { key: "NG", label: "Neutro Bom", short: "NB" },
  { key: "CG", label: "Caótico Bom", short: "CB" },
  { key: "LN", label: "Leal Neutro", short: "LN" },
  { key: "TN", label: "Neutro", short: "N" },
  { key: "CN", label: "Caótico Neutro", short: "CN" },
  { key: "LE", label: "Leal Mau", short: "LM" },
  { key: "NE", label: "Neutro Mau", short: "NM" },
  { key: "CE", label: "Caótico Mau", short: "CM" },
] as const;
