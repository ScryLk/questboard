import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useGameplayStore } from "../../lib/gameplay-store";
import { useCombatStore } from "../../stores/combatStore";

/**
 * Renders a grid overlay showing movement range during token drag in combat.
 * Green cells = within movement range, Red cells = out of range.
 */
function MovementRangeOverlayInner() {
  const draggingTokenId = useGameplayStore((s) => s.draggingTokenId);
  const tokens = useGameplayStore((s) => s.tokens);
  const gridSize = useGameplayStore((s) => s.gridSize);
  const combatActive = useGameplayStore((s) => s.combatActive);
  const mapImage = useGameplayStore((s) => s.mapImage);
  const combatants = useCombatStore((s) => s.combatants);

  const token = draggingTokenId ? tokens[draggingTokenId] : null;
  const combatant = useMemo(
    () => combatants.find((c) => c.tokenId === draggingTokenId),
    [combatants, draggingTokenId],
  );

  // Only show during combat + drag + combatant exists
  if (!combatActive || !token || !combatant || !draggingTokenId) return null;

  const ae = combatant.resources.actionEconomy;
  const maxRange = (ae.isDashing ? ae.movementMax * 2 : ae.movementMax) - ae.movementUsed;

  if (maxRange <= 0) return null;

  const cols = Math.ceil((mapImage?.width ?? 800) / gridSize);
  const rows = Math.ceil((mapImage?.height ?? 600) / gridSize);

  return (
    <RangeGrid
      tokenX={token.x}
      tokenY={token.y}
      maxRange={maxRange}
      gridSize={gridSize}
      cols={cols}
      rows={rows}
    />
  );
}

/**
 * Grid of colored cells showing movement range.
 * Extracted to its own memo component to avoid recomputing on every render.
 */
const RangeGrid = memo(function RangeGrid({
  tokenX,
  tokenY,
  maxRange,
  gridSize,
  cols,
  rows,
}: {
  tokenX: number;
  tokenY: number;
  maxRange: number;
  gridSize: number;
  cols: number;
  rows: number;
}) {
  // Compute reachable cells using Chebyshev distance
  const cells = useMemo(() => {
    const result: { x: number; y: number; inRange: boolean }[] = [];
    // Only render cells within a reasonable radius to avoid performance issues
    const radius = maxRange + 3;
    const minX = Math.max(0, tokenX - radius);
    const maxX = Math.min(cols - 1, tokenX + radius);
    const minY = Math.max(0, tokenY - radius);
    const maxY = Math.min(rows - 1, tokenY + radius);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (x === tokenX && y === tokenY) continue;
        const dist = Math.max(Math.abs(x - tokenX), Math.abs(y - tokenY));
        result.push({ x, y, inRange: dist <= maxRange });
      }
    }
    return result;
  }, [tokenX, tokenY, maxRange, cols, rows]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {cells.map((cell) => (
        <View
          key={`mr_${cell.x}_${cell.y}`}
          style={[
            styles.cell,
            {
              left: cell.x * gridSize,
              top: cell.y * gridSize,
              width: gridSize,
              height: gridSize,
              backgroundColor: cell.inRange
                ? "rgba(0, 184, 148, 0.12)"
                : "rgba(255, 68, 68, 0.08)",
              borderColor: cell.inRange
                ? "rgba(0, 184, 148, 0.2)"
                : "rgba(255, 68, 68, 0.12)",
            },
          ]}
        />
      ))}
    </View>
  );
});

export const MovementRangeOverlay = memo(MovementRangeOverlayInner);

const styles = StyleSheet.create({
  cell: {
    position: "absolute",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
