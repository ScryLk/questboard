import { memo, useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  Flame,
  HeartPulse,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Stack, Text, XStack, YStack } from "tamagui";

interface BonusActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

const BONUS_ACTIONS = [
  { id: "offhand-attack", icon: Swords, label: "Ataque Secundário", desc: "Ataque com arma leve na mão secundária", color: "#FF6B6B" },
  { id: "bonus-spell", icon: Sparkles, label: "Magia Bônus", desc: "Conjurar magia com tempo de lançamento bônus", color: "#6C5CE7" },
  { id: "healing-word", icon: HeartPulse, label: "Healing Word", desc: "1d4+4 cura · 60ft · Slot Nv.1", color: "#00B894" },
  { id: "misty-step", icon: Zap, label: "Misty Step", desc: "Teleportar 30ft · Slot Nv.2", color: "#74B9FF" },
  { id: "rage", icon: Flame, label: "Rage", desc: "Entrar em fúria (Bárbaro)", color: "#FF4444" },
];

function BonusActionSheetInner({ isOpen, onClose, onSelectAction }: BonusActionSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (isOpen) sheetRef.current?.snapToIndex(0);
    else sheetRef.current?.close();
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

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={["50%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <XStack alignItems="center" gap={8} marginBottom={16}>
          <Zap size={18} color="#FDCB6E" />
          <Text fontSize={17} fontWeight="700" color="#E8E8ED">
            AÇÃO BÔNUS
          </Text>
        </XStack>

        {BONUS_ACTIONS.map((action) => {
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

export const BonusActionSheet = memo(BonusActionSheetInner);

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
});
