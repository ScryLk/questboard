import * as Haptics from "expo-haptics";

type HapticEvent =
  // Combat
  | "my-turn"
  | "take-damage"
  | "critical-hit"
  | "creature-death"
  | "heal"
  // Reactions
  | "reaction-available"
  | "opportunity-attack"
  // Dice
  | "dice-roll"
  | "nat20"
  | "nat1"
  // Session
  | "combat-start"
  | "combat-end"
  | "session-starting"
  | "countdown-tick"
  // Touch
  | "token-select"
  | "path-add-cell"
  | "path-danger"
  // UI
  | "button-press"
  // Scene
  | "scene-cinematic"
  | "scene-chapter"
  | "scene-location"
  | "scene-mystery"
  | "scene-danger"
  | "scene-flashback"
  | "scene-weather"
  | "scene-reaction";

const HAPTIC_MAP: Record<HapticEvent, () => void> = {
  // Combat
  "my-turn": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  "take-damage": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  "critical-hit": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  "creature-death": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  "heal": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  // Reactions
  "reaction-available": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  "opportunity-attack": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  // Dice
  "dice-roll": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  "nat20": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  "nat1": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  // Session
  "combat-start": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  "combat-end": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  "session-starting": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  "countdown-tick": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Touch
  "token-select": () => Haptics.selectionAsync(),
  "path-add-cell": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  "path-danger": () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // UI
  "button-press": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Scene
  "scene-cinematic": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  "scene-chapter": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  "scene-location": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  "scene-mystery": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  "scene-danger": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  "scene-flashback": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  "scene-weather": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  "scene-reaction": () => Haptics.selectionAsync(),
};

// Global enabled flag (respects user settings)
let _enabled = true;

export function setHapticsEnabled(enabled: boolean) {
  _enabled = enabled;
}

/**
 * Trigger haptic feedback for a game event.
 * No-ops if haptics are disabled in settings.
 */
export function triggerHaptic(event: HapticEvent) {
  if (!_enabled) return;
  const fn = HAPTIC_MAP[event];
  if (fn) {
    try {
      fn();
    } catch {
      // Silently ignore on devices without haptic support
    }
  }
}
