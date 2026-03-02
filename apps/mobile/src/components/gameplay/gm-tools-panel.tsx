import { memo, useCallback, useEffect, useRef, useState } from "react";
import { TextInput, StyleSheet, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
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
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import { QuickNPCForm } from "./gm-tools/QuickNPCForm";

const GM_TOOLS = [
  { key: "fog", label: "Fog", Icon: Cloud },
  { key: "token", label: "Token", Icon: CirclePlus },
  { key: "measure", label: "Medir", Icon: Ruler },
  { key: "combat", label: "Combate", Icon: Swords },
  { key: "scene", label: "Cena", Icon: Film },
  { key: "audio", label: "Som", Icon: Volume2 },
] as const;

// ─── Custom Handle ────────────────────────────────────────

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ─── GM Tools Panel ──────────────────────────────────────

function GMToolsPanelInner({ isOpen }: { isOpen: boolean }) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [gmNotes, setGmNotes] = useState("");

  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const fogBrushActive = useGameplayStore((s) => s.fogBrushActive);
  const fogBrushMode = useGameplayStore((s) => s.fogBrushMode);
  const setFogBrush = useGameplayStore((s) => s.setFogBrush);
  const combatActive = useGameplayStore((s) => s.combatActive);
  const openGMToolView = useGameplayStore((s) => s.openGMToolView);
  const sessionStatus = useGameplayStore((s) => s.sessionStatus);
  const setSessionStatus = useGameplayStore((s) => s.setSessionStatus);
  const soundtrackPlaying = useGameplayStore((s) => s.soundtrack.isPlaying);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setActivePanel(null);
      }
    },
    [setActivePanel],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["40%", "88%"]}
      index={-1}
      bottomInset={0}
      enablePanDownToClose={true}
      enableContentPanningGesture={false}
      enableHandlePanningGesture={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      animateOnMount={true}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.outerContainer}>
        {/* ─── Fixed Header: Title + Tools Grid ──── */}
        <View style={styles.headerSection}>
          {/* Title + Pause button */}
          <XStack
            paddingHorizontal={16}
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

          {/* Quick tools grid 3x2 */}
          <XStack flexWrap="wrap" gap={8} paddingHorizontal={16}>
            {GM_TOOLS.map((tool) => {
              const isActive =
                (tool.key === "fog" && fogBrushActive) ||
                (tool.key === "combat" && combatActive) ||
                (tool.key === "audio" && soundtrackPlaying);

              const handlePress = () => {
                if (tool.key === "fog") {
                  setFogBrush(!fogBrushActive, fogBrushMode);
                } else if (tool.key === "token") {
                  openGMToolView("token-manager");
                } else if (tool.key === "combat") {
                  openGMToolView("combat-manager");
                } else if (tool.key === "scene") {
                  openGMToolView("scene-card");
                } else if (tool.key === "audio") {
                  openGMToolView("soundtrack");
                }
              };

              return (
                <Stack
                  key={tool.key}
                  flexBasis="30%"
                  flexGrow={1}
                  height={64}
                  borderRadius={12}
                  backgroundColor={
                    isActive ? "rgba(108, 92, 231, 0.15)" : "#1C1C24"
                  }
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

          {/* Fog controls (conditional) */}
          {fogBrushActive && (
            <YStack
              marginTop={12}
              marginHorizontal={16}
              backgroundColor="#1C1C24"
              borderRadius={12}
              borderWidth={1}
              borderColor="#2A2A35"
              padding={12}
              gap={8}
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
        </View>

        {/* ─── Scrollable Content ────────────────── */}
        <BottomSheetScrollView
          style={styles.scrollFlex}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick NPC */}
          <QuickNPCForm />

          {/* GM Notes */}
          <YStack gap={6}>
            <Text fontSize={13} fontWeight="600" color="#E8E8ED">
              Notas da Sessão
            </Text>
            <Stack
              backgroundColor="#0F0F12"
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
                style={[
                  styles.input,
                  { minHeight: 80, textAlignVertical: "top" },
                ]}
                multiline
              />
            </Stack>
          </YStack>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

export const GMToolsPanel = memo(GMToolsPanelInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#16161C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A2A35",
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#16161C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#5A5A6E",
  },
  outerContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 4,
    paddingBottom: 12,
  },
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
