import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Castle } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Button } from "../../../../components/button";
import { InviteCodeDisplay } from "../../../../components/invite-code-display";
import { useSessionCreationStore } from "../../../../lib/session-creation-store";

export default function SessionCelebration() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { identity, invite, reset } = useSessionCreationStore();

  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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

  function handleViewSessions() {
    reset();
    router.replace("/(app)/(tabs)/sessions");
  }

  function handleInvitePlayers() {
    reset();
    router.replace("/(app)/(tabs)/sessions");
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
          width: "100%",
        }}
      >
        {/* Glow ring */}
        <Animated.View
          style={{
            transform: [{ scale: glowScale }],
            position: "absolute",
            top: -10,
            left: "50%",
            marginLeft: -70,
          }}
        >
          <Stack
            height={140}
            width={140}
            borderRadius={9999}
            borderWidth={3}
            borderColor="$accent"
            opacity={0.3}
          />
        </Animated.View>

        {/* Icon */}
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
          <Castle size={48} color="#6C5CE7" />
        </Stack>

        {/* Session info */}
        <Text
          fontSize={28}
          fontWeight="700"
          color="$textPrimary"
          textAlign="center"
          marginBottom={4}
        >
          {identity.name || "Nova Sessão"}
        </Text>

        <Text
          fontSize={16}
          color="$textMuted"
          textAlign="center"
          marginBottom={24}
        >
          foi criada com sucesso!
        </Text>

        {/* Invite code */}
        <YStack width="100%" marginBottom={32}>
          <InviteCodeDisplay code={invite.inviteCode} />
        </YStack>

        {/* Action buttons */}
        <YStack width="100%" gap={12}>
          <Button variant="primary" size="lg" onPress={handleViewSessions}>
            Ver minhas sessões
          </Button>
          <Button variant="outline" size="lg" onPress={handleInvitePlayers}>
            Convidar jogadores
          </Button>
        </YStack>
      </Animated.View>
    </YStack>
  );
}
