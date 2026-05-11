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

export const MOCK_MEMBER_ENRICHMENT: Record<string, MemberEnrichment> = {};

export function getMemberEnrichment(userId: string): MemberEnrichment {
  return MOCK_MEMBER_ENRICHMENT[userId] ?? DEFAULT_ENRICHMENT;
}
