import { memo, useState } from "react";
import { TextInput } from "react-native";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterFeature, FeatureReset, FeatureSource } from "../../lib/character-types";

interface FeatureEditCardProps {
  feature: CharacterFeature;
  onUpdate: (updates: Partial<CharacterFeature>) => void;
  onRemove: () => void;
}

const SOURCE_LABELS: Record<FeatureSource, string> = {
  race: "Racial",
  class: "Classe",
  background: "Antecedente",
  feat: "Talento",
  custom: "Customizado",
};

const SOURCE_COLORS: Record<FeatureSource, string> = {
  race: "#00B894",
  class: "#6C5CE7",
  background: "#FDCB6E",
  feat: "#FF9F43",
  custom: "#9090A0",
};

const RESET_OPTIONS: { key: FeatureReset; label: string }[] = [
  { key: "short", label: "Curto" },
  { key: "long", label: "Longo" },
  { key: "manual", label: "Manual" },
];

function FeatureEditCardInner({ feature, onUpdate, onRemove }: FeatureEditCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sourceColor = SOURCE_COLORS[feature.source] ?? "#5A5A6E";

  return (
    <YStack
      backgroundColor="#1C1C24"
      borderRadius={10}
      borderWidth={1}
      borderColor="#2A2A35"
      overflow="hidden"
    >
      {/* Header row */}
      <XStack
        paddingHorizontal={12}
        paddingVertical={10}
        alignItems="center"
        gap={8}
        pressStyle={{ opacity: 0.8 }}
        onPress={() => setExpanded((v) => !v)}
      >
        <YStack flex={1} gap={2}>
          <Text fontSize={13} fontWeight="600" color="#E8E8ED" numberOfLines={1}>
            {feature.name}
          </Text>
          <XStack gap={6}>
            <Text fontSize={10} color={sourceColor}>
              {SOURCE_LABELS[feature.source]}
            </Text>
            {feature.uses && (
              <Text fontSize={10} color="#5A5A6E">
                {feature.uses.current}/{feature.uses.max} usos
              </Text>
            )}
          </XStack>
        </YStack>

        <Stack
          width={28}
          height={28}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={(e) => {
            e.stopPropagation?.();
            onRemove();
          }}
        >
          <Trash2 size={14} color="#FF6B6B" />
        </Stack>

        {expanded ? (
          <ChevronUp size={14} color="#5A5A6E" />
        ) : (
          <ChevronDown size={14} color="#5A5A6E" />
        )}
      </XStack>

      {/* Expanded edit */}
      {expanded && (
        <YStack
          paddingHorizontal={12}
          paddingBottom={12}
          gap={10}
          borderTopWidth={1}
          borderTopColor="#2A2A35"
          paddingTop={10}
        >
          {/* Name */}
          <YStack gap={4}>
            <Text fontSize={10} fontWeight="600" color="#5A5A6E">
              Nome
            </Text>
            <Stack
              borderRadius={8}
              borderWidth={1}
              borderColor="#2A2A35"
              backgroundColor="#16161C"
              paddingHorizontal={10}
              paddingVertical={8}
            >
              <TextInput
                value={feature.name}
                onChangeText={(text) => onUpdate({ name: text })}
                placeholder="Nome da habilidade"
                placeholderTextColor="#3A3A45"
                style={{ color: "#E8E8ED", fontSize: 13, padding: 0 }}
                maxLength={60}
              />
            </Stack>
          </YStack>

          {/* Description */}
          <YStack gap={4}>
            <Text fontSize={10} fontWeight="600" color="#5A5A6E">
              Descrição
            </Text>
            <Stack
              borderRadius={8}
              borderWidth={1}
              borderColor="#2A2A35"
              backgroundColor="#16161C"
              paddingHorizontal={10}
              paddingVertical={8}
            >
              <TextInput
                value={feature.description}
                onChangeText={(text) => onUpdate({ description: text })}
                placeholder="Descrição"
                placeholderTextColor="#3A3A45"
                multiline
                style={{
                  color: "#E8E8ED",
                  fontSize: 13,
                  padding: 0,
                  minHeight: 60,
                  textAlignVertical: "top",
                }}
                maxLength={500}
              />
            </Stack>
          </YStack>

          {/* Uses */}
          {feature.uses && (
            <XStack gap={12} alignItems="center">
              <Text fontSize={10} fontWeight="600" color="#5A5A6E">
                Usos máx:
              </Text>
              <XStack gap={4} alignItems="center">
                <Stack
                  width={26}
                  height={26}
                  borderRadius={6}
                  backgroundColor="#16161C"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => {
                    if (feature.uses && feature.uses.max > 1)
                      onUpdate({ uses: { ...feature.uses, max: feature.uses.max - 1 } });
                  }}
                >
                  <Text fontSize={14} color="#9090A0">-</Text>
                </Stack>
                <Text fontSize={14} fontWeight="700" color="#E8E8ED" minWidth={24} textAlign="center">
                  {feature.uses.max}
                </Text>
                <Stack
                  width={26}
                  height={26}
                  borderRadius={6}
                  backgroundColor="#16161C"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => {
                    if (feature.uses)
                      onUpdate({ uses: { ...feature.uses, max: feature.uses.max + 1 } });
                  }}
                >
                  <Text fontSize={14} color="#9090A0">+</Text>
                </Stack>
              </XStack>

              {/* Reset type */}
              <XStack gap={4} marginLeft={8}>
                {RESET_OPTIONS.map(({ key, label }) => {
                  const isActive = feature.uses?.reset === key;
                  return (
                    <Stack
                      key={key}
                      paddingHorizontal={8}
                      paddingVertical={4}
                      borderRadius={6}
                      backgroundColor={isActive ? "#6C5CE7" : "#16161C"}
                      pressStyle={{ opacity: 0.7 }}
                      onPress={() => {
                        if (feature.uses)
                          onUpdate({ uses: { ...feature.uses, reset: key } });
                      }}
                    >
                      <Text fontSize={10} color={isActive ? "#FFFFFF" : "#5A5A6E"}>
                        {label}
                      </Text>
                    </Stack>
                  );
                })}
              </XStack>
            </XStack>
          )}
        </YStack>
      )}
    </YStack>
  );
}

export const FeatureEditCard = memo(FeatureEditCardInner);
