import { memo } from "react";
import { Zap } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterSheetFeature } from "../../lib/gameplay-store";

interface FeaturesListProps {
  features: CharacterSheetFeature[];
  onUseAbility?: (featureId: string) => void;
}

function FeaturesListInner({ features, onUseAbility }: FeaturesListProps) {
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
          {onUseAbility && feat.uses && feat.uses.current > 0 && (
            <Stack
              alignSelf="flex-start"
              height={28}
              paddingHorizontal={12}
              borderRadius={6}
              backgroundColor="rgba(52,211,153,0.15)"
              borderWidth={1}
              borderColor="rgba(52,211,153,0.3)"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => onUseAbility(feat.name)}
              marginTop={4}
            >
              <XStack alignItems="center" gap={4}>
                <Zap size={10} color="#34D399" />
                <Text fontSize={11} fontWeight="700" color="#34D399">Usar</Text>
              </XStack>
            </Stack>
          )}
        </YStack>
      ))}
    </YStack>
  );
}

export const FeaturesList = memo(FeaturesListInner);
