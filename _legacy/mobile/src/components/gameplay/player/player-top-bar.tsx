import { memo, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Shield } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../../lib/gameplay-store";
import { MOCK_CHARACTER_SHEET } from "../../../lib/gameplay-mock-data";
import { PhaseBadge } from "../phase-badge";

function getHpColor(current: number, max: number): string {
  const ratio = current / max;
  if (ratio > 0.5) return "#34D399";
  if (ratio > 0.25) return "#FDCB6E";
  return "#FF6B6B";
}

function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function PlayerTopBarInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sessionName = useGameplayStore((s) => s.sessionName);
  const sessionStatus = useGameplayStore((s) => s.sessionStatus);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const tokens = useGameplayStore((s) => s.tokens);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);

  const sheet = MOCK_CHARACTER_SHEET;
  const token = myTokenId ? tokens[myTokenId] : null;
  const hpCurrent = token?.hp?.current ?? sheet.hp.current;
  const hpMax = token?.hp?.max ?? sheet.hp.max;
  const hpColor = getHpColor(hpCurrent, hpMax);
  const hpRatio = Math.max(0, Math.min(1, hpCurrent / hpMax));

  // Session duration timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(elapsed / 60);
  const mins = elapsed % 60;
  const durationText = hours > 0 ? `${hours}h${mins.toString().padStart(2, "0")}m` : `${mins}min`;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      paddingTop={insets.top}
      backgroundColor="#0D0D12"
      zIndex={50}
      borderBottomWidth={1}
      borderBottomColor="#1E1E2A"
    >
      {/* Row 1: Session info */}
      <XStack height={44} alignItems="center" paddingHorizontal={12} gap={8}>
        {/* Back button */}
        <Stack
          width={36}
          height={36}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.6 }}
          onPress={() => router.back()}
        >
          <ChevronLeft size={20} color="#9090A0" />
        </Stack>

        {/* Session name */}
        <Text
          flex={1}
          fontSize={14}
          fontWeight="600"
          color="#E8E8ED"
          numberOfLines={1}
        >
          {sessionName || "Sessão"}
        </Text>

        {/* Live status */}
        {sessionStatus === "LIVE" && (
          <XStack alignItems="center" gap={4}>
            <Stack
              width={6}
              height={6}
              borderRadius={3}
              backgroundColor="#34D399"
            />
            <Text fontSize={10} fontWeight="700" color="#34D399">
              AO VIVO
            </Text>
            <Text fontSize={10} color="#5A5A6E">
              {durationText}
            </Text>
          </XStack>
        )}

        {sessionStatus === "PAUSED" && (
          <XStack
            backgroundColor="rgba(253, 203, 110, 0.15)"
            paddingHorizontal={8}
            paddingVertical={2}
            borderRadius={8}
            alignItems="center"
          >
            <Text fontSize={10} fontWeight="700" color="#FDCB6E">
              PAUSADO
            </Text>
          </XStack>
        )}

        <PhaseBadge />
      </XStack>

      {/* Row 2: Character info + HP */}
      <XStack height={32} alignItems="center" paddingHorizontal={12} gap={8}>
        {/* Avatar */}
        <Stack
          width={24}
          height={24}
          borderRadius={12}
          backgroundColor={token?.color ?? "#6C5CE7"}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={9} fontWeight="800" color="white">
            {getInitials(sheet.name)}
          </Text>
        </Stack>

        {/* Name */}
        <Text fontSize={13} fontWeight="600" color="#E8E8ED" numberOfLines={1}>
          {sheet.name.split(",")[0]}
        </Text>

        {/* HP Bar */}
        <XStack
          flex={1}
          height={6}
          backgroundColor="rgba(255,255,255,0.08)"
          borderRadius={3}
          overflow="hidden"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => {
            if (myTokenId) updateTokenHp(myTokenId, 0);
          }}
        >
          <Stack
            width={`${hpRatio * 100}%` as `${number}%`}
            height={6}
            backgroundColor={hpColor}
            borderRadius={3}
          />
        </XStack>

        {/* HP text */}
        <Text fontSize={12} fontWeight="700" color={hpColor}>
          {hpCurrent}/{hpMax}
        </Text>

        {/* AC */}
        <XStack alignItems="center" gap={2}>
          <Shield size={12} color="#4FC3F7" />
          <Text fontSize={12} fontWeight="700" color="#4FC3F7">
            {sheet.ac}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  );
}

export const PlayerTopBar = memo(PlayerTopBarInner);
