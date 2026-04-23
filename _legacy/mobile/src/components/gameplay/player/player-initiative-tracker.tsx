import { memo, useEffect, useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Skull, Swords } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import { useGameplayStore } from "../../../lib/gameplay-store";

function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function PlayerInitiativeTrackerInner() {
  const combatRound = useGameplayStore((s) => s.combatRound);
  const participants = useGameplayStore((s) => s.combatParticipants);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const tokens = useGameplayStore((s) => s.tokens);
  const openCharacterSheet = useGameplayStore((s) => s.openCharacterSheet);

  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to active participant
  useEffect(() => {
    const xOffset = currentTurnIndex * 58; // approx width per item
    scrollRef.current?.scrollTo({ x: Math.max(0, xOffset - 60), animated: true });
  }, [currentTurnIndex]);

  return (
    <XStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      height={56}
      backgroundColor="rgba(10, 10, 15, 0.92)"
      borderBottomWidth={StyleSheet.hairlineWidth}
      borderBottomColor="rgba(255,255,255,0.08)"
      zIndex={49}
      alignItems="center"
      paddingHorizontal={4}
    >
      {/* Round indicator */}
      <XStack
        alignItems="center"
        gap={4}
        paddingHorizontal={8}
        paddingVertical={4}
        backgroundColor="rgba(108, 92, 231, 0.15)"
        borderRadius={8}
        marginRight={4}
      >
        <Swords size={12} color="#6C5CE7" />
        <Text fontSize={11} fontWeight="800" color="#6C5CE7">
          R{combatRound}
        </Text>
      </XStack>

      {/* Participants */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {participants.map((p, index) => {
          const isActive = index === currentTurnIndex;
          const token = tokens[p.tokenId];
          const color = p.isNPC ? "#FF4444" : (token?.color ?? "#6C5CE7");
          const hpCurrent = token?.hp?.current ?? 0;
          const hpMax = token?.hp?.max ?? 1;
          const hpRatio = Math.max(0, Math.min(1, hpCurrent / hpMax));

          return (
            <Stack
              key={p.id}
              alignItems="center"
              opacity={p.isDead ? 0.4 : 1}
              paddingHorizontal={4}
              pressStyle={{ opacity: 0.6 }}
              onPress={() => openCharacterSheet(p.tokenId)}
            >
              {/* Avatar */}
              <Stack
                width={28}
                height={28}
                borderRadius={14}
                backgroundColor={`${color}30`}
                alignItems="center"
                justifyContent="center"
                borderWidth={isActive ? 2 : 1}
                borderColor={isActive ? color : "rgba(255,255,255,0.1)"}
              >
                {p.isDead ? (
                  <Skull size={13} color="#5A5A6E" />
                ) : (
                  <Text fontSize={9} fontWeight="800" color={color}>
                    {getInitials(p.name)}
                  </Text>
                )}
              </Stack>

              {/* HP bar */}
              <Stack
                width={24}
                height={3}
                backgroundColor="rgba(255,255,255,0.08)"
                borderRadius={2}
                overflow="hidden"
                marginTop={2}
              >
                <Stack
                  width={`${hpRatio * 100}%` as `${number}%`}
                  height={3}
                  backgroundColor={p.isDead ? "#5A5A6E" : color}
                  borderRadius={2}
                />
              </Stack>

              {/* Name */}
              <Text
                fontSize={8}
                color={isActive ? color : "#5A5A6E"}
                fontWeight={isActive ? "700" : "500"}
                numberOfLines={1}
                width={46}
                textAlign="center"
                marginTop={1}
              >
                {p.name.length > 8 ? p.name.slice(0, 7) + "…" : p.name}
              </Text>
            </Stack>
          );
        })}
      </ScrollView>
    </XStack>
  );
}

export const PlayerInitiativeTracker = memo(PlayerInitiativeTrackerInner);

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    paddingRight: 8,
    gap: 2,
  },
});
