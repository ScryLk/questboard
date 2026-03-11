// ── SFX Trigger System ──
// Maps game event strings to Freesound SFX definition IDs.
// Call playSFX("event:name") from anywhere.

import { audioEngine } from "./audio-engine";
import { freesoundEngine } from "./freesound-engine";
import { SFX_DEFINITIONS } from "./sfx-definitions";

// Map event names → Freesound SFX definition IDs
const EVENT_TO_SFX: Record<string, string> = {
  "dice:roll": "dice-roll",
  "dice:result": "dice-result",
  "dice:nat20": "nat20",
  "dice:nat1": "nat1",

  "combat:turn_change": "turn-change",
  "combat:my_turn": "my-turn",
  "combat:attack_hit_melee": "sword-hit",
  "combat:attack_miss_melee": "sword-miss",
  "combat:attack_hit_ranged": "arrow-hit",
  "combat:attack_shot": "arrow-shot",
  "combat:spell_cast": "magic-cast",
  "combat:spell_hit": "magic-hit",
  "combat:heal": "heal-spell",
  "combat:take_damage": "take-damage",
  "combat:creature_death": "creature-death",
  "combat:shield_block": "shield-block",
  "combat:explosion": "explosion",
  "combat:critical_hit": "critical-hit",
  "combat:opportunity_attack": "opportunity-attack",

  "magic:fire": "fire-spell",
  "magic:ice": "ice-spell",
  "magic:lightning": "lightning-spell",
  "magic:dark": "dark-spell",
  "magic:shield": "shield-spell",

  "ui:chat_message": "chat-message",
  "ui:notification": "notification",
  "ui:success": "success",
  "ui:error": "error",

  "session:player_join": "player-join",
  "session:player_leave": "player-leave",
  "session:combat_start": "combat-start",
  "session:combat_end": "combat-end",

  "map:door_open": "door-open",
  "map:door_close": "door-close",
  "map:door_locked": "door-locked",
  "map:chest_open": "chest-open",
  "map:loot": "coin-drop",
  "map:trap": "trap-trigger",
  "map:footsteps": "footsteps-stone",
  "map:potion": "potion-drink",

  "character:level_up": "level-up",

  // Soundboard ambient triggers
  "soundboard:thunder": "ambient-thunder",
  "soundboard:wolf": "ambient-wolf-howl",
  "soundboard:laugh": "ambient-evil-laugh",
  "soundboard:scream": "ambient-scream",
};

export type SFXEvent = keyof typeof EVENT_TO_SFX;

// Cached store reference to avoid repeated dynamic imports
let _storeRef: { getState: () => { muteAll: boolean; sfxEnabled: boolean } } | null = null;

async function getStore() {
  if (!_storeRef) {
    const mod = await import("../audio-store");
    _storeRef = mod.useAudioStore;
  }
  return _storeRef;
}

/**
 * Play a SFX by event name. Initializes AudioContext if needed.
 * Safe to call at any time — silently no-ops if audio is muted or sound not loaded.
 */
export async function playSFX(eventName: string) {
  const store = await getStore();
  const state = store.getState();

  if (state.muteAll || !state.sfxEnabled) return;

  const sfxId = EVENT_TO_SFX[eventName];
  if (!sfxId) return;

  try {
    await audioEngine.init();
    const def = SFX_DEFINITIONS.find((d) => d.id === sfxId);
    freesoundEngine.play(sfxId, { volume: def?.volume });
  } catch {
    // Silently ignore audio errors (e.g. blocked by browser policy)
  }
}

/**
 * Synchronous version — assumes AudioContext already initialized.
 * Use this in hot paths where async is not appropriate (e.g. Zustand store actions).
 */
export function playSFXSync(eventName: string) {
  if (!audioEngine.initialized) return;

  // Check mute/enabled state via cached store ref
  if (_storeRef) {
    const state = _storeRef.getState();
    if (state.muteAll || !state.sfxEnabled) return;
  }

  const sfxId = EVENT_TO_SFX[eventName];
  if (!sfxId) return;

  try {
    const def = SFX_DEFINITIONS.find((d) => d.id === sfxId);
    freesoundEngine.play(sfxId, { volume: def?.volume });
  } catch {
    // Silently ignore
  }
}
