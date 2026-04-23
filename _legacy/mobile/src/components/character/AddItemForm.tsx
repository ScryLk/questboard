import { memo, useState } from "react";
import { TextInput } from "react-native";
import { Plus } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { InventoryItem, ItemCategory } from "../../lib/character-types";

interface AddItemFormProps {
  onAdd: (item: InventoryItem) => void;
}

const CATEGORIES: { key: ItemCategory; label: string }[] = [
  { key: "weapon", label: "Arma" },
  { key: "armor", label: "Armadura" },
  { key: "gear", label: "Equip." },
  { key: "consumable", label: "Consumível" },
  { key: "treasure", label: "Tesouro" },
];

function AddItemFormInner({ onAdd }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("gear");
  const [weight, setWeight] = useState("0");
  const [damage, setDamage] = useState("");
  const [armorClass, setArmorClass] = useState("");
  const [description, setDescription] = useState("");

  const canAdd = name.trim().length >= 2;

  function handleAdd() {
    if (!canAdd) return;
    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      category,
      quantity: 1,
      weight: parseFloat(weight) || 0,
      equipped: false,
      description: description.trim(),
      ...(category === "weapon" && damage.trim() ? { damage: damage.trim() } : {}),
      ...(category === "armor" && armorClass.trim()
        ? { armorClass: parseInt(armorClass, 10) || undefined }
        : {}),
    };
    onAdd(item);
    setName("");
    setWeight("0");
    setDamage("");
    setArmorClass("");
    setDescription("");
  }

  return (
    <YStack
      backgroundColor="#16161C"
      borderRadius={10}
      borderWidth={1}
      borderColor="#2A2A35"
      padding={12}
      gap={10}
    >
      <Text fontSize={12} fontWeight="700" color="#5A5A6E">
        ADICIONAR ITEM
      </Text>

      {/* Name */}
      <InputField
        label="Nome"
        value={name}
        onChange={setName}
        placeholder="Nome do item"
        maxLength={60}
      />

      {/* Category pills */}
      <YStack gap={4}>
        <Text fontSize={11} color="#5A5A6E">Categoria</Text>
        <XStack gap={4} flexWrap="wrap">
          {CATEGORIES.map(({ key, label }) => (
            <Stack
              key={key}
              paddingHorizontal={10}
              paddingVertical={5}
              borderRadius={6}
              backgroundColor={category === key ? "#6C5CE7" : "#1C1C24"}
              borderWidth={1}
              borderColor={category === key ? "#6C5CE7" : "#2A2A35"}
              onPress={() => setCategory(key)}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={11} color={category === key ? "#FFFFFF" : "#9090A0"}>
                {label}
              </Text>
            </Stack>
          ))}
        </XStack>
      </YStack>

      {/* Weight */}
      <InputField
        label="Peso (lb)"
        value={weight}
        onChange={setWeight}
        placeholder="0"
        keyboardType="decimal-pad"
      />

      {/* Conditional: Damage / AC */}
      {category === "weapon" && (
        <InputField
          label="Dano"
          value={damage}
          onChange={setDamage}
          placeholder="1d8 cortante"
          maxLength={30}
        />
      )}
      {category === "armor" && (
        <InputField
          label="Classe de Armadura"
          value={armorClass}
          onChange={setArmorClass}
          placeholder="14"
          keyboardType="number-pad"
        />
      )}

      {/* Description */}
      <YStack gap={4}>
        <Text fontSize={11} color="#5A5A6E">Descrição</Text>
        <Stack
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          backgroundColor="#1C1C24"
          paddingHorizontal={10}
          paddingVertical={8}
        >
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Descrição do item"
            placeholderTextColor="#3A3A45"
            multiline
            style={{
              color: "#E8E8ED",
              fontSize: 13,
              padding: 0,
              minHeight: 40,
              textAlignVertical: "top",
            }}
            maxLength={300}
          />
        </Stack>
      </YStack>

      {/* Add button */}
      <Stack
        alignSelf="flex-end"
        paddingHorizontal={14}
        paddingVertical={8}
        borderRadius={8}
        backgroundColor={canAdd ? "#6C5CE7" : "#2A2A35"}
        pressStyle={canAdd ? { opacity: 0.7 } : undefined}
        onPress={canAdd ? handleAdd : undefined}
      >
        <XStack gap={4} alignItems="center">
          <Plus size={14} color={canAdd ? "#FFFFFF" : "#5A5A6E"} />
          <Text fontSize={12} fontWeight="600" color={canAdd ? "#FFFFFF" : "#5A5A6E"}>
            Adicionar
          </Text>
        </XStack>
      </Stack>
    </YStack>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
  keyboardType?: "default" | "number-pad" | "decimal-pad";
}) {
  return (
    <YStack gap={4}>
      <Text fontSize={11} color="#5A5A6E">{label}</Text>
      <Stack
        borderRadius={8}
        borderWidth={1}
        borderColor="#2A2A35"
        backgroundColor="#1C1C24"
        paddingHorizontal={10}
        paddingVertical={8}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#3A3A45"
          keyboardType={keyboardType}
          style={{ color: "#E8E8ED", fontSize: 13, padding: 0 }}
          maxLength={maxLength}
        />
      </Stack>
    </YStack>
  );
}

export const AddItemForm = memo(AddItemFormInner);
