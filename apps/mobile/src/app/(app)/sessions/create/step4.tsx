import { ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Stack, Text, YStack } from "tamagui";
import { WizardHeader } from "../../../../components/wizard-header";
import { Button } from "../../../../components/button";
import { InviteCodeDisplay } from "../../../../components/invite-code-display";
import { useSessionCreationStore } from "../../../../lib/session-creation-store";

export default function Step4Invite() {
  const router = useRouter();
  const store = useSessionCreationStore();
  const { invite } = store;

  function handleNext() {
    router.push("/(app)/sessions/create/step5");
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={4}
        totalSteps={5}
        stepLabel="Convite"
        onClose={() => router.replace("/(app)/(tabs)/sessions")}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text fontSize={13} color="$textMuted" marginTop={8} marginBottom={20}>
          Compartilhe o código abaixo para convidar jogadores.
        </Text>

        {/* Invite Code */}
        <YStack marginBottom={24}>
          <InviteCodeDisplay code={invite.inviteCode} />
        </YStack>

        {/* Welcome Message */}
        <YStack gap={6} marginBottom={24}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Mensagem de Boas-vindas{" "}
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
              value={invite.welcomeMessage}
              onChangeText={(text) =>
                store.updateInvite({ welcomeMessage: text })
              }
              placeholder="Ex: Bem-vindo à mesa! Tragam seus personagens prontos..."
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
          <Text fontSize={12} color="$textMuted">
            Exibida para jogadores quando entrarem na sessão
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
          {`Próximo: Revisão →`}
        </Button>
      </YStack>
    </YStack>
  );
}
