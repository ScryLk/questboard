/**
 * Inventory management: weight, encumbrance, and slot tracking.
 * Pure functions — no side effects.
 */

export interface InventoryItem {
  id: string;
  name: string;
  weight: number; // in pounds
  quantity: number;
  slot?: string; // e.g., "weapon", "armor", "ring", "backpack"
  equipped: boolean;
}

export interface InventoryState {
  items: InventoryItem[];
  maxWeight: number; // carrying capacity in pounds
}

export interface EncumbranceResult {
  currentWeight: number;
  maxWeight: number;
  ratio: number;
  level: EncumbranceLevel;
}

export type EncumbranceLevel = "light" | "medium" | "heavy" | "over";

/**
 * Create an empty inventory with a given carrying capacity.
 */
export function createInventory(maxWeight: number): InventoryState {
  return { items: [], maxWeight };
}

/**
 * Add an item to the inventory. Returns new state.
 */
export function addItem(
  state: InventoryState,
  item: InventoryItem
): InventoryState {
  const existing = state.items.find((i) => i.id === item.id);
  if (existing) {
    return {
      ...state,
      items: state.items.map((i) =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      ),
    };
  }
  return { ...state, items: [...state.items, item] };
}

/**
 * Remove an item (or reduce quantity) from the inventory.
 */
export function removeItem(
  state: InventoryState,
  itemId: string,
  quantity = 1
): InventoryState {
  const item = state.items.find((i) => i.id === itemId);
  if (!item) return state;

  if (item.quantity <= quantity) {
    return {
      ...state,
      items: state.items.filter((i) => i.id !== itemId),
    };
  }

  return {
    ...state,
    items: state.items.map((i) =>
      i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
    ),
  };
}

/**
 * Toggle equipped status for an item.
 */
export function toggleEquip(
  state: InventoryState,
  itemId: string
): InventoryState {
  return {
    ...state,
    items: state.items.map((i) =>
      i.id === itemId ? { ...i, equipped: !i.equipped } : i
    ),
  };
}

/**
 * Calculate total weight of all items in the inventory.
 */
export function calculateTotalWeight(state: InventoryState): number {
  return state.items.reduce(
    (total, item) => total + item.weight * item.quantity,
    0
  );
}

/**
 * Calculate encumbrance level based on D&D 5e variant rules:
 * - Light: 0-33% of max
 * - Medium: 34-66% of max
 * - Heavy: 67-100% of max
 * - Over: >100% of max
 */
export function calculateEncumbrance(
  state: InventoryState
): EncumbranceResult {
  const currentWeight = calculateTotalWeight(state);
  const ratio = state.maxWeight > 0 ? currentWeight / state.maxWeight : 0;

  let level: EncumbranceLevel;
  if (ratio > 1) {
    level = "over";
  } else if (ratio > 0.66) {
    level = "heavy";
  } else if (ratio > 0.33) {
    level = "medium";
  } else {
    level = "light";
  }

  return { currentWeight, maxWeight: state.maxWeight, ratio, level };
}

/**
 * Get all equipped items.
 */
export function getEquippedItems(state: InventoryState): InventoryItem[] {
  return state.items.filter((i) => i.equipped);
}

/**
 * Get items by slot.
 */
export function getItemsBySlot(
  state: InventoryState,
  slot: string
): InventoryItem[] {
  return state.items.filter((i) => i.slot === slot);
}

/**
 * Calculate D&D 5e carrying capacity from Strength score.
 * Carrying capacity = Strength × 15 (in pounds).
 */
export function calculateCarryingCapacity(strengthScore: number): number {
  return strengthScore * 15;
}
