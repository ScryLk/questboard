import { memo, useCallback, useContext } from "react";
import { StyleSheet, Alert } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Text } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { useCombatStore } from "../../stores/combatStore";
import { TokenIcon } from "./token-icon";
import { useMapPanRef } from "./map-canvas";
import type { TokenState } from "../../lib/gameplay-store";

// ─── Single Token ────────────────────────────────────────

interface TokenProps {
  token: TokenState;
  gridSize: number;
  isSelected: boolean;
  isGM: boolean;
}

const TokenItem = memo(function TokenItem({
  token,
  gridSize,
  isSelected,
  isGM,
}: TokenProps) {
  const moveToken = useGameplayStore((s) => s.moveToken);
  const showContextMenu = useGameplayStore((s) => s.showContextMenu);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const setDraggingTokenId = useGameplayStore((s) => s.setDraggingTokenId);
  const mapPanRef = useMapPanRef();

  const size = token.size * gridSize;
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const pressScale = useSharedValue(1);
  const borderHighlight = useSharedValue(0);

  // If not visible and not GM, don't render
  if (!token.visible && !isGM) return null;

  const handleDragStart = useCallback(() => {
    const store = useGameplayStore.getState();
    if (store.combatActive) {
      setDraggingTokenId(token.id);
    }
  }, [token.id, setDraggingTokenId]);

  const handleDragEnd = useCallback(() => {
    setDraggingTokenId(null);
  }, [setDraggingTokenId]);

  const handleTokenPress = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {
      // Haptics not available (e.g. simulator)
    }
    const store = useGameplayStore.getState();

    if (token.id === myTokenId) {
      // My token → open SheetPanel
      store.closeAllPanels();
      store.setActivePanel("sheet");
    } else {
      // Other token → openCharacterSheet (already closes panels internally)
      store.openCharacterSheet(token.id);
    }
  }, [token.id, myTokenId]);

  const handleDrop = useCallback(
    (finalX: number, finalY: number) => {
      const snappedX = Math.round(finalX / gridSize);
      const snappedY = Math.round(finalY / gridSize);

      // Validate movement in combat if combatStore has this combatant
      const gameState = useGameplayStore.getState();
      if (gameState.combatActive) {
        const combatState = useCombatStore.getState();
        const combatant = combatState.combatants.find(
          (c) => c.tokenId === token.id,
        );
        if (combatant) {
          // Chebyshev distance (diagonal = 1 square in D&D 5e)
          const distanceSquares = Math.max(
            Math.abs(snappedX - token.x),
            Math.abs(snappedY - token.y),
          );
          const success = combatState.useMovement(combatant.id, distanceSquares);
          if (!success) {
            Alert.alert("Movimento insuficiente", "Não há quadrados de movimento disponíveis.");
            return; // Don't move — token snaps back via spring animation
          }
        }
      }

      moveToken(token.id, snappedX, snappedY);
    },
    [token.id, token.x, token.y, gridSize, moveToken],
  );

  const handleLongPress = useCallback(
    (absX: number, absY: number) => {
      showContextMenu(token.id, { x: absX, y: absY });
    },
    [token.id, showContextMenu],
  );

  const tapGesture = Gesture.Tap().onEnd(() => {
    // Scale press feedback
    pressScale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
    pressScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 200 }));
    // Accent border flash
    borderHighlight.value = 1;
    borderHighlight.value = withDelay(300, withTiming(0, { duration: 200 }));
    runOnJS(handleTokenPress)();
  });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart((e) => {
      runOnJS(handleLongPress)(e.absoluteX, e.absoluteY);
    });

  // Players can only drag their own token
  const canDrag = isGM || token.id === myTokenId;

  const dragGesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .enabled(canDrag)
    .onStart(() => {
      isDragging.value = true;
      runOnJS(handleDragStart)();
    })
    .onUpdate((e) => {
      offsetX.value = e.translationX;
      offsetY.value = e.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;
      const finalPixelX = token.x * gridSize + offsetX.value;
      const finalPixelY = token.y * gridSize + offsetY.value;
      runOnJS(handleDrop)(finalPixelX, finalPixelY);
      runOnJS(handleDragEnd)();
      offsetX.value = withSpring(0);
      offsetY.value = withSpring(0);
    });

  // Block map pan when interacting with token
  if (mapPanRef) {
    tapGesture.blocksExternalGesture(mapPanRef);
    longPressGesture.blocksExternalGesture(mapPanRef);
    dragGesture.blocksExternalGesture(mapPanRef);
  }

  const composed = Gesture.Race(
    dragGesture,
    Gesture.Simultaneous(tapGesture, longPressGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: isDragging.value ? 1.15 : pressScale.value },
    ],
    zIndex: isDragging.value ? 100 : 1,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: borderHighlight.value > 0.5 ? "#6C5CE7" : (token.layer === "npc" ? "#FF6B6B" : token.color),
  }));

  const pixelX = token.x * gridSize;
  const pixelY = token.y * gridSize;
  const isHidden = !token.visible;
  const hpPercent = token.hp
    ? Math.round((token.hp.current / token.hp.max) * 100)
    : null;

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          styles.token,
          {
            left: pixelX,
            top: pixelY,
            width: size,
            height: size,
          },
          animatedStyle,
        ]}
      >
        {/* Selection glow */}
        {isSelected && (
          <Animated.View
            style={[
              styles.selectionGlow,
              {
                width: size + 8,
                height: size + 8,
                borderRadius: (size + 8) / 2,
                borderColor: token.color,
              },
            ]}
          />
        )}

        {/* Token circle */}
        <Animated.View
          style={[
            styles.tokenCircle,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
              borderStyle: isHidden ? "dashed" : "solid",
              opacity: isHidden ? 0.5 : 1,
            },
            borderStyle,
          ]}
        >
          <TokenIcon name={token.icon} size={size * 0.4} color="#E8E8ED" />
        </Animated.View>

        {/* Name label */}
        <Animated.View style={styles.nameLabel}>
          <Text
            fontSize={9}
            fontWeight="600"
            color="white"
            textAlign="center"
            numberOfLines={1}
          >
            {token.name}
          </Text>
        </Animated.View>

        {/* HP bar */}
        {hpPercent !== null && (
          <Animated.View style={styles.hpBarContainer}>
            <Animated.View
              style={[
                styles.hpBar,
                {
                  width: `${hpPercent}%` as any,
                  backgroundColor:
                    hpPercent > 50
                      ? "#00B894"
                      : hpPercent > 25
                        ? "#FDCB6E"
                        : "#FF6B6B",
                },
              ]}
            />
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

// ─── Token Layer ─────────────────────────────────────────

function TokenLayerInner() {
  const tokens = useGameplayStore((s) => s.tokens);
  const gridSize = useGameplayStore((s) => s.gridSize);
  const selectedTokenId = useGameplayStore((s) => s.selectedTokenId);
  const isGM = useGameplayStore((s) => s.isGM);

  const tokenList = Object.values(tokens);

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {tokenList.map((token) => (
        <TokenItem
          key={token.id}
          token={token}
          gridSize={gridSize}
          isSelected={selectedTokenId === token.id}
          isGM={isGM}
        />
      ))}
    </Animated.View>
  );
}

export const TokenLayer = memo(TokenLayerInner);

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  token: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionGlow: {
    position: "absolute",
    borderWidth: 2,
    opacity: 0.6,
  },
  tokenCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A24",
    borderWidth: 2,
  },
  nameLabel: {
    position: "absolute",
    bottom: -12,
    left: -10,
    right: -10,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  hpBarContainer: {
    position: "absolute",
    bottom: -18,
    left: 2,
    right: 2,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  hpBar: {
    height: "100%",
    borderRadius: 2,
  },
});
