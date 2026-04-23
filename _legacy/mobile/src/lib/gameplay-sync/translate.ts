// ─────────────────────────────────────────────────────────────────────
// Tradutor de shape: payload do BroadcastChannel (shape do `web-next`)
// → shape do mobile store.
//
// Não importamos tipos do web-next (outro pacote, não há dep). Em vez
// disso, **declaramos o protocolo localmente** — é o contrato da
// mensagem. Se o web-next mudar shape do `GameToken`, precisa mudar
// aqui também (ou extrair um pacote `@questboard/gameplay-protocol`
// compartilhado — pode vir no futuro).
// ─────────────────────────────────────────────────────────────────────

import type { TokenState, NPCHostility } from "../gameplay-store";

// ── Shape do protocolo (bate com web-next GameToken) ─────────────────

type WebNextAlignment = "hostile" | "neutral" | "ally";

export interface WebNextGameToken {
  id: string;
  name: string;
  alignment: WebNextAlignment;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  size: number;
  x: number;
  y: number;
  onMap: boolean;
  conditions: string[];
  visibility: "visible" | "hidden" | "invisible";
  speed: number;
  playerId?: string;
  icon?: string;
  label?: string;
  elevation?: number;
}

export interface WebNextCombat {
  active: boolean;
  round: number;
  turnIndex: number;
  order: Array<{ tokenId: string; initiative: number; status: string }>;
}

// ── Mapeamentos de enum ──────────────────────────────────────────────

const ALIGNMENT_TO_HOSTILITY: Record<WebNextAlignment, NPCHostility> = {
  hostile: "hostile",
  neutral: "neutral",
  ally: "friendly",
};

// ── Token ────────────────────────────────────────────────────────────

export function translateToken(gt: WebNextGameToken): TokenState {
  // Ownership: se tem playerId → é PC (layer character); senão, NPC.
  const isPC = !!gt.playerId;
  return {
    id: gt.id,
    name: gt.name,
    imageUrl: null, // web-next token não tem imageUrl exposto no protocolo
    icon: gt.icon ?? (isPC ? "🧙" : "👹"),
    x: gt.x,
    y: gt.y,
    size: gt.size,
    layer: isPC ? "character" : "npc",
    // web-next usa `visibility + onMap`; mobile só tem `visible`.
    visible: gt.onMap && gt.visibility !== "hidden",
    characterId: gt.playerId ?? null,
    hp: { current: gt.hp, max: gt.maxHp },
    conditions: gt.conditions,
    ownerId: gt.playerId ?? "gm",
    color: "#6c5ce7",
    ac: gt.ac,
    hostility: ALIGNMENT_TO_HOSTILITY[gt.alignment],
  };
}

export function translateTokens(
  list: WebNextGameToken[],
): Record<string, TokenState> {
  const out: Record<string, TokenState> = {};
  for (const t of list) out[t.id] = translateToken(t);
  return out;
}

// ── Combat (parcial — só flags básicos que o mobile consome) ────────

export interface MobileCombatSlice {
  combatActive: boolean;
  currentTurnIndex: number;
}

export function translateCombat(c: WebNextCombat): MobileCombatSlice {
  return {
    combatActive: c.active,
    currentTurnIndex: c.turnIndex,
  };
}

// ── Snapshot completo ────────────────────────────────────────────────

export interface WebNextSnapshot {
  tokens?: WebNextGameToken[];
  combat?: WebNextCombat;
  // Outros campos (fog, messages, mapObjects, markers) ainda não são
  // traduzidos — shapes divergem bastante e o custo supera o ganho no
  // primeiro ciclo de testes. Adicionar conforme necessidade.
}

export interface MobileApplicablePatch {
  tokens?: Record<string, TokenState>;
  combatActive?: boolean;
  currentTurnIndex?: number;
}

export function translateSnapshot(
  snapshot: WebNextSnapshot,
): MobileApplicablePatch {
  const patch: MobileApplicablePatch = {};
  if (snapshot.tokens) patch.tokens = translateTokens(snapshot.tokens);
  if (snapshot.combat) {
    const c = translateCombat(snapshot.combat);
    patch.combatActive = c.combatActive;
    patch.currentTurnIndex = c.currentTurnIndex;
  }
  return patch;
}
