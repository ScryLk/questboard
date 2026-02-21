import { describe, it, expect } from "vitest";
import {
  createInitiativeState,
  addInitiativeEntry,
  removeInitiativeEntry,
  nextTurn,
  previousTurn,
  getCurrentEntry,
  resetInitiative,
} from "./initiative.js";
import type { InitiativeEntry } from "./initiative.js";

const entry1: InitiativeEntry = {
  id: "e1",
  tokenId: "t1",
  label: "Fighter",
  initiative: 15,
};
const entry2: InitiativeEntry = {
  id: "e2",
  tokenId: "t2",
  label: "Wizard",
  initiative: 20,
};
const entry3: InitiativeEntry = {
  id: "e3",
  tokenId: "t3",
  label: "Rogue",
  initiative: 18,
};

describe("createInitiativeState", () => {
  it("creates an empty state", () => {
    const state = createInitiativeState();
    expect(state.entries).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.round).toBe(1);
  });
});

describe("addInitiativeEntry", () => {
  it("adds an entry and sorts by initiative descending", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1); // 15
    state = addInitiativeEntry(state, entry2); // 20
    state = addInitiativeEntry(state, entry3); // 18

    expect(state.entries[0]!.label).toBe("Wizard"); // 20
    expect(state.entries[1]!.label).toBe("Rogue"); // 18
    expect(state.entries[2]!.label).toBe("Fighter"); // 15
  });
});

describe("removeInitiativeEntry", () => {
  it("removes the entry by ID", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1);
    state = addInitiativeEntry(state, entry2);
    state = removeInitiativeEntry(state, "e1");

    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]!.id).toBe("e2");
  });

  it("clamps currentIndex when removing last entry", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1);
    state = addInitiativeEntry(state, entry2);
    state = { ...state, currentIndex: 1 };
    state = removeInitiativeEntry(state, "e1");

    expect(state.currentIndex).toBeLessThanOrEqual(
      Math.max(0, state.entries.length - 1)
    );
  });
});

describe("nextTurn", () => {
  it("advances to the next entry", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1);
    state = addInitiativeEntry(state, entry2);
    state = addInitiativeEntry(state, entry3);

    expect(state.currentIndex).toBe(0);
    state = nextTurn(state);
    expect(state.currentIndex).toBe(1);
  });

  it("wraps around and increments round", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1);
    state = addInitiativeEntry(state, entry2);

    state = nextTurn(state); // index 1
    expect(state.round).toBe(1);

    state = nextTurn(state); // wraps to 0
    expect(state.currentIndex).toBe(0);
    expect(state.round).toBe(2);
  });

  it("returns same state for empty entries", () => {
    const state = createInitiativeState();
    const result = nextTurn(state);
    expect(result).toEqual(state);
  });
});

describe("previousTurn", () => {
  it("goes back to the previous entry", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1);
    state = addInitiativeEntry(state, entry2);
    state = addInitiativeEntry(state, entry3);

    state = nextTurn(state); // index 1
    state = previousTurn(state); // back to 0
    expect(state.currentIndex).toBe(0);
  });

  it("wraps to last entry and decrements round", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1);
    state = addInitiativeEntry(state, entry2);
    state = { ...state, round: 2, currentIndex: 0 };

    state = previousTurn(state);
    expect(state.currentIndex).toBe(1);
    expect(state.round).toBe(1);
  });

  it("does not go below round 1", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1);
    state = addInitiativeEntry(state, entry2);

    state = previousTurn(state);
    expect(state.round).toBe(1);
  });

  it("returns same state for empty entries", () => {
    const state = createInitiativeState();
    expect(previousTurn(state)).toEqual(state);
  });
});

describe("getCurrentEntry", () => {
  it("returns the current turn entry", () => {
    let state = createInitiativeState();
    state = addInitiativeEntry(state, entry1);
    state = addInitiativeEntry(state, entry2);

    const current = getCurrentEntry(state);
    expect(current).not.toBeNull();
    expect(current!.id).toBe("e2"); // highest initiative first
  });

  it("returns null for empty state", () => {
    const state = createInitiativeState();
    expect(getCurrentEntry(state)).toBeNull();
  });
});

describe("resetInitiative", () => {
  it("returns a fresh state", () => {
    const state = resetInitiative();
    expect(state.entries).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.round).toBe(1);
  });
});
