import { ScrollView } from "react-native";
import { Star, Shield, Swords, Crosshair } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterClass } from "../lib/data/dnd5e/types";
import { ABILITY_LABELS, ABILITY_SHORT_LABELS } from "../lib/data/dnd5e/abilities";
import { ROLE_LABELS, ROLE_COLORS } from "../lib/data/dnd5e/classes";
import { SkillSelector } from "./skill-selector";
import { FeatureChoiceSelector } from "./feature-choice";
import { Button } from "./button";
import { DND5E_RACES } from "../lib/data/dnd5e/races";

interface ClassDetailProps {
  cls: CharacterClass;
  selectedRaceId: string | null;
  skills: string[];
  featureChoices: Record<string, string>;
  onSkillsChange: (skills: string[]) => void;
  onFeatureChoiceChange: (choiceId: string, value: string) => void;
  onConfirm: () => void;
}

function ComplexityStars({ complexity }: { complexity: string }) {
  const count = complexity === "simple" ? 1 : complexity === "moderate" ? 2 : 3;
  const label = complexity === "simple" ? "Simples" : complexity === "moderate" ? "Moderada" : "Complexa";
  return (
    <XStack gap={2} alignItems="center">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={12}
          color={i <= count ? "#FDCB6E" : "#2A2A35"}
          fill={i <= count ? "#FDCB6E" : "transparent"}
        />
      ))}
      <Text fontSize={11} color="$textMuted" marginLeft={4}>
        {label}
      </Text>
    </XStack>
  );
}

export function ClassDetail({
  cls,
  selectedRaceId,
  skills,
  featureChoices,
  onSkillsChange,
  onFeatureChoiceChange,
  onConfirm,
}: ClassDetailProps) {
  const Icon = cls.icon;
  const roleLabel = ROLE_LABELS[cls.role] ?? cls.role;
  const roleColor = ROLE_COLORS[cls.role] ?? "#9090A0";

  const race = DND5E_RACES.find((r) => r.id === selectedRaceId);

  // Check synergy: primary abilities match racial bonuses
  const hasSynergy =
    race &&
    cls.primaryAbilities.some((ab) =>
      race.abilityBonuses.some((b) => b.ability === ab),
    );

  // Validation
  const hasRequiredSkills = skills.length === cls.skillChoices.count;
  const requiredFeatureChoices = cls.features
    .filter((f) => f.choices)
    .map((f) => f.choices!.id);
  const hasAllFeatureChoices = requiredFeatureChoices.every(
    (id) => featureChoices[id],
  );
  const canConfirm = hasRequiredSkills && hasAllFeatureChoices;

  return (
    <YStack flex={1}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <YStack alignItems="center" marginTop={20} marginBottom={20} gap={10}>
          <Stack
            height={80}
            width={80}
            borderRadius={9999}
            backgroundColor={`${cls.color}20`}
            borderWidth={2}
            borderColor={cls.color}
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={40} color={cls.color} />
          </Stack>
          <Text
            fontSize={22}
            fontWeight="700"
            color="$textPrimary"
            textAlign="center"
          >
            {cls.name}
          </Text>
          <Text fontSize={13} color="$textMuted" textAlign="center">
            {cls.tagline}
          </Text>
          <Stack
            borderRadius={6}
            paddingHorizontal={8}
            paddingVertical={3}
            backgroundColor={`${roleColor}20`}
          >
            <Text fontSize={12} fontWeight="600" color={roleColor}>
              {roleLabel}
            </Text>
          </Stack>
        </YStack>

        {/* Stats Row */}
        <XStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={12}
          marginBottom={20}
          gap={8}
        >
          <YStack flex={1} alignItems="center" gap={4}>
            <Shield size={16} color="#9090A0" />
            <Text fontSize={14} fontWeight="700" color="$textPrimary">
              d{cls.hitDie}
            </Text>
            <Text fontSize={10} color="$textMuted">
              Dado de Vida
            </Text>
          </YStack>
          <YStack flex={1} alignItems="center" gap={4}>
            <Crosshair size={16} color="#9090A0" />
            <Text fontSize={12} fontWeight="700" color="$textPrimary">
              {cls.primaryAbilities
                .map((a) => ABILITY_SHORT_LABELS[a])
                .join("/")}
            </Text>
            <Text fontSize={10} color="$textMuted">
              Principal
            </Text>
          </YStack>
          <YStack flex={1} alignItems="center" gap={4}>
            <Star size={16} color="#9090A0" />
            <ComplexityStars complexity={cls.complexity} />
          </YStack>
        </XStack>

        {/* Proficiencies */}
        <YStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={16}
          gap={10}
          marginBottom={20}
        >
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Proficiências
          </Text>
          {cls.armorProficiencies.length > 0 && (
            <XStack justifyContent="space-between">
              <Text fontSize={13} color="$textMuted">
                Armaduras
              </Text>
              <Text
                fontSize={13}
                color="$textPrimary"
                flex={1}
                textAlign="right"
                marginLeft={12}
                numberOfLines={2}
              >
                {cls.armorProficiencies.join(", ")}
              </Text>
            </XStack>
          )}
          <XStack justifyContent="space-between">
            <Text fontSize={13} color="$textMuted">
              Armas
            </Text>
            <Text
              fontSize={13}
              color="$textPrimary"
              flex={1}
              textAlign="right"
              marginLeft={12}
              numberOfLines={2}
            >
              {cls.weaponProficiencies.join(", ")}
            </Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text fontSize={13} color="$textMuted">
              Resistências
            </Text>
            <Text fontSize={13} color="$textPrimary">
              {cls.savingThrows
                .map((s) => ABILITY_LABELS[s])
                .join(", ")}
            </Text>
          </XStack>
          {cls.toolProficiencies && (
            <XStack justifyContent="space-between">
              <Text fontSize={13} color="$textMuted">
                Ferramentas
              </Text>
              <Text
                fontSize={13}
                color="$textPrimary"
                flex={1}
                textAlign="right"
                marginLeft={12}
                numberOfLines={2}
              >
                {cls.toolProficiencies.join(", ")}
              </Text>
            </XStack>
          )}
        </YStack>

        {/* Skills */}
        <YStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={16}
          marginBottom={20}
        >
          <SkillSelector
            options={cls.skillChoices.options}
            selected={skills}
            maxCount={cls.skillChoices.count}
            onChange={onSkillsChange}
          />
        </YStack>

        {/* Features */}
        {cls.features.map((feature) => (
          <YStack
            key={feature.name}
            borderRadius={14}
            backgroundColor="$bgCard"
            borderWidth={1}
            borderColor="$border"
            padding={16}
            gap={10}
            marginBottom={12}
          >
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              {feature.name}
            </Text>
            <Text
              fontSize={12}
              color="$textSecondary"
              lineHeight={18}
            >
              {feature.description}
            </Text>
            {feature.choices && (
              <YStack marginTop={4}>
                <FeatureChoiceSelector
                  label={feature.choices.label}
                  options={feature.choices.options}
                  selected={featureChoices[feature.choices.id] ?? null}
                  onChange={(id) =>
                    onFeatureChoiceChange(feature.choices!.id, id)
                  }
                />
              </YStack>
            )}
          </YStack>
        ))}

        {/* Synergy card */}
        {race && (
          <YStack
            borderRadius={14}
            borderWidth={1}
            borderColor={hasSynergy ? "$success" : "$border"}
            backgroundColor={hasSynergy ? "rgba(0,184,148,0.08)" : "$bgCard"}
            padding={16}
            gap={6}
            marginBottom={20}
          >
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Sinergia com {race.name}
            </Text>
            <Text fontSize={12} color="$textMuted" lineHeight={17}>
              {hasSynergy
                ? `Ótima combinação! ${race.name} fornece bônus em ${race.abilityBonuses
                    .filter((b) =>
                      cls.primaryAbilities.includes(b.ability),
                    )
                    .map(
                      (b) =>
                        `+${b.bonus} ${ABILITY_LABELS[b.ability]}`,
                    )
                    .join(", ")}, que são atributos principais de ${cls.name}.`
                : `${race.name} e ${cls.name} não compartilham atributos principais, mas podem funcionar com uma build criativa.`}
            </Text>
          </YStack>
        )}
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
          disabled={!canConfirm}
          onPress={onConfirm}
        >
          Próximo: Atributos →
        </Button>
      </YStack>
    </YStack>
  );
}
