import { ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Button } from "../../../../components/button";
import { LevelStepper } from "../../../../components/level-stepper";
import { SegmentedControl } from "../../../../components/segmented-control";
import {
  useSessionCreationStore,
  canProceedQuick,
} from "../../../../lib/session-creation-store";
import {
  SYSTEM_LABELS,
  SYSTEM_ICONS,
  MY_SESSIONS_GM,
  VISIBILITY_OPTIONS,
} from "../../../../lib/mock-data";

const SYSTEMS = Object.entries(SYSTEM_LABELS).map(([key, label]) => ({
  key,
  label,
  icon: SYSTEM_ICONS[key] ?? "🎲",
}));

export default function QuickCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useSessionCreationStore();
  const { identity, configuration, invite } = store;
  const canCreate = canProceedQuick(store);

  function handleCreate() {
    MY_SESSIONS_GM.push({
      id: `session-${Date.now()}`,
      name: identity.name,
      system: identity.system,
      gmName: "Você",
      playerCount: 0,
      maxPlayers: configuration.maxPlayers,
      tags: [],
      accentColor: "#6C5CE7",
      description: "",
      isLive: false,
      role: "gm",
      sessionNumber: 1,
      status: "idle",
    });
    router.push("/(app)/sessions/create/celebration");
  }

  return (
    <YStack flex={1} backgroundColor="$bg" paddingTop={insets.top}>
      {/* Header */}
      <XStack height={52} alignItems="center" paddingHorizontal={16}>
        <Stack
          onPress={() => router.back()}
          padding={8}
          hitSlop={8}
          pressStyle={{ opacity: 0.6 }}
        >
          <ArrowLeft size={22} color="#E8E8ED" />
        </Stack>
        <Text
          fontSize={16}
          fontWeight="700"
          color="$textPrimary"
          marginLeft={8}
        >
          Criação Rápida
        </Text>
      </XStack>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <YStack gap={6} marginTop={16} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Nome da Sessão{" "}
            <Text fontSize={14} color="$danger">
              *
            </Text>
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor={
              identity.name.length > 0 && identity.name.length < 2
                ? "$danger"
                : "$border"
            }
            backgroundColor="$bgCard"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={identity.name}
              onChangeText={(text) => store.updateIdentity({ name: text })}
              placeholder="Ex: A Maldição de Strahd"
              placeholderTextColor="#5A5A6E"
              style={{
                color: "#E8E8ED",
                fontSize: 15,
                padding: 0,
              }}
              maxLength={100}
            />
          </Stack>
        </YStack>

        {/* System chips */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Sistema{" "}
            <Text fontSize={14} color="$danger">
              *
            </Text>
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {SYSTEMS.map((sys) => {
              const isSelected = identity.system === sys.key;
              return (
                <Stack
                  key={sys.key}
                  borderRadius={12}
                  borderWidth={1}
                  borderColor={isSelected ? "$accent" : "$border"}
                  backgroundColor={isSelected ? "$accentMuted" : "$bgCard"}
                  paddingHorizontal={14}
                  paddingVertical={10}
                  onPress={() =>
                    store.updateIdentity({ system: sys.key })
                  }
                  pressStyle={{ opacity: 0.85 }}
                >
                  <XStack alignItems="center" gap={6}>
                    <Text fontSize={16}>{sys.icon}</Text>
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color={isSelected ? "$textPrimary" : "$textSecondary"}
                    >
                      {sys.label}
                    </Text>
                  </XStack>
                </Stack>
              );
            })}
          </ScrollView>
        </YStack>

        {/* Max players */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Máximo de Jogadores
          </Text>
          <LevelStepper
            value={configuration.maxPlayers}
            min={1}
            max={20}
            onChange={(v) => store.updateConfiguration({ maxPlayers: v })}
          />
        </YStack>

        {/* Visibility */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Visibilidade
          </Text>
          <SegmentedControl
            segments={VISIBILITY_OPTIONS.map((o) => ({
              key: o.key,
              label: o.label,
            }))}
            activeKey={configuration.visibility}
            onChange={(key) =>
              store.updateConfiguration({
                visibility: key as "private" | "public",
              })
            }
          />
        </YStack>
      </ScrollView>

      {/* Bottom CTA */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal={24}
        paddingBottom={40}
        paddingTop={16}
        backgroundColor="$bg"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <Button
          variant="primary"
          size="lg"
          disabled={!canCreate}
          onPress={handleCreate}
        >
          Criar Sessão
        </Button>
      </YStack>
    </YStack>
  );
}
