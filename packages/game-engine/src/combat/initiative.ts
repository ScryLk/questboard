export interface InitiativeEntry {
  id: string;
  tokenId: string;
  label: string;
  initiative: number;
}

export interface InitiativeState {
  entries: InitiativeEntry[];
  currentIndex: number;
  round: number;
}

/**
 * Create a new initiative tracker.
 */
export function createInitiativeState(): InitiativeState {
  return {
    entries: [],
    currentIndex: 0,
    round: 1,
  };
}

/**
 * Add an entry and re-sort by initiative (descending).
 */
export function addInitiativeEntry(
  state: InitiativeState,
  entry: InitiativeEntry
): InitiativeState {
  const entries = [...state.entries, entry].sort(
    (a, b) => b.initiative - a.initiative
  );
  return { ...state, entries };
}

/**
 * Remove an entry by ID.
 */
export function removeInitiativeEntry(
  state: InitiativeState,
  entryId: string
): InitiativeState {
  const entries = state.entries.filter((e) => e.id !== entryId);
  const currentIndex = Math.min(
    state.currentIndex,
    Math.max(0, entries.length - 1)
  );
  return { ...state, entries, currentIndex };
}

/**
 * Advance to the next turn.
 */
export function nextTurn(state: InitiativeState): InitiativeState {
  if (state.entries.length === 0) return state;

  const nextIndex = (state.currentIndex + 1) % state.entries.length;
  const round =
    nextIndex === 0 ? state.round + 1 : state.round;

  return {
    ...state,
    currentIndex: nextIndex,
    round,
  };
}

/**
 * Go back to the previous turn.
 */
export function previousTurn(state: InitiativeState): InitiativeState {
  if (state.entries.length === 0) return state;

  const prevIndex =
    state.currentIndex === 0
      ? state.entries.length - 1
      : state.currentIndex - 1;
  const round =
    state.currentIndex === 0 ? Math.max(1, state.round - 1) : state.round;

  return {
    ...state,
    currentIndex: prevIndex,
    round,
  };
}

/**
 * Get the current turn's entry.
 */
export function getCurrentEntry(
  state: InitiativeState
): InitiativeEntry | null {
  return state.entries[state.currentIndex] ?? null;
}

/**
 * Reset the initiative tracker.
 */
export function resetInitiative(): InitiativeState {
  return createInitiativeState();
}
