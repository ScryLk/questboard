import { useEffect, useRef, memo } from "react";
import { Animated, StyleSheet, Pressable } from "react-native";
import { Text, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

function DiceResultOverlayInner() {
  const visible = useGameplayStore((s) => s.diceResultVisible);
  const result = useGameplayStore((s) => s.lastDiceResult);
  const hideDiceResult = useGameplayStore((s) => s.hideDiceResult);

  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && result) {
      // Reset
      scale.setValue(0.5);
      opacity.setValue(0);
      shake.setValue(0);

      // Bounce in
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Shake on nat1
      if (result.isNat1) {
        Animated.sequence([
          Animated.timing(shake, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 8,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: -8,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Auto-dismiss after 3s
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => hideDiceResult());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, result, scale, opacity, shake, hideDiceResult]);

  if (!visible || !result) return null;

  const bgColor = result.isNat20
    ? "rgba(253, 203, 110, 0.15)"
    : result.isNat1
      ? "rgba(255, 107, 107, 0.15)"
      : "rgba(22, 22, 28, 0.95)";

  const borderColor = result.isNat20
    ? "#FDCB6E"
    : result.isNat1
      ? "#FF6B6B"
      : "#2A2A35";

  const totalColor = result.isNat20
    ? "#FDCB6E"
    : result.isNat1
      ? "#FF6B6B"
      : "#6C5CE7";

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity,
          transform: [{ scale }, { translateX: shake }],
        },
      ]}
    >
      <Pressable onPress={hideDiceResult}>
        <YStack
          backgroundColor={bgColor}
          borderRadius={20}
          borderWidth={2}
          borderColor={borderColor}
          padding={24}
          alignItems="center"
          gap={6}
          minWidth={200}
        >
          {/* Roller */}
          <Text fontSize={14} color="#9090A0">
            {result.rollerEmoji} {result.rollerName}
          </Text>

          {/* Label */}
          <Text fontSize={13} fontWeight="600" color="#E8E8ED">
            {result.label}
          </Text>

          {/* Result */}
          <Text fontSize={56} fontWeight="900" color={totalColor}>
            {result.total}
          </Text>

          {/* Special labels */}
          {result.isNat20 && (
            <Text fontSize={16} fontWeight="800" color="#FDCB6E">
              CRÍTICO!
            </Text>
          )}
          {result.isNat1 && (
            <Text fontSize={16} fontWeight="800" color="#FF6B6B">
              FALHA CRÍTICA!
            </Text>
          )}

          {/* Formula + rolls */}
          <Text fontSize={12} color="#5A5A6E">
            {result.formula} [{result.rolls.join(", ")}]
          </Text>
        </YStack>
      </Pressable>
    </Animated.View>
  );
}

export const DiceResultOverlay = memo(DiceResultOverlayInner);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    pointerEvents: "box-none",
  },
});
