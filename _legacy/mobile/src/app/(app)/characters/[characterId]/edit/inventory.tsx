import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCharacterStore } from "../../../../../lib/character-store";
import { EditScreenHeader } from "../../../../../components/character/EditScreenHeader";
import { CoinEditor } from "../../../../../components/character/CoinEditor";
import { ItemEditCard } from "../../../../../components/character/ItemEditCard";
import { AddItemForm } from "../../../../../components/character/AddItemForm";
import type { InventoryItem, ItemCategory } from "../../../../../lib/character-types";

const CATEGORY_ORDER: ItemCategory[] = ["weapon", "armor", "gear", "consumable", "treasure"];
const CATEGORY_LABELS: Record<ItemCategory, string> = {
  weapon: "Armas",
  armor: "Armaduras",
  gear: "Equipamento",
  consumable: "Consumíveis",
  treasure: "Tesouros",
};

export default function EditInventoryScreen() {
  const router = useRouter();
  const draft = useCharacterStore((s) => s.editDraft);
  const updateDraft = useCharacterStore((s) => s.updateDraft);
  const saveDraft = useCharacterStore((s) => s.saveDraft);
  const discardDraft = useCharacterStore((s) => s.discardDraft);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSave = useCallback(() => {
    router.back();
    setTimeout(saveDraft, 100);
  }, [saveDraft, router]);

  const handleCancel = useCallback(() => {
    router.back();
    setTimeout(discardDraft, 100);
  }, [discardDraft, router]);

  // Update item
  const handleUpdateItem = useCallback(
    (itemId: string, updates: Partial<InventoryItem>) => {
      if (!draft) return;
      updateDraft({
        inventory: draft.inventory.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item,
        ),
      });
    },
    [draft, updateDraft],
  );

  // Remove item
  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (!draft) return;
      Alert.alert("Remover item?", "Essa ação não pode ser desfeita.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () =>
            updateDraft({ inventory: draft.inventory.filter((i) => i.id !== itemId) }),
        },
      ]);
    },
    [draft, updateDraft],
  );

  // Add item
  const handleAddItem = useCallback(
    (item: InventoryItem) => {
      if (!draft) return;
      updateDraft({ inventory: [...draft.inventory, item] });
      setShowAddForm(false);
    },
    [draft, updateDraft],
  );

  // Group by category
  const groupedItems = useMemo(() => {
    if (!draft) return [];
    return CATEGORY_ORDER
      .map((cat) => ({
        category: cat,
        items: draft.inventory.filter((i) => i.category === cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [draft]);

  // Weight calculation
  const totalWeight = useMemo(() => {
    if (!draft) return 0;
    return draft.inventory.reduce((sum, i) => sum + i.weight * i.quantity, 0);
  }, [draft]);

  if (!draft) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
        <Text color="#5A5A6E" fontSize={14} padding={20}>
          Nenhum rascunho ativo
        </Text>
      </SafeAreaView>
    );
  }

  const weightRatio = draft.carryCapacity > 0 ? totalWeight / draft.carryCapacity : 0;
  const isOverweight = weightRatio > 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <EditScreenHeader
        title="Editar Inventário"
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Coins */}
        <YStack gap={8} marginTop={8} marginBottom={20}>
          <Text fontSize={12} fontWeight="700" color="#5A5A6E">
            MOEDAS
          </Text>
          <CoinEditor
            coins={draft.coins}
            onChange={(coins) => updateDraft({ coins })}
          />
        </YStack>

        {/* Weight bar */}
        <YStack
          backgroundColor="#1C1C24"
          borderRadius={10}
          borderWidth={1}
          borderColor="#2A2A35"
          padding={12}
          gap={6}
          marginBottom={20}
        >
          <XStack justifyContent="space-between">
            <Text fontSize={11} color="#5A5A6E">
              Peso Total
            </Text>
            <Text
              fontSize={12}
              fontWeight="700"
              color={isOverweight ? "#FF6B6B" : "#E8E8ED"}
            >
              {totalWeight.toFixed(1)} / {draft.carryCapacity} lb
            </Text>
          </XStack>
          <Stack height={4} borderRadius={2} backgroundColor="#1A1A24" overflow="hidden">
            <Stack
              width={`${Math.min(100, weightRatio * 100)}%`}
              height={4}
              borderRadius={2}
              backgroundColor={isOverweight ? "#FF6B6B" : "#6C5CE7"}
            />
          </Stack>
        </YStack>

        {/* Items by category */}
        {groupedItems.map(({ category, items }) => (
          <YStack key={category} gap={6} marginBottom={16}>
            <Text fontSize={12} fontWeight="700" color="#5A5A6E">
              {CATEGORY_LABELS[category]} ({items.length})
            </Text>
            <YStack gap={6}>
              {items.map((item) => (
                <ItemEditCard
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                  onRemove={() => handleRemoveItem(item.id)}
                />
              ))}
            </YStack>
          </YStack>
        ))}

        {/* Add item toggle / form */}
        {showAddForm ? (
          <YStack gap={8}>
            <AddItemForm onAdd={handleAddItem} />
            <Stack
              alignSelf="flex-start"
              paddingHorizontal={12}
              paddingVertical={6}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setShowAddForm(false)}
            >
              <Text fontSize={12} color="#5A5A6E">
                Cancelar
              </Text>
            </Stack>
          </YStack>
        ) : (
          <Stack
            paddingVertical={12}
            borderRadius={10}
            borderWidth={1}
            borderColor="#2A2A35"
            borderStyle="dashed"
            alignItems="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setShowAddForm(true)}
          >
            <XStack gap={6} alignItems="center">
              <Plus size={16} color="#6C5CE7" />
              <Text fontSize={13} color="#6C5CE7" fontWeight="600">
                Adicionar Item
              </Text>
            </XStack>
          </Stack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
