import { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Swords } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../../lib/gameplay-store";
import { triggerHaptic } from "../../../lib/haptics/haptic-triggers";
import { playSFX } from "../../../lib/audio/mobile-sfx-engine";
import { MOCK_CHARACTER_SHEET } from "../../../lib/gameplay-mock-data";

function TurnAlertOverlayInner() {
  const combatActive = useGameplayStore((s) => s.combatActive);
  const combatRound = useGameplayStore((s) => s.combatRound);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const participants = useGameplayStore((s) => s.combatParticipants);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);

  const [visible, setVisible] = useState(false);
  const prevTurnRef = useRef<number | null>(null);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const currentParticipant = participants[currentTurnIndex];
  const isMyTurn = combatActive && currentParticipant?.tokenId === myTokenId;

  // Trigger when turn changes to my turn
  useEffect(() => {
    if (!combatActive) {
      prevTurnRef.current = null;
      return;
    }

    if (isMyTurn && prevTurnRef.current !== currentTurnIndex) {
      setVisible(true);
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });

      triggerHaptic("my-turn");
      playSFX("my-turn");

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 3000);

      prevTurnRef.current = currentTurnIndex;
      return () => clearTimeout(timer);
    }

    prevTurnRef.current = currentTurnIndex;
  }, [currentTurnIndex, combatActive, isMyTurn]);

  const dismiss = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.9, { duration: 200 });
    setTimeout(() => setVisible(false), 200);
  }, [opacity, scale]);

  const handleOpenActions = useCallback(() => {
    dismiss();
    setTimeout(() => setActivePanel("actions"), 250);
  }, [dismiss, setActivePanel]);

  const animatedOverlay = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedOverlay]}>
      <Pressable style={styles.pressable} onPress={dismiss}>
        <Animated.View style={animatedCard}>
          <YStack
            alignItems="center"
            gap={12}
            paddingHorizontal={40}
            paddingVertical={32}
          >
            <Swords size={48} color="#6C5CE7" />

            <Text fontSize={28} fontWeight="900" color="#E8E8ED" textAlign="center">
              SEU TURNO!
            </Text>

            <Text fontSize={14} color="#5A5A6E" textAlign="center">
              Rodada {combatRound} · {MOCK_CHARACTER_SHEET.name.split(",")[0]}
            </Text>

            <Stack
              marginTop={8}
              backgroundColor="rgba(108, 92, 231, 0.2)"
              borderWidth={1}
              borderColor="rgba(108, 92, 231, 0.4)"
              borderRadius={12}
              paddingHorizontal={24}
              paddingVertical={12}
              pressStyle={{ opacity: 0.8 }}
              onPress={handleOpenActions}
            >
              <XStack alignItems="center" gap={6}>
                <Text fontSize={14} fontWeight="700" color="#6C5CE7">
                  Abrir Ações
                </Text>
                <Text fontSize={14} color="#6C5CE7">→</Text>
              </XStack>
            </Stack>
          </YStack>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export const TurnAlertOverlay = memo(TurnAlertOverlayInner);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13, 13, 18, 0.85)",
    zIndex: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  pressable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
