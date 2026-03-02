import { Switch } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({
  label,
  description,
  value,
  onChange,
}: ToggleRowProps) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingVertical={12}
    >
      <YStack flex={1} marginRight={16}>
        <Text fontSize={14} fontWeight="600" color="$textPrimary">
          {label}
        </Text>
        {description && (
          <Text fontSize={12} color="$textMuted" marginTop={2}>
            {description}
          </Text>
        )}
      </YStack>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#2A2A35", true: "#6C5CE7" }}
        thumbColor="#E8E8ED"
      />
    </XStack>
  );
}
