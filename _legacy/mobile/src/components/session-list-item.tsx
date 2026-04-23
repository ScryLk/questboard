import { Swords, Wind, Search, Skull, Dice5, Rocket } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { FeedSession } from "../lib/mock-data";
import { SYSTEM_LABELS } from "../lib/mock-data";

const SYSTEM_ICON_MAP: Record<string, typeof Swords> = {
  dnd5e: Swords,
  tormenta20: Wind,
  coc7: Search,
  vampireV5: Skull,
  generic: Dice5,
  starfinder: Rocket,
};

interface SessionListItemProps {
  session: FeedSession;
  onPress?: () => void;
}

export function SessionListItem({ session, onPress }: SessionListItemProps) {
  const systemLabel = SYSTEM_LABELS[session.system] ?? session.system;
  const Icon = SYSTEM_ICON_MAP[session.system] ?? Dice5;

  return (
    <Stack onPress={onPress} marginHorizontal={16} marginBottom={12}>
      <XStack
        overflow="hidden"
        borderRadius={12}
        borderWidth={1}
        borderColor="$border"
        backgroundColor="$bgCard"
      >
        {/* Color strip + icon */}
        <YStack
          backgroundColor={session.accentColor}
          width={64}
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={26} color="white" />
        </YStack>

        {/* Info */}
        <YStack flex={1} padding={12}>
          <XStack alignItems="center" justifyContent="space-between">
            <Text
              flex={1}
              fontSize={16}
              fontWeight="600"
              color="$textPrimary"
              numberOfLines={1}
            >
              {session.name}
            </Text>
            {session.isLive && (
              <XStack
                alignItems="center"
                gap={4}
                borderRadius={9999}
                backgroundColor="$successMuted"
                paddingHorizontal={8}
                paddingVertical={2}
              >
                <Stack
                  height={6}
                  width={6}
                  borderRadius={9999}
                  backgroundColor="$success"
                />
                <Text fontSize={10} fontWeight="500" color="$success">
                  AO VIVO
                </Text>
              </XStack>
            )}
          </XStack>

          <Text
            marginTop={2}
            fontSize={12}
            color="$textMuted"
            numberOfLines={1}
          >
            {session.description}
          </Text>

          <XStack marginTop={8} alignItems="center" gap={12}>
            <Text fontSize={12} color="$accent">
              {systemLabel}
            </Text>
            <Text fontSize={12} color="$textMuted">
              por {session.gmName}
            </Text>
            <Text fontSize={12} color="$textMuted">
              {session.playerCount}/{session.maxPlayers} jogadores
            </Text>
          </XStack>

          {session.tags.length > 0 && (
            <XStack marginTop={8} gap={4} flexWrap="wrap">
              {session.tags.map((tag) => (
                <Stack
                  key={tag}
                  borderRadius={6}
                  borderWidth={1}
                  borderColor="$border"
                  paddingHorizontal={6}
                  paddingVertical={2}
                >
                  <Text fontSize={10} color="$textMuted">
                    {tag}
                  </Text>
                </Stack>
              ))}
            </XStack>
          )}
        </YStack>
      </XStack>
    </Stack>
  );
}
