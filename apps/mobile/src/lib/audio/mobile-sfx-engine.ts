import { Audio } from "expo-av";

// ─── SFX Event Types ─────────────────────────────────────

type SFXEvent =
  // Combat
  | "combat-start"
  | "combat-end"
  | "my-turn"
  | "sword-hit"
  | "arrow-shot"
  | "arrow-hit"
  | "blunt-hit"
  | "spell-cast"
  | "fire-spell"
  | "ice-spell"
  | "lightning-spell"
  | "heal-spell"
  | "dark-spell"
  | "magic-hit"
  | "critical-hit"
  | "miss"
  | "creature-death"
  // Dice
  | "dice-roll"
  | "nat20"
  | "nat1"
  // Reactions
  | "reaction-available"
  | "opportunity-attack"
  // Session
  | "session-start"
  | "countdown-tick"
  // UI
  | "button-press"
  | "notification";

// ─── Sound Files Map ─────────────────────────────────────
// For now we use require() for bundled assets.
// Each maps to a local .mp3/.wav in assets/sfx/ (to be added later)
// When assets aren't available, the engine gracefully no-ops.

const SFX_FILES: Partial<Record<SFXEvent, number>> = {
  // Will be populated when actual sound assets are added:
  // "sword-hit": require("../../../assets/sfx/sword-hit.mp3"),
  // "dice-roll": require("../../../assets/sfx/dice-roll.mp3"),
};

// ─── Engine ──────────────────────────────────────────────

let _enabled = true;
let _volume = 0.7;
const _soundCache = new Map<SFXEvent, Audio.Sound>();

export function setSFXEnabled(enabled: boolean) {
  _enabled = enabled;
}

export function setSFXVolume(volume: number) {
  _volume = Math.max(0, Math.min(1, volume));
}

/**
 * Play a sound effect for a game event.
 * No-ops gracefully if the sound file isn't bundled yet.
 */
export async function playSFX(event: SFXEvent): Promise<void> {
  if (!_enabled) return;

  const file = SFX_FILES[event];
  if (!file) return; // No sound file mapped for this event yet

  try {
    // Reuse cached sound if available
    let sound = _soundCache.get(event);

    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(_volume);
        await sound.playAsync();
        return;
      }
      // Sound was unloaded, remove from cache
      _soundCache.delete(event);
    }

    // Create new sound
    const { sound: newSound } = await Audio.Sound.createAsync(file, {
      shouldPlay: true,
      volume: _volume,
    });
    _soundCache.set(event, newSound);
  } catch (_) {
    // Silently ignore - sound files may not be available
  }
}

/**
 * Unload all cached sounds. Call on session end.
 */
export async function unloadAllSFX(): Promise<void> {
  for (const [, sound] of _soundCache) {
    try {
      await sound.unloadAsync();
    } catch (_) {
      // ignore
    }
  }
  _soundCache.clear();
}

/**
 * Configure the audio session for mixing with background audio.
 * Call once at app start.
 */
export async function initAudioSession(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (_) {
    // ignore
  }
}
