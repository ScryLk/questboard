import { ScrollView } from "react-native";
import { Lightbulb, Wrench, Languages } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { Background } from "../lib/data/dnd5e/backgrounds";
import { Button } from "./button";

interface BackgroundDetailProps {
  background: Background;
  onConfirm: () => void;
}

export function BackgroundDetail({
  background,
  onConfirm,
}: BackgroundDetailProps) {
  const Icon = background.icon;

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
            backgroundColor="$accentMuted"
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={36} color="#6C5CE7" />
          </Stack>
          <Text fontSize={22} fontWeight="700" color="$textPrimary">
            {background.name}
          </Text>
          <Text
            fontSize={13}
            color="$textMuted"
            textAlign="center"
            paddingHorizontal={24}
          >
            {background.tagline}
          </Text>
        </YStack>

        {/* Proficiencies */}
        <YStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={16}
          gap={12}
          marginBottom={12}
        >
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Proficiências
          </Text>

          {/* Skills */}
          <XStack gap={8} alignItems="center">
            <Lightbulb size={16} color="#6C5CE7" />
            <YStack flex={1}>
              <Text fontSize={12} color="$textMuted">
                Perícias
              </Text>
              <Text fontSize={13} fontWeight="500" color="$textPrimary">
                {background.skillProficiencies.join(", ")}
              </Text>
            </YStack>
          </XStack>

          {/* Tools */}
          {background.toolProficiencies.length > 0 && (
            <XStack gap={8} alignItems="center">
              <Wrench size={16} color="#FDCB6E" />
              <YStack flex={1}>
                <Text fontSize={12} color="$textMuted">
                  Ferramentas
                </Text>
                <Text fontSize={13} fontWeight="500" color="$textPrimary">
                  {background.toolProficiencies.join(", ")}
                </Text>
              </YStack>
            </XStack>
          )}

          {/* Languages */}
          {background.languages > 0 && (
            <XStack gap={8} alignItems="center">
              <Languages size={16} color="#00B894" />
              <YStack flex={1}>
                <Text fontSize={12} color="$textMuted">
                  Idiomas
                </Text>
                <Text fontSize={13} fontWeight="500" color="$textPrimary">
                  {background.languages} idioma{background.languages > 1 ? "s" : ""} adicional{background.languages > 1 ? "is" : ""}
                </Text>
              </YStack>
            </XStack>
          )}
        </YStack>

        {/* Feature */}
        <YStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={16}
          gap={8}
          marginBottom={12}
        >
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Habilidade: {background.feature.name}
          </Text>
          <Text fontSize={13} color="$textMuted" lineHeight={20}>
            {background.feature.description}
          </Text>
        </YStack>

        {/* Starting Equipment */}
        <YStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={16}
          gap={8}
          marginBottom={12}
        >
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Equipamento Inicial
          </Text>
          {background.equipment.map((item, index) => (
            <XStack key={index} gap={8} alignItems="center">
              <Stack
                width={4}
                height={4}
                borderRadius={2}
                backgroundColor="$accent"
              />
              <Text fontSize={13} color="$textMuted">
                {item}
              </Text>
            </XStack>
          ))}
        </YStack>

        {/* Suggested Personality Traits preview */}
        <YStack
          borderRadius={14}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
          padding={16}
          gap={8}
        >
          <Text fontSize={14} fontWeight="600" color="$textPrimary">
            Sugestões de Personalidade
          </Text>
          <Text fontSize={12} color="$textMuted" lineHeight={18}>
            Este antecedente inclui {background.personalityTraits.length} traços
            de personalidade, {background.ideals.length} ideais,{" "}
            {background.bonds.length} vínculos e {background.flaws.length}{" "}
            defeitos sugeridos que você poderá escolher no próximo passo.
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
        <Button variant="primary" size="lg" onPress={onConfirm}>
          Confirmar Antecedente
        </Button>
      </YStack>
    </YStack>
  );
}
