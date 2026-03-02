import { memo, useCallback, useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";

interface CombatAddEnemyProps {
  onAdd: (name: string, count: number, hp: number, ac: number) => void;
  onCancel: () => void;
}

function CombatAddEnemyInner({ onAdd, onCancel }: CombatAddEnemyProps) {
  const [name, setName] = useState("");
  const [count, setCount] = useState(1);
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");

  const handleAdd = useCallback(() => {
    if (!name.trim()) return;
    onAdd(name.trim(), count, parseInt(hp, 10) || 10, parseInt(ac, 10) || 10);
    setName("");
    setCount(1);
    setHp("");
    setAc("");
  }, [name, count, hp, ac, onAdd]);

  return (
    <YStack
      backgroundColor="#1C1C24"
      borderRadius={10}
      borderWidth={1}
      borderColor="#2A2A35"
      padding={12}
      gap={8}
    >
      <Stack
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
          placeholder="Nome do inimigo"
          placeholderTextColor="#5A5A6E"
          style={styles.input}
        />
      </Stack>

      <XStack gap={8} alignItems="center">
        <Text fontSize={11} color="#5A5A6E" width={40}>
          Qtd:
        </Text>
        <XStack alignItems="center" gap={4}>
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
            onPress={() => setCount((c) => Math.max(1, c - 1))}
          >
            <Minus size={12} color="#9090A0" />
          </Stack>
          <Text fontSize={14} fontWeight="700" color="#E8E8ED" width={20} textAlign="center">
            {count}
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
            onPress={() => setCount((c) => Math.min(10, c + 1))}
          >
            <Plus size={12} color="#9090A0" />
          </Stack>
        </XStack>

        <Stack
          flex={1}
          backgroundColor="#0F0F12"
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          paddingHorizontal={8}
          paddingVertical={6}
        >
          <TextInput
            value={hp}
            onChangeText={setHp}
            placeholder="HP"
            placeholderTextColor="#5A5A6E"
            keyboardType="number-pad"
            style={styles.inputSmall}
          />
        </Stack>

        <Stack
          flex={1}
          backgroundColor="#0F0F12"
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          paddingHorizontal={8}
          paddingVertical={6}
        >
          <TextInput
            value={ac}
            onChangeText={setAc}
            placeholder="CA"
            placeholderTextColor="#5A5A6E"
            keyboardType="number-pad"
            style={styles.inputSmall}
          />
        </Stack>
      </XStack>

      <XStack gap={8}>
        <Stack
          flex={1}
          height={32}
          borderRadius={8}
          borderWidth={1}
          borderColor="#2A2A35"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={onCancel}
        >
          <Text fontSize={12} color="#9090A0">
            Cancelar
          </Text>
        </Stack>
        <Stack
          flex={1}
          height={32}
          borderRadius={8}
          backgroundColor="#6C5CE7"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.85 }}
          onPress={handleAdd}
        >
          <Text fontSize={12} fontWeight="600" color="white">
            Adicionar
          </Text>
        </Stack>
      </XStack>
    </YStack>
  );
}

export const CombatAddEnemy = memo(CombatAddEnemyInner);

const styles = StyleSheet.create({
  input: {
    color: "#E8E8ED",
    fontSize: 14,
    padding: 0,
  },
  inputSmall: {
    color: "#E8E8ED",
    fontSize: 12,
    padding: 0,
  },
});
