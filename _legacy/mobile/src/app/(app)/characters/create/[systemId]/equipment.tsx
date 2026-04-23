import { useMemo } from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Package,
  Coins,
  Check,
  Backpack,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { WizardHeader } from "../../../../../components/wizard-header";
import { Button } from "../../../../../components/button";
import { useCharacterCreationStore } from "../../../../../lib/character-creation-store";
import {
  DND5E_BACKGROUNDS,
  CLASS_EQUIPMENT_PACKS,
} from "../../../../../lib/data/dnd5e/backgrounds";

export default function EquipmentScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const router = useRouter();
  const store = useCharacterCreationStore();
  const { background, class_, equipment, setEquipmentChoice, updateEquipment, totalSteps } =
    store;

  const bgData = useMemo(
    () => DND5E_BACKGROUNDS.find((b) => b.id === background.backgroundId),
    [background.backgroundId],
  );

  const classPack = useMemo(
    () => CLASS_EQUIPMENT_PACKS.find((p) => p.classId === class_.classId),
    [class_.classId],
  );

  const allChoicesMade = useMemo(() => {
    if (!classPack) return true;
    return classPack.choices.every(
      (choice) => equipment.choices[choice.id] !== undefined,
    );
  }, [classPack, equipment.choices]);

  const selectedItems = useMemo(() => {
    if (!classPack) return [];
    const items: string[] = [...classPack.fixed];
    for (const choice of classPack.choices) {
      const selectedId = equipment.choices[choice.id];
      const option = choice.options.find((o) => o.id === selectedId);
      if (option) {
        items.push(...option.items);
      }
    }
    return items;
  }, [classPack, equipment.choices]);

  function handleNext() {
    router.push(`/(app)/characters/create/${systemId}/roleplay`);
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <WizardHeader
        currentStep={6}
        totalSteps={totalSteps}
        stepLabel="Equipamento"
        systemId={systemId}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gold alternative toggle */}
        <XStack
          marginTop={16}
          marginBottom={20}
          backgroundColor="$bgCard"
          borderRadius={12}
          borderWidth={1}
          borderColor={equipment.useGold ? "$accent" : "$border"}
          padding={14}
          alignItems="center"
          gap={12}
          onPress={() => updateEquipment({ useGold: !equipment.useGold })}
          pressStyle={{ opacity: 0.8 }}
        >
          <Stack
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor={equipment.useGold ? "$accentMuted" : "$border"}
            alignItems="center"
            justifyContent="center"
          >
            <Coins
              size={18}
              color={equipment.useGold ? "#6C5CE7" : "#5A5A6E"}
            />
          </Stack>
          <YStack flex={1}>
            <Text fontSize={14} fontWeight="600" color="$textPrimary">
              Usar Ouro Inicial
            </Text>
            <Text fontSize={12} color="$textMuted">
              Substitui equipamento por ouro para compra livre
            </Text>
          </YStack>
          <Stack
            width={20}
            height={20}
            borderRadius={10}
            borderWidth={2}
            borderColor={equipment.useGold ? "$accent" : "$border"}
            backgroundColor={equipment.useGold ? "$accent" : "transparent"}
            alignItems="center"
            justifyContent="center"
          >
            {equipment.useGold && <Check size={12} color="white" />}
          </Stack>
        </XStack>

        {!equipment.useGold && (
          <>
            {/* Background Equipment */}
            {bgData && (
              <YStack marginBottom={16} gap={8}>
                <XStack gap={8} alignItems="center">
                  <Package size={16} color="#00B894" />
                  <Text fontSize={14} fontWeight="600" color="$textPrimary">
                    Equipamento do Antecedente
                  </Text>
                </XStack>
                <Text fontSize={12} color="$textMuted" marginBottom={4}>
                  {bgData.name}
                </Text>
                <YStack
                  borderRadius={12}
                  backgroundColor="$bgCard"
                  borderWidth={1}
                  borderColor="$border"
                  padding={14}
                  gap={6}
                >
                  {bgData.equipment.map((item, index) => (
                    <XStack key={index} gap={8} alignItems="center">
                      <Stack
                        width={4}
                        height={4}
                        borderRadius={2}
                        backgroundColor="#00B894"
                      />
                      <Text fontSize={13} color="$textPrimary">
                        {item}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            )}

            {/* Class Equipment */}
            {classPack && (
              <YStack marginBottom={16} gap={8}>
                <XStack gap={8} alignItems="center">
                  <Backpack size={16} color="#6C5CE7" />
                  <Text fontSize={14} fontWeight="600" color="$textPrimary">
                    Equipamento da Classe
                  </Text>
                </XStack>

                {/* Fixed items */}
                {classPack.fixed.length > 0 && (
                  <YStack
                    borderRadius={12}
                    backgroundColor="$bgCard"
                    borderWidth={1}
                    borderColor="$border"
                    padding={14}
                    gap={6}
                    marginBottom={4}
                  >
                    <Text fontSize={12} fontWeight="600" color="$textMuted">
                      Itens fixos
                    </Text>
                    {classPack.fixed.map((item, index) => (
                      <XStack key={index} gap={8} alignItems="center">
                        <Stack
                          width={4}
                          height={4}
                          borderRadius={2}
                          backgroundColor="$accent"
                        />
                        <Text fontSize={13} color="$textPrimary">
                          {item}
                        </Text>
                      </XStack>
                    ))}
                  </YStack>
                )}

                {/* Choices */}
                {classPack.choices.map((choice) => (
                  <YStack key={choice.id} gap={6}>
                    <Text fontSize={13} fontWeight="600" color="$textPrimary">
                      {choice.label}
                    </Text>
                    <YStack gap={6}>
                      {choice.options.map((option) => {
                        const isSelected =
                          equipment.choices[choice.id] === option.id;
                        return (
                          <Stack
                            key={option.id}
                            borderRadius={12}
                            backgroundColor="$bgCard"
                            borderWidth={1}
                            borderColor={isSelected ? "$accent" : "$border"}
                            padding={14}
                            onPress={() =>
                              setEquipmentChoice(choice.id, option.id)
                            }
                            pressStyle={{ opacity: 0.8 }}
                          >
                            <XStack
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <YStack flex={1} gap={4}>
                                <Text
                                  fontSize={14}
                                  fontWeight="600"
                                  color={
                                    isSelected ? "$accent" : "$textPrimary"
                                  }
                                >
                                  {option.name}
                                </Text>
                                <Text
                                  fontSize={11}
                                  color="$textMuted"
                                  numberOfLines={2}
                                >
                                  {option.items.join(" + ")}
                                </Text>
                              </YStack>
                              <Stack
                                width={20}
                                height={20}
                                borderRadius={10}
                                borderWidth={2}
                                borderColor={
                                  isSelected ? "$accent" : "$border"
                                }
                                backgroundColor={
                                  isSelected ? "$accent" : "transparent"
                                }
                                alignItems="center"
                                justifyContent="center"
                              >
                                {isSelected && (
                                  <Check size={12} color="white" />
                                )}
                              </Stack>
                            </XStack>
                          </Stack>
                        );
                      })}
                    </YStack>
                  </YStack>
                ))}
              </YStack>
            )}

            {/* Summary */}
            {selectedItems.length > 0 && (
              <YStack gap={8}>
                <Text fontSize={14} fontWeight="600" color="$textPrimary">
                  Resumo do Inventário
                </Text>
                <YStack
                  borderRadius={12}
                  backgroundColor="$bgCard"
                  borderWidth={1}
                  borderColor="$border"
                  padding={14}
                  gap={4}
                >
                  {selectedItems.map((item, index) => (
                    <XStack key={index} gap={8} alignItems="center">
                      <Stack
                        width={4}
                        height={4}
                        borderRadius={2}
                        backgroundColor="$accent"
                      />
                      <Text fontSize={13} color="$textPrimary">
                        {item}
                      </Text>
                    </XStack>
                  ))}
                  {bgData &&
                    bgData.equipment.map((item, index) => (
                      <XStack key={`bg-${index}`} gap={8} alignItems="center">
                        <Stack
                          width={4}
                          height={4}
                          borderRadius={2}
                          backgroundColor="#00B894"
                        />
                        <Text fontSize={13} color="$textPrimary">
                          {item}
                        </Text>
                      </XStack>
                    ))}
                </YStack>
              </YStack>
            )}
          </>
        )}

        {equipment.useGold && (
          <YStack
            borderRadius={14}
            backgroundColor="$bgCard"
            borderWidth={1}
            borderColor="$border"
            padding={20}
            alignItems="center"
            gap={8}
            marginTop={8}
          >
            <Coins size={32} color="#FDCB6E" />
            <Text fontSize={16} fontWeight="700" color="$textPrimary">
              Ouro Inicial
            </Text>
            <Text
              fontSize={13}
              color="$textMuted"
              textAlign="center"
              lineHeight={20}
            >
              Você receberá uma quantia de ouro baseada na sua classe para
              comprar equipamentos livremente. As compras serão feitas com o
              mestre durante a sessão.
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
          disabled={!equipment.useGold && !allChoicesMade}
          onPress={handleNext}
        >
          {`Próximo: Interpretação \u2192`}
        </Button>
      </YStack>
    </YStack>
  );
}
