import { memo, useCallback } from "react";
import { Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Grid3x3,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Minus,
  Plus,
  Trash2,
} from "lucide-react-native";
import { Image, Stack, Text, XStack, YStack } from "tamagui";
import { SubModalSheet } from "./gm-tools/SubModalSheet";
import { useGameplayStore } from "../../lib/gameplay-store";

function GameplaySettingsModalInner({
  isOpen,
}: {
  isOpen: boolean;
}) {
  const closeSettingsModal = useGameplayStore((s) => s.closeSettingsModal);
  const mapImage = useGameplayStore((s) => s.mapImage);
  const setMapImage = useGameplayStore((s) => s.setMapImage);
  const gridVisible = useGameplayStore((s) => s.gridVisible);
  const toggleGrid = useGameplayStore((s) => s.toggleGrid);
  const gridSize = useGameplayStore((s) => s.gridSize);
  const setGridSize = useGameplayStore((s) => s.setGridSize);
  const gridType = useGameplayStore((s) => s.gridType);
  const setGridType = useGameplayStore((s) => s.setGridType);

  const handleImportImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setMapImage({
        url: asset.uri,
        width: asset.width ?? 800,
        height: asset.height ?? 600,
      });
    }
  }, [setMapImage]);

  const handleRemoveImage = useCallback(() => {
    Alert.alert("Remover Imagem", "Deseja remover a imagem de fundo do mapa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => setMapImage(null),
      },
    ]);
  }, [setMapImage]);

  return (
    <SubModalSheet
      isOpen={isOpen}
      snapPoints={["65%"]}
      title="Configurações"
      onBack={closeSettingsModal}
      onDismiss={closeSettingsModal}
    >
      <YStack gap={24}>
        {/* ─── Map Background ─── */}
        <YStack gap={10}>
          <Text fontSize={12} fontWeight="700" color="#6C5CE7" letterSpacing={1}>
            IMAGEM DE FUNDO
          </Text>

          {mapImage ? (
            <YStack
              borderRadius={12}
              borderWidth={1}
              borderColor="#2A2A35"
              backgroundColor="#1C1C24"
              overflow="hidden"
            >
              <Image
                source={{ uri: mapImage.url }}
                width="100%"
                height={120}
                resizeMode="cover"
              />
              <XStack padding={12} gap={10} alignItems="center">
                <Text fontSize={12} color="#9090A0" flex={1} numberOfLines={1}>
                  {mapImage.width} x {mapImage.height}px
                </Text>
                <Stack
                  paddingHorizontal={12}
                  paddingVertical={6}
                  borderRadius={8}
                  backgroundColor="#1C1C24"
                  borderWidth={1}
                  borderColor="#2A2A35"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handleImportImage}
                >
                  <Text fontSize={12} color="#9090A0">Trocar</Text>
                </Stack>
                <Stack
                  width={32}
                  height={32}
                  borderRadius={8}
                  backgroundColor="rgba(255, 59, 48, 0.1)"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={handleRemoveImage}
                >
                  <Trash2 size={14} color="#FF3B30" />
                </Stack>
              </XStack>
            </YStack>
          ) : (
            <Stack
              height={100}
              borderRadius={12}
              borderWidth={2}
              borderColor="#2A2A35"
              borderStyle="dashed"
              backgroundColor="#1C1C24"
              alignItems="center"
              justifyContent="center"
              gap={8}
              pressStyle={{ opacity: 0.7, borderColor: "#6C5CE7" }}
              onPress={handleImportImage}
            >
              <ImageIcon size={28} color="#5A5A6E" />
              <Text fontSize={13} color="#5A5A6E">
                Importar imagem do mapa
              </Text>
            </Stack>
          )}
        </YStack>

        {/* ─── Grid Settings ─── */}
        <YStack gap={10}>
          <Text fontSize={12} fontWeight="700" color="#6C5CE7" letterSpacing={1}>
            GRADE
          </Text>

          <YStack
            borderRadius={12}
            borderWidth={1}
            borderColor="#2A2A35"
            backgroundColor="#1C1C24"
            overflow="hidden"
          >
            {/* Grid visibility toggle */}
            <XStack
              paddingHorizontal={16}
              paddingVertical={14}
              alignItems="center"
              justifyContent="space-between"
              pressStyle={{ backgroundColor: "#22222C" }}
              onPress={toggleGrid}
            >
              <XStack alignItems="center" gap={10}>
                <Grid3x3 size={16} color={gridVisible ? "#6C5CE7" : "#5A5A6E"} />
                <Text fontSize={14} color="#E8E8ED">Grade visível</Text>
              </XStack>
              <Stack
                width={44}
                height={26}
                borderRadius={13}
                backgroundColor={gridVisible ? "#6C5CE7" : "#2A2A35"}
                justifyContent="center"
                paddingHorizontal={2}
              >
                <Stack
                  width={22}
                  height={22}
                  borderRadius={11}
                  backgroundColor="#fff"
                  alignSelf={gridVisible ? "flex-end" : "flex-start"}
                />
              </Stack>
            </XStack>

            <Stack height={StyleSheet.hairlineWidth} backgroundColor="#2A2A35" />

            {/* Grid size */}
            <XStack
              paddingHorizontal={16}
              paddingVertical={14}
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize={14} color="#E8E8ED">Tamanho da célula</Text>
              <XStack alignItems="center" gap={12}>
                <Stack
                  width={30}
                  height={30}
                  borderRadius={8}
                  backgroundColor="#1C1C24"
                  borderWidth={1}
                  borderColor="#2A2A35"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setGridSize(gridSize - 5)}
                  opacity={gridSize <= 20 ? 0.3 : 1}
                >
                  <Minus size={14} color="#9090A0" />
                </Stack>
                <Text
                  fontSize={14}
                  fontWeight="600"
                  color="#E8E8ED"
                  width={36}
                  textAlign="center"
                >
                  {gridSize}
                </Text>
                <Stack
                  width={30}
                  height={30}
                  borderRadius={8}
                  backgroundColor="#1C1C24"
                  borderWidth={1}
                  borderColor="#2A2A35"
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => setGridSize(gridSize + 5)}
                  opacity={gridSize >= 100 ? 0.3 : 1}
                >
                  <Plus size={14} color="#9090A0" />
                </Stack>
              </XStack>
            </XStack>

            <Stack height={StyleSheet.hairlineWidth} backgroundColor="#2A2A35" />

            {/* Grid type */}
            <YStack paddingHorizontal={16} paddingVertical={14} gap={8}>
              <Text fontSize={14} color="#E8E8ED">Tipo</Text>
              <XStack gap={8}>
                {(
                  [
                    { key: "SQUARE", label: "Quadrado" },
                    { key: "HEX", label: "Hexagonal" },
                    { key: "NONE", label: "Nenhum" },
                  ] as const
                ).map((opt) => {
                  const active = gridType === opt.key;
                  return (
                    <Stack
                      key={opt.key}
                      flex={1}
                      paddingVertical={8}
                      borderRadius={8}
                      backgroundColor={active ? "rgba(108, 92, 231, 0.15)" : "#22222C"}
                      borderWidth={1}
                      borderColor={active ? "#6C5CE7" : "#2A2A35"}
                      alignItems="center"
                      pressStyle={{ opacity: 0.7 }}
                      onPress={() => setGridType(opt.key)}
                    >
                      <Text
                        fontSize={12}
                        fontWeight={active ? "700" : "500"}
                        color={active ? "#6C5CE7" : "#9090A0"}
                      >
                        {opt.label}
                      </Text>
                    </Stack>
                  );
                })}
              </XStack>
            </YStack>
          </YStack>
        </YStack>

        {/* ─── Visibility ─── */}
        <YStack gap={10}>
          <Text fontSize={12} fontWeight="700" color="#6C5CE7" letterSpacing={1}>
            VISIBILIDADE
          </Text>
          <YStack
            borderRadius={12}
            borderWidth={1}
            borderColor="#2A2A35"
            backgroundColor="#1C1C24"
            overflow="hidden"
          >
            <XStack
              paddingHorizontal={16}
              paddingVertical={14}
              alignItems="center"
              gap={10}
            >
              {gridVisible ? (
                <Eye size={16} color="#5A5A6E" />
              ) : (
                <EyeOff size={16} color="#5A5A6E" />
              )}
              <Text fontSize={13} color="#9090A0" flex={1}>
                {mapImage
                  ? "Imagem de fundo e grade configurados"
                  : "Nenhuma imagem de fundo configurada"}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </SubModalSheet>
  );
}

export const GameplaySettingsModal = memo(GameplaySettingsModalInner);
