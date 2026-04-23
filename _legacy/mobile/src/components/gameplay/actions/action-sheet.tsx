import { memo, useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  ArrowDownLeft,
  Eye,
  EyeOff,
  Footprints,
  HandHelping,
  Shield,
  Sparkles,
  Sword,
  Timer,
  Package,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Stack, Text, XStack, YStack } from "tamagui";

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
  weapons?: { id: string; name: string; bonus: string; damage: string }[];
}

const STANDARD_ACTIONS = [
  { id: "cast-spell", icon: Sparkles, label: "Conjurar Magia", desc: "Usar uma magia do seu grimório", color: "#6C5CE7" },
  { id: "dash", icon: Footprints, label: "Dash", desc: "Dobrar seu movimento neste turno", color: "#00B894" },
  { id: "dodge", icon: Shield, label: "Dodge", desc: "Ataques contra você têm desvantagem", color: "#4FC3F7" },
  { id: "help", icon: HandHelping, label: "Help", desc: "Dar vantagem a um aliado", color: "#FDCB6E" },
  { id: "hide", icon: EyeOff, label: "Hide", desc: "Fazer teste de furtividade", color: "#9090A0" },
  { id: "search", icon: Eye, label: "Search", desc: "Fazer teste de percepção", color: "#FF9F43" },
  { id: "disengage", icon: ArrowDownLeft, label: "Disengage", desc: "Mover sem provocar OA", color: "#74B9FF" },
  { id: "ready", icon: Timer, label: "Preparar Ação", desc: "Definir um gatilho para agir", color: "#FDCB6E" },
  { id: "use-item", icon: Package, label: "Usar Item", desc: "Usar um item do inventário", color: "#A29BFE" },
];

function ActionSheetInner({ isOpen, onClose, onSelectAction, weapons = [] }: ActionSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (actionId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelectAction(actionId);
      onClose();
    },
    [onSelectAction, onClose],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
    ),
    [],
  );

  // Mock weapons if none provided
  const displayWeapons = weapons.length > 0 ? weapons : [
    { id: "w1", name: "Espada Longa", bonus: "+7", damage: "1d8+4 cortante" },
    { id: "w2", name: "Arco Curto", bonus: "+5", damage: "1d6+3 perfurante" },
  ];

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={["70%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <XStack alignItems="center" gap={8} marginBottom={16}>
          <Sword size={18} color="#FF6B6B" />
          <Text fontSize={17} fontWeight="700" color="#E8E8ED">
            AÇÃO
          </Text>
        </XStack>

        {/* Attack weapons */}
        {displayWeapons.map((w) => (
          <Stack
            key={w.id}
            height={60}
            borderRadius={12}
            backgroundColor="rgba(255, 107, 107, 0.08)"
            borderWidth={1}
            borderColor="rgba(255, 107, 107, 0.15)"
            paddingHorizontal={16}
            justifyContent="center"
            marginBottom={8}
            cursor="pointer"
            pressStyle={{ opacity: 0.7, scale: 0.98 }}
            onPress={() => handleSelect(`attack:${w.id}`)}
          >
            <XStack alignItems="center" gap={12}>
              <Sword size={18} color="#FF6B6B" />
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="600" color="#E8E8ED">
                  Atacar ({w.name})
                </Text>
                <Text fontSize={12} color="#9090A0">
                  {w.bonus}, {w.damage}
                </Text>
              </YStack>
            </XStack>
          </Stack>
        ))}

        {/* Separator */}
        <View style={styles.separator} />

        {/* Standard actions */}
        {STANDARD_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Stack
              key={action.id}
              height={56}
              borderRadius={12}
              backgroundColor="rgba(255, 255, 255, 0.03)"
              paddingHorizontal={16}
              justifyContent="center"
              marginBottom={6}
              cursor="pointer"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => handleSelect(action.id)}
            >
              <XStack alignItems="center" gap={12}>
                <Icon size={18} color={action.color} />
                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="600" color="#E8E8ED">
                    {action.label}
                  </Text>
                  <Text fontSize={11} color="#5A5A6E">
                    {action.desc}
                  </Text>
                </YStack>
              </XStack>
            </Stack>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export const ActionSheet = memo(ActionSheetInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#16161C",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleIndicator: {
    backgroundColor: "#3A3A4E",
    width: 36,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: "#2A2A35",
    marginVertical: 12,
  },
});
