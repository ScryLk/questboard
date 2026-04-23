import { ScrollView } from "react-native";
import { Plus } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface SelectableCharacter {
  id: string;
  name: string;
  className: string;
  level: number;
  system: string;
  disabled?: boolean;
  disabledReason?: string;
}

interface CharacterSelectorProps {
  characters: SelectableCharacter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew?: () => void;
  systemLabel: string;
}

export function CharacterSelector({
  characters,
  selectedId,
  onSelect,
  onCreateNew,
  systemLabel,
}: CharacterSelectorProps) {
  return (
    <YStack gap={10}>
      <Text fontSize={13} fontWeight="600" color="$textSecondary" paddingHorizontal={4}>
        Escolha seu personagem para esta campanha
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 10 }}
      >
        {characters.map((char) => {
          const isSelected = selectedId === char.id;
          const isDisabled = char.disabled === true;

          return (
            <Stack
              key={char.id}
              onPress={isDisabled ? undefined : () => onSelect(char.id)}
              width={140}
              borderRadius={12}
              borderWidth={isSelected ? 2 : 1}
              borderColor={isSelected ? "$accent" : isDisabled ? "#1A1A24" : "$border"}
              backgroundColor={
                isSelected
                  ? "rgba(108, 92, 231, 0.08)"
                  : isDisabled
                    ? "#12121A"
                    : "$bgCard"
              }
              padding={12}
              opacity={isDisabled ? 0.5 : 1}
            >
              <Text
                fontSize={14}
                fontWeight="600"
                color={isSelected ? "$accent" : isDisabled ? "$textMuted" : "$textPrimary"}
                numberOfLines={1}
              >
                {char.name}
              </Text>
              <Text fontSize={12} color="$textMuted" marginTop={4}>
                {char.className} Nv.{char.level}
              </Text>
              {isDisabled && char.disabledReason && (
                <Text fontSize={10} color="#FF6B6B" marginTop={4}>
                  {char.disabledReason}
                </Text>
              )}
            </Stack>
          );
        })}

        {/* Create new */}
        {onCreateNew && (
          <Stack
            onPress={onCreateNew}
            width={140}
            borderRadius={12}
            borderWidth={1}
            borderColor="$border"
            borderStyle="dashed"
            backgroundColor="transparent"
            padding={12}
            alignItems="center"
            justifyContent="center"
            gap={6}
          >
            <XStack
              height={32}
              width={32}
              borderRadius={9999}
              backgroundColor="rgba(108, 92, 231, 0.1)"
              alignItems="center"
              justifyContent="center"
            >
              <Plus size={16} color="#6C5CE7" />
            </XStack>
            <Text fontSize={12} color="$accent" textAlign="center">
              Criar novo{"\n"}({systemLabel})
            </Text>
          </Stack>
        )}
      </ScrollView>
    </YStack>
  );
}
