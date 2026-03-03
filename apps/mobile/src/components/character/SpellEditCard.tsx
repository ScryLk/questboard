import { memo, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CharacterSpell } from "../../lib/character-types";

interface SpellEditCardProps {
  spell: CharacterSpell;
  onRemove: () => void;
  onTogglePrepared: () => void;
}

const SCHOOL_COLORS: Record<string, string> = {
  Abjuração: "#00B894",
  Conjuração: "#FDCB6E",
  Adivinhação: "#6C5CE7",
  Encantamento: "#FF6B6B",
  Evocação: "#FF9F43",
  Ilusão: "#A29BFE",
  Necromancia: "#636E72",
  Transmutação: "#00CEC9",
};

function SpellEditCardInner({ spell, onRemove, onTogglePrepared }: SpellEditCardProps) {
  const [expanded, setExpanded] = useState(false);
  const schoolColor = SCHOOL_COLORS[spell.school] ?? "#5A5A6E";

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
        {/* Prepared dot */}
        <Stack
          width={12}
          height={12}
          borderRadius={6}
          borderWidth={1.5}
          borderColor={spell.prepared ? "#6C5CE7" : "#3A3A45"}
          backgroundColor={spell.prepared ? "#6C5CE7" : "transparent"}
          pressStyle={{ opacity: 0.7 }}
          onPress={(e) => {
            e.stopPropagation?.();
            onTogglePrepared();
          }}
        />

        <YStack flex={1} gap={1}>
          <Text fontSize={13} fontWeight="600" color="#E8E8ED" numberOfLines={1}>
            {spell.name}
          </Text>
          <XStack gap={6}>
            <Text fontSize={10} color={schoolColor}>
              {spell.school}
            </Text>
            <Text fontSize={10} color="#5A5A6E">
              {spell.level === 0 ? "Truque" : `Nível ${spell.level}`}
            </Text>
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

      {/* Expanded details */}
      {expanded && (
        <YStack
          paddingHorizontal={12}
          paddingBottom={10}
          gap={6}
          borderTopWidth={1}
          borderTopColor="#2A2A35"
          paddingTop={8}
        >
          <DetailRow label="Tempo de Conjuração" value={spell.castingTime} />
          <DetailRow label="Alcance" value={spell.range} />
          <DetailRow label="Componentes" value={spell.components} />
          <DetailRow label="Duração" value={spell.duration} />
          {spell.description && (
            <YStack gap={2} marginTop={4}>
              <Text fontSize={10} fontWeight="600" color="#5A5A6E">
                Descrição
              </Text>
              <Text fontSize={11} color="#9090A0" lineHeight={16}>
                {spell.description}
              </Text>
            </YStack>
          )}
        </YStack>
      )}
    </YStack>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack gap={8}>
      <Text fontSize={10} fontWeight="600" color="#5A5A6E" width={100}>
        {label}
      </Text>
      <Text fontSize={11} color="#9090A0" flex={1}>
        {value}
      </Text>
    </XStack>
  );
}

export const SpellEditCard = memo(SpellEditCardInner);
