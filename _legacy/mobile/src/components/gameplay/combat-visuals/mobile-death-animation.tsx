import { memo, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Skull } from "lucide-react-native";
import { Stack, Text } from "tamagui";

interface MobileDeathAnimationProps {
  x: number;
  y: number;
  tokenName: string;
  onDone?: () => void;
}

function MobileDeathAnimationInner({ x, y, tokenName, onDone }: MobileDeathAnimationProps) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const skullScale = useRef(new Animated.Value(0)).current;
  const skullOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.3)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Haptic burst
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), 150);

    // Red ring expands
    Animated.parallel([
      Animated.timing(ringScale, { toValue: 2.5, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(ringOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    // Skull icon appears with bounce
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(skullScale, { toValue: 1, useNativeDriver: true, damping: 8, stiffness: 200 }),
        Animated.timing(skullOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();

    // Everything fades out
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(skullOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start(() => onDone?.());
    }, 1200);

    return () => clearTimeout(timer);
  }, [scale, opacity, skullScale, skullOpacity, ringScale, ringOpacity, onDone]);

  return (
    <Animated.View
      style={[styles.container, { left: x - 40, top: y - 40, opacity }]}
      pointerEvents="none"
    >
      {/* Red ring */}
      <Animated.View
        style={[
          styles.ring,
          { transform: [{ scale: ringScale }], opacity: ringOpacity },
        ]}
      />

      {/* Skull icon */}
      <Animated.View
        style={[
          styles.skullContainer,
          { transform: [{ scale: skullScale }], opacity: skullOpacity },
        ]}
      >
        <Stack
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="rgba(255, 68, 68, 0.2)"
          borderWidth={2}
          borderColor="rgba(255, 68, 68, 0.5)"
          alignItems="center"
          justifyContent="center"
        >
          <Skull size={20} color="#FF4444" />
        </Stack>
      </Animated.View>

      {/* Name */}
      <Animated.View style={[styles.nameContainer, { opacity: skullOpacity }]}>
        <Text fontSize={10} fontWeight="700" color="#FF6B6B" textAlign="center">
          {tokenName}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export const MobileDeathAnimation = memo(MobileDeathAnimationInner);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 95,
  },
  ring: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 68, 68, 0.6)",
  },
  skullContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  nameContainer: {
    position: "absolute",
    bottom: -8,
    left: -20,
    right: -20,
  },
});
