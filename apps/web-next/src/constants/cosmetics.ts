import type { CosmeticItem, GMStyleTag } from "@/types/profile";

// ── Frames ──

export const COSMETIC_FRAMES: CosmeticItem[] = [
  {
    id: "frame-default",
    category: "frame",
    name: "Padrão",
    description: "Moldura básica do aventureiro.",
    rarity: "common",
    cssClass: "frame-default",
    unlocked: true,
  },
  {
    id: "frame-silver-ring",
    category: "frame",
    name: "Anel de Prata",
    description: "Uma moldura prateada elegante.",
    rarity: "uncommon",
    cssClass: "frame-silver-ring",
    unlocked: true,
  },
  {
    id: "frame-arcane-glow",
    category: "frame",
    name: "Brilho Arcano",
    description: "Emana um brilho mágico azulado.",
    rarity: "rare",
    cssClass: "frame-arcane-glow",
    unlocked: true,
    unlockHint: "Alcance nível 10 de perfil.",
  },
  {
    id: "frame-dragon-fire",
    category: "frame",
    name: "Fogo de Dragão",
    description: "Chamas épicas envolvem seu avatar.",
    rarity: "epic",
    cssClass: "frame-dragon-fire",
    unlocked: false,
    unlockHint: "Conquista: Matador de Dragões.",
  },
  {
    id: "frame-celestial",
    category: "frame",
    name: "Celestial",
    description: "A moldura dos escolhidos pelos deuses.",
    rarity: "legendary",
    cssClass: "frame-celestial",
    unlocked: false,
    unlockHint: "Alcance nível 20 de perfil.",
  },
];

// ── Banners ──

export const COSMETIC_BANNERS: CosmeticItem[] = [
  {
    id: "banner-default",
    category: "banner",
    name: "Noite Estrelada",
    description: "O banner padrão com tons escuros.",
    rarity: "common",
    cssClass: "banner-default",
    cssStyle: { background: "linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%)" },
    unlocked: true,
  },
  {
    id: "banner-emerald-forest",
    category: "banner",
    name: "Floresta Esmeralda",
    description: "Tons verdes da floresta profunda.",
    rarity: "uncommon",
    cssClass: "banner-emerald-forest",
    cssStyle: { background: "linear-gradient(135deg, #0D1B0E 0%, #1B4332 50%, #2D6A4F 100%)" },
    unlocked: true,
  },
  {
    id: "banner-crimson-throne",
    category: "banner",
    name: "Trono Carmesim",
    description: "O vermelho sanguíneo do poder.",
    rarity: "rare",
    cssClass: "banner-crimson-throne",
    cssStyle: { background: "linear-gradient(135deg, #1A0A0A 0%, #4A1010 50%, #7F1D1D 100%)" },
    unlocked: true,
  },
  {
    id: "banner-astral-plane",
    category: "banner",
    name: "Plano Astral",
    description: "As cores do além resplandecem.",
    rarity: "epic",
    cssClass: "banner-astral-plane",
    cssStyle: { background: "linear-gradient(135deg, #0F0A1A 0%, #3B1F8E 30%, #6C5CE7 60%, #A855F7 100%)" },
    unlocked: false,
    unlockHint: "Conquista: Cartógrafo.",
  },
];

// ── Titles ──

export const COSMETIC_TITLES: CosmeticItem[] = [
  {
    id: "title-adventurer",
    category: "title",
    name: "Aventureiro",
    description: "O título básico de quem se aventura.",
    rarity: "common",
    cssClass: "title-adventurer",
    cssStyle: { color: "#9090A0" },
    unlocked: true,
  },
  {
    id: "title-hero",
    category: "title",
    name: "Herói",
    description: "Reconhecido por suas façanhas.",
    rarity: "uncommon",
    cssClass: "title-hero",
    cssStyle: { color: "#10B981" },
    unlocked: true,
  },
  {
    id: "title-archmage",
    category: "title",
    name: "Arquimago",
    description: "Mestre dos mistérios arcanos.",
    rarity: "rare",
    cssClass: "title-archmage",
    cssStyle: { color: "#3B82F6" },
    unlocked: false,
    unlockHint: "Alcance nível 15 de perfil.",
  },
  {
    id: "title-legend",
    category: "title",
    name: "Lenda Viva",
    description: "Seu nome ecoa através dos reinos.",
    rarity: "epic",
    cssClass: "title-legend",
    cssStyle: { color: "#A855F7" },
    unlocked: false,
    unlockHint: "Jogue 100 sessões.",
  },
  {
    id: "title-chosen",
    category: "title",
    name: "Escolhido dos Deuses",
    description: "O título máximo, reservado aos mais dedicados.",
    rarity: "legendary",
    cssClass: "title-chosen",
    cssStyle: { color: "#F59E0B" },
    unlocked: false,
    unlockHint: "Desbloqueie todas as conquistas.",
  },
];

// ── Backgrounds ──

export const COSMETIC_BACKGROUNDS: CosmeticItem[] = [
  {
    id: "bg-tavern",
    category: "background",
    name: "Taverna",
    description: "O conforto de uma taverna acolhedora.",
    rarity: "common",
    cssClass: "bg-tavern",
    cssStyle: { background: "radial-gradient(ellipse at center, #1A1510 0%, #0A0A0F 70%)" },
    unlocked: true,
  },
  {
    id: "bg-dungeon",
    category: "background",
    name: "Masmorra",
    description: "As sombras da profundeza.",
    rarity: "uncommon",
    cssClass: "bg-dungeon",
    cssStyle: { background: "radial-gradient(ellipse at center, #151520 0%, #0A0A0F 70%)" },
    unlocked: true,
  },
  {
    id: "bg-dragon-lair",
    category: "background",
    name: "Covil do Dragão",
    description: "Calor e tesouros incalculáveis.",
    rarity: "rare",
    cssClass: "bg-dragon-lair",
    cssStyle: { background: "radial-gradient(ellipse at center, #2A1510 0%, #0A0A0F 70%)" },
    unlocked: false,
    unlockHint: "Conquista: Matador de Dragões.",
  },
  {
    id: "bg-feywild",
    category: "background",
    name: "Feywild",
    description: "As cores vibrantes do reino encantado.",
    rarity: "epic",
    cssClass: "bg-feywild",
    cssStyle: { background: "radial-gradient(ellipse at center, #1A1030 0%, #0A0A0F 70%)" },
    unlocked: false,
    unlockHint: "Alcance nível 18 de perfil.",
  },
];

// ── Dice Skins ──

export const COSMETIC_DICE_SKINS: CosmeticItem[] = [
  {
    id: "dice-classic",
    category: "dice_skin",
    name: "Clássico",
    description: "O dado padrão de todo aventureiro.",
    rarity: "common",
    cssClass: "dice-classic",
    unlocked: true,
  },
  {
    id: "dice-obsidian",
    category: "dice_skin",
    name: "Obsidiana",
    description: "Dados negros como a noite.",
    rarity: "uncommon",
    cssClass: "dice-obsidian",
    unlocked: true,
  },
  {
    id: "dice-ethereal",
    category: "dice_skin",
    name: "Etéreo",
    description: "Dados translúcidos com brilho interior.",
    rarity: "rare",
    cssClass: "dice-ethereal",
    unlocked: false,
    unlockHint: "Conquista: Mestre dos Críticos.",
  },
];

// ── Consolidated ──

export const ALL_COSMETICS: CosmeticItem[] = [
  ...COSMETIC_FRAMES,
  ...COSMETIC_BANNERS,
  ...COSMETIC_TITLES,
  ...COSMETIC_BACKGROUNDS,
  ...COSMETIC_DICE_SKINS,
];

export function getCosmeticById(id: string): CosmeticItem | undefined {
  return ALL_COSMETICS.find((c) => c.id === id);
}

// ── GM Style Tags ──

export const GM_STYLE_TAGS: GMStyleTag[] = [
  "narrativo",
  "tático",
  "sandbox",
  "roleplay-heavy",
  "regras-leves",
  "homebrew",
  "teatro-da-mente",
  "mapas-detalhados",
  "horror",
  "humor",
];
