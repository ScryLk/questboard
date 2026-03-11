import { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
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
  Users,
  Volume2,
  Eye,
  RefreshCw,
  Moon,
  Package,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../../lib/gameplay-store";
import { usePhaseStore } from "../../../stores/phaseStore";
import { PHASE_META } from "../../../constants/phaseTransitions";
import { MOCK_CHARACTER_SHEET } from "../../../lib/gameplay-mock-data";
import { ShortRestModal } from "./short-rest-modal";

// ─── Custom Handle ────────────────────────────────────────

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ─── Menu Item ────────────────────────────────────────────

function MenuItem({
  icon,
  label,
  detail,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  detail?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <XStack
      paddingHorizontal={12}
      paddingVertical={14}
      borderRadius={12}
      backgroundColor="rgba(255,255,255,0.02)"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.04)"
      alignItems="center"
      gap={10}
      pressStyle={{ opacity: 0.7, backgroundColor: "rgba(255,255,255,0.05)" }}
      onPress={onPress}
    >
      {icon}
      <Text flex={1} fontSize={13} fontWeight="500" color={danger ? "#FF6B6B" : "#E8E8ED"}>
        {label}
      </Text>
      {detail && (
        <Text fontSize={11} color="#5A5A6E">
          {detail}
        </Text>
      )}
      <ChevronRight size={14} color="#3A3A4E" />
    </XStack>
  );
}

// ─── Panel ────────────────────────────────────────────────

function MorePanelInner({ isOpen }: { isOpen: boolean }) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const router = useRouter();
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const onlinePlayers = useGameplayStore((s) => s.onlinePlayers);
  const addMessage = useGameplayStore((s) => s.addMessage);

  const currentPhase = usePhaseStore((s) => s.current);
  const phaseMeta = PHASE_META[currentPhase.type];

  const sheet = MOCK_CHARACTER_SHEET;
  const onlineCount = onlinePlayers.filter((p) => p.isOnline).length;
  const totalCount = onlinePlayers.length;

  const [showPlayers, setShowPlayers] = useState(false);
  const [showRest, setShowRest] = useState(false);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(0);
      setShowPlayers(false);
      setShowRest(false);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (index: number) => {
      if (index === -1) setActivePanel(null);
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

  const handleRequestLongRest = useCallback(() => {
    addMessage({
      id: `msg-${Date.now()}`,
      channel: "GENERAL",
      type: "text",
      content: `${sheet.name.split(",")[0]} gostaria de sugerir um descanso longo.`,
      senderName: sheet.name.split(",")[0],
      senderIcon: "sword",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setActivePanel(null);
  }, [addMessage, sheet.name, setActivePanel]);

  const handleOpenInventory = useCallback(() => {
    setActivePanel("sheet");
  }, [setActivePanel]);

  const handleLeave = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["40%", "65%"]}
      index={-1}
      enablePanDownToClose
      enableHandlePanningGesture
      enableContentPanningGesture={false}
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.outerContainer}>
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Session section */}
          <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
            Sessão
          </Text>
          <YStack gap={6} marginBottom={16}>
            <MenuItem
              icon={<Users size={16} color="#6C5CE7" />}
              label="Jogadores online"
              detail={`${onlineCount}/${totalCount}`}
              onPress={() => setShowPlayers(!showPlayers)}
            />

            {showPlayers && (
              <YStack
                backgroundColor="rgba(255,255,255,0.02)"
                borderRadius={10}
                padding={8}
                gap={6}
              >
                {onlinePlayers.map((player) => (
                  <XStack key={player.id} alignItems="center" gap={8} paddingVertical={4} paddingHorizontal={8}>
                    <Stack
                      width={24}
                      height={24}
                      borderRadius={12}
                      backgroundColor={player.role === "gm" ? "rgba(108,92,231,0.2)" : "rgba(255,255,255,0.08)"}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <User size={12} color={player.role === "gm" ? "#6C5CE7" : "#5A5A6E"} />
                    </Stack>
                    <YStack flex={1}>
                      <Text fontSize={12} fontWeight="600" color="#E8E8ED">
                        {player.name}
                      </Text>
                      {player.characterName && (
                        <Text fontSize={10} color="#5A5A6E">
                          {player.characterName}
                        </Text>
                      )}
                    </YStack>
                    <Stack
                      width={8}
                      height={8}
                      borderRadius={4}
                      backgroundColor={player.isOnline ? "#34D399" : "#5A5A6E"}
                    />
                  </XStack>
                ))}
              </YStack>
            )}

            <MenuItem
              icon={<Volume2 size={16} color="#FDCB6E" />}
              label="Áudio e efeitos sonoros"
            />

            <MenuItem
              icon={<Eye size={16} color={phaseMeta.color} />}
              label="Fase atual"
              detail={currentPhase.label}
            />
          </YStack>

          {/* Character section */}
          <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
            Personagem
          </Text>
          <YStack gap={6} marginBottom={16}>
            <MenuItem
              icon={<RefreshCw size={16} color="#34D399" />}
              label="Descanso curto"
              onPress={() => setShowRest(!showRest)}
            />

            {showRest && (
              <ShortRestModal onClose={() => setShowRest(false)} />
            )}

            <MenuItem
              icon={<Moon size={16} color="#818CF8" />}
              label="Solicitar descanso longo"
              onPress={handleRequestLongRest}
            />

            <MenuItem
              icon={<Package size={16} color="#4FC3F7" />}
              label="Inventário rápido"
              onPress={handleOpenInventory}
            />
          </YStack>

          {/* Leave section */}
          <Text fontSize={9} fontWeight="700" letterSpacing={1} color="#5A5A6E" textTransform="uppercase" marginBottom={8}>
            Sair
          </Text>
          <YStack gap={6} marginBottom={24}>
            <MenuItem
              icon={<LogOut size={16} color="#FF6B6B" />}
              label="Sair da sessão"
              danger
              onPress={handleLeave}
            />
          </YStack>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

export const MorePanel = memo(MorePanelInner);

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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
});
