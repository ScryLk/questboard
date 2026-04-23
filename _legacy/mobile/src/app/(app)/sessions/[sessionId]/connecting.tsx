import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";
import { CharacterPortrait } from "../../../../components/character/character-portrait";

export default function ConnectingScreen() {
  const { sessionId, characterName, classId, classIcon, level } =
    useLocalSearchParams<{
      sessionId: string;
      characterName: string;
      classId: string;
      classIcon: string;
      level: string;
    }>();
  const router = useRouter();

  // Dot opacity animations
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const makeDotAnim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = makeDotAnim(dot1, 0);
    const anim2 = makeDotAnim(dot2, 200);
    const anim3 = makeDotAnim(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  // Navigate to gameplay after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionId) {
        router.replace(`/(app)/sessions/${sessionId}/gameplay`);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [sessionId, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <YStack flex={1} alignItems="center" justifyContent="center" gap={32}>
        <CharacterPortrait
          name={characterName ?? "?"}
          classId={classId ?? "fighter"}
          classIcon={classIcon ?? "Sword"}
          level={parseInt(level ?? "1", 10)}
          size="xl"
          pulsing
        />

        <YStack alignItems="center" gap={12}>
          <Text fontSize={20} fontWeight="700" color="$textPrimary">
            Entrando na sessao...
          </Text>

          {/* Animated dots */}
          <Animated.View style={styles.dotsRow}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={[styles.dot, { opacity: dot }]}
              />
            ))}
          </Animated.View>

          <Text
            fontSize={14}
            color="$textMuted"
            marginTop={8}
          >
            Conectando como {characterName ?? "..."}
          </Text>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F12",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C5CE7",
  },
});
