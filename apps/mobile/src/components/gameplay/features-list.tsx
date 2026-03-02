import { memo } from "react";
import { Text, XStack, YStack } from "tamagui";
import type { CharacterSheetFeature } from "../../lib/gameplay-store";

interface FeaturesListProps {
  features: CharacterSheetFeature[];
}

function FeaturesListInner({ features }: FeaturesListProps) {
  return (
    <YStack gap={6} paddingHorizontal={12} marginTop={10}>
      {features.map((feat) => (
        <YStack
          key={feat.name}
          backgroundColor="#16161C"
          borderRadius={10}
          borderWidth={1}
          borderColor="#2A2A35"
          padding={12}
          gap={4}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={13} fontWeight="600" color="#E8E8ED">
              {feat.name}
            </Text>
            {feat.uses && (
              <Text fontSize={11} color="#6C5CE7">
                {feat.uses.current}/{feat.uses.max}
              </Text>
            )}
          </XStack>
          <Text fontSize={12} color="#9090A0" lineHeight={16}>
            {feat.description}
          </Text>
        </YStack>
      ))}
    </YStack>
  );
}

export const FeaturesList = memo(FeaturesListInner);
