import { Image } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { ArtworkPostData } from "@questboard/types";

interface ArtworkPostCardProps {
  data: ArtworkPostData;
}

export function ArtworkPostCard({ data }: ArtworkPostCardProps) {
  const aspectRatio = data.width && data.height ? data.width / data.height : 4 / 3;

  return (
    <YStack gap={8}>
      {/* Image placeholder */}
      <Stack
        borderRadius={12}
        backgroundColor="rgba(255, 107, 107, 0.08)"
        height={220}
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        <Image size={40} color="rgba(255, 107, 107, 0.4)" />
        <Text fontSize={12} color="$textMuted" marginTop={8}>
          Imagem indisponivel
        </Text>
      </Stack>

      {/* Caption */}
      {data.caption && (
        <Text fontSize={14} color="$textSecondary" lineHeight={20}>
          {data.caption}
        </Text>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <XStack flexWrap="wrap" gap={6}>
          {data.tags.map((tag) => (
            <Stack
              key={tag}
              paddingHorizontal={8}
              paddingVertical={3}
              borderRadius={8}
              backgroundColor="rgba(255, 107, 107, 0.12)"
            >
              <Text fontSize={12} color="#FF6B6B">
                #{tag}
              </Text>
            </Stack>
          ))}
        </XStack>
      )}
    </YStack>
  );
}
