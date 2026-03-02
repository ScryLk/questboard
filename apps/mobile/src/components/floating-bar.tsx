import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";
import { Button } from "./button";

interface FloatingBarProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function FloatingBar({ onSignIn, onSignUp }: FloatingBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      borderTopWidth={1}
      borderTopColor="$border"
      backgroundColor="$bg"
      paddingHorizontal={24}
      paddingTop={12}
      paddingBottom={Math.max(insets.bottom, 16)}
    >
      <XStack alignItems="center" gap={12}>
        <YStack flex={1}>
          <Button variant="primary" size="md" onPress={onSignUp}>
            Criar conta
          </Button>
        </YStack>
        <YStack flex={1}>
          <Button variant="outline" size="md" onPress={onSignIn}>
            Entrar
          </Button>
        </YStack>
      </XStack>
      <Text marginTop={8} textAlign="center" fontSize={12} color="$textMuted">
        Entre para participar de sessões
      </Text>
    </YStack>
  );
}
