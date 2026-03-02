import type { LucideIcon } from "lucide-react-native";
import {
  Sword,
  Flame,
  Search,
  Moon,
  Skull,
  Dice5,
  Settings,
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

export const SYSTEM_ICONS: Record<string, string> = {
  dnd5e: "⚔️",
  tormenta20: "🌪️",
  coc7: "🔍",
  vampireV5: "🧛",
  generic: "🎲",
  starfinder: "🚀",
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

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-1",
    title: "Crie mundos épicos",
    subtitle: "Dicas para mestres construírem cenários imersivos para suas mesas.",
    accentColor: "#6C5CE7",
    icon: "🏰",
    type: "tip",
  },
  {
    id: "news-2",
    title: "Arte: Dragão Ancestral",
    subtitle: "Ilustração da comunidade por @elvenartist.",
    accentColor: "#E94560",
    icon: "🐉",
    type: "art",
  },
  {
    id: "news-3",
    title: "Sessão destaque da semana",
    subtitle: "\"A Maldição de Strahd\" com 3 sessões ao vivo essa semana!",
    accentColor: "#00B894",
    icon: "⭐",
    type: "highlight",
  },
  {
    id: "news-4",
    title: "Novo sistema: Tormenta20",
    subtitle: "Suporte completo para fichas e dados de Tormenta20.",
    accentColor: "#FDCB6E",
    icon: "🌪️",
    type: "news",
  },
  {
    id: "news-5",
    title: "Guia de roleplay",
    subtitle: "Como interpretar personagens memoráveis em 5 passos.",
    accentColor: "#A29BFE",
    icon: "🎭",
    type: "tip",
  },
  {
    id: "news-6",
    title: "Arte: Taverna do Grifo",
    subtitle: "Um ponto de encontro clássico para aventureiros.",
    accentColor: "#74B9FF",
    icon: "🍺",
    type: "art",
  },
  {
    id: "news-7",
    title: "Mapas interativos",
    subtitle: "Fog of war e tokens agora disponíveis para todas as mesas.",
    accentColor: "#FF6B6B",
    icon: "🗺️",
    type: "news",
  },
  {
    id: "news-8",
    title: "Combate narrativo",
    subtitle: "Técnicas para tornar combates mais cinematográficos.",
    accentColor: "#636E72",
    icon: "⚔️",
    type: "tip",
  },
  {
    id: "news-9",
    title: "Comunidade crescendo!",
    subtitle: "Mais de 500 mestres já criaram sessões no QuestBoard.",
    accentColor: "#00B894",
    icon: "🎉",
    type: "highlight",
  },
  {
    id: "news-10",
    title: "Arte: Necromante Sombrio",
    subtitle: "Concept art para sua próxima campanha de horror.",
    accentColor: "#4A1942",
    icon: "💀",
    type: "art",
  },
];

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

export const FEED_SESSIONS: FeedSession[] = [
  {
    id: "mock-1",
    name: "A Maldição de Strahd",
    system: "dnd5e",
    gmName: "DarkMaster",
    playerCount: 3,
    maxPlayers: 5,
    tags: ["horror", "sandbox"],
    accentColor: "#6C5CE7",
    description: "Explore as terras sombrias de Barovia e enfrente o vampiro Strahd.",
    isLive: true,
  },
  {
    id: "mock-2",
    name: "O Despertar de Azgher",
    system: "tormenta20",
    gmName: "ArtoriasRPG",
    playerCount: 4,
    maxPlayers: 6,
    tags: ["épico", "combate"],
    accentColor: "#E94560",
    description: "Os deuses de Arton estão em perigo. Heróis são convocados.",
    isLive: false,
  },
  {
    id: "mock-3",
    name: "Masks of Nyarlathotep",
    system: "coc7",
    gmName: "CosmicHorror",
    playerCount: 2,
    maxPlayers: 4,
    tags: ["investigação", "horror cósmico"],
    accentColor: "#00B894",
    description: "Uma investigação global que começa em Nova York, 1925.",
    isLive: false,
  },
  {
    id: "mock-4",
    name: "Noite Eterna em São Paulo",
    system: "vampireV5",
    gmName: "NocturnalST",
    playerCount: 5,
    maxPlayers: 5,
    tags: ["drama", "política"],
    accentColor: "#FF6B6B",
    description: "Navegue pela Camarilla paulistana e sobreviva às intrigas.",
    isLive: true,
  },
  {
    id: "mock-5",
    name: "Fortaleza dos Goblins",
    system: "dnd5e",
    gmName: "QuestMaster",
    playerCount: 1,
    maxPlayers: 4,
    tags: ["iniciante", "dungeon crawl"],
    accentColor: "#FDCB6E",
    description: "Uma dungeon clássica perfeita para iniciantes.",
    isLive: false,
  },
  {
    id: "mock-6",
    name: "Operação Lua Negra",
    system: "generic",
    gmName: "TacticalGM",
    playerCount: 3,
    maxPlayers: 5,
    tags: ["sci-fi", "tático"],
    accentColor: "#74B9FF",
    description: "Mercenários espaciais em uma missão de resgate.",
    isLive: false,
  },
  {
    id: "mock-7",
    name: "O Legado de Vectora",
    system: "tormenta20",
    gmName: "BrasílioMestre",
    playerCount: 2,
    maxPlayers: 5,
    tags: ["exploração", "mistério"],
    accentColor: "#A29BFE",
    description: "Ruínas de uma civilização perdida guardam segredos perigosos.",
    isLive: true,
  },
  {
    id: "mock-8",
    name: "Horror on the Orient Express",
    system: "coc7",
    gmName: "ElderSign",
    playerCount: 0,
    maxPlayers: 6,
    tags: ["campanha longa", "viagem"],
    accentColor: "#636E72",
    description: "De Londres a Constantinopla, em um trem cheio de mistérios.",
    isLive: false,
  },
];

// ─── Tab: Fórum ──────────────────────────────────────────

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  replies: number;
  lastActivity: string;
  tags: string[];
}

export const FORUM_THREADS: ForumThread[] = [
  {
    id: "forum-1",
    title: "Qual o melhor sistema para iniciantes?",
    author: "NovicePlayer",
    replies: 24,
    lastActivity: "2h atrás",
    tags: ["iniciante", "dúvida"],
  },
  {
    id: "forum-2",
    title: "Dicas para mestrar Call of Cthulhu",
    author: "CosmicHorror",
    replies: 18,
    lastActivity: "5h atrás",
    tags: ["coc7", "mestre"],
  },
  {
    id: "forum-3",
    title: "Homebrew: classes para Tormenta20",
    author: "BrasílioMestre",
    replies: 42,
    lastActivity: "1d atrás",
    tags: ["tormenta20", "homebrew"],
  },
  {
    id: "forum-4",
    title: "Como lidar com jogadores problemáticos?",
    author: "PeacefulGM",
    replies: 67,
    lastActivity: "3h atrás",
    tags: ["mestre", "comunidade"],
  },
  {
    id: "forum-5",
    title: "Campanha de 2 anos — relato completo",
    author: "VeteranDM",
    replies: 31,
    lastActivity: "12h atrás",
    tags: ["relato", "campanha"],
  },
  {
    id: "forum-6",
    title: "Música ambiente para sessões de horror",
    author: "AtmosphericGM",
    replies: 15,
    lastActivity: "1d atrás",
    tags: ["recursos", "horror"],
  },
  {
    id: "forum-7",
    title: "Procurando grupo em São Paulo",
    author: "PaulistanoRPG",
    replies: 8,
    lastActivity: "6h atrás",
    tags: ["lfg", "presencial"],
  },
  {
    id: "forum-8",
    title: "IA como assistente de mestre — vale a pena?",
    author: "TechMaster",
    replies: 53,
    lastActivity: "4h atrás",
    tags: ["ia", "ferramentas"],
  },
];

// ─── User Sessions (authenticated) ─────────────────────

export interface UserSession extends FeedSession {
  role: "gm" | "player";
  nextSchedule?: string;
  sessionNumber: number;
  status: "live" | "scheduled" | "idle";
}

export const MY_SESSIONS_GM: UserSession[] = [
  {
    id: "my-1",
    name: "A Maldição de Strahd",
    system: "dnd5e",
    gmName: "Você",
    playerCount: 4,
    maxPlayers: 5,
    tags: ["horror", "sandbox"],
    accentColor: "#6C5CE7",
    description: "Explore as terras sombrias de Barovia.",
    isLive: true,
    role: "gm",
    sessionNumber: 12,
    status: "live",
  },
  {
    id: "my-2",
    name: "Fortaleza dos Goblins",
    system: "dnd5e",
    gmName: "Você",
    playerCount: 3,
    maxPlayers: 4,
    tags: ["iniciante", "dungeon crawl"],
    accentColor: "#FDCB6E",
    description: "Uma dungeon clássica para iniciantes.",
    isLive: false,
    role: "gm",
    nextSchedule: "Sábado, 19:00",
    sessionNumber: 5,
    status: "scheduled",
  },
  {
    id: "my-3",
    name: "O Legado de Vectora",
    system: "tormenta20",
    gmName: "Você",
    playerCount: 2,
    maxPlayers: 5,
    tags: ["exploração", "mistério"],
    accentColor: "#A29BFE",
    description: "Ruínas de uma civilização perdida.",
    isLive: false,
    role: "gm",
    sessionNumber: 8,
    status: "idle",
  },
];

export const MY_SESSIONS_PLAYER: UserSession[] = [
  {
    id: "play-1",
    name: "Noite Eterna em São Paulo",
    system: "vampireV5",
    gmName: "NocturnalST",
    playerCount: 5,
    maxPlayers: 5,
    tags: ["drama", "política"],
    accentColor: "#FF6B6B",
    description: "Navegue pela Camarilla paulistana.",
    isLive: true,
    role: "player",
    sessionNumber: 15,
    status: "live",
  },
  {
    id: "play-2",
    name: "Masks of Nyarlathotep",
    system: "coc7",
    gmName: "CosmicHorror",
    playerCount: 3,
    maxPlayers: 4,
    tags: ["investigação", "horror cósmico"],
    accentColor: "#00B894",
    description: "Uma investigação global em 1925.",
    isLive: false,
    role: "player",
    nextSchedule: "Domingo, 15:00",
    sessionNumber: 7,
    status: "scheduled",
  },
];

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

export const MY_CHARACTERS: MockCharacter[] = [
  {
    id: "char-1",
    name: "Eldrin",
    class: "Mago",
    level: 8,
    currentHp: 45,
    maxHp: 52,
    system: "dnd5e",
    avatar: "🧙",
  },
  {
    id: "char-2",
    name: "Kira Ironfist",
    class: "Guerreira",
    level: 5,
    currentHp: 62,
    maxHp: 62,
    system: "dnd5e",
    avatar: "⚔️",
  },
  {
    id: "char-3",
    name: "Zael",
    class: "Ladino",
    level: 3,
    currentHp: 18,
    maxHp: 28,
    system: "tormenta20",
    avatar: "🗡️",
  },
];

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
    characterCount: "12.4k personagens",
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
    characterCount: "3.2k personagens",
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
    characterCount: "1.8k personagens",
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
    characterCount: "890 personagens",
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
    characterCount: "1.2k personagens",
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
    characterCount: "420 personagens",
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
