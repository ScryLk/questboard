import { memo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Menu, Settings, Users } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

function TopBarInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sessionName = useGameplayStore((s) => s.sessionName);
  const sessionSystem = useGameplayStore((s) => s.sessionSystem);
  const sessionStatus = useGameplayStore((s) => s.sessionStatus);
  const onlinePlayers = useGameplayStore((s) => s.onlinePlayers);
  const isGM = useGameplayStore((s) => s.isGM);

  const onlineCount = onlinePlayers.filter((p) => p.isOnline).length;

  return (
    <XStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      height={48 + insets.top}
      paddingTop={insets.top}
      paddingHorizontal={16}
      backgroundColor="rgba(10, 10, 15, 0.85)"
      alignItems="center"
      justifyContent="space-between"
      zIndex={50}
      borderBottomWidth={StyleSheet.hairlineWidth}
      borderBottomColor="rgba(255,255,255,0.06)"
    >
      {/* Left: Back */}
      <Stack
        width={40}
        height={40}
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.6 }}
        onPress={() => router.back()}
      >
        <Menu size={20} color="#9090A0" />
      </Stack>

      {/* Center: Session info */}
      <XStack flex={1} alignItems="center" justifyContent="center" gap={8}>
        <Stack alignItems="center">
          <Text
            fontSize={14}
            fontWeight="700"
            color="#E8E8ED"
            numberOfLines={1}
          >
            {sessionName || "Sessão"}
          </Text>
          <Text fontSize={11} color="#5A5A6E">
            {sessionSystem?.toUpperCase() ?? ""}
          </Text>
        </Stack>

        {/* Status badge */}
        {sessionStatus === "LIVE" && (
          <XStack
            backgroundColor="rgba(255, 59, 48, 0.15)"
            paddingHorizontal={8}
            paddingVertical={2}
            borderRadius={8}
            alignItems="center"
            gap={4}
          >
            <Stack
              width={6}
              height={6}
              borderRadius={3}
              backgroundColor="#FF3B30"
            />
            <Text fontSize={10} fontWeight="700" color="#FF3B30">
              AO VIVO
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
      </XStack>

      {/* Right: Player count + GM settings */}
      <XStack alignItems="center" gap={8}>
        <XStack alignItems="center" gap={4}>
          <Users size={14} color="#5A5A6E" />
          <Text fontSize={12} color="#9090A0">
            {onlineCount}
          </Text>
        </XStack>

        {isGM && (
          <Stack
            width={36}
            height={36}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.6 }}
          >
            <Settings size={16} color="#5A5A6E" />
          </Stack>
        )}
      </XStack>
    </XStack>
  );
}

export const TopBar = memo(TopBarInner);
