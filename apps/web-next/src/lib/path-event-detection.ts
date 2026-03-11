import type { GameToken, WallData, TerrainCell } from "./gameplay-mock-data";
import type { PathCellEvent } from "./gameplay-store";
import { isWithinReach, areHostile } from "./reactions";
import { TERRAIN_CATALOG } from "./terrain-catalog";
import { makeWallKey } from "./wall-helpers";
import { getTerrainAt } from "./movement-cost";

/**
 * Detect all events for a single step from prev cell to next cell.
 * Called once per cell added to the planned path.
 */
export function detectStepEvents(
  prevX: number,
  prevY: number,
  nextX: number,
  nextY: number,
  movingTokenId: string,
  allTokens: GameToken[],
  reactionUsedMap: Record<string, boolean>,
  isDisengaging: boolean,
  wallEdges: Record<string, WallData>,
  terrainCells: TerrainCell[],
  cellSizeFt: number,
): PathCellEvent[] {
  const events: PathCellEvent[] = [];
  const movingToken = allTokens.find((t) => t.id === movingTokenId);
  if (!movingToken) return events;

  const reachFt = 5; // Standard melee reach

  // ── Opportunity Attack: leaving hostile's reach ──
  if (!isDisengaging) {
    for (const reactor of allTokens) {
      if (reactor.id === movingTokenId) continue;
      if (!reactor.onMap || reactor.hp <= 0) continue;
      if (!areHostile(reactor.alignment, movingToken.alignment)) continue;
      if (reactionUsedMap[reactor.id]) continue;

      const wasInReach = isWithinReach(reactor.x, reactor.y, prevX, prevY, reachFt, cellSizeFt);
      const stillInReach = isWithinReach(reactor.x, reactor.y, nextX, nextY, reachFt, cellSizeFt);

      if (wasInReach && !stillInReach) {
        events.push({
          type: "opportunity_attack",
          severity: "danger",
          icon: "Swords",
          iconColor: "#FF4444",
          title: `AO: ${reactor.name}`,
          description: `${reactor.name} pode fazer ataque de oportunidade quando você sair do alcance (${reachFt}ft).`,
          relatedTokenId: reactor.id,
        });
      }
    }
  }

  // ── Enters enemy melee reach ──
  for (const enemy of allTokens) {
    if (enemy.id === movingTokenId) continue;
    if (!enemy.onMap || enemy.hp <= 0) continue;
    if (!areHostile(enemy.alignment, movingToken.alignment)) continue;

    const wasInReach = isWithinReach(enemy.x, enemy.y, prevX, prevY, reachFt, cellSizeFt);
    const isNowInReach = isWithinReach(enemy.x, enemy.y, nextX, nextY, reachFt, cellSizeFt);

    if (!wasInReach && isNowInReach) {
      events.push({
        type: "enters_enemy_reach",
        severity: "warning",
        icon: "Shield",
        iconColor: "#FFA500",
        title: `Alcance: ${enemy.name}`,
        description: `Você entra no alcance corpo a corpo de ${enemy.name} (${reachFt}ft).`,
        relatedTokenId: enemy.id,
      });
    }
  }

  // ── Enters enemy vision (simplified: distance-based) ──
  for (const enemy of allTokens) {
    if (enemy.id === movingTokenId) continue;
    if (!enemy.onMap || enemy.hp <= 0) continue;
    if (!areHostile(enemy.alignment, movingToken.alignment)) continue;

    // Simplified: check Chebyshev distance vs a standard vision range (12 cells = 60ft)
    const visionCells = 12;
    const prevDist = Math.max(Math.abs(enemy.x - prevX), Math.abs(enemy.y - prevY));
    const nextDist = Math.max(Math.abs(enemy.x - nextX), Math.abs(enemy.y - nextY));

    if (prevDist > visionCells && nextDist <= visionCells) {
      events.push({
        type: "enters_enemy_vision",
        severity: "warning",
        icon: "Eye",
        iconColor: "#FFA500",
        title: `Detectado: ${enemy.name}`,
        description: `Você entra no campo de visão de ${enemy.name} (${visionCells * cellSizeFt}ft).`,
        relatedTokenId: enemy.id,
      });
    }
  }

  // ── Difficult terrain ──
  const terrain = getTerrainAt(nextX, nextY, terrainCells);
  if (terrain && terrain.movementCost === 2) {
    const info = TERRAIN_CATALOG[terrain.terrainType as keyof typeof TERRAIN_CATALOG];
    events.push({
      type: "difficult_terrain",
      severity: "info",
      icon: "Mountain",
      iconColor: "#FDCB6E",
      title: "Terreno Difícil",
      description: `${info?.label ?? terrain.terrainType}: custo de movimento dobrado (${cellSizeFt * 2}ft por célula).`,
    });
  }

  // ── Hazardous terrain (impassable types that are dangerous) ──
  if (terrain) {
    const hazardTypes = new Set(["lava", "acid", "pit", "void"]);
    if (hazardTypes.has(terrain.terrainType)) {
      const info = TERRAIN_CATALOG[terrain.terrainType as keyof typeof TERRAIN_CATALOG];
      events.push({
        type: "hazardous_terrain",
        severity: "danger",
        icon: "Flame",
        iconColor: "#FF4444",
        title: `Terreno Perigoso: ${info?.label ?? terrain.terrainType}`,
        description: "Entrar neste terreno pode causar dano.",
      });
    }
  }

  // ── Door closed / locked ──
  const wallKey = makeWallKey(prevX, prevY, nextX, nextY);
  const wall = wallEdges[wallKey];
  if (wall) {
    if (wall.type === "door-closed") {
      events.push({
        type: "door_closed",
        severity: "warning",
        icon: "DoorClosed",
        iconColor: "#C8A050",
        title: "Porta Fechada",
        description: "A porta está fechada. Use uma interação com objeto para abri-la.",
      });
    } else if (wall.type === "door-locked") {
      events.push({
        type: "door_locked",
        severity: "danger",
        icon: "Lock",
        iconColor: "#FF4444",
        title: "Porta Trancada",
        description: "A porta está trancada. Precisa de chave ou teste de Ladrão.",
      });
    }
  }

  return events;
}
