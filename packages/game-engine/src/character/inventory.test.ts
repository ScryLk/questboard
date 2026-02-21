import { describe, it, expect } from "vitest";
import {
  createInventory,
  addItem,
  removeItem,
  toggleEquip,
  calculateTotalWeight,
  calculateEncumbrance,
  getEquippedItems,
  getItemsBySlot,
  calculateCarryingCapacity,
} from "./inventory.js";
import type { InventoryItem } from "./inventory.js";

const sword: InventoryItem = {
  id: "sword-1",
  name: "Espada Longa",
  weight: 3,
  quantity: 1,
  slot: "weapon",
  equipped: false,
};

const potion: InventoryItem = {
  id: "potion-1",
  name: "Poção de Cura",
  weight: 0.5,
  quantity: 3,
  slot: "backpack",
  equipped: false,
};

const shield: InventoryItem = {
  id: "shield-1",
  name: "Escudo",
  weight: 6,
  quantity: 1,
  slot: "weapon",
  equipped: true,
};

describe("createInventory", () => {
  it("creates an empty inventory with max weight", () => {
    const inv = createInventory(150);
    expect(inv.items).toEqual([]);
    expect(inv.maxWeight).toBe(150);
  });
});

describe("addItem", () => {
  it("adds a new item", () => {
    const inv = addItem(createInventory(150), sword);
    expect(inv.items).toHaveLength(1);
    expect(inv.items[0]!.name).toBe("Espada Longa");
  });

  it("stacks quantity for existing items", () => {
    let inv = createInventory(150);
    inv = addItem(inv, potion);
    inv = addItem(inv, { ...potion, quantity: 2 });
    expect(inv.items).toHaveLength(1);
    expect(inv.items[0]!.quantity).toBe(5);
  });

  it("adds multiple different items", () => {
    let inv = createInventory(150);
    inv = addItem(inv, sword);
    inv = addItem(inv, potion);
    expect(inv.items).toHaveLength(2);
  });
});

describe("removeItem", () => {
  it("removes an item completely when quantity <= removal amount", () => {
    let inv = addItem(createInventory(150), sword);
    inv = removeItem(inv, "sword-1");
    expect(inv.items).toHaveLength(0);
  });

  it("reduces quantity when removing less than total", () => {
    let inv = addItem(createInventory(150), potion); // quantity 3
    inv = removeItem(inv, "potion-1", 1);
    expect(inv.items[0]!.quantity).toBe(2);
  });

  it("returns unchanged state if item not found", () => {
    const inv = addItem(createInventory(150), sword);
    const result = removeItem(inv, "nonexistent");
    expect(result.items).toHaveLength(1);
  });
});

describe("toggleEquip", () => {
  it("equips an unequipped item", () => {
    let inv = addItem(createInventory(150), sword);
    inv = toggleEquip(inv, "sword-1");
    expect(inv.items[0]!.equipped).toBe(true);
  });

  it("unequips an equipped item", () => {
    let inv = addItem(createInventory(150), shield);
    inv = toggleEquip(inv, "shield-1");
    expect(inv.items[0]!.equipped).toBe(false);
  });
});

describe("calculateTotalWeight", () => {
  it("calculates total weight considering quantity", () => {
    let inv = createInventory(150);
    inv = addItem(inv, sword); // 3 * 1 = 3
    inv = addItem(inv, potion); // 0.5 * 3 = 1.5
    expect(calculateTotalWeight(inv)).toBe(4.5);
  });

  it("returns 0 for empty inventory", () => {
    expect(calculateTotalWeight(createInventory(150))).toBe(0);
  });
});

describe("calculateEncumbrance", () => {
  it("returns light for low weight", () => {
    let inv = createInventory(150);
    inv = addItem(inv, sword); // 3 lbs
    const result = calculateEncumbrance(inv);
    expect(result.level).toBe("light");
    expect(result.currentWeight).toBe(3);
    expect(result.maxWeight).toBe(150);
  });

  it("returns medium for moderate weight", () => {
    let inv = createInventory(10);
    inv = addItem(inv, { ...sword, weight: 5 }); // 50% of 10
    const result = calculateEncumbrance(inv);
    expect(result.level).toBe("medium");
  });

  it("returns heavy for high weight", () => {
    let inv = createInventory(10);
    inv = addItem(inv, { ...sword, weight: 8 }); // 80% of 10
    const result = calculateEncumbrance(inv);
    expect(result.level).toBe("heavy");
  });

  it("returns over for exceeding max weight", () => {
    let inv = createInventory(10);
    inv = addItem(inv, { ...sword, weight: 15 }); // 150% of 10
    const result = calculateEncumbrance(inv);
    expect(result.level).toBe("over");
    expect(result.ratio).toBeGreaterThan(1);
  });

  it("handles zero max weight", () => {
    const inv = createInventory(0);
    const result = calculateEncumbrance(inv);
    expect(result.level).toBe("light");
    expect(result.ratio).toBe(0);
  });
});

describe("getEquippedItems", () => {
  it("returns only equipped items", () => {
    let inv = createInventory(150);
    inv = addItem(inv, sword);
    inv = addItem(inv, shield); // equipped
    const equipped = getEquippedItems(inv);
    expect(equipped).toHaveLength(1);
    expect(equipped[0]!.name).toBe("Escudo");
  });

  it("returns empty for no equipped items", () => {
    let inv = createInventory(150);
    inv = addItem(inv, sword);
    expect(getEquippedItems(inv)).toEqual([]);
  });
});

describe("getItemsBySlot", () => {
  it("returns items matching the slot", () => {
    let inv = createInventory(150);
    inv = addItem(inv, sword);
    inv = addItem(inv, shield);
    inv = addItem(inv, potion);
    const weapons = getItemsBySlot(inv, "weapon");
    expect(weapons).toHaveLength(2);
  });

  it("returns empty for no matching slot", () => {
    let inv = createInventory(150);
    inv = addItem(inv, sword);
    expect(getItemsBySlot(inv, "armor")).toEqual([]);
  });
});

describe("calculateCarryingCapacity", () => {
  it("calculates capacity as Strength * 15", () => {
    expect(calculateCarryingCapacity(10)).toBe(150);
    expect(calculateCarryingCapacity(18)).toBe(270);
    expect(calculateCarryingCapacity(1)).toBe(15);
  });
});
