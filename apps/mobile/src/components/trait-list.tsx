import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { RacialTrait } from "../lib/data/dnd5e/types";

interface TraitListProps {
  traits: RacialTrait[];
}

function TraitItem({ trait }: { trait: RacialTrait }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = trait.icon;

  return (
    <Stack
      borderRadius={12}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      padding={12}
      onPress={() => setExpanded(!expanded)}
      pressStyle={{ opacity: 0.85 }}
    >
      <XStack alignItems="center" gap={10}>
        <Stack
          height={32}
          width={32}
          borderRadius={9999}
          backgroundColor="$accentMuted"
          alignItems="center"
          justifyContent="center"
        >
          <Icon size={16} color="#6C5CE7" />
        </Stack>
        <YStack flex={1} gap={2}>
          <Text fontSize={13} fontWeight="600" color="$textPrimary">
            {trait.name}
          </Text>
          <Text fontSize={11} color="$textMuted" numberOfLines={expanded ? undefined : 1}>
            {trait.shortDescription}
          </Text>
        </YStack>
        {expanded ? (
          <ChevronUp size={16} color="#5A5A6E" />
        ) : (
          <ChevronDown size={16} color="#5A5A6E" />
        )}
      </XStack>
      {expanded && (
        <Text
          fontSize={12}
          color="$textSecondary"
          lineHeight={18}
          marginTop={10}
          paddingLeft={42}
        >
          {trait.description}
        </Text>
      )}
    </Stack>
  );
}

export function TraitList({ traits }: TraitListProps) {
  return (
    <YStack gap={8}>
      {traits.map((trait) => (
        <TraitItem key={trait.name} trait={trait} />
      ))}
    </YStack>
  );
}
