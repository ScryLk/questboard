import { Crown } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface PlayerRowProps {
  displayName: string;
  avatarUrl: string | null;
  role: "GM" | "CO_GM" | "PLAYER";
  characterName: string | null;
  isOnline?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function PlayerRow({
  displayName,
  role,
  characterName,
  isOnline,
}: PlayerRowProps) {
  const initials = getInitials(displayName);

  return (
    <XStack
      height={56}
      alignItems="center"
      paddingHorizontal={16}
      gap={12}
    >
      {/* Avatar */}
      <Stack
        height={40}
        width={40}
        borderRadius={9999}
        backgroundColor={role === "GM" ? "rgba(108, 92, 231, 0.2)" : "rgba(255, 255, 255, 0.08)"}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={14} fontWeight="700" color={role === "GM" ? "$accent" : "$textSecondary"}>
          {initials}
        </Text>
      </Stack>

      {/* Info */}
      <YStack flex={1}>
        <XStack alignItems="center" gap={6}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary" numberOfLines={1}>
            {displayName}
          </Text>
          {role === "GM" && (
            <XStack
              alignItems="center"
              gap={3}
              borderRadius={6}
              backgroundColor="rgba(108, 92, 231, 0.15)"
              paddingHorizontal={6}
              paddingVertical={2}
            >
              <Crown size={10} color="#6C5CE7" />
              <Text fontSize={10} fontWeight="600" color="$accent">
                Mestre
              </Text>
            </XStack>
          )}
        </XStack>
        {characterName && (
          <Text fontSize={12} color="$textMuted" numberOfLines={1} marginTop={2}>
            {characterName}
          </Text>
        )}
      </YStack>

      {/* Online status */}
      {isOnline !== undefined && (
        <Stack
          height={8}
          width={8}
          borderRadius={9999}
          backgroundColor={isOnline ? "$success" : "#3A3A4E"}
        />
      )}
    </XStack>
  );
}
