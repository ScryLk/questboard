import { Stack, Text, XStack } from "tamagui";

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function SegmentedControl({
  segments,
  activeKey,
  onChange,
}: SegmentedControlProps) {
  return (
    <XStack
      marginHorizontal={16}
      marginBottom={16}
      borderRadius={12}
      backgroundColor="$bgCard"
      padding={4}
    >
      {segments.map((segment) => {
        const isActive = segment.key === activeKey;
        return (
          <Stack
            key={segment.key}
            flex={1}
            paddingVertical={10}
            borderRadius={10}
            alignItems="center"
            backgroundColor={isActive ? "$accent" : "transparent"}
            onPress={() => onChange(segment.key)}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              color={isActive ? "white" : "$textMuted"}
            >
              {segment.label}
            </Text>
          </Stack>
        );
      })}
    </XStack>
  );
}
