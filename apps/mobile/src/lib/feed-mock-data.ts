import type { FeedPost, FeedComment } from "@questboard/types";
import {
  PostType,
  PostVisibility,
  ReactionType,
  CommentBadge,
} from "@questboard/types";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

export const MOCK_FEED_POSTS: FeedPost[] = [
  // 1 — Text post
  {
    id: "post-1",
    type: PostType.TEXT,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u1",
      displayName: "Lucas Mestre",
      username: "lucasgm",
      avatarUrl: null,
    },
    data: {
      body: "Acabei de terminar de preparar a sessao de hoje! Os jogadores nao fazem ideia do que os espera na Cripta dos Sussurros... 🎲",
      tags: ["dnd5e", "preparacao"],
    },
    engagement: {
      reactions: [
        { type: ReactionType.HYPE, count: 7 },
        { type: ReactionType.HEART, count: 5 },
      ],
      totalReactions: 12,
      comments: 3,
      reposts: 1,
      bookmarks: 2,
      myReaction: null,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(2),
  },
  // 2 — Dice roll (NAT 20)
  {
    id: "post-2",
    type: PostType.DICE_ROLL,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u2",
      displayName: "Ana Rogueira",
      username: "anarogue",
      avatarUrl: null,
    },
    data: {
      formula: "1d20+7",
      results: [20],
      total: 27,
      label: "Ataque Furtivo",
      context: "Cravei a adaga nas costas do dragao jovem! NAT 20!",
      isNat20: true,
      isNat1: false,
    },
    engagement: {
      reactions: [
        { type: ReactionType.EPIC, count: 28 },
        { type: ReactionType.HYPE, count: 12 },
        { type: ReactionType.HEART, count: 5 },
      ],
      totalReactions: 45,
      comments: 8,
      reposts: 5,
      bookmarks: 0,
      myReaction: ReactionType.EPIC,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(3),
  },
  // 3 — Character card
  {
    id: "post-3",
    type: PostType.CHARACTER_CARD,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u3",
      displayName: "Pedro Bardo",
      username: "pedrobard",
      avatarUrl: null,
    },
    data: {
      characterId: "char-1",
      characterName: "Theron Cantaluz",
      characterClass: "Bardo",
      characterRace: "Meio-Elfo",
      characterLevel: 7,
      system: "dnd5e",
      avatarUrl: null,
      caption:
        "Meu novo personagem para a campanha Maldição de Strahd! Pronto pra cantar e encantar. 🎵",
    },
    engagement: {
      reactions: [
        { type: ReactionType.HEART, count: 15 },
        { type: ReactionType.LORE, count: 8 },
      ],
      totalReactions: 23,
      comments: 5,
      reposts: 2,
      bookmarks: 4,
      myReaction: null,
      isBookmarked: true,
      isReposted: false,
    },
    createdAt: hoursAgo(5),
  },
  // 4 — Session highlight
  {
    id: "post-4",
    type: PostType.SESSION_HIGHLIGHT,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u4",
      displayName: "Marina GM",
      username: "marinagm",
      avatarUrl: null,
    },
    data: {
      sessionId: "sess-1",
      sessionName: "Sessao #12 - O Despertar",
      campaignName: "Cronicas de Arton",
      system: "tormenta20",
      momentTitle: "A Queda do Paladino",
      momentDescription:
        "O paladino Kael sacrificou sua vida para selar o portal demoníaco. Toda a mesa ficou em silencio por 30 segundos. Momento épico!",
    },
    engagement: {
      reactions: [
        { type: ReactionType.EPIC, count: 32 },
        { type: ReactionType.RIP, count: 20 },
        { type: ReactionType.HEART, count: 15 },
      ],
      totalReactions: 67,
      comments: 14,
      reposts: 8,
      bookmarks: 12,
      myReaction: null,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(8),
  },
  // 5 — Artwork
  {
    id: "post-5",
    type: PostType.ARTWORK,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u5",
      displayName: "Julia Artista",
      username: "juliaart",
      avatarUrl: null,
    },
    data: {
      imageUrl: null,
      caption:
        "Comissao que fiz do grupo da campanha Segredos de Ravenloft! Ficou incrivel 🎨",
      tags: ["fanart", "dnd5e", "comissao"],
      width: 800,
      height: 600,
    },
    engagement: {
      reactions: [
        { type: ReactionType.HEART, count: 50 },
        { type: ReactionType.HYPE, count: 25 },
        { type: ReactionType.LORE, count: 14 },
      ],
      totalReactions: 89,
      comments: 12,
      reposts: 15,
      bookmarks: 20,
      myReaction: ReactionType.HEART,
      isBookmarked: true,
      isReposted: false,
    },
    createdAt: hoursAgo(12),
  },
  // 6 — Campaign recruit
  {
    id: "post-6",
    type: PostType.CAMPAIGN_RECRUIT,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u6",
      displayName: "Rafael Mestre",
      username: "rafagm",
      avatarUrl: null,
    },
    data: {
      campaignId: "camp-1",
      campaignName: "A Maldição do Rei Lich",
      system: "dnd5e",
      description:
        "Procuro 2 jogadores para campanha semanal! Sessoes as sextas 20h. Nivel 5, homebrew com elementos de horror.",
      currentPlayers: 3,
      maxPlayers: 5,
      tags: ["sexta", "noturno", "horror", "homebrew"],
    },
    engagement: {
      reactions: [
        { type: ReactionType.HYPE, count: 18 },
        { type: ReactionType.HEART, count: 16 },
      ],
      totalReactions: 34,
      comments: 18,
      reposts: 7,
      bookmarks: 9,
      myReaction: null,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(16),
  },
  // 7 — Text post (tip)
  {
    id: "post-7",
    type: PostType.TEXT,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u1",
      displayName: "Lucas Mestre",
      username: "lucasgm",
      avatarUrl: null,
    },
    data: {
      body: "Dica de mestre: criem uma playlist diferente para cada ambiente da dungeon. Muda completamente a atmosfera da sessao! Recomendo Tabletop Audio pra quem nao conhece.",
      tags: ["dica", "ambientacao", "musica"],
    },
    engagement: {
      reactions: [
        { type: ReactionType.LORE, count: 30 },
        { type: ReactionType.HEART, count: 20 },
        { type: ReactionType.HYPE, count: 6 },
      ],
      totalReactions: 56,
      comments: 9,
      reposts: 12,
      bookmarks: 25,
      myReaction: null,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(24),
  },
  // 8 — Dice roll (NAT 1)
  {
    id: "post-8",
    type: PostType.DICE_ROLL,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u3",
      displayName: "Pedro Bardo",
      username: "pedrobard",
      avatarUrl: null,
    },
    data: {
      formula: "1d20+3",
      results: [1],
      total: 4,
      label: "Persuasao",
      context:
        "Tentei convencer o rei a nos dar um castelo. Acho que insultei a mae dele sem querer...",
      isNat20: false,
      isNat1: true,
    },
    engagement: {
      reactions: [
        { type: ReactionType.LAUGH, count: 45 },
        { type: ReactionType.RIP, count: 20 },
        { type: ReactionType.HEART, count: 13 },
      ],
      totalReactions: 78,
      comments: 22,
      reposts: 10,
      bookmarks: 1,
      myReaction: null,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(28),
  },
  // 9 — Character card
  {
    id: "post-9",
    type: PostType.CHARACTER_CARD,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u2",
      displayName: "Ana Rogueira",
      username: "anarogue",
      avatarUrl: null,
    },
    data: {
      characterId: "char-2",
      characterName: "Sombra Noturna",
      characterClass: "Ladina",
      characterRace: "Halfling",
      characterLevel: 12,
      system: "dnd5e",
      avatarUrl: null,
      caption:
        "Level up! Sombra chegou no nivel 12 depois de 2 anos de campanha 🗡️",
    },
    engagement: {
      reactions: [
        { type: ReactionType.EPIC, count: 18 },
        { type: ReactionType.HEART, count: 13 },
      ],
      totalReactions: 31,
      comments: 7,
      reposts: 3,
      bookmarks: 2,
      myReaction: null,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(36),
  },
  // 10 — Campaign recruit (Tormenta)
  {
    id: "post-10",
    type: PostType.CAMPAIGN_RECRUIT,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u4",
      displayName: "Marina GM",
      username: "marinagm",
      avatarUrl: null,
    },
    data: {
      campaignId: "camp-2",
      campaignName: "Desafio dos Deuses",
      system: "tormenta20",
      description:
        "Nova campanha de Tormenta 20! Procuro jogadores que curtam roleplay pesado e combate tatico. Sabados 14h.",
      currentPlayers: 1,
      maxPlayers: 4,
      tags: ["sabado", "tarde", "tormenta20", "roleplay"],
    },
    engagement: {
      reactions: [
        { type: ReactionType.HYPE, count: 12 },
        { type: ReactionType.HEART, count: 7 },
      ],
      totalReactions: 19,
      comments: 11,
      reposts: 4,
      bookmarks: 6,
      myReaction: null,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(48),
  },
  // 11 — Quote post (quoting post-2 nat 20)
  {
    id: "post-11",
    type: PostType.QUOTE,
    visibility: PostVisibility.PUBLIC,
    author: {
      id: "u1",
      displayName: "Lucas Mestre",
      username: "lucasgm",
      avatarUrl: null,
    },
    data: {
      body: "Isso aconteceu na nossa campanha semana passada tambem kkkk, exatamente igual. RPG é universal 😂",
      quotedPost: {
        id: "post-2",
        type: PostType.DICE_ROLL,
        visibility: PostVisibility.PUBLIC,
        author: {
          id: "u2",
          displayName: "Ana Rogueira",
          username: "anarogue",
          avatarUrl: null,
        },
        data: {
          formula: "1d20+7",
          results: [20],
          total: 27,
          label: "Ataque Furtivo",
          context: "Cravei a adaga nas costas do dragao jovem! NAT 20!",
          isNat20: true,
          isNat1: false,
        },
        engagement: {
          reactions: [{ type: ReactionType.EPIC, count: 28 }],
          totalReactions: 45,
          comments: 8,
          reposts: 5,
          bookmarks: 0,
          myReaction: null,
          isBookmarked: false,
          isReposted: false,
        },
        createdAt: hoursAgo(3),
      },
    },
    engagement: {
      reactions: [
        { type: ReactionType.LAUGH, count: 8 },
        { type: ReactionType.HEART, count: 4 },
      ],
      totalReactions: 12,
      comments: 2,
      reposts: 1,
      bookmarks: 0,
      myReaction: null,
      isBookmarked: false,
      isReposted: false,
    },
    createdAt: hoursAgo(1),
  },
];

// ─── Mock Comments ───────────────────────────────────────

export const MOCK_COMMENTS: Record<string, FeedComment[]> = {
  "post-4": [
    {
      id: "c-4-1",
      postId: "post-4",
      author: {
        id: "u2",
        displayName: "Ana Rogueira",
        username: "anarogue",
        avatarUrl: null,
      },
      content:
        "Eu chorei nessa cena! Kael foi o melhor paladino que ja vi. O sacrificio dele deu um significado enorme pra campanha.",
      badge: null,
      isPinned: true,
      createdAt: hoursAgo(7),
      reactions: [{ type: ReactionType.HEART, count: 5 }],
      totalReactions: 5,
      myReaction: null,
      replies: [
        {
          id: "c-4-1-r1",
          postId: "post-4",
          author: {
            id: "u4",
            displayName: "Marina GM",
            username: "marinagm",
            avatarUrl: null,
          },
          content:
            "Foi um dos momentos mais bonitos que ja mestrei! Obrigada por ter vivido isso com a gente.",
          badge: CommentBadge.AUTHOR,
          isPinned: false,
          createdAt: hoursAgo(6),
          reactions: [{ type: ReactionType.HEART, count: 3 }],
          totalReactions: 3,
          myReaction: null,
          replies: [],
          replyCount: 0,
        },
      ],
      replyCount: 1,
    },
    {
      id: "c-4-2",
      postId: "post-4",
      author: {
        id: "u3",
        displayName: "Pedro Bardo",
        username: "pedrobard",
        avatarUrl: null,
      },
      content:
        "Momento tipo filme. Quando ele disse 'pela luz que me guia', eu sabia que ia acontecer algo grande.",
      badge: null,
      isPinned: false,
      createdAt: hoursAgo(6),
      reactions: [{ type: ReactionType.EPIC, count: 2 }],
      totalReactions: 2,
      myReaction: null,
      replies: [],
      replyCount: 0,
    },
    {
      id: "c-4-3",
      postId: "post-4",
      author: {
        id: "u6",
        displayName: "Rafael Mestre",
        username: "rafagm",
        avatarUrl: null,
      },
      content:
        "Isso me inspira a criar momentos assim nas minhas sessoes. Parabens pela narrativa!",
      badge: null,
      isPinned: false,
      createdAt: hoursAgo(5),
      reactions: [{ type: ReactionType.LORE, count: 1 }],
      totalReactions: 1,
      myReaction: null,
      replies: [],
      replyCount: 0,
    },
  ],
  "post-2": [
    {
      id: "c-2-1",
      postId: "post-2",
      author: {
        id: "u1",
        displayName: "Lucas Mestre",
        username: "lucasgm",
        avatarUrl: null,
      },
      content: "NAT 20 NO ATAQUE FURTIVO?? Isso é ilegal hahaha parabens!",
      badge: null,
      isPinned: false,
      createdAt: hoursAgo(2),
      reactions: [{ type: ReactionType.LAUGH, count: 4 }],
      totalReactions: 4,
      myReaction: null,
      replies: [],
      replyCount: 0,
    },
    {
      id: "c-2-2",
      postId: "post-2",
      author: {
        id: "u2",
        displayName: "Ana Rogueira",
        username: "anarogue",
        avatarUrl: null,
      },
      content:
        "O mestre ficou de boca aberta quando eu disse que ia usar o ataque furtivo hehe 🗡️",
      badge: CommentBadge.AUTHOR,
      isPinned: false,
      createdAt: hoursAgo(2),
      reactions: [{ type: ReactionType.EPIC, count: 2 }],
      totalReactions: 2,
      myReaction: null,
      replies: [],
      replyCount: 0,
    },
  ],
  "post-8": [
    {
      id: "c-8-1",
      postId: "post-8",
      author: {
        id: "u1",
        displayName: "Lucas Mestre",
        username: "lucasgm",
        avatarUrl: null,
      },
      content: "F no chat pelo bardo kkkkkk",
      badge: null,
      isPinned: false,
      createdAt: hoursAgo(27),
      reactions: [{ type: ReactionType.LAUGH, count: 8 }],
      totalReactions: 8,
      myReaction: null,
      replies: [
        {
          id: "c-8-1-r1",
          postId: "post-8",
          author: {
            id: "u3",
            displayName: "Pedro Bardo",
            username: "pedrobard",
            avatarUrl: null,
          },
          content: "Nao ri. Meu bardo agora é persona non grata no reino inteiro 😭",
          badge: CommentBadge.AUTHOR,
          isPinned: false,
          createdAt: hoursAgo(26),
          reactions: [
            { type: ReactionType.LAUGH, count: 12 },
            { type: ReactionType.RIP, count: 3 },
          ],
          totalReactions: 15,
          myReaction: null,
          replies: [],
          replyCount: 0,
        },
      ],
      replyCount: 1,
    },
  ],
};
