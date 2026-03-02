import { memo, useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack, Text, XStack } from "tamagui";

interface FilterOption<T extends string> {
  key: T;
  label: string;
}

interface FilterPillsProps<T extends string> {
  options: FilterOption<T>[];
  selected: T;
  onChange: (key: T) => void;
  scrollable?: boolean;
}

function FilterPillsInner<T extends string>({
  options,
  selected,
  onChange,
  scrollable = false,
}: FilterPillsProps<T>) {
  const content = (
    <XStack gap={8}>
      {options.map((opt) => {
        const isActive = opt.key === selected;
        return (
          <Stack
            key={opt.key}
            paddingHorizontal={12}
            paddingVertical={6}
            borderRadius={8}
            backgroundColor={isActive ? "rgba(108, 92, 231, 0.15)" : "#1C1C24"}
            borderWidth={1}
            borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => onChange(opt.key)}
          >
            <Text
              fontSize={12}
              fontWeight="600"
              color={isActive ? "#6C5CE7" : "#9090A0"}
            >
              {opt.label}
            </Text>
          </Stack>
        );
      })}
    </XStack>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

export const FilterPills = memo(FilterPillsInner) as typeof FilterPillsInner;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
  },
});
