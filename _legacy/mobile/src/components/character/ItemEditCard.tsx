import { memo } from "react";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { InventoryItem } from "../../lib/character-types";

interface ItemEditCardProps {
  item: InventoryItem;
  onUpdate: (updates: Partial<InventoryItem>) => void;
  onRemove: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  weapon: "Arma",
  armor: "Armadura",
  gear: "Equipamento",
  consumable: "Consumível",
  treasure: "Tesouro",
};

const CATEGORY_COLORS: Record<string, string> = {
  weapon: "#FF6B6B",
  armor: "#6C5CE7",
  gear: "#9090A0",
  consumable: "#00B894",
  treasure: "#FDCB6E",
};

function ItemEditCardInner({ item, onUpdate, onRemove }: ItemEditCardProps) {
  const categoryColor = CATEGORY_COLORS[item.category] ?? "#5A5A6E";

  return (
    <XStack
      backgroundColor="#1C1C24"
      borderRadius={10}
      borderWidth={1}
      borderColor="#2A2A35"
      paddingHorizontal={12}
      paddingVertical={10}
      alignItems="center"
      gap={10}
    >
      {/* Equipped toggle */}
      <Stack
        width={18}
        height={18}
        borderRadius={4}
        borderWidth={1.5}
        borderColor={item.equipped ? "#6C5CE7" : "#3A3A45"}
        backgroundColor={item.equipped ? "#6C5CE7" : "transparent"}
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.7 }}
        onPress={() => onUpdate({ equipped: !item.equipped })}
      >
        {item.equipped && (
          <Text fontSize={10} color="#FFFFFF" fontWeight="700">
            E
          </Text>
        )}
      </Stack>

      {/* Item info */}
      <YStack flex={1} gap={2}>
        <Text fontSize={13} fontWeight="600" color="#E8E8ED" numberOfLines={1}>
          {item.name}
        </Text>
        <XStack gap={6}>
          <Text fontSize={10} color={categoryColor}>
            {CATEGORY_LABELS[item.category] ?? item.category}
          </Text>
          {item.damage && (
            <Text fontSize={10} color="#FF6B6B">
              {item.damage}
            </Text>
          )}
          {item.armorClass !== undefined && (
            <Text fontSize={10} color="#6C5CE7">
              CA {item.armorClass}
            </Text>
          )}
          <Text fontSize={10} color="#5A5A6E">
            {item.weight}lb
          </Text>
        </XStack>
      </YStack>

      {/* Quantity stepper */}
      <XStack alignItems="center" gap={4}>
        <Stack
          width={24}
          height={24}
          borderRadius={6}
          backgroundColor="#16161C"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => {
            if (item.quantity > 1) onUpdate({ quantity: item.quantity - 1 });
          }}
        >
          <Minus size={12} color={item.quantity > 1 ? "#9090A0" : "#3A3A45"} />
        </Stack>
        <Text fontSize={13} fontWeight="700" color="#E8E8ED" minWidth={20} textAlign="center">
          {item.quantity}
        </Text>
        <Stack
          width={24}
          height={24}
          borderRadius={6}
          backgroundColor="#16161C"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => onUpdate({ quantity: item.quantity + 1 })}
        >
          <Plus size={12} color="#9090A0" />
        </Stack>
      </XStack>

      {/* Remove */}
      <Stack
        width={28}
        height={28}
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.7 }}
        onPress={onRemove}
      >
        <Trash2 size={14} color="#FF6B6B" />
      </Stack>
    </XStack>
  );
}

export const ItemEditCard = memo(ItemEditCardInner);
