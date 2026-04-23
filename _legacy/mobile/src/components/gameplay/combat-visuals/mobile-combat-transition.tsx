import { memo, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Sword, Flag } from "lucide-react-native";
import { Stack, Text, YStack } from "tamagui";

interface MobileCombatTransitionProps {
  type: "start" | "end" | null;
  onDone: () => void;
}

function MobileCombatTransitionInner({ type, onDone }: MobileCombatTransitionProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.3)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!type) return;

    // Haptic burst
    if (type === "start") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // White flash
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.6, duration: 80, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    // Overlay fade in
    Animated.timing(overlayOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();

    // Content pop in
    Animated.parallel([
      Animated.spring(contentScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 200 }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss after 1.8s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(contentScale, { toValue: 0.8, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
      ]).start(() => {
        // Reset values
        overlayOpacity.setValue(0);
        contentScale.setValue(0.3);
        contentOpacity.setValue(0);
        onDone();
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [type, overlayOpacity, contentScale, contentOpacity, flashOpacity, onDone]);

  if (!type) return null;

  const isStart = type === "start";
  const accentColor = isStart ? "#FF4444" : "#00B894";
  const Icon = isStart ? Sword : Flag;
  const title = isStart ? "COMBATE!" : "FIM DE COMBATE";
  const subtitle = isStart ? "Rolar iniciativa" : "Vitória!";

  return (
    <>
      {/* White flash */}
      <Animated.View style={[styles.flash, { opacity: flashOpacity }]} />

      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: contentOpacity, transform: [{ scale: contentScale }] },
          ]}
        >
          <YStack alignItems="center" gap={16}>
            <Stack
              width={72}
              height={72}
              borderRadius={36}
              backgroundColor={`${accentColor}20`}
              borderWidth={3}
              borderColor={`${accentColor}60`}
              alignItems="center"
              justifyContent="center"
            >
              <Icon size={32} color={accentColor} />
            </Stack>

            <Text fontSize={28} fontWeight="900" color={accentColor} textAlign="center">
              {title}
            </Text>
            <Text fontSize={14} color="#9090A0" textAlign="center">
              {subtitle}
            </Text>
          </YStack>
        </Animated.View>
      </Animated.View>
    </>
  );
}

export const MobileCombatTransition = memo(MobileCombatTransitionInner);

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 150,
    pointerEvents: "none",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 15, 0.85)",
    zIndex: 140,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
