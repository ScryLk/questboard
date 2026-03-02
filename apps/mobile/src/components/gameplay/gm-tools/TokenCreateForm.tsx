import { memo, useCallback, useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import {
  Sword,
  Shield,
  Skull,
  Crown,
  Wand2,
  Crosshair,
  Flame,
  Leaf,
  Bug,
  Ghost,
  Cat,
  Dog,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useGameplayStore } from "../../../lib/gameplay-store";
import type { NPCHostility } from "../../../lib/gameplay-store";

const ICONS = [
  { key: "sword", Icon: Sword },
  { key: "shield", Icon: Shield },
  { key: "skull", Icon: Skull },
  { key: "crown", Icon: Crown },
  { key: "wand", Icon: Wand2 },
  { key: "crosshair", Icon: Crosshair },
  { key: "flame", Icon: Flame },
  { key: "leaf", Icon: Leaf },
  { key: "bug", Icon: Bug },
  { key: "ghost", Icon: Ghost },
  { key: "cat", Icon: Cat },
  { key: "dog", Icon: Dog },
];

const TOKEN_TYPES = [
  { key: "character" as const, label: "Jogador" },
  { key: "npc-friendly" as const, label: "NPC Amigável" },
  { key: "npc-hostile" as const, label: "NPC Hostil" },
  { key: "object" as const, label: "Objeto" },
];

const SIZES = [
  { key: 1, label: "Pequeno 1×1" },
  { key: 2, label: "Médio 2×2" },
  { key: 3, label: "Grande 3×3" },
  { key: 4, label: "Enorme 4×4" },
];

const COLORS = [
  "#FF6B6B", "#74B9FF", "#00B894", "#FDCB6E",
  "#6C5CE7", "#00CEC9", "#E17055", "#FD79A8",
];

type TokenType = "character" | "npc-friendly" | "npc-hostile" | "object";

interface TokenCreateFormProps {
  onCancel: () => void;
  onCreated: () => void;
}

function TokenCreateFormInner({ onCancel, onCreated }: TokenCreateFormProps) {
  const addToken = useGameplayStore((s) => s.addToken);

  const [name, setName] = useState("");
  const [tokenType, setTokenType] = useState<TokenType>("npc-hostile");
  const [icon, setIcon] = useState("skull");
  const [size, setSize] = useState(1);
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");
  const [color, setColor] = useState("#FF6B6B");

  const isNPC = tokenType === "npc-friendly" || tokenType === "npc-hostile";

  const handleCreate = useCallback(() => {
    if (!name.trim()) return;

    const hpVal = parseInt(hp, 10) || 10;
    const acVal = parseInt(ac, 10) || null;
    const layer = tokenType === "character" ? "character" : tokenType === "object" ? "object" : "npc";
    const hostility: NPCHostility | null =
      tokenType === "npc-hostile" ? "hostile" :
      tokenType === "npc-friendly" ? "friendly" :
      null;

    addToken({
      id: `token-${Date.now()}`,
      name: name.trim(),
      imageUrl: null,
      icon,
      x: 10,
      y: 10,
      size,
      layer,
      visible: true,
      characterId: null,
      hp: isNPC ? { current: hpVal, max: hpVal } : null,
      conditions: [],
      ownerId: tokenType === "character" ? "" : "gm",
      color,
      ac: isNPC ? acVal : null,
      hostility,
    });

    onCreated();
  }, [name, hp, ac, tokenType, icon, size, color, isNPC, addToken, onCreated]);

  return (
    <BottomSheetScrollView
      style={styles.scrollFlex}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      contentContainerStyle={styles.scrollContent}
    >
      <YStack gap={16}>
        {/* Name */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            Nome
          </Text>
          <Stack
            backgroundColor="#0F0F12"
            borderRadius={8}
            borderWidth={1}
            borderColor="#2A2A35"
            paddingHorizontal={12}
            paddingVertical={10}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome do token..."
              placeholderTextColor="#5A5A6E"
              style={styles.input}
            />
          </Stack>
        </YStack>

        {/* Type */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            Tipo
          </Text>
          <XStack gap={6} flexWrap="wrap">
            {TOKEN_TYPES.map((t) => {
              const isActive = tokenType === t.key;
              return (
                <Stack
                  key={t.key}
                  paddingHorizontal={10}
                  paddingVertical={6}
                  borderRadius={8}
                  backgroundColor={isActive ? "rgba(108, 92, 231, 0.15)" : "#1C1C24"}
                  borderWidth={1}
                  borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setTokenType(t.key)}
                >
                  <Text fontSize={11} fontWeight="600" color={isActive ? "#6C5CE7" : "#9090A0"}>
                    {t.label}
                  </Text>
                </Stack>
              );
            })}
          </XStack>
        </YStack>

        {/* Icon grid */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            Ícone
          </Text>
          <XStack flexWrap="wrap" gap={8}>
            {ICONS.map((item) => {
              const isActive = icon === item.key;
              return (
                <Stack
                  key={item.key}
                  width={44}
                  height={44}
                  borderRadius={10}
                  backgroundColor={isActive ? "rgba(108, 92, 231, 0.15)" : "#1C1C24"}
                  borderWidth={1}
                  borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setIcon(item.key)}
                >
                  <item.Icon size={20} color={isActive ? "#6C5CE7" : "#9090A0"} />
                </Stack>
              );
            })}
          </XStack>
        </YStack>

        {/* Size */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            Tamanho
          </Text>
          <XStack gap={6} flexWrap="wrap">
            {SIZES.map((s) => {
              const isActive = size === s.key;
              return (
                <Stack
                  key={s.key}
                  paddingHorizontal={10}
                  paddingVertical={6}
                  borderRadius={8}
                  backgroundColor={isActive ? "rgba(108, 92, 231, 0.15)" : "#1C1C24"}
                  borderWidth={1}
                  borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setSize(s.key)}
                >
                  <Text fontSize={11} fontWeight="600" color={isActive ? "#6C5CE7" : "#9090A0"}>
                    {s.label}
                  </Text>
                </Stack>
              );
            })}
          </XStack>
        </YStack>

        {/* HP + CA (only for NPCs) */}
        {isNPC && (
          <XStack gap={8}>
            <YStack flex={1} gap={6}>
              <Text fontSize={12} fontWeight="600" color="#9090A0">
                HP
              </Text>
              <Stack
                backgroundColor="#0F0F12"
                borderRadius={8}
                borderWidth={1}
                borderColor="#2A2A35"
                paddingHorizontal={12}
                paddingVertical={10}
              >
                <TextInput
                  value={hp}
                  onChangeText={setHp}
                  placeholder="10"
                  placeholderTextColor="#5A5A6E"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </Stack>
            </YStack>
            <YStack flex={1} gap={6}>
              <Text fontSize={12} fontWeight="600" color="#9090A0">
                CA
              </Text>
              <Stack
                backgroundColor="#0F0F12"
                borderRadius={8}
                borderWidth={1}
                borderColor="#2A2A35"
                paddingHorizontal={12}
                paddingVertical={10}
              >
                <TextInput
                  value={ac}
                  onChangeText={setAc}
                  placeholder="10"
                  placeholderTextColor="#5A5A6E"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </Stack>
            </YStack>
          </XStack>
        )}

        {/* Color */}
        <YStack gap={6}>
          <Text fontSize={12} fontWeight="600" color="#9090A0">
            Cor da borda
          </Text>
          <XStack gap={8}>
            {COLORS.map((c) => {
              const isActive = color === c;
              return (
                <Stack
                  key={c}
                  width={32}
                  height={32}
                  borderRadius={16}
                  backgroundColor={c}
                  borderWidth={isActive ? 3 : 1}
                  borderColor={isActive ? "#FFFFFF" : "rgba(255,255,255,0.15)"}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setColor(c)}
                />
              );
            })}
          </XStack>
        </YStack>

        {/* Footer buttons */}
        <XStack gap={8} marginTop={8}>
          <Stack
            flex={1}
            height={40}
            borderRadius={10}
            borderWidth={1}
            borderColor="#2A2A35"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={onCancel}
          >
            <Text fontSize={13} fontWeight="600" color="#9090A0">
              Cancelar
            </Text>
          </Stack>
          <Stack
            flex={2}
            height={40}
            borderRadius={10}
            backgroundColor="#6C5CE7"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.85 }}
            onPress={handleCreate}
          >
            <Text fontSize={13} fontWeight="600" color="white">
              Criar e Adicionar ao Mapa
            </Text>
          </Stack>
        </XStack>
      </YStack>
    </BottomSheetScrollView>
  );
}

export const TokenCreateForm = memo(TokenCreateFormInner);

const styles = StyleSheet.create({
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  input: {
    color: "#E8E8ED",
    fontSize: 14,
    padding: 0,
  },
});
