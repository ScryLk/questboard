import type {
  UserProfile,
  LevelReward,
  XPSource,
} from "@questboard/types";
import {
  Plan,
  ProfileTier,
  CharacterStatus,
  CampaignRole,
  ProfileCampaignStatus,
  PostType,
  PostVisibility,
  ReactionType,
} from "@questboard/types";

// ─── Helper ─────────────────────────────────────────

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

// ─── Own Profile ────────────────────────────────────

export const MOCK_OWN_PROFILE: UserProfile = {
  id: "user-1",
  username: "voce",
  displayName: "Lucas Ferreira",
  avatarUrl: null,
  bannerUrl: null,
  bio: "Explorador de masmorras, sobrevivente de TPKs e eterno otimista. Sempre em busca da proxima aventura epica.",
  location: "Porto Alegre",
  joinedAt: "2025-01-15T00:00:00.000Z",
  plan: Plan.ADVENTURER,
  isGM: true,
  isPrivate: false,
  equippedTitle: { label: "O Lendario Narrador", color: "#FDCB6E" },

  level: 47,
  tier: ProfileTier.PLATINUM,
  currentXP: 1840,
  requiredXP: 2560,

  followersCount: 248,
  followingCount: 84,
  campaignsCount: 12,
  isFollowing: false,

  stats: {
    sessions: 248,
    hoursPlayed: 620,
    characters: 12,
    diceRolled: 4821,
    achievements: 34,
    nat20s: 312,
    nat1s: 8,
  },

  gmStats: {
    campaigns: 6,
    hoursNarrated: 180,
    uniquePlayers: 14,
    averageRating: 4.9,
    totalReviews: 18,
  },

  featuredCharacters: [
    {
      id: "char-1",
      name: "Eldrin",
      class: "Mago",
      level: 12,
      system: "D&D 5e",
      status: CharacterStatus.ACTIVE,
      avatarUrl: null,
      highlight: "Derrotou Strahd sozinho",
    },
    {
      id: "char-2",
      name: "Kira",
      class: "Ladina",
      level: 8,
      system: "Tormenta 20",
      status: CharacterStatus.ACTIVE,
      avatarUrl: null,
      highlight: "Sobrevivente da Sessao 7",
    },
    {
      id: "char-3",
      name: "Borin",
      class: "Guerreiro",
      level: 6,
      system: "D&D 5e",
      status: CharacterStatus.DECEASED,
      avatarUrl: null,
      highlight: "TPK mais dramatico da mesa",
    },
  ],

  featuredAchievements: [
    {
      id: "ach-1",
      name: "Dragao Abatido",
      icon: "Trophy",
      rarity: "epic",
      isUnlocked: true,
      unlockedAt: daysAgo(30),
    },
    {
      id: "ach-2",
      name: "Primeira Campanha",
      icon: "Swords",
      rarity: "rare",
      isUnlocked: true,
      unlockedAt: daysAgo(180),
    },
    {
      id: "ach-3",
      name: "Sobrevivente de TPK",
      icon: "Skull",
      rarity: "legendary",
      isUnlocked: true,
      unlockedAt: daysAgo(60),
    },
    {
      id: "ach-4",
      name: "Segredo Oculto",
      icon: "HelpCircle",
      rarity: "legendary",
      isUnlocked: false,
      unlockedAt: null,
    },
  ],

  recentCampaigns: [
    {
      id: "camp-1",
      name: "A Maldicao de Strahd",
      system: "D&D 5e",
      role: CampaignRole.PLAYER,
      status: ProfileCampaignStatus.ONGOING,
      totalSessions: 12,
      progress: 85,
      thumbnailUrl: null,
      rating: null,
      reviewCount: null,
      playerCount: 4,
      maxPlayers: 5,
      nextSessionAt: null,
    },
    {
      id: "camp-2",
      name: "Os Filhos do Apocalipse",
      system: "Tormenta 20",
      role: CampaignRole.PLAYER,
      status: ProfileCampaignStatus.COMPLETED,
      totalSessions: 8,
      progress: null,
      thumbnailUrl: null,
      rating: null,
      reviewCount: null,
      playerCount: 5,
      maxPlayers: 5,
      nextSessionAt: null,
    },
    {
      id: "camp-3",
      name: "O Horror de Dunwich",
      system: "Call of Cthulhu",
      role: CampaignRole.PLAYER,
      status: ProfileCampaignStatus.ABANDONED,
      totalSessions: 3,
      progress: null,
      thumbnailUrl: null,
      rating: null,
      reviewCount: null,
      playerCount: 3,
      maxPlayers: 4,
      nextSessionAt: null,
    },
  ],

  gmCampaigns: [
    {
      id: "gm-camp-1",
      name: "A Maldicao de Strahd",
      system: "D&D 5e",
      role: CampaignRole.GM,
      status: ProfileCampaignStatus.ONGOING,
      totalSessions: 12,
      progress: 85,
      thumbnailUrl: null,
      rating: 5.0,
      reviewCount: 3,
      playerCount: 4,
      maxPlayers: 5,
      nextSessionAt: null,
    },
    {
      id: "gm-camp-2",
      name: "O Horror de Dunwich",
      system: "Call of Cthulhu",
      role: CampaignRole.GM,
      status: ProfileCampaignStatus.RECRUITING,
      totalSessions: 0,
      progress: null,
      thumbnailUrl: null,
      rating: null,
      reviewCount: null,
      playerCount: 2,
      maxPlayers: 4,
      nextSessionAt: "2025-03-15T20:00:00.000Z",
    },
  ],

  gmReviews: [
    {
      id: "rev-1",
      author: {
        displayName: "Maria Souza",
        username: "maria_cleric",
        avatarUrl: null,
      },
      rating: 5,
      content:
        "Lucas e um mestre incrivel. A atmosfera que ele cria e unica — cada sessao parece um episodio de serie. Sempre preparado com mapas bonitos e NPCs memoraveis.",
      createdAt: daysAgo(14),
    },
    {
      id: "rev-2",
      author: {
        displayName: "Pedro Alves",
        username: "pedro_ranger",
        avatarUrl: null,
      },
      rating: 5,
      content:
        "Muito preparado, sempre com mapas bonitos e narrativas envolventes. Recomendo demais para quem quer uma experiencia imersiva de RPG.",
      createdAt: daysAgo(30),
    },
  ],

  gmTags: [
    "Horror Gotico",
    "Narrativa Intensa",
    "Roleplay Pesado",
    "Iniciantes bem-vindos",
  ],

  posts: [
    {
      id: "profile-post-1",
      type: PostType.TEXT,
      visibility: PostVisibility.PUBLIC,
      author: {
        id: "user-1",
        displayName: "Lucas Ferreira",
        username: "voce",
        avatarUrl: null,
      },
      data: {
        body: "Sessao incrivel ontem! O grupo finalmente encontrou a entrada da cripta de Strahd. Tensao maxima!",
        tags: ["dnd5e", "strahd"],
      },
      engagement: {
        reactions: [
          { type: ReactionType.EPIC, count: 8 },
          { type: ReactionType.HYPE, count: 5 },
        ],
        totalReactions: 13,
        comments: 4,
        reposts: 2,
        bookmarks: 1,
        myReaction: null,
        isBookmarked: false,
        isReposted: false,
      },
      createdAt: daysAgo(1),
    },
  ],
};

// ─── Other Profile ──────────────────────────────────

export const MOCK_OTHER_PROFILE: UserProfile = {
  id: "user-2",
  username: "eldrin_mago",
  displayName: "Rafael Costa",
  avatarUrl: null,
  bannerUrl: null,
  bio: "Mago nivel 20 na vida real. Coleciono dados e historias epicas.",
  location: "Sao Paulo",
  joinedAt: "2024-06-10T00:00:00.000Z",
  plan: Plan.LEGENDARY,
  isGM: false,
  isPrivate: false,
  equippedTitle: { label: "Arquimago Supremo", color: "#6C5CE7" },

  level: 32,
  tier: ProfileTier.GOLD,
  currentXP: 980,
  requiredXP: 1800,

  followersCount: 156,
  followingCount: 42,
  campaignsCount: 5,
  isFollowing: false,

  stats: {
    sessions: 98,
    hoursPlayed: 245,
    characters: 6,
    diceRolled: 2103,
    achievements: 18,
    nat20s: 142,
    nat1s: 15,
  },

  gmStats: null,

  featuredCharacters: [
    {
      id: "char-r1",
      name: "Thalion",
      class: "Mago",
      level: 15,
      system: "D&D 5e",
      status: CharacterStatus.ACTIVE,
      avatarUrl: null,
      highlight: "Mestre da Torre Arcana",
    },
    {
      id: "char-r2",
      name: "Grimjaw",
      class: "Barbaro",
      level: 10,
      system: "Pathfinder 2e",
      status: CharacterStatus.RETIRED,
      avatarUrl: null,
      highlight: "Aposentado apos 50 sessoes",
    },
  ],

  featuredAchievements: [
    {
      id: "ach-r1",
      name: "Veterano",
      icon: "Shield",
      rarity: "rare",
      isUnlocked: true,
      unlockedAt: daysAgo(90),
    },
    {
      id: "ach-r2",
      name: "Rolador Nato",
      icon: "Dice5",
      rarity: "common",
      isUnlocked: true,
      unlockedAt: daysAgo(120),
    },
  ],

  recentCampaigns: [
    {
      id: "camp-r1",
      name: "A Maldicao de Strahd",
      system: "D&D 5e",
      role: CampaignRole.PLAYER,
      status: ProfileCampaignStatus.ONGOING,
      totalSessions: 12,
      progress: 85,
      thumbnailUrl: null,
      rating: null,
      reviewCount: null,
      playerCount: 4,
      maxPlayers: 5,
      nextSessionAt: null,
    },
  ],

  gmCampaigns: [],
  gmReviews: [],
  gmTags: [],
  posts: [],
};

// ─── Level Rewards ──────────────────────────────────

export const MOCK_LEVEL_REWARDS: LevelReward[] = [
  { level: 48, icon: "Dice5", label: "Skin de Dado: Rubi", type: "skin" },
  { level: 50, icon: "Crown", label: "Titulo: O Mestre", type: "title" },
  { level: 50, icon: "Frame", label: "Moldura: Dourada", type: "frame" },
];

// ─── XP Sources ─────────────────────────────────────

export const MOCK_XP_SOURCES: XPSource[] = [
  { icon: "Swords", label: "Participar de sessao", value: 50 },
  { icon: "Drama", label: "Narrar uma sessao", value: 80 },
  { icon: "Trophy", label: "Desbloquear conquista", value: 30 },
  { icon: "BookOpen", label: "Completar campanha", value: 200 },
  { icon: "Dice5", label: "A cada 100 dados", value: 5 },
];
