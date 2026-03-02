import { ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Stack, Text, YStack } from "tamagui";
import { WizardHeader } from "../../../../components/wizard-header";
import { Button } from "../../../../components/button";
import { LevelStepper } from "../../../../components/level-stepper";
import { SegmentedControl } from "../../../../components/segmented-control";
import { RadioGroup } from "../../../../components/radio-group";
import { ToggleRow } from "../../../../components/toggle-row";
import { useSessionCreationStore } from "../../../../lib/session-creation-store";
import {
  VISIBILITY_OPTIONS,
  HP_METHODS,
  DICE_VISIBILITY_OPTIONS,
} from "../../../../lib/mock-data";

export default function Step2Configuration() {
  const router = useRouter();
  const store = useSessionCreationStore();
  const { configuration } = store;

  function handleNext() {
    router.push("/(app)/sessions/create/step3");
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={2}
        totalSteps={5}
        stepLabel="Configuração"
        onClose={() => router.replace("/(app)/(tabs)/sessions")}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Max Players */}
        <YStack gap={6} marginTop={16} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Máximo de Jogadores
          </Text>
          <LevelStepper
            value={configuration.maxPlayers}
            min={1}
            max={20}
            onChange={(v) => store.updateConfiguration({ maxPlayers: v })}
          />
          <Text fontSize={12} color="$textMuted">
            Sem contar o mestre
          </Text>
        </YStack>

        {/* Visibility */}
        <YStack gap={6} marginBottom={24}>
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
          <Text fontSize={12} color="$textMuted">
            {configuration.visibility === "private"
              ? "Apenas jogadores com o código de convite podem entrar"
              : "Qualquer jogador pode encontrar e solicitar entrada"}
          </Text>
        </YStack>

        {/* Password (only if private) */}
        {configuration.visibility === "private" && (
          <YStack gap={6} marginBottom={24}>
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Senha{" "}
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
                value={configuration.password}
                onChangeText={(text) =>
                  store.updateConfiguration({ password: text })
                }
                placeholder="Senha para entrar na sessão"
                placeholderTextColor="#5A5A6E"
                secureTextEntry
                style={{
                  color: "#E8E8ED",
                  fontSize: 15,
                  padding: 0,
                }}
                maxLength={50}
              />
            </Stack>
          </YStack>
        )}

        {/* Dice Visibility */}
        <YStack gap={8} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Visibilidade de Dados
          </Text>
          <RadioGroup
            options={DICE_VISIBILITY_OPTIONS.map((o) => ({
              key: o.key,
              label: o.label,
              description: o.description,
            }))}
            selected={configuration.diceVisibility}
            onChange={(key) =>
              store.updateConfiguration({
                diceVisibility: key as "public" | "gm-only",
              })
            }
          />
        </YStack>

        {/* HP Method */}
        <YStack gap={8} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Método de PV
          </Text>
          <RadioGroup
            options={HP_METHODS.map((o) => ({
              key: o.key,
              label: o.label,
              description: o.description,
            }))}
            selected={configuration.hpMethod}
            onChange={(key) =>
              store.updateConfiguration({
                hpMethod: key as "manual" | "auto-roll" | "fixed",
              })
            }
          />
        </YStack>

        {/* Homebrew toggle */}
        <YStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          paddingHorizontal={16}
          marginBottom={24}
        >
          <ToggleRow
            label="Permitir Homebrew"
            description="Jogadores podem usar conteúdo personalizado"
            value={configuration.allowHomebrewContent}
            onChange={(v) =>
              store.updateConfiguration({ allowHomebrewContent: v })
            }
          />
        </YStack>

        {/* Schedule (mock) */}
        <YStack gap={6} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Agendamento{" "}
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
              value={configuration.scheduledAt ?? ""}
              onChangeText={(text) =>
                store.updateConfiguration({
                  scheduledAt: text || null,
                })
              }
              placeholder="Ex: Sábado, 19:00"
              placeholderTextColor="#5A5A6E"
              style={{
                color: "#E8E8ED",
                fontSize: 15,
                padding: 0,
              }}
            />
          </Stack>
          <Text fontSize={12} color="$textMuted">
            Informe o horário planejado para sua sessão
          </Text>
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
        <Button variant="primary" size="lg" onPress={handleNext}>
          {`Próximo: Ambientação →`}
        </Button>
      </YStack>
    </YStack>
  );
}
