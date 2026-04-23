import { memo, useRef, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { TokenIcon } from "./token-icon";

function InitiativeTrackerInner() {
  const insets = useSafeAreaInsets();
  const combatActive = useGameplayStore((s) => s.combatActive);
  const combatRound = useGameplayStore((s) => s.combatRound);
  const participants = useGameplayStore((s) => s.combatParticipants);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const isGM = useGameplayStore((s) => s.isGM);
  const myPlayerId = useGameplayStore((s) => s.myPlayerId);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const tokens = useGameplayStore((s) => s.tokens);
  const nextTurn = useGameplayStore((s) => s.nextTurn);
  const activePanel = useGameplayStore((s) => s.activePanel);
  const viewingType = useGameplayStore((s) => s.viewingType);
  const openCharacterSheet = useGameplayStore((s) => s.openCharacterSheet);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const closeAllPanels = useGameplayStore((s) => s.closeAllPanels);

  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const isHidden = !!(activePanel || viewingType);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: combatActive ? 0 : -80,
      tension: 60,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [combatActive, slideAnim]);

  // Fade out when any panel or character sheet is open
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isHidden ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isHidden, opacityAnim]);

  const handleAvatarPress = useCallback(
    (tokenId: string) => {
      if (tokenId === myTokenId) {
        closeAllPanels();
        setActivePanel("sheet");
      } else {
        openCharacterSheet(tokenId);
      }
    },
    [myTokenId, closeAllPanels, setActivePanel, openCharacterSheet],
  );

  if (!combatActive || participants.length === 0) return null;

  return (
    <Animated.View
      pointerEvents={isHidden ? "none" : "auto"}
      style={[
        styles.container,
        {
          top: 48 + insets.top,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Round badge */}
      <XStack
        paddingHorizontal={12}
        alignItems="center"
        gap={6}
        marginRight={4}
      >
        <Text fontSize={10} fontWeight="700" color="#5A5A6E">
          R{combatRound}
        </Text>
      </XStack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {participants.map((p, index) => {
          const isCurrent = index === currentTurnIndex;
          const isPast = index < currentTurnIndex;
          const token = tokens[p.tokenId];
          const isMyTurn = token?.ownerId === myPlayerId && isCurrent;

          return (
            <YStack
              key={p.id}
              alignItems="center"
              gap={2}
              opacity={isPast ? 0.4 : 1}
              marginRight={8}
            >
              <Stack
                width={isCurrent ? 44 : 38}
                height={isCurrent ? 44 : 38}
                borderRadius={isCurrent ? 22 : 19}
                backgroundColor={isCurrent ? "#1A1A2E" : "#12121A"}
                borderWidth={2}
                borderColor={
                  isCurrent
                    ? "#6C5CE7"
                    : p.isNPC
                      ? "rgba(255, 107, 107, 0.4)"
                      : "rgba(255,255,255,0.1)"
                }
                alignItems="center"
                justifyContent="center"
                onPress={() => handleAvatarPress(p.tokenId)}
                pressStyle={{ opacity: 0.7, scale: 0.95 }}
              >
                <TokenIcon name={p.icon} size={isCurrent ? 20 : 16} color={isCurrent ? "#E8E8ED" : "#9090A0"} />
              </Stack>

              <Text
                fontSize={9}
                fontWeight="600"
                color={isCurrent ? "#E8E8ED" : "#5A5A6E"}
                numberOfLines={1}
              >
                {p.name}
              </Text>

              <Text fontSize={8} color="#5A5A6E">
                {p.initiative}
              </Text>

              {isMyTurn && (
                <Stack
                  backgroundColor="#6C5CE7"
                  paddingHorizontal={6}
                  paddingVertical={1}
                  borderRadius={4}
                >
                  <Text fontSize={8} fontWeight="700" color="white">
                    SUA VEZ!
                  </Text>
                </Stack>
              )}
            </YStack>
          );
        })}

        {/* Next turn button (GM only) */}
        {isGM && (
          <Stack
            width={38}
            height={38}
            borderRadius={19}
            backgroundColor="rgba(108, 92, 231, 0.15)"
            borderWidth={1}
            borderColor="rgba(108, 92, 231, 0.4)"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.6, scale: 0.95 }}
            onPress={nextTurn}
            alignSelf="center"
          >
            <ChevronRight size={18} color="#6C5CE7" />
          </Stack>
        )}
      </ScrollView>
    </Animated.View>
  );
}

export const InitiativeTracker = memo(InitiativeTrackerInner);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "rgba(10, 10, 15, 0.85)",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 49,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  scrollContent: {
    alignItems: "center",
    paddingRight: 16,
  },
});
