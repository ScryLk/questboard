import { ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Stack, Text, XStack, YStack } from "tamagui";
import { WizardHeader } from "../../../../components/wizard-header";
import { TagInput } from "../../../../components/tag-input";
import { SegmentedControl } from "../../../../components/segmented-control";
import { Button } from "../../../../components/button";
import {
  useSessionCreationStore,
  canProceedStep1,
} from "../../../../lib/session-creation-store";
import {
  SYSTEM_LABELS,
  SYSTEM_ICONS,
  CAMPAIGN_TYPES,
} from "../../../../lib/mock-data";

const SYSTEMS = Object.entries(SYSTEM_LABELS).map(([key, label]) => ({
  key,
  label,
  icon: SYSTEM_ICONS[key] ?? "🎲",
}));

export default function Step1Identity() {
  const router = useRouter();
  const store = useSessionCreationStore();
  const { identity } = store;
  const canProceed = canProceedStep1(store);

  function handleNext() {
    router.push("/(app)/sessions/create/step2");
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={1}
        totalSteps={5}
        stepLabel="Identidade"
        onClose={() => router.replace("/(app)/(tabs)/sessions")}
      />

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
          <Text fontSize={12} color="$textMuted">
            O nome que os jogadores verão ao procurar sua mesa
          </Text>
        </YStack>

        {/* System */}
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

        {/* Campaign Type */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Tipo de Campanha
          </Text>
          <SegmentedControl
            segments={CAMPAIGN_TYPES.map((t) => ({
              key: t.key,
              label: t.label,
            }))}
            activeKey={identity.campaignType}
            onChange={(key) =>
              store.updateIdentity({
                campaignType: key as "oneshot" | "campaign" | "westmarch",
              })
            }
          />
        </YStack>

        {/* Description */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Descrição{" "}
            <Text fontSize={12} color="$textMuted">
              (opcional)
            </Text>
          </Text>
          <Stack
            borderRadius={12}
            borderWidth={1}
            borderColor="$border"
            backgroundColor="$bgCard"
            paddingHorizontal={14}
            paddingVertical={12}
          >
            <TextInput
              value={identity.description}
              onChangeText={(text) =>
                store.updateIdentity({ description: text })
              }
              placeholder="Descreva sua sessão para atrair jogadores..."
              placeholderTextColor="#5A5A6E"
              style={{
                color: "#E8E8ED",
                fontSize: 15,
                padding: 0,
                minHeight: 80,
                textAlignVertical: "top",
              }}
              multiline
              maxLength={500}
            />
          </Stack>
        </YStack>

        {/* Tags */}
        <YStack gap={6} marginBottom={20}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Tags{" "}
            <Text fontSize={12} color="$textMuted">
              (opcional)
            </Text>
          </Text>
          <TagInput
            tags={identity.tags}
            maxTags={10}
            placeholder="Ex: horror, sandbox, iniciante..."
            onAdd={(tag) =>
              store.updateIdentity({ tags: [...identity.tags, tag] })
            }
            onRemove={(tag) =>
              store.updateIdentity({
                tags: identity.tags.filter((t) => t !== tag),
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
          disabled={!canProceed}
          onPress={handleNext}
        >
          {`Próximo: Configuração →`}
        </Button>
      </YStack>
    </YStack>
  );
}
