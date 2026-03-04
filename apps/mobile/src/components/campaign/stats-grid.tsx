import { Text, XStack, YStack } from "tamagui";

interface StatItem {
  value: string | number;
  label: string;
}

interface StatsGridProps {
  items: [StatItem, StatItem, StatItem, StatItem];
}

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <YStack gap={8}>
      <XStack gap={8}>
        <StatCard item={items[0]} />
        <StatCard item={items[1]} />
      </XStack>
      <XStack gap={8}>
        <StatCard item={items[2]} />
        <StatCard item={items[3]} />
      </XStack>
    </YStack>
  );
}

function StatCard({ item }: { item: StatItem }) {
  return (
    <YStack
      flex={1}
      borderRadius={12}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      padding={14}
      alignItems="center"
      gap={4}
    >
      <Text fontSize={22} fontWeight="700" color="$textPrimary">
        {item.value}
      </Text>
      <Text fontSize={12} color="$textMuted">
        {item.label}
      </Text>
    </YStack>
  );
}
