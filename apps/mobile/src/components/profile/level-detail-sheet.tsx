import { Modal, ScrollView } from "react-native";
import { Shield } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { UserProfile } from "@questboard/types";
import { MOCK_LEVEL_REWARDS, MOCK_XP_SOURCES } from "../../lib/profile-mock-data";

const TIER_COLORS: Record<string, string> = {
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#6C5CE7",
  DIAMOND: "#00CEC9",
};

interface LevelDetailSheetProps {
  visible: boolean;
  profile: UserProfile;
  onClose: () => void;
}

export function LevelDetailSheet({
  visible,
  profile,
  onClose,
}: LevelDetailSheetProps) {
  const tierColor = TIER_COLORS[profile.tier] ?? "#5A5A6E";
  const xpPercent = Math.round(
    (profile.currentXP / profile.requiredXP) * 100,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <YStack flex={1} justifyContent="flex-end">
        <Stack
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(0,0,0,0.5)"
          onPress={onClose}
        />

        <YStack
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
          borderTopWidth={1}
          borderTopColor="$border"
          backgroundColor="$bgCard"
          paddingBottom={40}
          maxHeight="55%"
        >
          {/* Handle */}
          <YStack alignItems="center" paddingVertical={12}>
            <Stack
              height={4}
              width={40}
              borderRadius={9999}
              backgroundColor="$border"
            />
          </YStack>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          >
            {/* Header */}
            <XStack alignItems="center" gap={8}>
              <Shield size={20} color={tierColor} />
              <Text fontSize={18} fontWeight="700" color="$textPrimary">
                NIVEL {profile.level}
              </Text>
              <Text fontSize={14} color={tierColor} fontWeight="600">
                {profile.tier}
              </Text>
            </XStack>

            {/* XP Bar */}
            <YStack marginTop={16} gap={6}>
              <XStack justifyContent="space-between">
                <Text fontSize={13} color="$textMuted">
                  {profile.currentXP.toLocaleString()} / {profile.requiredXP.toLocaleString()} XP
                </Text>
                <Text fontSize={13} color="$accent" fontWeight="600">
                  {xpPercent}%
                </Text>
              </XStack>
              <Stack
                height={8}
                borderRadius={4}
                backgroundColor="#2A2A35"
                overflow="hidden"
              >
                <Stack
                  height={8}
                  borderRadius={4}
                  backgroundColor="$accent"
                  width={`${xpPercent}%` as unknown as number}
                />
              </Stack>
            </YStack>

            {/* Next Rewards */}
            <Text
              fontSize={12}
              fontWeight="600"
              color="$textMuted"
              textTransform="uppercase"
              letterSpacing={1}
              marginTop={24}
              marginBottom={12}
            >
              PROXIMAS RECOMPENSAS
            </Text>

            <YStack gap={10}>
              {MOCK_LEVEL_REWARDS.map((reward) => (
                <XStack
                  key={`${reward.level}-${reward.label}`}
                  height={48}
                  borderRadius={12}
                  backgroundColor="#1C1C24"
                  alignItems="center"
                  paddingHorizontal={14}
                  gap={12}
                >
                  <Text fontSize={13} color="$textMuted" width={60}>
                    Nv. {reward.level}
                  </Text>
                  <Stack
                    height={32}
                    width={32}
                    borderRadius={8}
                    backgroundColor="$accentMuted"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={14} color="$accent">
                      {reward.icon === "Crown" ? "C" : reward.icon === "Dice5" ? "D" : "F"}
                    </Text>
                  </Stack>
                  <Text
                    flex={1}
                    fontSize={14}
                    fontWeight="500"
                    color="$textPrimary"
                  >
                    {reward.label}
                  </Text>
                </XStack>
              ))}
            </YStack>

            {/* How to earn XP */}
            <Text
              fontSize={12}
              fontWeight="600"
              color="$textMuted"
              textTransform="uppercase"
              letterSpacing={1}
              marginTop={24}
              marginBottom={12}
            >
              COMO GANHAR XP
            </Text>

            <YStack gap={8}>
              {MOCK_XP_SOURCES.map((source) => (
                <XStack
                  key={source.label}
                  alignItems="center"
                  justifyContent="space-between"
                  paddingVertical={6}
                >
                  <Text fontSize={14} color="$textPrimary">
                    {source.label}
                  </Text>
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color="$accent"
                  >
                    +{source.value} XP
                  </Text>
                </XStack>
              ))}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>
    </Modal>
  );
}
