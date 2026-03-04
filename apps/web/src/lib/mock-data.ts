import type {
  Campaign,
  CampaignSession,
  CampaignPlayer,
  CampaignDashboardData,
  SessionDashboardData,
  ScheduledSessionData,
  PrepChecklistItem,
  PlannedEncounter,
  DashboardKPI,
  ActivityEntry,
  DiceStats,
} from "@questboard/types";

// ── Campanhas ──

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "camp_01",
    name: "A Maldição de Strahd",
    description:
      "Uma campanha sombria nas terras brumosas de Barovia, onde os aventureiros enfrentam o vampiro Strahd von Zarovich.",
    system: "dnd5e",
    code: "QB-7X4A",
    status: "active",
    imageUrl: null,
    ownerId: "user_01",
    maxPlayers: 5,
    tags: ["horror", "gothic", "ravenloft"],
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2026-03-01"),
  },
  {
    id: "camp_02",
    name: "Lost Mine of Phandelver",
    description:
      "Uma aventura introdutória em Phandalin e arredores, buscando a lendária Mina de Phandelver.",
    system: "dnd5e",
    code: "QB-9M2B",
    status: "paused",
    imageUrl: null,
    ownerId: "user_01",
    maxPlayers: 4,
    tags: ["starter", "exploration"],
    createdAt: new Date("2025-06-10"),
    updatedAt: new Date("2025-11-20"),
  },
];

// ── Jogadores ──

const STRAHD_PLAYERS: CampaignPlayer[] = [
  {
    userId: "user_01",
    displayName: "Lucas",
    avatarUrl: null,
    role: "GM",
    characterName: null,
    characterId: null,
    sessionsAttended: 12,
    joinedAt: new Date("2025-01-15"),
    isOnline: true,
    confirmed: true,
  },
  {
    userId: "user_02",
    displayName: "Maria",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Eldrin",
    characterId: "char_eldrin",
    sessionsAttended: 12,
    joinedAt: new Date("2025-01-16"),
    isOnline: false,
    confirmed: true,
  },
  {
    userId: "user_03",
    displayName: "Pedro",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Kira",
    characterId: "char_kira",
    sessionsAttended: 11,
    joinedAt: new Date("2025-01-16"),
    isOnline: false,
    confirmed: true,
  },
  {
    userId: "user_04",
    displayName: "Ana",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Zael",
    characterId: "char_zael",
    sessionsAttended: 10,
    joinedAt: new Date("2025-01-20"),
    isOnline: false,
    confirmed: false,
  },
  {
    userId: "user_05",
    displayName: "João",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Theron",
    characterId: "char_theron",
    sessionsAttended: 12,
    joinedAt: new Date("2025-02-01"),
    isOnline: false,
    confirmed: true,
  },
];

const PHANDELVER_PLAYERS: CampaignPlayer[] = [
  {
    userId: "user_01",
    displayName: "Lucas",
    avatarUrl: null,
    role: "GM",
    characterName: null,
    characterId: null,
    sessionsAttended: 4,
    joinedAt: new Date("2025-06-10"),
  },
  {
    userId: "user_06",
    displayName: "Carlos",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Brandão",
    characterId: "char_brandao",
    sessionsAttended: 4,
    joinedAt: new Date("2025-06-11"),
  },
  {
    userId: "user_07",
    displayName: "Julia",
    avatarUrl: null,
    role: "PLAYER",
    characterName: "Lyra",
    characterId: "char_lyra",
    sessionsAttended: 3,
    joinedAt: new Date("2025-06-11"),
  },
];

// ── Sessões ──

const STRAHD_SESSIONS: CampaignSession[] = [
  {
    id: "sess_01",
    campaignId: "camp_01",
    name: "Chegada em Barovia",
    status: "COMPLETED",
    sessionCode: "X7K3M2",
    scheduledAt: null,
    startedAt: new Date("2025-02-01T20:00:00"),
    endedAt: new Date("2025-02-01T23:30:00"),
    durationMinutes: 210,
    playerCount: 4,
    order: 1,
    mapName: "Vila de Barovia",
    createdAt: new Date("2025-01-28"),
  },
  {
    id: "sess_02",
    campaignId: "camp_01",
    name: "A Igreja em Ruínas",
    status: "COMPLETED",
    sessionCode: "P4N8Q1",
    scheduledAt: null,
    startedAt: new Date("2025-02-15T20:00:00"),
    endedAt: new Date("2025-02-15T23:00:00"),
    durationMinutes: 180,
    playerCount: 4,
    order: 2,
    mapName: "Igreja de Barovia",
    createdAt: new Date("2025-02-10"),
  },
  {
    id: "sess_03",
    campaignId: "camp_01",
    name: "O Acampamento Vistani",
    status: "COMPLETED",
    sessionCode: "R2M5A8",
    scheduledAt: null,
    startedAt: new Date("2025-03-01T20:00:00"),
    endedAt: new Date("2025-03-02T00:15:00"),
    durationMinutes: 255,
    playerCount: 5,
    order: 3,
    mapName: "Acampamento Vistani",
    createdAt: new Date("2025-02-25"),
  },
  {
    id: "sess_04",
    campaignId: "camp_01",
    name: "A Taverna do Sangue",
    status: "COMPLETED",
    sessionCode: "K9J3L7",
    scheduledAt: null,
    startedAt: new Date("2025-03-15T20:00:00"),
    endedAt: new Date("2025-03-15T23:45:00"),
    durationMinutes: 225,
    playerCount: 5,
    order: 4,
    mapName: "Taverna do Sangue",
    createdAt: new Date("2025-03-10"),
  },
  {
    id: "sess_05",
    campaignId: "camp_01",
    name: "A Mansão da Morte",
    status: "COMPLETED",
    sessionCode: "W6B2C4",
    scheduledAt: null,
    startedAt: new Date("2025-04-05T20:00:00"),
    endedAt: new Date("2025-04-06T00:30:00"),
    durationMinutes: 270,
    playerCount: 5,
    order: 5,
    mapName: "Death House",
    createdAt: new Date("2025-04-01"),
  },
  {
    id: "sess_06",
    campaignId: "camp_01",
    name: "Os Vinhedos Malditos",
    status: "COMPLETED",
    sessionCode: "T1F8H5",
    scheduledAt: null,
    startedAt: new Date("2025-04-19T20:00:00"),
    endedAt: new Date("2025-04-19T23:15:00"),
    durationMinutes: 195,
    playerCount: 4,
    order: 6,
    mapName: "Vinhedos do Mago",
    createdAt: new Date("2025-04-14"),
  },
  {
    id: "sess_07",
    campaignId: "camp_01",
    name: "O Lago Zarovitch",
    status: "COMPLETED",
    sessionCode: "D3G7N9",
    scheduledAt: null,
    startedAt: new Date("2025-05-03T20:00:00"),
    endedAt: new Date("2025-05-03T23:00:00"),
    durationMinutes: 180,
    playerCount: 5,
    order: 7,
    mapName: null,
    createdAt: new Date("2025-04-28"),
  },
  {
    id: "sess_08",
    campaignId: "camp_01",
    name: "A Torre de Van Richten",
    status: "COMPLETED",
    sessionCode: "Q5Y2E6",
    scheduledAt: null,
    startedAt: new Date("2025-05-17T20:00:00"),
    endedAt: new Date("2025-05-18T00:00:00"),
    durationMinutes: 240,
    playerCount: 5,
    order: 8,
    mapName: "Torre de Van Richten",
    createdAt: new Date("2025-05-12"),
  },
  {
    id: "sess_09",
    campaignId: "camp_01",
    name: "O Monastério de Krezk",
    status: "COMPLETED",
    sessionCode: "V8U1Z3",
    scheduledAt: null,
    startedAt: new Date("2025-06-07T20:00:00"),
    endedAt: new Date("2025-06-07T23:30:00"),
    durationMinutes: 210,
    playerCount: 4,
    order: 9,
    mapName: "Monastério Krezk",
    createdAt: new Date("2025-06-02"),
  },
  {
    id: "sess_10",
    campaignId: "camp_01",
    name: "Argynvostholt",
    status: "COMPLETED",
    sessionCode: "M4S7I2",
    scheduledAt: null,
    startedAt: new Date("2025-07-05T20:00:00"),
    endedAt: new Date("2025-07-06T00:15:00"),
    durationMinutes: 255,
    playerCount: 5,
    order: 10,
    mapName: "Argynvostholt",
    createdAt: new Date("2025-06-30"),
  },
  {
    id: "sess_11",
    campaignId: "camp_01",
    name: "O Templo de Amber",
    status: "COMPLETED",
    sessionCode: "A3K9F2",
    scheduledAt: null,
    startedAt: new Date("2025-08-02T20:00:00"),
    endedAt: new Date("2025-08-02T23:45:00"),
    durationMinutes: 225,
    playerCount: 5,
    order: 11,
    mapName: "Templo de Amber",
    createdAt: new Date("2025-07-28"),
  },
  {
    id: "sess_12",
    campaignId: "camp_01",
    name: "O Castelo de Amber",
    status: "COMPLETED",
    sessionCode: "H6O4R8",
    scheduledAt: null,
    startedAt: new Date("2025-09-06T20:00:00"),
    endedAt: new Date("2025-09-06T23:45:00"),
    durationMinutes: 225,
    playerCount: 5,
    order: 12,
    mapName: "Castle Ravenloft — Nível 1",
    createdAt: new Date("2025-09-01"),
  },
  {
    id: "sess_13",
    campaignId: "camp_01",
    name: "A Torre de Ravenloft",
    status: "SCHEDULED",
    sessionCode: "B7M2X4",
    scheduledAt: new Date("2026-03-15T20:00:00"),
    startedAt: null,
    endedAt: null,
    durationMinutes: null,
    playerCount: 5,
    order: 13,
    mapName: "Castle Ravenloft — Torre",
    createdAt: new Date("2026-02-28"),
  },
  {
    id: "sess_14",
    campaignId: "camp_01",
    name: "O Confronto Final",
    status: "DRAFT",
    sessionCode: "N1P5W9",
    scheduledAt: null,
    startedAt: null,
    endedAt: null,
    durationMinutes: null,
    playerCount: 0,
    order: 14,
    mapName: null,
    createdAt: new Date("2026-03-01"),
  },
];

const PHANDELVER_SESSIONS: CampaignSession[] = [
  {
    id: "sess_p01",
    campaignId: "camp_02",
    name: "Emboscada na Trilha",
    status: "COMPLETED",
    sessionCode: "E8T3G6",
    scheduledAt: null,
    startedAt: new Date("2025-06-20T19:00:00"),
    endedAt: new Date("2025-06-20T22:00:00"),
    durationMinutes: 180,
    playerCount: 3,
    order: 1,
    mapName: "Trilha de Triboar",
    createdAt: new Date("2025-06-15"),
  },
  {
    id: "sess_p02",
    campaignId: "camp_02",
    name: "O Esconderijo Cragmaw",
    status: "COMPLETED",
    sessionCode: "J2L9X5",
    scheduledAt: null,
    startedAt: new Date("2025-07-04T19:00:00"),
    endedAt: new Date("2025-07-04T22:30:00"),
    durationMinutes: 210,
    playerCount: 3,
    order: 2,
    mapName: "Caverna Cragmaw",
    createdAt: new Date("2025-06-30"),
  },
  {
    id: "sess_p03",
    campaignId: "camp_02",
    name: "Phandalin e os Redbrands",
    status: "COMPLETED",
    sessionCode: "C7D1F4",
    scheduledAt: null,
    startedAt: new Date("2025-07-18T19:00:00"),
    endedAt: new Date("2025-07-18T22:15:00"),
    durationMinutes: 195,
    playerCount: 2,
    order: 3,
    mapName: "Vila de Phandalin",
    createdAt: new Date("2025-07-13"),
  },
  {
    id: "sess_p04",
    campaignId: "camp_02",
    name: "O Covil dos Redbrands",
    status: "COMPLETED",
    sessionCode: "U9V6Y3",
    scheduledAt: null,
    startedAt: new Date("2025-08-01T19:00:00"),
    endedAt: new Date("2025-08-01T22:45:00"),
    durationMinutes: 225,
    playerCount: 3,
    order: 4,
    mapName: "Mansão Tresendar",
    createdAt: new Date("2025-07-28"),
  },
];

// ── KPIs ──

const STRAHD_KPIS: DashboardKPI[] = [
  {
    label: "Sessões Jogadas",
    value: 12,
    previousValue: 10,
    changePercent: 20,
    icon: "scroll",
  },
  {
    label: "Horas de Jogo",
    value: 46,
    previousValue: 38,
    changePercent: 21,
    icon: "clock",
  },
  { label: "Jogadores Ativos", value: 5, icon: "users" },
  { label: "Próxima Sessão", value: 13, icon: "calendar" },
];

const PHANDELVER_KPIS: DashboardKPI[] = [
  {
    label: "Sessões Jogadas",
    value: 4,
    previousValue: 4,
    changePercent: 0,
    icon: "scroll",
  },
  {
    label: "Horas de Jogo",
    value: 14,
    previousValue: 14,
    changePercent: 0,
    icon: "clock",
  },
  { label: "Jogadores Ativos", value: 3, icon: "users" },
  { label: "Status", value: 0, icon: "pause" },
];

// ── Atividade Recente ──

const STRAHD_ACTIVITY: ActivityEntry[] = [
  {
    id: "act_01",
    type: "session",
    title: "Sessão #13 agendada",
    description: "A Torre de Ravenloft — 15/03/2026 às 20:00",
    timestamp: new Date("2026-02-28T14:00:00"),
    sessionId: "sess_13",
  },
  {
    id: "act_02",
    type: "map",
    title: "Mapa atualizado",
    description: "Castle Ravenloft — Torre: novos tokens adicionados",
    timestamp: new Date("2026-02-27T18:30:00"),
  },
  {
    id: "act_03",
    type: "session",
    title: "Sessão #12 encerrada",
    description: "O Castelo de Amber — 3h 45min, 5 jogadores",
    timestamp: new Date("2025-09-06T23:45:00"),
    sessionId: "sess_12",
  },
  {
    id: "act_04",
    type: "character",
    title: "Eldrin subiu de nível",
    description: "Nível 5 → Nível 6 (Mago)",
    timestamp: new Date("2025-09-07T10:00:00"),
  },
  {
    id: "act_05",
    type: "encounter",
    title: "Encontro planejado",
    description: "Guardiões do Vault — CR 8 adicionado à sessão #13",
    timestamp: new Date("2026-02-26T15:00:00"),
  },
  {
    id: "act_06",
    type: "note",
    title: "Nota do mestre",
    description: "Detalhes sobre a motivação de Kasimir atualizados",
    timestamp: new Date("2026-02-25T11:00:00"),
  },
];

// ── Dice Stats (para sessões completas) ──

const MOCK_DICE_STATS: DiceStats = {
  d4: 12,
  d6: 34,
  d8: 28,
  d10: 8,
  d12: 6,
  d20: 87,
  d100: 2,
  totalRolls: 177,
  averageResult: 11.3,
  nat20s: 7,
  nat1s: 5,
};

// ── Timeline Events ──

function buildSessionTimeline(sessionId: string) {
  const events = [
    {
      id: `${sessionId}_tl_01`,
      type: "session_start",
      title: "Sessão iniciada",
      description: "Todos os jogadores conectados",
      timestamp: new Date("2025-09-06T20:00:00"),
    },
    {
      id: `${sessionId}_tl_02`,
      type: "scene",
      title: "Cena: O Castelo de Amber",
      description: "O grupo entra no castelo pela porta principal",
      timestamp: new Date("2025-09-06T20:05:00"),
    },
    {
      id: `${sessionId}_tl_03`,
      type: "roll",
      title: "Eldrin rolou Percepção: 18",
      description: "Percebe armadilha no corredor",
      timestamp: new Date("2025-09-06T20:15:00"),
    },
    {
      id: `${sessionId}_tl_04`,
      type: "combat",
      title: "Combate iniciado",
      description: "3 Esqueletos Guardiões (CR 4)",
      timestamp: new Date("2025-09-06T20:30:00"),
    },
    {
      id: `${sessionId}_tl_05`,
      type: "roll",
      title: "Kira rolou Ataque: NAT 20!",
      description: "Acerto crítico com arco longo — 24 de dano",
      timestamp: new Date("2025-09-06T20:45:00"),
    },
    {
      id: `${sessionId}_tl_06`,
      type: "combat_end",
      title: "Combate encerrado",
      description: "3 rodadas, nenhuma baixa",
      timestamp: new Date("2025-09-06T21:00:00"),
    },
    {
      id: `${sessionId}_tl_07`,
      type: "scene",
      title: "Cena: A Biblioteca Proibida",
      description: "Sala repleta de tomos antigos e pergaminhos empoeirados",
      timestamp: new Date("2025-09-06T21:10:00"),
    },
    {
      id: `${sessionId}_tl_08`,
      type: "roll",
      title: "Zael rolou Arcanismo: 22",
      description: "Decifra as runas do portal dimensional",
      timestamp: new Date("2025-09-06T21:30:00"),
    },
    {
      id: `${sessionId}_tl_09`,
      type: "discovery",
      title: "Descoberta: Pacto Sombrio",
      description: "O grupo descobre o pacto entre Strahd e os Poderes Sombrios",
      timestamp: new Date("2025-09-06T22:00:00"),
    },
    {
      id: `${sessionId}_tl_10`,
      type: "combat",
      title: "Combate iniciado",
      description: "Aparição Sombria (CR 7)",
      timestamp: new Date("2025-09-06T22:15:00"),
    },
    {
      id: `${sessionId}_tl_11`,
      type: "roll",
      title: "Theron rolou Salvaguarda: 8",
      description: "Falha contra Toque Sombrio — 18 de dano necrótico",
      timestamp: new Date("2025-09-06T22:30:00"),
    },
    {
      id: `${sessionId}_tl_12`,
      type: "combat_end",
      title: "Combate encerrado",
      description: "5 rodadas, Theron quase caiu",
      timestamp: new Date("2025-09-06T23:00:00"),
    },
    {
      id: `${sessionId}_tl_13`,
      type: "milestone",
      title: "Marco: Artefato obtido",
      description: "O grupo recupera o Símbolo Sagrado de Ravenkind",
      timestamp: new Date("2025-09-06T23:15:00"),
    },
    {
      id: `${sessionId}_tl_14`,
      type: "session_end",
      title: "Sessão encerrada",
      description: "O grupo descansa no templo — 3h 45min de jogo",
      timestamp: new Date("2025-09-06T23:45:00"),
    },
  ];
  return events;
}

// ── Checklist (sessão agendada) ──

const SESSION_13_CHECKLIST: PrepChecklistItem[] = [
  {
    id: "chk_01",
    label: 'Mapa definido: "Castle Ravenloft — Torre"',
    completed: true,
    category: "mapa",
  },
  {
    id: "chk_02",
    label: "Encontros preparados: 3 encontros",
    completed: true,
    category: "encontro",
  },
  {
    id: "chk_03",
    label: "NPCs prontos: Rahadin, Strahd (aparição breve)",
    completed: true,
    category: "npc",
  },
  {
    id: "chk_04",
    label: "Itens de tesouro definidos",
    completed: false,
    category: "item",
  },
  {
    id: "chk_05",
    label: "Trilha sonora selecionada",
    completed: false,
    category: "geral",
  },
  {
    id: "chk_06",
    label: "Notas da sessão escritas",
    completed: false,
    category: "nota",
  },
];

const SESSION_13_ENCOUNTERS: PlannedEncounter[] = [
  {
    id: "enc_01",
    name: "Guardiões do Vault",
    type: "combat",
    difficulty: "Difícil (CR 8)",
    prepared: true,
  },
  {
    id: "enc_02",
    name: "Armadilha Arcana",
    type: "exploration",
    difficulty: "Média (CR 5)",
    prepared: true,
  },
  {
    id: "enc_03",
    name: "Conversa com Kasimir",
    type: "social",
    difficulty: "Social",
    prepared: false,
  },
];

// ── Funções de Dashboard ──

export function getMockCampaignDashboard(
  campaignId: string,
): CampaignDashboardData | null {
  if (campaignId === "camp_01") {
    const scheduledSession = STRAHD_SESSIONS.find(
      (s) => s.status === "SCHEDULED",
    );
    return {
      campaign: MOCK_CAMPAIGNS[0]!,
      kpis: STRAHD_KPIS,
      sessions: STRAHD_SESSIONS,
      players: STRAHD_PLAYERS,
      recentActivity: STRAHD_ACTIVITY,
      nextSession: scheduledSession ?? null,
    };
  }
  if (campaignId === "camp_02") {
    return {
      campaign: MOCK_CAMPAIGNS[1]!,
      kpis: PHANDELVER_KPIS,
      sessions: PHANDELVER_SESSIONS,
      players: PHANDELVER_PLAYERS,
      recentActivity: [],
      nextSession: null,
    };
  }
  return null;
}

export function getMockSessionDashboard(
  sessionId: string,
): SessionDashboardData | null {
  const allSessions = [...STRAHD_SESSIONS, ...PHANDELVER_SESSIONS];
  const session = allSessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const players =
    session.campaignId === "camp_01" ? STRAHD_PLAYERS : PHANDELVER_PLAYERS;

  return {
    session,
    players,
    metrics: {
      totalRolls: 47,
      totalMessages: 83,
      combats: 2,
      playTimeMinutes: session.durationMinutes ?? 0,
    },
    diceStats: MOCK_DICE_STATS,
    timeline: buildSessionTimeline(sessionId),
  };
}

export function getMockScheduledSessionData(
  sessionId: string,
): ScheduledSessionData | null {
  const session = STRAHD_SESSIONS.find((s) => s.id === sessionId);
  if (!session || session.status !== "SCHEDULED") return null;

  const confirmed = STRAHD_PLAYERS.filter((p) => p.confirmed);
  const pending = STRAHD_PLAYERS.filter((p) => !p.confirmed);

  return {
    session,
    checklist: SESSION_13_CHECKLIST,
    confirmedPlayers: confirmed,
    pendingPlayers: pending,
    encounters: SESSION_13_ENCOUNTERS,
    gmNotes:
      "Lembrar: Kasimir tem motivações próprias para visitar o Templo de Amber.\nSe o grupo falhar no vault, Strahd aparece no final da sessão.\nEzmerelda pode ser aliada se o grupo a encontrar na torre.",
  };
}

export { STRAHD_SESSIONS, PHANDELVER_SESSIONS };
