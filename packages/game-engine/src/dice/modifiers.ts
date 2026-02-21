/**
 * Dice modifier functions for advanced roll mechanics.
 * Exploding dice, rerolling, etc.
 */

/**
 * Exploding dice: when a die rolls its max value, roll again and add.
 * Uses crypto.getRandomValues for secure randomness.
 * Limits recursion to prevent infinite loops.
 */
export function explodeDice(
  rolls: number[],
  sides: number,
  maxExplosions = 10
): number[] {
  const result = [...rolls];
  let explosionsLeft = maxExplosions;

  let newRolls = rolls.filter((r) => r === sides);
  while (newRolls.length > 0 && explosionsLeft > 0) {
    const extraRolls = secureRoll(newRolls.length, sides);
    result.push(...extraRolls);
    explosionsLeft -= newRolls.length;
    newRolls = extraRolls.filter((r) => r === sides);
  }

  return result;
}

/**
 * Reroll dice that are below a minimum value.
 * Each die is rerolled at most once.
 */
export function rerollBelow(
  rolls: number[],
  sides: number,
  minimum: number
): number[] {
  return rolls.map((r) => {
    if (r < minimum) {
      return secureRollSingle(sides);
    }
    return r;
  });
}

/**
 * Keep the highest N rolls from a set.
 */
export function keepHighest(rolls: number[], count: number): number[] {
  return [...rolls].sort((a, b) => b - a).slice(0, count);
}

/**
 * Keep the lowest N rolls from a set.
 */
export function keepLowest(rolls: number[], count: number): number[] {
  return [...rolls].sort((a, b) => a - b).slice(0, count);
}

/**
 * Drop the highest N rolls from a set.
 */
export function dropHighest(rolls: number[], count: number): number[] {
  return [...rolls].sort((a, b) => a - b).slice(0, -count || undefined);
}

/**
 * Drop the lowest N rolls from a set.
 */
export function dropLowest(rolls: number[], count: number): number[] {
  return [...rolls].sort((a, b) => a - b).slice(count);
}

/**
 * Count successes: rolls that meet or exceed a target number.
 */
export function countSuccesses(rolls: number[], target: number): number {
  return rolls.filter((r) => r >= target).length;
}

function secureRoll(count: number, sides: number): number[] {
  const results: number[] = [];
  const bytes = new Uint32Array(count);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < count; i++) {
    const value = bytes[i];
    if (value === undefined) continue;
    results.push((value % sides) + 1);
  }
  return results;
}

function secureRollSingle(sides: number): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return (bytes[0]! % sides) + 1;
}
