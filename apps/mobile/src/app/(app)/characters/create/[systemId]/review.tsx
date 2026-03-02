import { ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Sparkles, User } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { ComputedStatsPanel } from "../../../../../components/computed-stats";
import { useCharacterCreationStore, getFinalScores } from "../../../../../lib/character-creation-store";
import { DND5E_RACES } from "../../../../../lib/data/dnd5e/races";
import { DND5E_CLASSES } from "../../../../../lib/data/dnd5e/classes";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  formatModifier,
  getModifier,
} from "../../../../../lib/data/dnd5e/abilities";
import {
  DND_ALIGNMENTS,
  MY_CHARACTERS,
  SYSTEM_LABELS,
} from "../../../../../lib/mock-data";

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

export default function ReviewScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const store = useCharacterCreationStore();
  const { identity, race, class_, totalSteps, reset } = store;

  const systemLabel = SYSTEM_LABELS[systemId ?? ""] ?? systemId;
  const alignmentLabel = DND_ALIGNMENTS.find(
    (a) => a.key === identity.alignment,
  )?.label;

  const raceData = DND5E_RACES.find((r) => r.id === race.raceId);
  const subRaceData = raceData?.subRaces.find(
    (s) => s.id === race.subRaceId,
  );
  const classData = DND5E_CLASSES.find((c) => c.id === class_.classId);
  const finalScores = getFinalScores(store);

  function handleCreate() {
    const newChar = {
      id: `char-${Date.now()}`,
      name: identity.name,
      class: classData?.name ?? "Aventureiro",
      level: identity.level,
      currentHp: 10 + identity.level * 5,
      maxHp: 10 + identity.level * 5,
      system: systemId ?? "dnd5e",
      avatar: "⚔️",
    };
    MY_CHARACTERS.push(newChar);
    router.push(`/(app)/characters/create/${systemId}/celebration`);
  }

  function handleEditIdentity() {
    router.back();
    router.back();
    router.back();
  }

  function handleEditRace() {
    router.back();
    router.back();
  }

  function handleEditClass() {
    router.back();
  }

  function handleEditAbilities() {
    router.back();
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={totalSteps}
        totalSteps={totalSteps}
        stepLabel="Revisão"
        systemId={systemId}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <YStack alignItems="center" marginTop={20} marginBottom={24} gap={10}>
          <Stack
            height={100}
            width={100}
            borderRadius={9999}
            backgroundColor="$accentMuted"
            borderWidth={2}
            borderColor="$accent"
            alignItems="center"
            justifyContent="center"
          >
            <User size={40} color="#6C5CE7" />
          </Stack>

          <Text fontSize={22} fontWeight="700" color="$textPrimary" textAlign="center">
            {identity.name || "Sem nome"}
          </Text>

          <XStack gap={8} alignItems="center">
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
        </YStack>

        {/* Sections */}
        <YStack gap={12}>
          {/* Identity Section */}
          <ReviewSection title="Identidade" onEdit={handleEditIdentity}>
            <ReviewRow label="Nome" value={identity.name || "—"} />
            {identity.concept ? (
              <YStack gap={2}>
                <Text fontSize={13} color="$textMuted">
                  Conceito
                </Text>
                <Text fontSize={13} color="$textPrimary" lineHeight={18}>
                  {identity.concept}
                </Text>
              </YStack>
            ) : null}
            <ReviewRow label="Nível" value={String(identity.level)} />
            {alignmentLabel && (
              <ReviewRow label="Alinhamento" value={alignmentLabel} />
            )}
          </ReviewSection>

          {/* Race Section */}
          {raceData && (
            <ReviewSection title="Raça" onEdit={handleEditRace}>
              <ReviewRow label="Raça" value={raceData.name} />
              {subRaceData && (
                <ReviewRow label="Sub-raça" value={subRaceData.name} />
              )}
              <ReviewRow
                label="Bônus"
                value={[
                  ...raceData.abilityBonuses,
                  ...(subRaceData?.abilityBonuses ?? []),
                ]
                  .map(
                    (b) =>
                      `+${b.bonus} ${ABILITY_LABELS[b.ability]}`,
                  )
                  .join(", ")}
              />
              <ReviewRow
                label="Velocidade"
                value={`${(raceData.speed / 5) * 1.5}m`}
              />
            </ReviewSection>
          )}

          {/* Class Section */}
          {classData && (
            <ReviewSection title="Classe" onEdit={handleEditClass}>
              <ReviewRow label="Classe" value={classData.name} />
              <ReviewRow label="Dado de Vida" value={`d${classData.hitDie}`} />
              {class_.skills.length > 0 && (
                <ReviewRow
                  label="Perícias"
                  value={class_.skills.join(", ")}
                />
              )}
              {Object.entries(class_.featureChoices).map(
                ([choiceId, value]) => {
                  const feature = classData.features.find(
                    (f) => f.choices?.id === choiceId,
                  );
                  const option = feature?.choices?.options.find(
                    (o) => o.id === value,
                  );
                  if (!feature || !option) return null;
                  return (
                    <ReviewRow
                      key={choiceId}
                      label={feature.choices!.label}
                      value={option.name}
                    />
                  );
                },
              )}
            </ReviewSection>
          )}

          {/* Abilities Section */}
          {store.abilities.method && (
            <ReviewSection title="Atributos" onEdit={handleEditAbilities}>
              {ABILITY_ORDER.map((ability) => (
                <ReviewRow
                  key={ability}
                  label={ABILITY_LABELS[ability]}
                  value={`${finalScores[ability]} (${formatModifier(getModifier(finalScores[ability]))})`}
                />
              ))}
            </ReviewSection>
          )}

          {/* Computed Stats */}
          <ComputedStatsPanel />
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
              Criar Personagem
            </Text>
          </XStack>
        </Stack>
      </YStack>
    </YStack>
  );
}
