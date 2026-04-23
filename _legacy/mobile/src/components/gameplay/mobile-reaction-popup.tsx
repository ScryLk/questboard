import { memo, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { Shield, Sword, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Stack, Text, XStack, YStack } from "tamagui";

interface ReactionData {
  id: string;
  type: "opportunity-attack" | "shield" | "counterspell";
  description: string;
  triggerName: string;
  weaponName?: string;
  attackBonus?: number;
  damageDice?: string;
  timeLimit: number;
}

interface MobileReactionPopupProps {
  reaction: ReactionData | null;
  visible: boolean;
  onUse: () => void;
  onSkip: () => void;
}

function MobileReactionPopupInner({
  reaction,
  visible,
  onUse,
  onSkip,
}: MobileReactionPopupProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const borderPulse = useRef(new Animated.Value(0)).current;
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (visible && reaction) {
      // Haptic + sound
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }).start();

      // Border pulse
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(borderPulse, { toValue: 1, duration: 600, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(borderPulse, { toValue: 0, duration: 600, useNativeDriver: false, easing: Easing.inOut(Easing.ease) }),
        ]),
      );
      pulse.start();

      // Timer
      setTimeLeft(reaction.timeLimit);

      return () => {
        pulse.stop();
      };
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, reaction, slideAnim, borderPulse]);

  // Countdown timer
  useEffect(() => {
    if (!visible || !reaction || reaction.timeLimit <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, reaction, onSkip]);

  if (!visible || !reaction) return null;

  const borderColor = borderPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 68, 68, 0.3)", "rgba(255, 68, 68, 0.7)"],
  });

  const isOA = reaction.type === "opportunity-attack";

  return (
    <Animated.View
      style={[
        styles.overlay,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Vignette effect */}
      <Stack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(10, 10, 15, 0.85)"
      />

      <YStack
        flex={1}
        justifyContent="flex-end"
        paddingHorizontal={16}
        paddingBottom={48}
        gap={16}
      >
        <Animated.View
          style={[styles.card, { borderColor }]}
        >
          {/* Timer bar */}
          {reaction.timeLimit > 0 && (
            <XStack
              height={4}
              backgroundColor="rgba(255, 68, 68, 0.1)"
              borderRadius={2}
              marginBottom={12}
              overflow="hidden"
            >
              <Stack
                height={4}
                backgroundColor="#FF4444"
                borderRadius={2}
                width={`${(timeLeft / reaction.timeLimit) * 100}%` as `${number}%`}
              />
            </XStack>
          )}

          {/* Header */}
          <XStack alignItems="center" gap={12} marginBottom={12}>
            <Stack
              width={44}
              height={44}
              borderRadius={22}
              backgroundColor="rgba(255, 68, 68, 0.12)"
              alignItems="center"
              justifyContent="center"
            >
              {isOA ? (
                <Sword size={22} color="#FF6B6B" />
              ) : (
                <Shield size={22} color="#4FC3F7" />
              )}
            </Stack>
            <YStack flex={1}>
              <Text fontWeight="800" color="#FF6B6B" fontSize={15}>
                REAÇÃO DISPONÍVEL!
              </Text>
              <Text fontSize={12} color="#9090A0">
                {reaction.description}
              </Text>
            </YStack>
            {reaction.timeLimit > 0 && (
              <Text fontSize={16} fontWeight="700" color="#FF6B6B">
                {timeLeft}s
              </Text>
            )}
          </XStack>

          {/* Weapon info (OA) */}
          {isOA && reaction.weaponName && (
            <XStack
              backgroundColor="rgba(255, 255, 255, 0.04)"
              padding={12}
              borderRadius={10}
              marginBottom={16}
              gap={10}
              alignItems="center"
            >
              <Sword size={18} color="#FF6B6B" />
              <YStack>
                <Text fontWeight="600" fontSize={14} color="#E8E8ED">
                  {reaction.weaponName}
                </Text>
                <Text fontSize={12} color="#9090A0">
                  +{reaction.attackBonus} · {reaction.damageDice}
                </Text>
              </YStack>
            </XStack>
          )}

          {/* Buttons */}
          <XStack gap={12}>
            <Stack
              flex={1}
              height={50}
              borderRadius={12}
              backgroundColor="#DD3333"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onUse();
              }}
            >
              <XStack alignItems="center" gap={6}>
                <Sword size={18} color="white" />
                <Text fontSize={15} fontWeight="700" color="white">
                  Atacar!
                </Text>
              </XStack>
            </Stack>

            <Stack
              flex={1}
              height={50}
              borderRadius={12}
              backgroundColor="rgba(255, 255, 255, 0.06)"
              borderWidth={1}
              borderColor="rgba(255, 255, 255, 0.1)"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
              onPress={onSkip}
            >
              <Text fontSize={15} fontWeight="600" color="#9090A0">
                Deixar ir
              </Text>
            </Stack>
          </XStack>
        </Animated.View>
      </YStack>
    </Animated.View>
  );
}

export const MobileReactionPopup = memo(MobileReactionPopupInner);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  card: {
    backgroundColor: "#16161C",
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
  },
});
