import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, YStack } from "tamagui";

export default function JoinRequestScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"waiting" | "approved" | "denied">("waiting");

  // Spinning animation
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  // Mock: auto-approve after 4s
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("approved");
      setTimeout(() => {
        if (sessionId) {
          router.replace(`/(app)/sessions/${sessionId}/lobby`);
        }
      }, 800);
    }, 4000);
    return () => clearTimeout(timer);
  }, [sessionId, router]);

  const spinRotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <YStack flex={1} alignItems="center" justifyContent="center" gap={32} paddingHorizontal={32}>
        {/* Icon */}
        <Animated.View style={{ transform: [{ rotate: spinRotation }] }}>
          <Stack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="rgba(108, 92, 231, 0.15)"
            borderWidth={2}
            borderColor="rgba(108, 92, 231, 0.3)"
            alignItems="center"
            justifyContent="center"
          >
            <Clock size={36} color="#6C5CE7" />
          </Stack>
        </Animated.View>

        <YStack alignItems="center" gap={12}>
          <Text fontSize={20} fontWeight="700" color="$textPrimary">
            Sessão em andamento
          </Text>
          <Text fontSize={14} color="$textMuted" textAlign="center" lineHeight={20}>
            Pedindo permissão ao{"\n"}mestre para entrar...
          </Text>

          {/* Status */}
          {status === "waiting" && (
            <Text fontSize={13} color="$accent" marginTop={8}>
              Aguardando aprovação...
            </Text>
          )}
          {status === "approved" && (
            <Text fontSize={13} color="$success" marginTop={8}>
              Aprovado! Entrando...
            </Text>
          )}
          {status === "denied" && (
            <Text fontSize={13} color="$danger" marginTop={8}>
              Entrada negada pelo mestre
            </Text>
          )}
        </YStack>

        {/* Cancel button */}
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
            Cancelar e voltar
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
