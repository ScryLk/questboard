import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Button } from "../../../../../components/button";
import { useCharacterCreationStore } from "../../../../../lib/character-creation-store";
import { SYSTEM_LABELS } from "../../../../../lib/mock-data";

export default function CelebrationScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { identity, reset } = useCharacterCreationStore();

  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  const systemLabel = SYSTEM_LABELS[systemId ?? ""] ?? systemId;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing glow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scale, opacity, glowScale]);

  function handleViewCharacters() {
    reset();
    router.replace("/(app)/(tabs)/characters");
  }

  function handleCreateAnother() {
    reset();
    router.replace("/(app)/characters/create");
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$bg"
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={32}
      paddingTop={insets.top}
      paddingBottom={insets.bottom + 24}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
          alignItems: "center",
        }}
      >
        {/* Glow ring */}
        <Animated.View
          style={{
            transform: [{ scale: glowScale }],
            position: "absolute",
            top: -10,
            left: -10,
            right: -10,
            bottom: -10,
          }}
        >
          <Stack
            height={140}
            width={140}
            borderRadius={9999}
            borderWidth={3}
            borderColor="$accent"
            opacity={0.3}
            alignSelf="center"
          />
        </Animated.View>

        {/* Portrait */}
        <Stack
          height={120}
          width={120}
          borderRadius={9999}
          backgroundColor="$accentMuted"
          borderWidth={3}
          borderColor="$accent"
          alignItems="center"
          justifyContent="center"
          marginBottom={24}
        >
          <User size={48} color="#6C5CE7" />
        </Stack>

        {/* Character info */}
        <Text
          fontSize={28}
          fontWeight="700"
          color="$textPrimary"
          textAlign="center"
          marginBottom={4}
        >
          {identity.name}
        </Text>

        <Text fontSize={16} color="$textMuted" textAlign="center" marginBottom={12}>
          nasceu no QuestBoard!
        </Text>

        <XStack gap={8} alignItems="center" marginBottom={40}>
          <Stack
            borderRadius={9999}
            backgroundColor="$accentMuted"
            paddingHorizontal={10}
            paddingVertical={3}
          >
            <Text fontSize={12} fontWeight="600" color="$accent">
              {systemLabel}
            </Text>
          </Stack>
          <Text fontSize={13} color="$textMuted">
            Nível {identity.level}
          </Text>
        </XStack>

        {/* Action buttons */}
        <YStack width="100%" gap={12}>
          <Button variant="primary" size="lg" onPress={handleViewCharacters}>
            Ver meus personagens
          </Button>
          <Button variant="outline" size="lg" onPress={handleCreateAnother}>
            Criar outro personagem
          </Button>
        </YStack>
      </Animated.View>
    </YStack>
  );
}
