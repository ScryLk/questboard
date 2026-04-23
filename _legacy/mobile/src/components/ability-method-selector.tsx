import { Dices, Calculator, List } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { AbilityMethod } from "../lib/character-creation-store";

interface AbilityMethodSelectorProps {
  selected: AbilityMethod;
  onChange: (method: AbilityMethod) => void;
}

const METHODS = [
  {
    id: "roll" as const,
    label: "Rolar Dados",
    description: "Role 4d6 e descarte o menor para cada atributo",
    icon: Dices,
  },
  {
    id: "point-buy" as const,
    label: "Compra de Pontos",
    description: "27 pontos para distribuir entre os atributos",
    icon: Calculator,
  },
  {
    id: "standard-array" as const,
    label: "Valores Padrão",
    description: "Atribua os valores 15, 14, 13, 12, 10, 8",
    icon: List,
  },
];

export function AbilityMethodSelector({
  selected,
  onChange,
}: AbilityMethodSelectorProps) {
  return (
    <YStack gap={10}>
      <Text fontSize={14} fontWeight="600" color="$textPrimary">
        Método de Atributos
      </Text>
      {METHODS.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;

        return (
          <Stack
            key={method.id}
            borderRadius={14}
            borderWidth={1}
            borderColor={isSelected ? "$accent" : "$border"}
            backgroundColor={isSelected ? "$accentMuted" : "$bgCard"}
            padding={16}
            onPress={() => onChange(method.id)}
            pressStyle={{ opacity: 0.85, scale: 0.98 }}
          >
            <XStack alignItems="center" gap={14}>
              <Stack
                height={44}
                width={44}
                borderRadius={12}
                backgroundColor={isSelected ? "$accent" : "$border"}
                alignItems="center"
                justifyContent="center"
              >
                <Icon size={22} color={isSelected ? "white" : "#9090A0"} />
              </Stack>
              <YStack flex={1} gap={2}>
                <Text
                  fontSize={15}
                  fontWeight="600"
                  color={isSelected ? "$textPrimary" : "$textSecondary"}
                >
                  {method.label}
                </Text>
                <Text fontSize={12} color="$textMuted">
                  {method.description}
                </Text>
              </YStack>
            </XStack>
          </Stack>
        );
      })}
    </YStack>
  );
}
