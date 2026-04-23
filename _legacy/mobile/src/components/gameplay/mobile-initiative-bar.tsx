import { memo, useRef, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import type { CombatParticipant } from "../../lib/gameplay-store";

function MobileInitiativeBarInner() {
  const insets = useSafeAreaInsets();
  const participants = useGameplayStore((s) => s.combatParticipants);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const combatRound = useGameplayStore((s) => s.combatRound);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to active participant
  useEffect(() => {
    if (currentTurnIndex >= 0) {
      scrollRef.current?.scrollTo({ x: currentTurnIndex * 72, animated: true });
    }
  }, [currentTurnIndex]);

  if (participants.length === 0) return null;

  return (
    <XStack
      position="absolute"
      top={insets.top}
      left={0}
      right={0}
      height={56}
      backgroundColor="rgba(10, 10, 15, 0.9)"
      alignItems="center"
      zIndex={50}
      borderBottomWidth={StyleSheet.hairlineWidth}
      borderBottomColor="rgba(255,255,255,0.08)"
      paddingHorizontal={4}
    >
      {/* Round indicator */}
      <Stack
        paddingHorizontal={8}
        paddingVertical={4}
        borderRadius={6}
        backgroundColor="rgba(108, 92, 231, 0.15)"
        marginLeft={4}
        marginRight={4}
      >
        <Text fontSize={10} fontWeight="700" color="#6C5CE7">
          R{combatRound}
        </Text>
      </Stack>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {participants.map((p, i) => (
          <InitiativeToken
            key={p.id}
            participant={p}
            isActive={i === currentTurnIndex}
            isMyToken={p.tokenId === myTokenId}
          />
        ))}
      </ScrollView>
    </XStack>
  );
}

function InitiativeToken({
  participant,
  isActive,
  isMyToken,
}: {
  participant: CombatParticipant;
  isActive: boolean;
  isMyToken: boolean;
}) {
  const borderColor = participant.isNPC
    ? isActive ? "#FF4444" : "#882222"
    : isActive ? "#6C5CE7" : "#3A3A4E";

  const bgColor = isActive
    ? participant.isNPC
      ? "rgba(255, 68, 68, 0.15)"
      : "rgba(108, 92, 231, 0.2)"
    : "rgba(255, 255, 255, 0.04)";

  const initials = participant.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <YStack
      alignItems="center"
      gap={2}
      opacity={participant.isDead ? 0.35 : 1}
      marginHorizontal={4}
      width={56}
    >
      <Stack
        width={isActive ? 34 : 30}
        height={isActive ? 34 : 30}
        borderRadius={isActive ? 17 : 15}
        backgroundColor={bgColor}
        borderWidth={isActive ? 2 : 1.5}
        borderColor={borderColor}
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize={isActive ? 12 : 11}
          fontWeight="700"
          color={isActive ? (participant.isNPC ? "#FF6666" : "#6C5CE7") : "#9090A0"}
        >
          {initials}
        </Text>
      </Stack>
      <Text
        fontSize={8}
        color={isActive ? (isMyToken ? "#6C5CE7" : "#E8E8ED") : "#5A5A6E"}
        fontWeight={isActive ? "700" : "500"}
        numberOfLines={1}
        maxWidth={56}
        textAlign="center"
      >
        {participant.name}
      </Text>
    </YStack>
  );
}

export const MobileInitiativeBar = memo(MobileInitiativeBarInner);

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    paddingRight: 8,
  },
});
