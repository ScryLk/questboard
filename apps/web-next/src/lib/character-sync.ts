// ── Sync de personagem local → backend ─────────────────────
//
// O wizard salva personagem em useCharacterStore (Zustand persist).
// Quando estamos no fluxo /play/[code]/new-character, queremos
// também persistir no backend pra que o player possa juntar Token
// na mesa do GM.
//
// Helper único: resolve sessionCode → campaignId, faz POST /characters
// com os campos essenciais, e armazena mapping local→backend no
// localStorage (chave `qb:char-map`). JoinScreen lê esse mapping pra
// passar o backendCharacterId no /sessions/join.

import { apiRequest } from "./api-client";
import type { CampaignCharacter } from "@/types/character";

const STORAGE_KEY = "qb:char-backend-map";

interface CharacterIdMap {
  /** localId → backendId */
  [localId: string]: string;
}

function readMap(): CharacterIdMap {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeMap(map: CharacterIdMap): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Recupera o backendId de um personagem local (se já foi sincado). */
export function getBackendCharacterId(localId: string): string | null {
  return readMap()[localId] ?? null;
}

interface SessionLite {
  id: string;
  campaignId: string | null;
}

interface CreatedCharacter {
  id: string;
  name: string;
}

/** Sincroniza um personagem local pro backend, vinculado à campanha
 *  da sessão. Retorna o backendId. Idempotente: se já foi sincado,
 *  retorna o id existente. */
export async function syncCharacterToBackend(
  local: CampaignCharacter,
  sessionCode: string,
): Promise<string> {
  const existing = getBackendCharacterId(local.id);
  if (existing) return existing;

  // Resolve sessão → campaignId
  const session = await apiRequest<SessionLite>(
    `/sessions/by-code/${encodeURIComponent(sessionCode.toUpperCase())}`,
  );

  // Determina sistema do personagem
  const system = local.cosmicHorrorData
    ? "cosmic-horror"
    : local.dnd5eData
      ? "dnd5e"
      : "custom";

  // Atributos compactados pra column attributes (JSON)
  const attributes: Record<string, unknown> = {
    ...(local.dnd5eData
      ? {
          str: local.stats.str,
          dex: local.stats.dex,
          con: local.stats.con,
          int: local.stats.int,
          wis: local.stats.wis,
          cha: local.stats.cha,
        }
      : local.cosmicHorrorData
        ? local.cosmicHorrorData.attributes
        : {}),
  };

  const created = await apiRequest<CreatedCharacter>("/characters", {
    method: "POST",
    body: {
      name: local.name,
      system,
      race: local.dnd5eData?.raceSlug,
      class: local.dnd5eData?.classSlug,
      level: local.dnd5eData?.level ?? 1,
      campaignId: session.campaignId ?? undefined,
      attributes,
    },
  });

  const map = readMap();
  map[local.id] = created.id;
  writeMap(map);
  return created.id;
}
