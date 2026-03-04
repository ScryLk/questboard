import type {
  Campaign,
  CampaignSession,
  CampaignPlayer,
  SessionStatusExtended,
} from "@questboard/types";

// ── Mock Campaigns ──────────────────────────────────────

const STRAHD_CAMPAIGN: Campaign = {
  id: "camp_strahd",
  name: "A Maldição de Strahd",
  description:
    "Os aventureiros são transportados para Barovia, uma terra sombria governada pelo vampiro Strahd von Zarovich. Conseguirão escapar da névoa e derrotar o senhor das trevas?",
  system: "dnd5e",
  code: "QB-7K3M",
  status: "active",
  imageUrl: null,
  ownerId: "user_me",
  maxPlayers: 5,
  tags: ["horror", "sandbox", "longa"],
  createdAt: new Date("2025-01-15"),
  updatedAt: new Date("2026-03-01"),
};

const PHANDELVER_CAMPAIGN: Campaign = {
  id: "camp_phandelver",
  name: "Lost Mine of Phandelver",
  description:
    "Uma aventura clássica de D&D 5e que leva os heróis das minas perdidas de Phandelver até os segredos de Wave Echo Cave.",
  system: "dnd5e",
  code: "QB-9M2B",
  status: "active",
  imageUrl: null,
  ownerId: "user_ana",
  maxPlayers: 4,
  tags: ["iniciante", "dungeon crawl"],
  createdAt: new Date("2025-06-10"),
  updatedAt: new Date("2026-02-28"),
};

const WATERDEEP_CAMPAIGN: Campaign = {
  id: "camp_waterdeep",
  name: "Waterdeep: Dragon Heist",
  description:
    "Intrigas urbanas na maior cidade da Costa da Espada. Encontre o tesouro escondido antes que as facções rivais o façam.",
  system: "dnd5e",
  code: "QB-4T8R",
  status: "active",
  imageUrl: null,
  ownerId: "user_carlos",
  maxPlayers: 5,
  tags: ["urbano", "intriga", "roleplay"],
  createdAt: new Date("2026-01-20"),
  updatedAt: new Date("2026-02-25"),
};

export const MOCK_CAMPAIGNS: Campaign[] = [
  STRAHD_CAMPAIGN,
  PHANDELVER_CAMPAIGN,
  WATERDEEP_CAMPAIGN,
];

// ── Mock Players ────────────────────────────────────────

const STRAHD_PLAYERS: CampaignPlayer[] = [
  {
    userId: "user_me",
    displayName: "Lucas Silva",
    avatarUrl: null,
    role: "GM",
    characterName: null,
    characterId: null,
    sessionsAttended: 12,
    joinedAt: new Date("2025-01-15"),
    isOnline: true,
  },
  {
    userId: "user_maria",
    displayName: "Maria Santos",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Eldrin",
    characterId: "char-1",
    sessionsAttended: 11,
    joinedAt: new Date("2025-01-15"),
    isOnline: true,
  },
  {
    userId: "user_pedro",
    displayName: "Pedro Costa",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Kira Ironfist",
    characterId: "char-2",
    sessionsAttended: 10,
    joinedAt: new Date("2025-01-20"),
    isOnline: false,
  },
  {
    userId: "user_joao",
    displayName: "João Oliveira",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Theron",
    characterId: "char_theron",
    sessionsAttended: 12,
    joinedAt: new Date("2025-01-15"),
    isOnline: true,
  },
  {
    userId: "user_ana",
    displayName: "Ana Costa",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Zael",
    characterId: "char-3",
    sessionsAttended: 8,
    joinedAt: new Date("2025-02-10"),
    isOnline: false,
  },
];

const PHANDELVER_PLAYERS: CampaignPlayer[] = [
  {
    userId: "user_ana",
    displayName: "Ana Costa",
    avatarUrl: null,
    role: "GM",
    characterName: null,
    characterId: null,
    sessionsAttended: 4,
    joinedAt: new Date("2025-06-10"),
    isOnline: true,
  },
  {
    userId: "user_me",
    displayName: "Lucas Silva",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Gandalf",
    characterId: "char_gandalf",
    sessionsAttended: 4,
    joinedAt: new Date("2025-06-10"),
    isOnline: true,
  },
  {
    userId: "user_pedro",
    displayName: "Pedro Costa",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Thorin",
    characterId: "char_thorin",
    sessionsAttended: 3,
    joinedAt: new Date("2025-06-15"),
    isOnline: false,
  },
];

const WATERDEEP_PLAYERS: CampaignPlayer[] = [
  {
    userId: "user_carlos",
    displayName: "Carlos Mendes",
    avatarUrl: null,
    role: "GM",
    characterName: null,
    characterId: null,
    sessionsAttended: 2,
    joinedAt: new Date("2026-01-20"),
    isOnline: false,
  },
  {
    userId: "user_maria",
    displayName: "Maria Santos",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Lyra",
    characterId: "char_lyra",
    sessionsAttended: 2,
    joinedAt: new Date("2026-01-22"),
    isOnline: true,
  },
];

const PLAYERS_MAP: Record<string, CampaignPlayer[]> = {
  camp_strahd: STRAHD_PLAYERS,
  camp_phandelver: PHANDELVER_PLAYERS,
  camp_waterdeep: WATERDEEP_PLAYERS,
};

// ── Mock Sessions ───────────────────────────────────────

function makeSession(
  id: string,
  campaignId: string,
  order: number,
  name: string,
  status: SessionStatusExtended,
  overrides?: Partial<CampaignSession>,
): CampaignSession {
  return {
    id,
    campaignId,
    name,
    status,
    sessionCode: id.replace("sess_", "").toUpperCase().padEnd(6, "X"),
    scheduledAt: null,
    startedAt: null,
    endedAt: null,
    durationMinutes: null,
    playerCount: 4,
    order,
    mapName: null,
    createdAt: new Date(),
    ...overrides,
  };
}

const STRAHD_SESSIONS: CampaignSession[] = [
  makeSession("sess_s01", "camp_strahd", 1, "Chegada em Barovia", "COMPLETED", {
    startedAt: new Date("2025-02-01T20:00:00"),
    endedAt: new Date("2025-02-01T23:30:00"),
    durationMinutes: 210,
    sessionCode: "B7K2X1",
  }),
  makeSession("sess_s02", "camp_strahd", 2, "O Vilarejo de Barovia", "COMPLETED", {
    startedAt: new Date("2025-02-15T20:00:00"),
    endedAt: new Date("2025-02-16T00:00:00"),
    durationMinutes: 240,
    sessionCode: "C9M3Y2",
  }),
  makeSession("sess_s03", "camp_strahd", 3, "O Castelo de Amber", "COMPLETED", {
    startedAt: new Date("2025-03-01T20:00:00"),
    endedAt: new Date("2025-03-01T23:45:00"),
    durationMinutes: 225,
    sessionCode: "D4N6Z3",
  }),
  makeSession("sess_s04", "camp_strahd", 4, "A Torre de Ravenloft", "LIVE", {
    startedAt: new Date(),
    playerCount: 3,
    sessionCode: "B7M2X4",
    mapName: "Torre de Ravenloft — Andar 1",
  }),
  makeSession("sess_s05", "camp_strahd", 5, "A Cripta de Strahd", "SCHEDULED", {
    scheduledAt: new Date("2026-03-15T20:00:00"),
    playerCount: 0,
    sessionCode: "E8P5W5",
  }),
];

const PHANDELVER_SESSIONS: CampaignSession[] = [
  makeSession("sess_p01", "camp_phandelver", 1, "Emboscada na Estrada", "COMPLETED", {
    startedAt: new Date("2025-07-01T19:00:00"),
    endedAt: new Date("2025-07-01T22:30:00"),
    durationMinutes: 210,
    playerCount: 3,
    sessionCode: "F2Q8R1",
  }),
  makeSession("sess_p02", "camp_phandelver", 2, "A Caverna dos Goblins", "COMPLETED", {
    startedAt: new Date("2025-07-15T19:00:00"),
    endedAt: new Date("2025-07-15T23:00:00"),
    durationMinutes: 240,
    playerCount: 3,
    sessionCode: "G6S1T2",
  }),
  makeSession("sess_p03", "camp_phandelver", 3, "Phandalin em Perigo", "COMPLETED", {
    startedAt: new Date("2025-08-01T19:00:00"),
    endedAt: new Date("2025-08-01T22:00:00"),
    durationMinutes: 180,
    playerCount: 2,
    sessionCode: "H3U4V3",
  }),
  makeSession("sess_p04", "camp_phandelver", 4, "Wave Echo Cave", "SCHEDULED", {
    scheduledAt: new Date("2026-03-17T19:00:00"),
    playerCount: 0,
    sessionCode: "J5W7X4",
  }),
];

const SESSIONS_MAP: Record<string, CampaignSession[]> = {
  camp_strahd: STRAHD_SESSIONS,
  camp_phandelver: PHANDELVER_SESSIONS,
};

// ── Mock Lobby ──────────────────────────────────────────

export interface LobbyPlayer {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: "GM" | "PLAYER";
  characterName: string | null;
  characterClass: string | null;
  characterLevel: number | null;
  status: "ready" | "joining" | "offline";
}

const LOBBY_PLAYERS: Record<string, LobbyPlayer[]> = {
  sess_s04: [
    {
      userId: "user_me",
      displayName: "Lucas Silva",
      avatarUrl: null,
      role: "GM",
      characterName: null,
      characterClass: null,
      characterLevel: null,
      status: "ready",
    },
    {
      userId: "user_maria",
      displayName: "Maria Santos",
      avatarUrl: null,
      role: "PLAYER",
      characterName: "Eldrin",
      characterClass: "Mago",
      characterLevel: 5,
      status: "ready",
    },
    {
      userId: "user_joao",
      displayName: "João Oliveira",
      avatarUrl: null,
      role: "PLAYER",
      characterName: "Theron",
      characterClass: "Clérigo",
      characterLevel: 5,
      status: "joining",
    },
    {
      userId: "user_ana",
      displayName: "Ana Costa",
      avatarUrl: null,
      role: "PLAYER",
      characterName: "Zael",
      characterClass: "Ranger",
      characterLevel: 4,
      status: "offline",
    },
  ],
};

// ── Code resolution map ─────────────────────────────────

interface CodeResolution {
  type: "campaign" | "session";
  id: string;
  status?: SessionStatusExtended;
}

const CODE_MAP: Record<string, CodeResolution> = {
  // Campaign codes
  "QB-7K3M": { type: "campaign", id: "camp_strahd" },
  "QB-9M2B": { type: "campaign", id: "camp_phandelver" },
  "QB-4T8R": { type: "campaign", id: "camp_waterdeep" },
  // Session codes
  B7M2X4: { type: "session", id: "sess_s04", status: "LIVE" },
  E8P5W5: { type: "session", id: "sess_s05", status: "SCHEDULED" },
  J5W7X4: { type: "session", id: "sess_p04", status: "SCHEDULED" },
  B7K2X1: { type: "session", id: "sess_s01", status: "COMPLETED" },
};

// ── Public API ──────────────────────────────────────────

export function getMockCampaign(id: string): Campaign | null {
  return MOCK_CAMPAIGNS.find((c) => c.id === id) ?? null;
}

export function getMockCampaignSessions(
  campaignId: string,
): CampaignSession[] {
  return SESSIONS_MAP[campaignId] ?? [];
}

export function getMockCampaignPlayers(
  campaignId: string,
): CampaignPlayer[] {
  return PLAYERS_MAP[campaignId] ?? [];
}

export function getMockLobby(sessionId: string): LobbyPlayer[] {
  return LOBBY_PLAYERS[sessionId] ?? [];
}

/**
 * Simula a resolução de código com delay de API.
 */
export function resolveMockCode(
  code: string,
): Promise<CodeResolution | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalized = code.toUpperCase().replace(/\s/g, "");
      resolve(CODE_MAP[normalized] ?? null);
    }, 800);
  });
}

/**
 * Retorna as campanhas onde o usuário logado participa como jogador.
 */
export function getMyCampaignsAsPlayer(): Campaign[] {
  // user_me é PLAYER em Phandelver
  return [PHANDELVER_CAMPAIGN];
}

/**
 * Retorna as campanhas onde o usuário logado é GM.
 */
export function getMyCampaignsAsGM(): Campaign[] {
  // user_me é GM em Strahd
  return [STRAHD_CAMPAIGN];
}

/**
 * Retorna convites pendentes para o usuário.
 */
export function getMyPendingInvites(): Campaign[] {
  // Waterdeep é um convite pendente
  return [WATERDEEP_CAMPAIGN];
}

/**
 * Retorna a próxima sessão agendada de uma campanha.
 */
export function getNextSession(
  campaignId: string,
): CampaignSession | null {
  const sessions = SESSIONS_MAP[campaignId] ?? [];
  return (
    sessions.find(
      (s) => s.status === "SCHEDULED" || s.status === "LIVE",
    ) ?? null
  );
}

/**
 * Retorna a sessão ao vivo de uma campanha, se houver.
 */
export function getLiveSession(
  campaignId: string,
): CampaignSession | null {
  const sessions = SESSIONS_MAP[campaignId] ?? [];
  return sessions.find((s) => s.status === "LIVE") ?? null;
}

/**
 * Retorna o nome do GM de uma campanha.
 */
export function getGMName(campaignId: string): string {
  const players = PLAYERS_MAP[campaignId] ?? [];
  const gm = players.find((p) => p.role === "GM");
  return gm?.displayName ?? "Desconhecido";
}

/**
 * Retorna o nome do personagem do jogador atual numa campanha.
 */
export function getMyCharacterName(campaignId: string): string | null {
  const players = PLAYERS_MAP[campaignId] ?? [];
  const me = players.find(
    (p) => p.userId === "user_me" && p.role === "PLAYER",
  );
  return me?.characterName ?? null;
}

/**
 * Retorna cores de accent por sistema.
 */
export const SYSTEM_ACCENT_COLORS: Record<string, string> = {
  dnd5e: "#6C5CE7",
  tormenta20: "#E94560",
  coc7: "#00B894",
  vampireV5: "#FF6B6B",
  generic: "#FDCB6E",
};
