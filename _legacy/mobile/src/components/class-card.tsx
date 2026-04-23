import { Star } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterClass } from "../lib/data/dnd5e/types";
import { ABILITY_SHORT_LABELS } from "../lib/data/dnd5e/abilities";
import { ROLE_LABELS, ROLE_COLORS } from "../lib/data/dnd5e/classes";

interface ClassCardProps {
  cls: CharacterClass;
  isSelected: boolean;
  onPress: () => void;
}

function ComplexityStars({ complexity }: { complexity: string }) {
  const count = complexity === "simple" ? 1 : complexity === "moderate" ? 2 : 3;
  return (
    <XStack gap={2}>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={10}
          color={i <= count ? "#FDCB6E" : "#2A2A35"}
          fill={i <= count ? "#FDCB6E" : "transparent"}
        />
      ))}
    </XStack>
  );
}

export function ClassCard({ cls, isSelected, onPress }: ClassCardProps) {
  const Icon = cls.icon;
  const roleLabel = ROLE_LABELS[cls.role] ?? cls.role;
  const roleColor = ROLE_COLORS[cls.role] ?? "#9090A0";

  return (
    <Stack flex={1} padding={6} maxWidth="50%">
      <YStack
        borderRadius={14}
        borderWidth={1}
        borderColor={isSelected ? "$accent" : "$border"}
        backgroundColor="$bgCard"
        overflow="hidden"
        onPress={onPress}
        pressStyle={{ opacity: 0.85, scale: 0.98 }}
      >
        <YStack
          height={80}
          alignItems="center"
          justifyContent="center"
          backgroundColor={`${cls.color}15`}
        >
          <Icon size={36} color={cls.color} />
        </YStack>
        <YStack padding={12} gap={4}>
          <Text
            fontSize={14}
            fontWeight="600"
            color="$textPrimary"
            numberOfLines={1}
          >
            {cls.name}
          </Text>
          <XStack gap={6} alignItems="center">
            <Stack
              borderRadius={6}
              paddingHorizontal={6}
              paddingVertical={2}
              backgroundColor={`${roleColor}20`}
            >
              <Text fontSize={10} fontWeight="600" color={roleColor}>
                {roleLabel}
              </Text>
            </Stack>
            <Text fontSize={11} color="$textMuted">
              d{cls.hitDie}
            </Text>
          </XStack>
          <XStack justifyContent="space-between" alignItems="center" marginTop={2}>
            <Text fontSize={11} color="$textMuted">
              {cls.primaryAbilities
                .map((a) => ABILITY_SHORT_LABELS[a])
                .join("/")}
            </Text>
            <ComplexityStars complexity={cls.complexity} />
          </XStack>
        </YStack>
      </YStack>
    </Stack>
  );
}
