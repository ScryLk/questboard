import type { LucideIcon } from "lucide-react-native";
import { Castle, Flame, BookOpen, Sparkles, Theater, Map, Palette, Scroll, Star, Skull } from "lucide-react-native";
import { Stack, Text, YStack } from "tamagui";
import type { NewsItem } from "../lib/mock-data";
import { TYPE_LABELS } from "../lib/mock-data";

const ICON_MAP: Record<string, LucideIcon> = {
  "🏰": Castle,
  "🐉": Flame,
  "⭐": Star,
  "🌪️": Sparkles,
  "🎭": Theater,
  "🍺": BookOpen,
  "🗺️": Map,
  "⚔️": Castle,
  "🎉": Star,
  "💀": Skull,
};

interface ContentCardProps {
  item: NewsItem;
  onPress?: () => void;
}

export function ContentCard({ item, onPress }: ContentCardProps) {
  const typeLabel = TYPE_LABELS[item.type];
  const Icon = ICON_MAP[item.icon] ?? Scroll;

  return (
    <Stack onPress={onPress} width="50%" padding={6}>
      <YStack
        overflow="hidden"
        borderRadius={12}
        borderWidth={1}
        borderColor="$border"
        backgroundColor="$bgCard"
      >
        {/* Colored header area */}
        <YStack
          backgroundColor={item.accentColor}
          height={96}
          alignItems="center"
          justifyContent="center"
        >
          <Stack
            position="absolute"
            left={8}
            top={8}
            borderRadius={9999}
            backgroundColor="rgba(0,0,0,0.4)"
            paddingHorizontal={8}
            paddingVertical={2}
          >
            <Text fontSize={10} fontWeight="500" color="$white">
              {typeLabel}
            </Text>
          </Stack>
          <Icon size={32} color="white" strokeWidth={1.5} />
        </YStack>

        {/* Info */}
        <YStack padding={12}>
          <Text
            fontSize={14}
            fontWeight="600"
            color="$textPrimary"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            marginTop={2}
            fontSize={12}
            color="$textMuted"
            numberOfLines={2}
          >
            {item.subtitle}
          </Text>
        </YStack>
      </YStack>
    </Stack>
  );
}
