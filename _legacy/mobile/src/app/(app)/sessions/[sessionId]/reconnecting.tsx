import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WifiOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, YStack } from "tamagui";

export default function ReconnectingScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  // Pulsing animation
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  // Mock: auto-reconnect after 3s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionId) {
        router.replace(`/(app)/sessions/${sessionId}/gameplay`);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [sessionId, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <YStack flex={1} alignItems="center" justifyContent="center" gap={32} paddingHorizontal={32}>
        <Animated.View style={{ opacity: pulse }}>
          <Stack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="rgba(253, 203, 110, 0.15)"
            borderWidth={2}
            borderColor="rgba(253, 203, 110, 0.3)"
            alignItems="center"
            justifyContent="center"
          >
            <WifiOff size={36} color="#FDCB6E" />
          </Stack>
        </Animated.View>

        <YStack alignItems="center" gap={12}>
          <Text fontSize={20} fontWeight="700" color="$textPrimary">
            Reconectando...
          </Text>
          <Text fontSize={14} color="$textMuted" textAlign="center" lineHeight={20}>
            Conexão perdida com a sessão.{"\n"}
            Tentando reconectar automaticamente.
          </Text>
        </YStack>

        {/* Back button */}
        <Stack
          height={44}
          paddingHorizontal={24}
          borderRadius={12}
          borderWidth={1}
          borderColor="$border"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => router.back()}
        >
          <Text fontSize={14} fontWeight="600" color="$textSecondary">
            Voltar ao menu
          </Text>
        </Stack>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F12",
  },
});
