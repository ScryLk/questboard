// Enriquecimento mock por userId — backend trará tudo isso real:
// presence, attention e ficha vêm de /campaigns/:id/stats e /members/:id.
// Por ora cada userId conhecido tem um snapshot fixo, e userIds novos
// (membros recém-convidados) caem no DEFAULT abaixo.

type Status = "IN_SESSION" | "OFFLINE";
type AttentionReason =
  | "CONSECUTIVE_ABSENCES"
  | "INACTIVE"
  | "NO_CHARACTER"
  | "CHARACTER_DOWN";

export interface MemberCharacter {
  name: string;
  race: string;
  className: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  ac: number;
}

export interface MemberPresence {
  attendedCount: number;
  totalSessions: number;
  percentage: number;
  lastSessionAt: string | null;
}

export interface MemberEnrichment {
  character: MemberCharacter | null;
  presence: MemberPresence;
  status: Status;
  attention: { reason: AttentionReason; detail: string } | null;
}

const DEFAULT_ENRICHMENT: MemberEnrichment = {
  character: null,
  presence: {
    attendedCount: 0,
    totalSessions: 0,
    percentage: 0,
    lastSessionAt: null,
  },
  status: "OFFLINE",
  attention: null,
};

export const MOCK_MEMBER_ENRICHMENT: Record<string, MemberEnrichment> = {
  // ── A Maldição de Strahd ──
  "u_owner": {
    character: null,
    presence: {
      attendedCount: 24,
      totalSessions: 24,
      percentage: 100,
      lastSessionAt: "2026-04-18",
    },
    status: "IN_SESSION",
    attention: null,
  },
  "u_ana": {
    character: null,
    presence: {
      attendedCount: 10,
      totalSessions: 12,
      percentage: 83,
      lastSessionAt: "2026-04-18",
    },
    status: "IN_SESSION",
    attention: null,
  },
  "u_bia": {
    character: {
      name: "Elara",
      race: "Elfa",
      className: "Maga",
      level: 5,
      hpCurrent: 32,
      hpMax: 45,
      ac: 14,
    },
    presence: {
      attendedCount: 18,
      totalSessions: 24,
      percentage: 75,
      lastSessionAt: "2026-04-18",
    },
    status: "IN_SESSION",
    attention: null,
  },
  "u_caio": {
    character: {
      name: "Thorin",
      race: "Anão",
      className: "Guerreiro",
      level: 5,
      hpCurrent: 8,
      hpMax: 50,
      ac: 18,
    },
    presence: {
      attendedCount: 21,
      totalSessions: 24,
      percentage: 88,
      lastSessionAt: "2026-03-28",
    },
    status: "OFFLINE",
    attention: { reason: "CONSECUTIVE_ABSENCES", detail: "3 faltas seguidas" },
  },

  // ── Os Caçadores de Lenore ──
  "u_dani": {
    character: {
      name: "Lyra",
      race: "Halfling",
      className: "Ladina",
      level: 4,
      hpCurrent: 25,
      hpMax: 28,
      ac: 15,
    },
    presence: {
      attendedCount: 1,
      totalSessions: 1,
      percentage: 100,
      lastSessionAt: "2026-04-22",
    },
    status: "OFFLINE",
    attention: null,
  },
  "u_eduardo": {
    character: {
      name: "Kael",
      race: "Tiefling",
      className: "Bruxo",
      level: 4,
      hpCurrent: 32,
      hpMax: 32,
      ac: 12,
    },
    presence: {
      attendedCount: 1,
      totalSessions: 1,
      percentage: 100,
      lastSessionAt: "2026-04-22",
    },
    status: "OFFLINE",
    attention: null,
  },
};

export function getMemberEnrichment(userId: string): MemberEnrichment {
  return MOCK_MEMBER_ENRICHMENT[userId] ?? DEFAULT_ENRICHMENT;
}
