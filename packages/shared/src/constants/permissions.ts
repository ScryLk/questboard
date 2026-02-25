import { PlayerRole } from "../types/enums.js";

export const PERMISSIONS: Record<string, PlayerRole[]> = {
  // ── Sessão ──
  "session:start": [PlayerRole.GM],
  "session:pause": [PlayerRole.GM],
  "session:resume": [PlayerRole.GM],
  "session:end": [PlayerRole.GM],
  "session:delete": [PlayerRole.GM],
  "session:update-settings": [PlayerRole.GM, PlayerRole.CO_GM],
  "session:transfer-ownership": [PlayerRole.GM],

  // ── Jogadores ──
  "player:invite": [PlayerRole.GM, PlayerRole.CO_GM],
  "player:kick": [PlayerRole.GM, PlayerRole.CO_GM],
  "player:ban": [PlayerRole.GM],
  "player:change-role": [PlayerRole.GM],
  "player:mute": [PlayerRole.GM, PlayerRole.CO_GM],

  // ── Mapa ──
  "map:upload": [PlayerRole.GM, PlayerRole.CO_GM],
  "map:generate-ai": [PlayerRole.GM],
  "map:change-active": [PlayerRole.GM, PlayerRole.CO_GM],
  "map:edit-layers": [PlayerRole.GM, PlayerRole.CO_GM],
  "map:edit-fog": [PlayerRole.GM, PlayerRole.CO_GM],
  "map:edit-lighting": [PlayerRole.GM, PlayerRole.CO_GM],
  "map:edit-walls": [PlayerRole.GM, PlayerRole.CO_GM],

  // ── Tokens ──
  "token:add": [PlayerRole.GM, PlayerRole.CO_GM],
  "token:remove": [PlayerRole.GM, PlayerRole.CO_GM],
  "token:move-own": [PlayerRole.GM, PlayerRole.CO_GM, PlayerRole.PLAYER],
  "token:move-any": [PlayerRole.GM, PlayerRole.CO_GM],
  "token:edit": [PlayerRole.GM, PlayerRole.CO_GM],

  // ── Combate ──
  "combat:start": [PlayerRole.GM, PlayerRole.CO_GM],
  "combat:end": [PlayerRole.GM, PlayerRole.CO_GM],
  "combat:next-turn": [PlayerRole.GM, PlayerRole.CO_GM],
  "combat:add-npc": [PlayerRole.GM, PlayerRole.CO_GM],
  "combat:update-any-hp": [PlayerRole.GM, PlayerRole.CO_GM],
  "combat:update-own-hp": [PlayerRole.GM, PlayerRole.CO_GM, PlayerRole.PLAYER],

  // ── Dados ──
  "dice:roll": [PlayerRole.GM, PlayerRole.CO_GM, PlayerRole.PLAYER],
  "dice:roll-secret": [PlayerRole.GM, PlayerRole.CO_GM],

  // ── Chat ──
  "chat:send-general": [PlayerRole.GM, PlayerRole.CO_GM, PlayerRole.PLAYER],
  "chat:send-in-character": [PlayerRole.GM, PlayerRole.CO_GM, PlayerRole.PLAYER],
  "chat:send-whisper": [PlayerRole.GM, PlayerRole.CO_GM, PlayerRole.PLAYER],
  "chat:send-gm-only": [PlayerRole.GM, PlayerRole.CO_GM],
  "chat:send-narrative": [PlayerRole.GM, PlayerRole.CO_GM],

  // ── Áudio ──
  "audio:control": [PlayerRole.GM, PlayerRole.CO_GM],

  // ── Espectador ──
  "spectator:view": [PlayerRole.GM, PlayerRole.CO_GM, PlayerRole.PLAYER, PlayerRole.SPECTATOR],
  "spectator:chat": [],
};

export function checkPermission(action: string, role: PlayerRole): boolean {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

export const SOCKET_RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "token:move": { max: 30, windowMs: 1000 },
  "cursor:move": { max: 15, windowMs: 1000 },
  "chat:send": { max: 5, windowMs: 1000 },
  "chat:typing": { max: 3, windowMs: 1000 },
  "dice:roll": { max: 10, windowMs: 1000 },
  "combat:update-hp": { max: 20, windowMs: 1000 },
};
