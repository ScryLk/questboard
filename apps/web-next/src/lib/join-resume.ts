// Persistência local do "join" do player view. Sem isso, cada reload
// joga o jogador de volta no JoinScreen pra reescolher nome + sistema
// + personagem — o que é frustrante porque o backend já criou o
// SessionPlayer e o Token, então é só restaurar local.
//
// Escopado por sessionCode pra evitar misturar dados entre sessões.
// `playerViewStore` continua sem persist global — só esses 4 campos
// (que viram input do JoinScreen) ficam no localStorage.

import type { PlayerCampaignSystem } from "./player-view-store";

const KEY_PREFIX = "qb:join-resume:";
const VERSION = 1;

export interface JoinResumeData {
  v: number;
  playerName: string;
  characterId: string | null;
  campaignSystem: PlayerCampaignSystem;
  backendSessionId: string | null;
  savedAt: number;
}

function keyFor(sessionCode: string): string {
  return `${KEY_PREFIX}${sessionCode.toUpperCase()}`;
}

export function saveJoinResume(
  sessionCode: string,
  data: Omit<JoinResumeData, "v" | "savedAt">,
): void {
  if (typeof window === "undefined") return;
  if (!sessionCode) return;
  try {
    const payload: JoinResumeData = {
      v: VERSION,
      savedAt: Date.now(),
      ...data,
    };
    window.localStorage.setItem(keyFor(sessionCode), JSON.stringify(payload));
  } catch {
    // Quota cheio / modo privado — segue silencioso, próximo reload
    // só vai pedir os dados de novo.
  }
}

export function loadJoinResume(sessionCode: string): JoinResumeData | null {
  if (typeof window === "undefined") return null;
  if (!sessionCode) return null;
  try {
    const raw = window.localStorage.getItem(keyFor(sessionCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<JoinResumeData>;
    if (parsed.v !== VERSION) {
      window.localStorage.removeItem(keyFor(sessionCode));
      return null;
    }
    if (!parsed.playerName) return null;
    return parsed as JoinResumeData;
  } catch {
    return null;
  }
}

export function clearJoinResume(sessionCode: string): void {
  if (typeof window === "undefined") return;
  if (!sessionCode) return;
  try {
    window.localStorage.removeItem(keyFor(sessionCode));
  } catch {
    // ignore
  }
}
