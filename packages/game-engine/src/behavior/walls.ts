// ── Wall set efetivo por tipo de behavior (CLAUDE.md §6.2) ──
//
// Cada tipo de behavior interage com paredes/portas de forma
// distinta:
//   - PANIC : passa por portas normais como se estivessem abertas.
//   - RIOT  : arromba portas não-mágicas (efetivamente abertas).
//   - Demais: respeitam estado atual.
//
// Engine puro — recebe o conjunto de paredes/portas e devolve um
// `Set<string>` de "células bloqueadas" (formato `"x,y"`). O caller
// (worker, pathfinding) consulta `wallSet.has("x,y")` em hot path.

export type DoorState = "OPEN" | "CLOSED" | "LOCKED" | "DESTROYED";

export interface Door {
  /** ID estável da porta (pra eventos). */
  id: string;
  /** Célula que a porta ocupa. */
  x: number;
  y: number;
  state: DoorState;
  /** Portas mágicas (selo arcano) não podem ser arrombadas no RIOT. */
  isMagical?: boolean;
}

export interface Wall {
  /** Formato linha: dois pontos delimitam o segmento. Pra fins de
   *  bloqueio em grid, cada wall é tratada como célula obstruída. */
  cells: Array<{ x: number; y: number }>;
}

export type BehaviorTypeForWalls =
  | "IDLE"
  | "CROWD"
  | "PATROL"
  | "GUARD"
  | "FLEE"
  | "PANIC"
  | "RIOT"
  | "FOLLOW"
  | "SEARCH";

export interface BuildWallsInput {
  walls: Wall[];
  doors: Door[];
  behaviorType: BehaviorTypeForWalls;
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}

/** Constrói o conjunto efetivo de células bloqueadas pra um
 *  behavior. Paredes sempre bloqueiam; portas dependem do state e do
 *  tipo. Portas DESTROYED nunca bloqueiam (CLAUDE.md §6.2 — riot). */
export function buildEffectiveWallSet(input: BuildWallsInput): Set<string> {
  const blocked = new Set<string>();

  for (const wall of input.walls) {
    for (const cell of wall.cells) {
      blocked.add(key(cell.x, cell.y));
    }
  }

  for (const door of input.doors) {
    if (door.state === "DESTROYED") continue;
    if (door.state === "OPEN") continue;

    const closed = door.state === "CLOSED" || door.state === "LOCKED";
    if (!closed) continue;

    if (input.behaviorType === "PANIC") {
      // Pânico passa por portas como se estivessem abertas.
      continue;
    }
    if (input.behaviorType === "RIOT" && !door.isMagical) {
      // Riot arromba portas não-mágicas — tratadas como abertas
      // pelo path; o worker emite door:npc-broken ao chegar.
      continue;
    }
    blocked.add(key(door.x, door.y));
  }

  return blocked;
}

/** Detecta portas que serão "tocadas" pelo path do behavior — útil
 *  pro worker emitir door:npc-opened ou door:npc-broken antes da
 *  célula ser usada. */
export function findDoorsOnPath(
  path: Array<{ x: number; y: number }>,
  doors: Door[],
): Door[] {
  if (path.length === 0 || doors.length === 0) return [];
  const pathSet = new Set(path.map((p) => key(p.x, p.y)));
  return doors.filter((d) => pathSet.has(key(d.x, d.y)));
}
