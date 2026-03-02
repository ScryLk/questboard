import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Sparkles } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { WizardHeader } from "../../../../components/wizard-header";
import { SessionPreviewCard } from "../../../../components/session-preview-card";
import { useSessionCreationStore } from "../../../../lib/session-creation-store";
import {
  MY_SESSIONS_GM,
  SYSTEM_LABELS,
  CAMPAIGN_TYPES,
  HP_METHODS,
  DICE_VISIBILITY_OPTIONS,
} from "../../../../lib/mock-data";

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <YStack
      borderRadius={14}
      backgroundColor="$bgCard"
      borderWidth={1}
      borderColor="$border"
      padding={16}
      gap={10}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={14} fontWeight="600" color="$textPrimary">
          {title}
        </Text>
        {onEdit && (
          <Stack
            onPress={onEdit}
            pressStyle={{ opacity: 0.6 }}
            padding={4}
          >
            <ChevronRight size={16} color="#5A5A6E" />
          </Stack>
        )}
      </XStack>
      {children}
    </YStack>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text fontSize={13} color="$textMuted">
        {label}
      </Text>
      <Text fontSize={13} fontWeight="500" color="$textPrimary">
        {value}
      </Text>
    </XStack>
  );
}

export default function Step5Review() {
  const router = useRouter();
  const store = useSessionCreationStore();
  const { identity, configuration, ambiance, invite } = store;

  const systemLabel = SYSTEM_LABELS[identity.system] ?? identity.system;
  const typeLabel =
    CAMPAIGN_TYPES.find((t) => t.key === identity.campaignType)?.label ??
    identity.campaignType;
  const hpLabel =
    HP_METHODS.find((m) => m.key === configuration.hpMethod)?.label ??
    configuration.hpMethod;
  const diceLabel =
    DICE_VISIBILITY_OPTIONS.find((d) => d.key === configuration.diceVisibility)
      ?.label ?? configuration.diceVisibility;

  function handleCreate() {
    MY_SESSIONS_GM.push({
      id: `session-${Date.now()}`,
      name: identity.name,
      system: identity.system,
      gmName: "Você",
      playerCount: 0,
      maxPlayers: configuration.maxPlayers,
      tags: identity.tags,
      accentColor: "#6C5CE7",
      description: identity.description,
      isLive: false,
      role: "gm",
      sessionNumber: 1,
      status: "idle",
    });
    router.push("/(app)/sessions/create/celebration");
  }

  function handleEditIdentity() {
    router.back();
    router.back();
    router.back();
    router.back();
  }

  function handleEditConfig() {
    router.back();
    router.back();
    router.back();
  }

  function handleEditAmbiance() {
    router.back();
    router.back();
  }

  function handleEditInvite() {
    router.back();
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={5}
        totalSteps={5}
        stepLabel="Revisão"
        onClose={() => router.replace("/(app)/(tabs)/sessions")}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Card */}
        <YStack marginTop={16} marginBottom={20}>
          <SessionPreviewCard
            name={identity.name}
            system={identity.system}
            campaignType={identity.campaignType}
            maxPlayers={configuration.maxPlayers}
            visibility={configuration.visibility}
            tags={identity.tags}
            description={identity.description}
          />
        </YStack>

        <YStack gap={12}>
          {/* Identity */}
          <ReviewSection title="Identidade" onEdit={handleEditIdentity}>
            <ReviewRow label="Nome" value={identity.name || "—"} />
            <ReviewRow label="Sistema" value={systemLabel || "—"} />
            <ReviewRow label="Tipo" value={typeLabel} />
            {identity.description ? (
              <YStack gap={2}>
                <Text fontSize={13} color="$textMuted">
                  Descrição
                </Text>
                <Text fontSize={13} color="$textPrimary" lineHeight={18}>
                  {identity.description}
                </Text>
              </YStack>
            ) : null}
          </ReviewSection>

          {/* Configuration */}
          <ReviewSection title="Configuração" onEdit={handleEditConfig}>
            <ReviewRow
              label="Jogadores"
              value={`Até ${configuration.maxPlayers}`}
            />
            <ReviewRow
              label="Visibilidade"
              value={
                configuration.visibility === "public" ? "Pública" : "Privada"
              }
            />
            <ReviewRow label="Dados" value={diceLabel} />
            <ReviewRow label="Método de PV" value={hpLabel} />
            <ReviewRow
              label="Homebrew"
              value={configuration.allowHomebrewContent ? "Sim" : "Não"}
            />
            {configuration.scheduledAt && (
              <ReviewRow label="Agendamento" value={configuration.scheduledAt} />
            )}
          </ReviewSection>

          {/* Ambiance */}
          <ReviewSection title="Ambientação" onEdit={handleEditAmbiance}>
            <ReviewRow
              label="Mapa"
              value={ambiance.mapUrl ? "Configurado" : "Nenhum"}
            />
            <ReviewRow
              label="Grade"
              value={ambiance.gridEnabled ? "Ativada" : "Desativada"}
            />
            <ReviewRow
              label="Notas do Mestre"
              value={ambiance.gmNotes ? "Sim" : "Nenhuma"}
            />
          </ReviewSection>

          {/* Invite */}
          <ReviewSection title="Convite" onEdit={handleEditInvite}>
            <ReviewRow label="Código" value={invite.inviteCode} />
            <ReviewRow
              label="Mensagem"
              value={invite.welcomeMessage ? "Configurada" : "Nenhuma"}
            />
          </ReviewSection>
        </YStack>

        <Text
          fontSize={12}
          color="$textMuted"
          textAlign="center"
          marginTop={20}
        >
          Toque em qualquer seção para editar
        </Text>
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
        <Stack
          onPress={handleCreate}
          height={52}
          borderRadius={14}
          backgroundColor="$accent"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.85 }}
        >
          <XStack alignItems="center" gap={8}>
            <Sparkles size={18} color="white" />
            <Text fontSize={16} fontWeight="700" color="white">
              Criar Sessão
            </Text>
          </XStack>
        </Stack>
      </YStack>
    </YStack>
  );
}
