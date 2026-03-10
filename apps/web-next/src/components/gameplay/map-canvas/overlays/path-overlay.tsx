"use client";

import { useMemo } from "react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { getReachableCells } from "@/lib/pathfinding";
import { getMaxMovementFt } from "@/lib/movement-cost";
import { MOCK_MAP } from "@/lib/gameplay-mock-data";

interface PathOverlayProps {
  scaledCell: number;
  cellSizeFt: number;
}

const SEVERITY_COLORS: Record<string, string> = {
  danger: "#FF4444",
  warning: "#FFA500",
  info: "#FDCB6E",
};

const SEVERITY_ICONS: Record<string, string> = {
  opportunity_attack: "⚔",
  enters_enemy_reach: "🛡",
  enters_enemy_vision: "👁",
  difficult_terrain: "⛰",
  hazardous_terrain: "🔥",
  door_closed: "🚪",
  door_locked: "🔒",
  over_speed_limit: "⚠",
};

export function PathOverlay({ scaledCell, cellSizeFt }: PathOverlayProps) {
  const pathPlanningActive = useGameplayStore((s) => s.pathPlanningActive);
  const pathPlanningTokenId = useGameplayStore((s) => s.pathPlanningTokenId);
  const plannedPath = useGameplayStore((s) => s.plannedPath);
  const tokens = useGameplayStore((s) => s.tokens);
  const movementUsedFt = useGameplayStore((s) => s.movementUsedFt);
  const turnActions = useGameplayStore((s) => s.turnActions);
  const wallEdges = useGameplayStore((s) => s.wallEdges);
  const terrainCells = useGameplayStore((s) => s.terrainCells);

  const token = tokens.find((t) => t.id === pathPlanningTokenId);

  const maxFt = token
    ? getMaxMovementFt(token.speed, turnActions.isDashing, movementUsedFt)
    : 0;

  // Reachable cells (Dijkstra flood)
  const reachable = useMemo(() => {
    if (!token || !pathPlanningActive) return new Map<string, number>();
    // Remaining ft after already-planned path
    const pathCost = plannedPath.length > 0 ? plannedPath[plannedPath.length - 1].totalFt : 0;
    const remaining = Math.max(0, maxFt - pathCost);
    const startX = plannedPath.length > 0 ? plannedPath[plannedPath.length - 1].x : token.x;
    const startY = plannedPath.length > 0 ? plannedPath[plannedPath.length - 1].y : token.y;

    return getReachableCells(
      startX,
      startY,
      remaining,
      wallEdges,
      terrainCells,
      MOCK_MAP.gridCols,
      MOCK_MAP.gridRows,
      cellSizeFt,
    );
  }, [token, pathPlanningActive, plannedPath, maxFt, wallEdges, terrainCells, cellSizeFt]);

  // Max cost found (for distinguishing limit cells)
  const maxCostInReachable = useMemo(() => {
    let max = 0;
    for (const cost of reachable.values()) {
      if (cost > max) max = cost;
    }
    return max;
  }, [reachable]);

  if (!pathPlanningActive || !token) return null;

  const half = scaledCell / 2;
  const tokenOriginX = token.x;
  const tokenOriginY = token.y;

  // Determine path color by highest severity
  const hasDanger = plannedPath.some((c) => c.events.some((e) => e.severity === "danger"));
  const hasWarning = plannedPath.some((c) => c.events.some((e) => e.severity === "warning"));
  const pathColor = hasDanger ? "#FF4444" : hasWarning ? "#FFA500" : "#6C5CE7";

  // Build polyline points: token origin → each path cell center
  const allPoints = [
    { x: tokenOriginX, y: tokenOriginY },
    ...plannedPath.map((c) => ({ x: c.x, y: c.y })),
  ];
  const polylineStr = allPoints
    .map((p) => `${p.x * scaledCell + half},${p.y * scaledCell + half}`)
    .join(" ");

  // Ft badge info
  const totalFt = plannedPath.length > 0 ? plannedPath[plannedPath.length - 1].totalFt : 0;
  const isOverSpeed = totalFt > maxFt;
  const lastCell = plannedPath.length > 0 ? plannedPath[plannedPath.length - 1] : null;

  return (
    <>
      {/* Reachable cells highlight (green = reachable, yellow = at limit) */}
      {Array.from(reachable.entries()).map(([key, cost]) => {
        const [cx, cy] = key.split(",").map(Number);
        // Don't highlight cells already in the path or the token's own cell
        const isInPath = plannedPath.some((c) => c.x === cx && c.y === cy);
        if (isInPath || (cx === tokenOriginX && cy === tokenOriginY)) return null;
        // Yellow for cells at max range, green for cells within range
        const isLimit = maxCostInReachable > 0 && cost >= maxCostInReachable - cellSizeFt + 1;
        return (
          <div
            key={`reach_${key}`}
            className="pointer-events-none absolute"
            style={{
              left: cx * scaledCell,
              top: cy * scaledCell,
              width: scaledCell,
              height: scaledCell,
              backgroundColor: isLimit
                ? "rgba(253, 203, 110, 0.12)"
                : "rgba(0, 184, 148, 0.12)",
              border: `1px solid ${isLimit ? "rgba(253, 203, 110, 0.25)" : "rgba(0, 184, 148, 0.2)"}`,
              boxSizing: "border-box" as const,
            }}
          />
        );
      })}

      {/* Path cell highlights */}
      {plannedPath.map((cell, i) => {
        const cellHasDanger = cell.events.some((e) => e.severity === "danger");
        const bgColor = cellHasDanger
          ? "rgba(255, 68, 68, 0.12)"
          : "rgba(108, 92, 231, 0.1)";
        const borderColor = cellHasDanger
          ? "rgba(255, 68, 68, 0.4)"
          : "rgba(108, 92, 231, 0.3)";

        return (
          <div
            key={`path_${i}`}
            className="pointer-events-none absolute"
            style={{
              left: cell.x * scaledCell,
              top: cell.y * scaledCell,
              width: scaledCell,
              height: scaledCell,
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              boxSizing: "border-box",
            }}
          />
        );
      })}

      {/* SVG overlay: path line + arrows + event icons + ft badge */}
      <svg className="pointer-events-none absolute inset-0" style={{ overflow: "visible" }}>
        <defs>
          <marker
            id="path-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={pathColor} opacity={0.7} />
          </marker>
        </defs>

        {/* Path line */}
        {plannedPath.length > 0 && (
          <polyline
            points={polylineStr}
            fill="none"
            stroke={pathColor}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.8}
            markerEnd="url(#path-arrow)"
          />
        )}

        {/* Origin ring */}
        <circle
          cx={tokenOriginX * scaledCell + half}
          cy={tokenOriginY * scaledCell + half}
          r={half * 0.6}
          fill="none"
          stroke="#6C5CE7"
          strokeWidth={2}
          opacity={0.5}
        >
          <animate
            attributeName="opacity"
            values="0.5;0.2;0.5"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Destination marker (pulsing) */}
        {lastCell && (
          <g>
            <circle
              cx={lastCell.x * scaledCell + half}
              cy={lastCell.y * scaledCell + half}
              r={half * 0.35}
              fill="none"
              stroke="#6C5CE7"
              strokeWidth={2}
              opacity={0.8}
            >
              <animate
                attributeName="r"
                values={`${half * 0.3};${half * 0.45};${half * 0.3}`}
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.8;0.3;0.8"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Crosshair lines */}
            {[0, 90].map((angle) => (
              <line
                key={angle}
                x1={lastCell.x * scaledCell + half + Math.cos((angle * Math.PI) / 180) * half * 0.2}
                y1={lastCell.y * scaledCell + half + Math.sin((angle * Math.PI) / 180) * half * 0.2}
                x2={lastCell.x * scaledCell + half + Math.cos((angle * Math.PI) / 180) * half * 0.5}
                y2={lastCell.y * scaledCell + half + Math.sin((angle * Math.PI) / 180) * half * 0.5}
                stroke="#6C5CE7"
                strokeWidth={1.5}
                opacity={0.6}
              />
            ))}
          </g>
        )}

        {/* Event icons on cells */}
        {plannedPath.map((cell, i) => {
          if (cell.events.length === 0) return null;
          // Show highest severity event icon
          const topEvent =
            cell.events.find((e) => e.severity === "danger") ??
            cell.events.find((e) => e.severity === "warning") ??
            cell.events[0];

          const iconX = cell.x * scaledCell + scaledCell - 8;
          const iconY = cell.y * scaledCell + 2;
          const emoji = SEVERITY_ICONS[topEvent.type] ?? "⚠";

          return (
            <g key={`evt_${i}`}>
              <circle
                cx={iconX}
                cy={iconY + 6}
                r={7}
                fill="rgba(0,0,0,0.7)"
              />
              <text
                x={iconX}
                y={iconY + 10}
                textAnchor="middle"
                fontSize={10}
                fill={topEvent.iconColor}
              >
                <title>{topEvent.title}: {topEvent.description}</title>
                {emoji}
              </text>
            </g>
          );
        })}

        {/* Ft badge at last cell */}
        {lastCell && (
          <g>
            <rect
              x={lastCell.x * scaledCell + half - 22}
              y={lastCell.y * scaledCell + scaledCell + 2}
              width={44}
              height={16}
              rx={4}
              fill="#1A1A24"
              stroke={isOverSpeed ? "#FF4444" : "#6C5CE7"}
              strokeWidth={1}
              opacity={0.9}
            />
            <text
              x={lastCell.x * scaledCell + half}
              y={lastCell.y * scaledCell + scaledCell + 13}
              textAnchor="middle"
              fontSize={9}
              fontWeight="bold"
              fill={isOverSpeed ? "#FF4444" : "#6C5CE7"}
            >
              {totalFt}/{maxFt + movementUsedFt}ft
            </text>
          </g>
        )}
      </svg>
    </>
  );
}
