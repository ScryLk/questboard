import { memo, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Stack, Text } from "tamagui";

interface MobileTurnBannerProps {
  visible: boolean;
  text: string;
  isMyTurn: boolean;
  onDone?: () => void;
}

function MobileTurnBannerInner({ visible, text, isMyTurn, onDone }: MobileTurnBannerProps) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!visible) return;

    if (isMyTurn) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Animate in
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 200 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();

    // Auto-dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
      ]).start(() => onDone?.());
    }, 1500);

    return () => clearTimeout(timer);
  }, [visible, isMyTurn, scale, opacity, translateY, onDone]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ scale }, { translateY }] },
      ]}
    >
      <Stack
        paddingHorizontal={24}
        paddingVertical={12}
        borderRadius={16}
        backgroundColor={isMyTurn ? "rgba(108, 92, 231, 0.25)" : "rgba(255, 255, 255, 0.08)"}
        borderWidth={2}
        borderColor={isMyTurn ? "rgba(108, 92, 231, 0.5)" : "rgba(255, 255, 255, 0.15)"}
      >
        <Text
          fontSize={isMyTurn ? 20 : 16}
          fontWeight="800"
          color={isMyTurn ? "#6C5CE7" : "#E8E8ED"}
          textAlign="center"
        >
          {text}
        </Text>
      </Stack>
    </Animated.View>
  );
}

export const MobileTurnBanner = memo(MobileTurnBannerInner);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
    pointerEvents: "none",
  },
});
