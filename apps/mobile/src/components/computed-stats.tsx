import { Heart, Shield, Zap } from "lucide-react-native";
import { Text, XStack, YStack } from "tamagui";
import {
  useCharacterCreationStore,
  getComputedStats,
} from "../lib/character-creation-store";
import { formatModifier } from "../lib/data/dnd5e/abilities";

export function ComputedStatsPanel() {
  const state = useCharacterCreationStore();
  const stats = getComputedStats(state);

  return (
    <XStack
      borderRadius={14}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      padding={12}
      gap={8}
    >
      <YStack flex={1} alignItems="center" gap={4}>
        <Heart size={18} color="#FF6B6B" />
        <Text fontSize={18} fontWeight="700" color="$textPrimary">
          {stats.hp}
        </Text>
        <Text fontSize={10} color="$textMuted">
          PV
        </Text>
      </YStack>
      <YStack flex={1} alignItems="center" gap={4}>
        <Shield size={18} color="#6C5CE7" />
        <Text fontSize={18} fontWeight="700" color="$textPrimary">
          {stats.ac}
        </Text>
        <Text fontSize={10} color="$textMuted">
          CA
        </Text>
      </YStack>
      <YStack flex={1} alignItems="center" gap={4}>
        <Zap size={18} color="#FDCB6E" />
        <Text fontSize={18} fontWeight="700" color="$textPrimary">
          {formatModifier(stats.initiative)}
        </Text>
        <Text fontSize={10} color="$textMuted">
          Iniciativa
        </Text>
      </YStack>
    </XStack>
  );
}
