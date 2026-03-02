import { memo, useCallback, useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  Cloud,
  CirclePlus,
  Ruler,
  Swords,
  Film,
  Volume2,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

const GM_TOOLS = [
  { key: "fog", label: "Fog", Icon: Cloud },
  { key: "token", label: "Token", Icon: CirclePlus },
  { key: "measure", label: "Medir", Icon: Ruler },
  { key: "combat", label: "Combate", Icon: Swords },
  { key: "scene", label: "Cena", Icon: Film },
  { key: "audio", label: "Som", Icon: Volume2 },
] as const;

function GMToolsPanelInner() {
  const insets = useSafeAreaInsets();
  const [npcName, setNpcName] = useState("");
  const [npcHp, setNpcHp] = useState("");
  const [gmNotes, setGmNotes] = useState("");

  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const fogBrushActive = useGameplayStore((s) => s.fogBrushActive);
  const fogBrushMode = useGameplayStore((s) => s.fogBrushMode);
  const setFogBrush = useGameplayStore((s) => s.setFogBrush);
  const combatActive = useGameplayStore((s) => s.combatActive);
  const startCombat = useGameplayStore((s) => s.startCombat);
  const endCombat = useGameplayStore((s) => s.endCombat);
  const combatParticipants = useGameplayStore((s) => s.combatParticipants);
  const addToken = useGameplayStore((s) => s.addToken);
  const showSceneCard = useGameplayStore((s) => s.showSceneCard);
  const sessionStatus = useGameplayStore((s) => s.sessionStatus);
  const setSessionStatus = useGameplayStore((s) => s.setSessionStatus);

  const handleClose = useCallback(() => {
    setActivePanel(null);
  }, [setActivePanel]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    [],
  );

  const handleAddNpc = useCallback(() => {
    if (!npcName.trim()) return;
    const hp = parseInt(npcHp, 10) || 10;
    addToken({
      id: `token-${Date.now()}`,
      name: npcName.trim(),
      imageUrl: null,
      emoji: "👾",
      x: 10,
      y: 10,
      size: 1,
      layer: "npc",
      visible: true,
      characterId: null,
      hp: { current: hp, max: hp },
      conditions: [],
      ownerId: "gm",
      color: "#FF6B6B",
    });
    setNpcName("");
    setNpcHp("");
  }, [npcName, npcHp, addToken]);

  const handleSceneCard = useCallback(() => {
    showSceneCard({
      variant: "cinematic",
      title: "Um Novo Capítulo",
      subtitle: "A escuridão se aproxima...",
    });
  }, [showSceneCard]);

  const handleToggleCombat = useCallback(() => {
    if (combatActive) {
      endCombat();
    } else {
      startCombat(combatParticipants);
    }
  }, [combatActive, endCombat, startCombat, combatParticipants]);

  return (
    <BottomSheet
      snapPoints={["35%", "60%", "85%"]}
      index={0}
      bottomInset={56 + insets.bottom}
      enablePanDownToClose
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      overDragResistanceFactor={2.5}
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 }}
      >
          {/* Session status */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom={16}
          >
            <Text fontSize={14} fontWeight="700" color="#E8E8ED">
              Ferramentas do Mestre
            </Text>
            <Stack
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius={8}
              backgroundColor={
                sessionStatus === "LIVE"
                  ? "rgba(255, 59, 48, 0.15)"
                  : "rgba(0, 184, 148, 0.15)"
              }
              pressStyle={{ opacity: 0.7 }}
              onPress={() =>
                setSessionStatus(sessionStatus === "LIVE" ? "PAUSED" : "LIVE")
              }
            >
              <Text
                fontSize={11}
                fontWeight="700"
                color={sessionStatus === "LIVE" ? "#FF3B30" : "#00B894"}
              >
                {sessionStatus === "LIVE" ? "PAUSAR" : "INICIAR"}
              </Text>
            </Stack>
          </XStack>

          {/* Quick tools grid */}
          <XStack flexWrap="wrap" gap={8} marginBottom={20}>
            {GM_TOOLS.map((tool) => {
              const isActive =
                (tool.key === "fog" && fogBrushActive) ||
                (tool.key === "combat" && combatActive);

              const handlePress = () => {
                if (tool.key === "fog") {
                  setFogBrush(!fogBrushActive, fogBrushMode);
                } else if (tool.key === "combat") {
                  handleToggleCombat();
                } else if (tool.key === "scene") {
                  handleSceneCard();
                }
              };

              return (
                <Stack
                  key={tool.key}
                  width="30%"
                  height={64}
                  borderRadius={12}
                  backgroundColor={isActive ? "rgba(108, 92, 231, 0.15)" : "#16161C"}
                  borderWidth={1}
                  borderColor={isActive ? "#6C5CE7" : "#2A2A35"}
                  alignItems="center"
                  justifyContent="center"
                  gap={4}
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handlePress}
                >
                  <tool.Icon
                    size={18}
                    color={isActive ? "#6C5CE7" : "#9090A0"}
                  />
                  <Text
                    fontSize={11}
                    color={isActive ? "#6C5CE7" : "#9090A0"}
                  >
                    {tool.label}
                  </Text>
                </Stack>
              );
            })}
          </XStack>

          {/* Fog controls */}
          {fogBrushActive && (
            <YStack
              backgroundColor="#16161C"
              borderRadius={12}
              borderWidth={1}
              borderColor="#2A2A35"
              padding={12}
              gap={8}
              marginBottom={16}
            >
              <Text fontSize={13} fontWeight="600" color="#E8E8ED">
                Modo Fog
              </Text>
              <XStack gap={8}>
                <Stack
                  flex={1}
                  paddingVertical={8}
                  borderRadius={8}
                  backgroundColor={
                    fogBrushMode === "reveal"
                      ? "rgba(0, 184, 148, 0.15)"
                      : "#1A1A24"
                  }
                  borderWidth={1}
                  borderColor={
                    fogBrushMode === "reveal" ? "#00B894" : "#2A2A35"
                  }
                  alignItems="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setFogBrush(true, "reveal")}
                >
                  <XStack alignItems="center" gap={4}>
                    <Eye size={14} color="#00B894" />
                    <Text fontSize={12} color="#00B894">
                      Revelar
                    </Text>
                  </XStack>
                </Stack>
                <Stack
                  flex={1}
                  paddingVertical={8}
                  borderRadius={8}
                  backgroundColor={
                    fogBrushMode === "hide"
                      ? "rgba(255, 107, 107, 0.15)"
                      : "#1A1A24"
                  }
                  borderWidth={1}
                  borderColor={
                    fogBrushMode === "hide" ? "#FF6B6B" : "#2A2A35"
                  }
                  alignItems="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setFogBrush(true, "hide")}
                >
                  <XStack alignItems="center" gap={4}>
                    <EyeOff size={14} color="#FF6B6B" />
                    <Text fontSize={12} color="#FF6B6B">
                      Ocultar
                    </Text>
                  </XStack>
                </Stack>
              </XStack>
            </YStack>
          )}

          {/* Quick NPC */}
          <YStack
            backgroundColor="#16161C"
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
            <XStack gap={8}>
              <Stack
                flex={1}
                backgroundColor="#12121A"
                borderRadius={8}
                borderWidth={1}
                borderColor="#2A2A35"
                paddingHorizontal={10}
                paddingVertical={8}
              >
                <TextInput
                  value={npcName}
                  onChangeText={setNpcName}
                  placeholder="Nome"
                  placeholderTextColor="#5A5A6E"
                  style={styles.input}
                />
              </Stack>
              <Stack
                width={64}
                backgroundColor="#12121A"
                borderRadius={8}
                borderWidth={1}
                borderColor="#2A2A35"
                paddingHorizontal={10}
                paddingVertical={8}
              >
                <TextInput
                  value={npcHp}
                  onChangeText={setNpcHp}
                  placeholder="PV"
                  placeholderTextColor="#5A5A6E"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </Stack>
            </XStack>
            <Stack
              height={36}
              borderRadius={8}
              backgroundColor="#6C5CE7"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.85 }}
              onPress={handleAddNpc}
            >
              <Text fontSize={13} fontWeight="600" color="white">
                Adicionar ao Mapa
              </Text>
            </Stack>
          </YStack>

          {/* GM Notes */}
          <YStack gap={6}>
            <Text fontSize={13} fontWeight="600" color="#E8E8ED">
              Notas da Sessão
            </Text>
            <Stack
              backgroundColor="#12121A"
              borderRadius={10}
              borderWidth={1}
              borderColor="#2A2A35"
              paddingHorizontal={14}
              paddingVertical={12}
            >
              <TextInput
                value={gmNotes}
                onChangeText={setGmNotes}
                placeholder="Anotações rápidas..."
                placeholderTextColor="#5A5A6E"
                style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
                multiline
              />
            </Stack>
          </YStack>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export const GMToolsPanel = memo(GMToolsPanelInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#0F0F12",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A2A35",
  },
  handle: {
    backgroundColor: "#5A5A6E",
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  input: {
    color: "#E8E8ED",
    fontSize: 14,
    padding: 0,
  },
});
