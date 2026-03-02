import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

export function LoadingSpinner() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$bg">
      <ActivityIndicator size="large" color="#6C5CE7" />
    </YStack>
  );
}
