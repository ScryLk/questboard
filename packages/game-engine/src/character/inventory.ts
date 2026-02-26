/**
 * Inventory Management — CRUD operations, weight calculation,
 * encumbrance checks, and currency conversion.
 */

// ── Types ──

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  attunement: boolean;
  rarity?: string;
  category?: string;
  properties?: Record<string, unknown>;
}

export interface EncumbranceResult {
  totalWeight: number;
  carryCapacity: number;
  encumbered: boolean;
  heavilyEncumbered: boolean;
  overCapacity: boolean;
}

export interface CurrencyState {
  [denomination: string]: number;
}

export interface CurrencyDenomination {
  key: string;
  label: string;
  rate: number; // relative to the base denomination (e.g., cp=1, sp=10, gp=100)
}

// ── Inventory Operations ──

/**
 * Add an item to the inventory. Returns the new inventory array.
 */
export function addItem(
  inventory: InventoryItem[],
  item: Omit<InventoryItem, "id">
): InventoryItem[] {
  // Check for stackable item (same name, not equipped)
  const existing = inventory.find(
    (i) => i.name === item.name && !i.equipped && !item.equipped
  );

  if (existing && !item.attunement) {
    return inventory.map((i) =>
      i.id === existing.id
        ? { ...i, quantity: i.quantity + (item.quantity || 1) }
        : i
    );
  }

  const newItem: InventoryItem = {
    ...item,
    id: generateId(),
    quantity: item.quantity || 1,
    weight: item.weight || 0,
    equipped: item.equipped || false,
    attunement: item.attunement || false,
  };

  return [...inventory, newItem];
}

/**
 * Remove an item from the inventory by id.
 */
export function removeItem(
  inventory: InventoryItem[],
  itemId: string
): InventoryItem[] {
  return inventory.filter((i) => i.id !== itemId);
}

/**
 * Update an item in the inventory.
 */
export function updateItem(
  inventory: InventoryItem[],
  itemId: string,
  changes: Partial<Omit<InventoryItem, "id">>
): InventoryItem[] {
  return inventory.map((i) =>
    i.id === itemId ? { ...i, ...changes } : i
  );
}

/**
 * Update the quantity of an item. If quantity drops to 0, remove it.
 */
export function updateQuantity(
  inventory: InventoryItem[],
  itemId: string,
  delta: number
): InventoryItem[] {
  return inventory
    .map((i) =>
      i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
    )
    .filter((i) => i.quantity > 0);
}

/**
 * Toggle equipped status of an item.
 */
export function toggleEquipped(
  inventory: InventoryItem[],
  itemId: string
): InventoryItem[] {
  return inventory.map((i) =>
    i.id === itemId ? { ...i, equipped: !i.equipped } : i
  );
}

// ── Weight & Encumbrance ──

/**
 * Calculate total weight of inventory.
 */
export function calculateTotalWeight(inventory: InventoryItem[]): number {
  return inventory.reduce((total, item) => {
    return total + item.weight * item.quantity;
  }, 0);
}

/**
 * Calculate encumbrance based on D&D 5e variant rules.
 * @param strengthScore - Character's Strength score
 * @param sizeMultiplier - 1 for Medium, 2 for Large, 0.5 for Small
 */
export function calculateEncumbrance(
  inventory: InventoryItem[],
  strengthScore: number,
  sizeMultiplier: number = 1
): EncumbranceResult {
  const totalWeight = calculateTotalWeight(inventory);
  const carryCapacity = strengthScore * 15 * sizeMultiplier;
  const encumberedThreshold = strengthScore * 5 * sizeMultiplier;
  const heavilyEncumberedThreshold = strengthScore * 10 * sizeMultiplier;

  return {
    totalWeight,
    carryCapacity,
    encumbered: totalWeight > encumberedThreshold,
    heavilyEncumbered: totalWeight > heavilyEncumberedThreshold,
    overCapacity: totalWeight > carryCapacity,
  };
}

/**
 * Get count of attuned items.
 * D&D 5e: max 3 attuned items.
 */
export function getAttunedCount(inventory: InventoryItem[]): number {
  return inventory.filter((i) => i.attunement && i.equipped).length;
}

/**
 * Get items grouped by category.
 */
export function groupByCategory(
  inventory: InventoryItem[]
): Record<string, InventoryItem[]> {
  const groups: Record<string, InventoryItem[]> = {};
  for (const item of inventory) {
    const category = item.category || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
  }
  return groups;
}

// ── Currency ──

/**
 * Convert all currency to a single base denomination value.
 */
export function totalCurrencyValue(
  currency: CurrencyState,
  denominations: CurrencyDenomination[]
): number {
  let total = 0;
  for (const denom of denominations) {
    total += (currency[denom.key] || 0) * denom.rate;
  }
  return total;
}

/**
 * Add currency to a state.
 */
export function addCurrency(
  currency: CurrencyState,
  denomination: string,
  amount: number
): CurrencyState {
  return {
    ...currency,
    [denomination]: (currency[denomination] || 0) + amount,
  };
}

/**
 * Remove currency. Returns null if insufficient funds.
 */
export function removeCurrency(
  currency: CurrencyState,
  denomination: string,
  amount: number
): CurrencyState | null {
  const current = currency[denomination] || 0;
  if (current < amount) return null;
  return {
    ...currency,
    [denomination]: current - amount,
  };
}

/**
 * Standard D&D 5e currency denominations.
 */
export const DND5E_DENOMINATIONS: CurrencyDenomination[] = [
  { key: "cp", label: "Copper", rate: 1 },
  { key: "sp", label: "Silver", rate: 10 },
  { key: "ep", label: "Electrum", rate: 50 },
  { key: "gp", label: "Gold", rate: 100 },
  { key: "pp", label: "Platinum", rate: 1000 },
];

// ── Currency weight (D&D 5e: 50 coins = 1 lb) ──

export function currencyWeight(
  currency: CurrencyState,
  coinsPerPound: number = 50
): number {
  let totalCoins = 0;
  for (const amount of Object.values(currency)) {
    totalCoins += amount;
  }
  return totalCoins / coinsPerPound;
}

// ── Helpers ──

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    id += chars[byte % chars.length];
  }
  return id;
}
