import { ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Sparkles, User } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { ComputedStatsPanel } from "../../../../../components/computed-stats";
import { useCharacterCreationStore, getFinalScores } from "../../../../../lib/character-creation-store";
import { DND5E_RACES } from "../../../../../lib/data/dnd5e/races";
import { DND5E_CLASSES } from "../../../../../lib/data/dnd5e/classes";
import { DND5E_BACKGROUNDS } from "../../../../../lib/data/dnd5e/backgrounds";
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
      <Text fontSize={13} fontWeight="500" color="$textPrimary" flexShrink={1} textAlign="right">
        {value}
      </Text>
    </XStack>
  );
}

function ReviewText({ label, value }: { label: string; value: string }) {
  return (
    <YStack gap={2}>
      <Text fontSize={13} color="$textMuted">
        {label}
      </Text>
      <Text fontSize={13} color="$textPrimary" lineHeight={18}>
        {value}
      </Text>
    </YStack>
  );
}

export default function ReviewScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const store = useCharacterCreationStore();
  const { identity, race, class_, background, equipment, roleplay, totalSteps, reset } = store;

  const systemLabel = SYSTEM_LABELS[systemId ?? ""] ?? systemId;
  const alignmentLabel = DND_ALIGNMENTS.find(
    (a) => a.key === identity.alignment,
  )?.label;

  const raceData = DND5E_RACES.find((r) => r.id === race.raceId);
  const subRaceData = raceData?.subRaces.find(
    (s) => s.id === race.subRaceId,
  );
  const classData = DND5E_CLASSES.find((c) => c.id === class_.classId);
  const bgData = DND5E_BACKGROUNDS.find((b) => b.id === background.backgroundId);
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
      avatar: "sword",
    };
    MY_CHARACTERS.push(newChar);
    router.push(`/(app)/characters/create/${systemId}/celebration`);
  }

  function navigateBackSteps(count: number) {
    for (let i = 0; i < count; i++) {
      router.back();
    }
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

          <XStack gap={8} alignItems="center" flexWrap="wrap" justifyContent="center">
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
            {bgData && (
              <Stack
                borderRadius={9999}
                backgroundColor="rgba(0, 184, 148, 0.15)"
                paddingHorizontal={10}
                paddingVertical={3}
              >
                <Text fontSize={12} fontWeight="600" color="#00B894">
                  {bgData.name}
                </Text>
              </Stack>
            )}
          </XStack>
        </YStack>

        {/* Sections */}
        <YStack gap={12}>
          {/* Identity Section */}
          <ReviewSection title="Identidade" onEdit={() => navigateBackSteps(7)}>
            <ReviewRow label="Nome" value={identity.name || "\u2014"} />
            {identity.concept ? (
              <ReviewText label="Conceito" value={identity.concept} />
            ) : null}
            <ReviewRow label="Nível" value={String(identity.level)} />
            {alignmentLabel && (
              <ReviewRow label="Alinhamento" value={alignmentLabel} />
            )}
          </ReviewSection>

          {/* Race Section */}
          {raceData && (
            <ReviewSection title="Raça" onEdit={() => navigateBackSteps(6)}>
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
            <ReviewSection title="Classe" onEdit={() => navigateBackSteps(5)}>
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
            <ReviewSection title="Atributos" onEdit={() => navigateBackSteps(4)}>
              {ABILITY_ORDER.map((ability) => (
                <ReviewRow
                  key={ability}
                  label={ABILITY_LABELS[ability]}
                  value={`${finalScores[ability]} (${formatModifier(getModifier(finalScores[ability]))})`}
                />
              ))}
            </ReviewSection>
          )}

          {/* Background Section */}
          {bgData && (
            <ReviewSection title="Antecedente" onEdit={() => navigateBackSteps(3)}>
              <ReviewRow label="Antecedente" value={bgData.name} />
              <ReviewRow
                label="Perícias"
                value={bgData.skillProficiencies.join(", ")}
              />
              {bgData.toolProficiencies.length > 0 && (
                <ReviewRow
                  label="Ferramentas"
                  value={bgData.toolProficiencies.join(", ")}
                />
              )}
              {bgData.languages > 0 && (
                <ReviewRow
                  label="Idiomas"
                  value={`+${bgData.languages}`}
                />
              )}
              <ReviewRow label="Habilidade" value={bgData.feature.name} />
            </ReviewSection>
          )}

          {/* Equipment Section */}
          <ReviewSection title="Equipamento" onEdit={() => navigateBackSteps(2)}>
            {equipment.useGold ? (
              <Text fontSize={13} color="$textMuted">
                Ouro inicial (compra livre com o mestre)
              </Text>
            ) : (
              <YStack gap={4}>
                {bgData &&
                  bgData.equipment.map((item, i) => (
                    <Text key={`bg-eq-${i}`} fontSize={13} color="$textPrimary">
                      {item}
                    </Text>
                  ))}
                <Text fontSize={12} color="$textMuted" marginTop={2}>
                  + Equipamento de classe selecionado
                </Text>
              </YStack>
            )}
          </ReviewSection>

          {/* Roleplay Section */}
          {(roleplay.personalityTraits.length > 0 ||
            roleplay.ideal ||
            roleplay.bond ||
            roleplay.flaw ||
            roleplay.backstory) && (
            <ReviewSection title="Interpretação" onEdit={() => navigateBackSteps(1)}>
              {roleplay.personalityTraits.length > 0 && (
                <ReviewText
                  label="Traços de Personalidade"
                  value={roleplay.personalityTraits.join(" | ")}
                />
              )}
              {roleplay.ideal && (
                <ReviewText label="Ideal" value={roleplay.ideal} />
              )}
              {roleplay.bond && (
                <ReviewText label="Vínculo" value={roleplay.bond} />
              )}
              {roleplay.flaw && (
                <ReviewText label="Defeito" value={roleplay.flaw} />
              )}
              {roleplay.backstory && (
                <ReviewText label="História" value={roleplay.backstory} />
              )}
              {roleplay.appearance && (
                <ReviewText label="Aparência" value={roleplay.appearance} />
              )}
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
