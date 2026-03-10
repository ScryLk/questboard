import { memo, useCallback } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Check, CornerDownLeft, Trash2, X } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGameplayStore } from "../../../lib/gameplay-store";
import type { PathCell } from "../../../lib/gameplay-store";

// ─── Path Overlay (renders planned path cells on map) ────

interface PathOverlayProps {
  gridSize: number;
}

function PathOverlayInner({ gridSize }: PathOverlayProps) {
  const plannedPath = useGameplayStore((s) => s.plannedPath);
  const movementMaxFt = useGameplayStore((s) => s.movementMaxFt);

  if (plannedPath.length === 0) return null;

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {plannedPath.map((cell, i) => {
        const isLast = i === plannedPath.length - 1;
        const overBudget = cell.totalFt > movementMaxFt;
        const bgColor = overBudget
          ? "rgba(255, 68, 68, 0.3)"
          : cell.isDifficultTerrain
            ? "rgba(253, 203, 110, 0.25)"
            : "rgba(108, 92, 231, 0.25)";
        const borderColor = overBudget
          ? "rgba(255, 68, 68, 0.6)"
          : isLast
            ? "rgba(108, 92, 231, 0.8)"
            : "rgba(108, 92, 231, 0.4)";

        return (
          <Stack
            key={`${cell.x}-${cell.y}`}
            position="absolute"
            left={cell.x * gridSize + 2}
            top={cell.y * gridSize + 2}
            width={gridSize - 4}
            height={gridSize - 4}
            borderRadius={4}
            backgroundColor={bgColor}
            borderWidth={isLast ? 2 : 1}
            borderColor={borderColor}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={9} fontWeight="700" color={overBudget ? "#FF6B6B" : "#B0A0FF"}>
              {cell.totalFt}ft
            </Text>
          </Stack>
        );
      })}

      {/* Line connecting cells */}
      {plannedPath.length >= 2 &&
        plannedPath.slice(1).map((cell, i) => {
          const prev = plannedPath[i];
          const fromX = prev.x * gridSize + gridSize / 2;
          const fromY = prev.y * gridSize + gridSize / 2;
          const toX = cell.x * gridSize + gridSize / 2;
          const toY = cell.y * gridSize + gridSize / 2;
          const dx = toX - fromX;
          const dy = toY - fromY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <Stack
              key={`line-${i}`}
              position="absolute"
              left={fromX}
              top={fromY - 1}
              width={length}
              height={2}
              backgroundColor="rgba(108, 92, 231, 0.5)"
              borderRadius={1}
              style={{ transform: [{ rotate: `${angle}deg` }], transformOrigin: "left center" }}
            />
          );
        })}
    </Animated.View>
  );
}

export const PathOverlay = memo(PathOverlayInner);

// ─── Touch Handler (tap-on-grid to add cells) ────────────

interface PathTouchHandlerProps {
  gridSize: number;
}

function PathTouchHandlerInner({ gridSize }: PathTouchHandlerProps) {
  const pathPlanningActive = useGameplayStore((s) => s.pathPlanningActive);
  const addPathCell = useGameplayStore((s) => s.addPathCell);
  const plannedPath = useGameplayStore((s) => s.plannedPath);
  const pathPlanningTokenId = useGameplayStore((s) => s.pathPlanningTokenId);
  const tokens = useGameplayStore((s) => s.tokens);

  const handleTap = useCallback(
    (absX: number, absY: number) => {
      const gridX = Math.floor(absX / gridSize);
      const gridY = Math.floor(absY / gridSize);

      // Don't add duplicate
      const path = useGameplayStore.getState().plannedPath;
      if (path.length > 0 && path[path.length - 1].x === gridX && path[path.length - 1].y === gridY) {
        return;
      }

      // Calculate cost
      const prevCell = path.length > 0 ? path[path.length - 1] : null;
      const tokenId = useGameplayStore.getState().pathPlanningTokenId;
      const token = tokenId ? useGameplayStore.getState().tokens[tokenId] : null;

      let prevX = prevCell ? prevCell.x : (token?.x ?? 0);
      let prevY = prevCell ? prevCell.y : (token?.y ?? 0);

      const dx = Math.abs(gridX - prevX);
      const dy = Math.abs(gridY - prevY);
      const isDiagonal = dx > 0 && dy > 0;
      const baseCost = isDiagonal ? 5 : 5; // 5ft per cell (simplified)
      const isDifficultTerrain = false; // Will be wired to terrain data later
      const ftCost = isDifficultTerrain ? baseCost * 2 : baseCost;
      const totalFt = (prevCell?.totalFt ?? 0) + ftCost;

      const newCell: PathCell = {
        x: gridX,
        y: gridY,
        ftCost,
        totalFt,
        isDiagonal,
        isDifficultTerrain,
      };

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {
        // no haptics
      }

      addPathCell(newCell);
    },
    [gridSize, addPathCell],
  );

  if (!pathPlanningActive) return null;

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={StyleSheet.absoluteFill} />
    </GestureDetector>
  );
}

export const PathTouchHandler = memo(PathTouchHandlerInner);

// ─── Path Planning HUD (confirm/cancel/undo toolbar) ─────

function PathPlanningHUDInner() {
  const insets = useSafeAreaInsets();
  const pathPlanningActive = useGameplayStore((s) => s.pathPlanningActive);
  const plannedPath = useGameplayStore((s) => s.plannedPath);
  const movementUsedFt = useGameplayStore((s) => s.movementUsedFt);
  const movementMaxFt = useGameplayStore((s) => s.movementMaxFt);
  const confirmPath = useGameplayStore((s) => s.confirmPath);
  const cancelPathPlanning = useGameplayStore((s) => s.cancelPathPlanning);
  const undoPathCell = useGameplayStore((s) => s.undoPathCell);
  const clearPath = useGameplayStore((s) => s.clearPath);

  if (!pathPlanningActive) return null;

  const overBudget = movementUsedFt > movementMaxFt;
  const hasPath = plannedPath.length > 0;

  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="rgba(10, 10, 15, 0.95)"
      borderTopWidth={StyleSheet.hairlineWidth}
      borderTopColor="rgba(108, 92, 231, 0.3)"
      paddingBottom={insets.bottom || 8}
      paddingTop={8}
      zIndex={55}
    >
      {/* Movement budget */}
      <XStack alignItems="center" justifyContent="center" gap={8} marginBottom={8}>
        <Text fontSize={13} fontWeight="700" color={overBudget ? "#FF6B6B" : "#6C5CE7"}>
          {movementUsedFt}ft / {movementMaxFt}ft
        </Text>
        {overBudget && (
          <Text fontSize={11} color="#FF6B6B">
            (Dash necessário)
          </Text>
        )}
      </XStack>

      {/* Action buttons */}
      <XStack height={48} alignItems="center" justifyContent="space-around" paddingHorizontal={16}>
        <Stack
          height={40}
          paddingHorizontal={16}
          borderRadius={10}
          backgroundColor="rgba(255, 68, 68, 0.1)"
          borderWidth={1}
          borderColor="rgba(255, 68, 68, 0.2)"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          pressStyle={{ opacity: 0.7 }}
          onPress={cancelPathPlanning}
        >
          <XStack alignItems="center" gap={6}>
            <X size={16} color="#FF6B6B" />
            <Text fontSize={13} fontWeight="600" color="#FF6B6B">
              Cancelar
            </Text>
          </XStack>
        </Stack>

        <Stack
          height={40}
          paddingHorizontal={16}
          borderRadius={10}
          backgroundColor="rgba(255, 255, 255, 0.06)"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          pressStyle={{ opacity: 0.7 }}
          onPress={undoPathCell}
          opacity={hasPath ? 1 : 0.4}
          disabled={!hasPath}
        >
          <XStack alignItems="center" gap={6}>
            <CornerDownLeft size={16} color="#9090A0" />
            <Text fontSize={13} fontWeight="600" color="#9090A0">
              Desfazer
            </Text>
          </XStack>
        </Stack>

        <Stack
          height={40}
          paddingHorizontal={16}
          borderRadius={10}
          backgroundColor="rgba(255, 255, 255, 0.06)"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          pressStyle={{ opacity: 0.7 }}
          onPress={clearPath}
          opacity={hasPath ? 1 : 0.4}
          disabled={!hasPath}
        >
          <Trash2 size={16} color="#9090A0" />
        </Stack>

        <Stack
          height={40}
          paddingHorizontal={20}
          borderRadius={10}
          backgroundColor={hasPath ? "#6C5CE7" : "rgba(108, 92, 231, 0.2)"}
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (_) {
              // no haptics
            }
            confirmPath();
          }}
          opacity={hasPath ? 1 : 0.4}
          disabled={!hasPath}
        >
          <XStack alignItems="center" gap={6}>
            <Check size={16} color="white" />
            <Text fontSize={13} fontWeight="700" color="white">
              Mover
            </Text>
          </XStack>
        </Stack>
      </XStack>
    </YStack>
  );
}

export const PathPlanningHUD = memo(PathPlanningHUDInner);
