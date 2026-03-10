import type {
  Campaign,
  CampaignSession,
  CampaignPlayer,
} from "@questboard/types";

// ── Empty data (previously mock) ───────────────────────

export const MOCK_CAMPAIGNS: Campaign[] = [];

// ── Lobby Types ─────────────────────────────────────────

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

// ── System Accent Colors ────────────────────────────────

export const SYSTEM_ACCENT_COLORS: Record<string, string> = {
  dnd5e: "#6C5CE7",
  tormenta20: "#E94560",
  coc7: "#00B894",
  vampireV5: "#FF6B6B",
  generic: "#FDCB6E",
};

// ── Public API (return empty data) ──────────────────────

export function getMockCampaign(_id: string): Campaign | null {
  return null;
}

export function getMockCampaignSessions(
  _campaignId: string,
): CampaignSession[] {
  return [];
}

export function getMockCampaignPlayers(
  _campaignId: string,
): CampaignPlayer[] {
  return [];
}

export function getMockLobby(_sessionId: string): LobbyPlayer[] {
  return [
    {
      userId: "user_me",
      displayName: "Você",
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
  ];
}

export function resolveMockCode(
  code: string,
): Promise<{ type: "campaign" | "session"; id: string; status?: string } | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");

      // Campaign codes: QB-XXXX format
      if (/^QB-?[A-Z0-9]{4}$/.test(normalized)) {
        resolve({ type: "campaign", id: "camp_mock" });
        return;
      }

      // Session codes: any 6-char alphanumeric
      if (/^[A-Z0-9]{6}$/.test(normalized)) {
        resolve({ type: "session", id: "sess_mock", status: "LOBBY" });
        return;
      }

      resolve(null);
    }, 500);
  });
}

export function getMyCampaignsAsPlayer(): Campaign[] {
  return [];
}

export function getMyCampaignsAsGM(): Campaign[] {
  return [];
}

export function getMyPendingInvites(): Campaign[] {
  return [];
}

export function getNextSession(
  _campaignId: string,
): CampaignSession | null {
  return null;
}

export function getLiveSession(
  _campaignId: string,
): CampaignSession | null {
  return null;
}

export function getGMName(_campaignId: string): string {
  return "";
}

export function getMyCharacterName(_campaignId: string): string | null {
  return null;
}
