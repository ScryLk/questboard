import { memo, useCallback, useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../../lib/gameplay-store";
import type { NPCHostility } from "../../../lib/gameplay-store";

const HOSTILITY_OPTIONS: { key: NPCHostility; label: string; color: string }[] = [
  { key: "hostile", label: "Hostil", color: "#FF6B6B" },
  { key: "neutral", label: "Neutro", color: "#FDCB6E" },
  { key: "friendly", label: "Aliado", color: "#00B894" },
];

function QuickNPCFormInner() {
  const addToken = useGameplayStore((s) => s.addToken);

  const [name, setName] = useState("");
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");
  const [hostility, setHostility] = useState<NPCHostility>("hostile");
  const [quantity, setQuantity] = useState(1);

  const handleAdd = useCallback(() => {
    if (!name.trim()) return;
    const hpVal = parseInt(hp, 10) || 10;
    const acVal = parseInt(ac, 10) || null;

    const colorMap: Record<NPCHostility, string> = {
      hostile: "#FF6B6B",
      neutral: "#FDCB6E",
      friendly: "#00B894",
    };

    for (let i = 0; i < quantity; i++) {
      const suffix = quantity > 1 ? ` #${i + 1}` : "";
      addToken({
        id: `token-${Date.now()}-${i}`,
        name: `${name.trim()}${suffix}`,
        imageUrl: null,
        icon: hostility === "hostile" ? "skull" : "user",
        x: 10 + i,
        y: 10,
        size: 1,
        layer: "npc",
        visible: true,
        characterId: null,
        hp: { current: hpVal, max: hpVal },
        conditions: [],
        ownerId: "gm",
        color: colorMap[hostility],
        ac: acVal,
        hostility,
      });
    }

    setName("");
    setHp("");
    setAc("");
    setQuantity(1);
  }, [name, hp, ac, hostility, quantity, addToken]);

  return (
    <YStack
      backgroundColor="#1C1C24"
      borderRadius={12}
      borderWidth={1}
      borderColor="#2A2A35"
      padding={12}
      gap={8}
      marginBottom={16}
    >
      <Text fontSize={13} fontWeight="600" color="#E8E8ED">
        NPC Rápido
      </Text>

      {/* Row 1: Nome + PV + CA */}
      <XStack gap={8}>
        <Stack
          flex={1}
          backgroundColor="#0F0F12"
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          paddingHorizontal={10}
          paddingVertical={8}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome"
            placeholderTextColor="#5A5A6E"
            style={styles.input}
          />
        </Stack>
        <Stack
          width={60}
          backgroundColor="#0F0F12"
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          paddingHorizontal={10}
          paddingVertical={8}
        >
          <TextInput
            value={hp}
            onChangeText={setHp}
            placeholder="PV"
            placeholderTextColor="#5A5A6E"
            keyboardType="number-pad"
            style={styles.input}
          />
        </Stack>
        <Stack
          width={60}
          backgroundColor="#0F0F12"
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          paddingHorizontal={10}
          paddingVertical={8}
        >
          <TextInput
            value={ac}
            onChangeText={setAc}
            placeholder="CA"
            placeholderTextColor="#5A5A6E"
            keyboardType="number-pad"
            style={styles.input}
          />
        </Stack>
      </XStack>

      {/* Row 2: Type pills + Quantity */}
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap={6}>
          {HOSTILITY_OPTIONS.map((opt) => {
            const isActive = hostility === opt.key;
            return (
              <Stack
                key={opt.key}
                paddingHorizontal={10}
                paddingVertical={5}
                borderRadius={6}
                backgroundColor={
                  isActive ? `${opt.color}20` : "#0F0F12"
                }
                borderWidth={1}
                borderColor={isActive ? opt.color : "#2A2A35"}
                pressStyle={{ opacity: 0.7 }}
                onPress={() => setHostility(opt.key)}
              >
                <Text
                  fontSize={11}
                  fontWeight="600"
                  color={isActive ? opt.color : "#5A5A6E"}
                >
                  {opt.label}
                </Text>
              </Stack>
            );
          })}
        </XStack>

        {/* Quantity counter */}
        <XStack alignItems="center" gap={6}>
          <Stack
            width={28}
            height={28}
            borderRadius={6}
            backgroundColor="#0F0F12"
            borderWidth={1}
            borderColor="#2A2A35"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus size={14} color="#9090A0" />
          </Stack>
          <Text fontSize={14} fontWeight="700" color="#E8E8ED" width={20} textAlign="center">
            {quantity}
          </Text>
          <Stack
            width={28}
            height={28}
            borderRadius={6}
            backgroundColor="#0F0F12"
            borderWidth={1}
            borderColor="#2A2A35"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setQuantity((q) => Math.min(10, q + 1))}
          >
            <Plus size={14} color="#9090A0" />
          </Stack>
        </XStack>
      </XStack>

      {/* Add button */}
      <Stack
        height={36}
        borderRadius={8}
        backgroundColor="#6C5CE7"
        alignItems="center"
        justifyContent="center"
        pressStyle={{ opacity: 0.85 }}
        onPress={handleAdd}
      >
        <Text fontSize={13} fontWeight="600" color="white">
          Adicionar ao Mapa
        </Text>
      </Stack>
    </YStack>
  );
}

export const QuickNPCForm = memo(QuickNPCFormInner);

const styles = StyleSheet.create({
  input: {
    color: "#E8E8ED",
    fontSize: 14,
    padding: 0,
  },
});
