// ── Session Join Mock Data ──
// Characters available for selection when joining a session

export interface SessionCharacter {
  id: string;
  name: string;
  className: string;
  classId: string;
  classIcon: string;
  level: number;
  race: string;
  avatarUrl: string | null;
  isAvailable: boolean;
  takenByName?: string;
}

const SESSION_CHARACTERS: SessionCharacter[] = [
  {
    id: "char-1",
    name: "Eldrin",
    className: "Mago",
    classId: "wizard",
    classIcon: "BookOpen",
    level: 5,
    race: "Elfo",
    avatarUrl: null,
    isAvailable: false,
    takenByName: "Maria Santos",
  },
  {
    id: "char-2",
    name: "Kira Ironfist",
    className: "Ranger",
    classId: "ranger",
    classIcon: "Crosshair",
    level: 5,
    race: "Anao",
    avatarUrl: null,
    isAvailable: true,
  },
  {
    id: "char_theron",
    name: "Theron",
    className: "Clerigo",
    classId: "cleric",
    classIcon: "Star",
    level: 5,
    race: "Humano",
    avatarUrl: null,
    isAvailable: false,
    takenByName: "Joao Oliveira",
  },
  {
    id: "char-3",
    name: "Zael",
    className: "Feiticeiro",
    classId: "sorcerer",
    classIcon: "Zap",
    level: 4,
    race: "Tiefling",
    avatarUrl: null,
    isAvailable: true,
  },
];

export function getSessionCharacters(_sessionId: string): SessionCharacter[] {
  return SESSION_CHARACTERS;
}

export function getSessionInfo(sessionId: string): {
  sessionName: string;
  campaignName: string;
} {
  if (sessionId === "sess_s04") {
    return {
      sessionName: "A Torre de Ravenloft",
      campaignName: "A Maldicao de Strahd",
    };
  }
  return {
    sessionName: "Sessao",
    campaignName: "Campanha",
  };
}
