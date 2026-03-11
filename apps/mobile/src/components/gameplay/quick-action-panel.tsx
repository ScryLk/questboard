import { memo, useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  ArrowDownLeft,
  Footprints,
  HandHelping,
  Package,
  Shield,
  Sparkles,
  Sword,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useCombatStore } from "../../stores/combatStore";
import { INCAPACITATING_CONDITIONS, type Condition } from "../../types/combat";

// ─── Action Definitions ──────────────────────────────────

interface ActionDef {
  id: string;
  icon: typeof Sword;
  label: string;
  subtitle: string;
  requires: "action" | "bonusAction" | "reaction" | "free";
  color: string;
}

const QUICK_ACTIONS: ActionDef[] = [
  {
    id: "attack",
    icon: Sword,
    label: "Atacar",
    subtitle: "Requer: Ação",
    requires: "action",
    color: "#FF6B6B",
  },
  {
    id: "cast-spell",
    icon: Sparkles,
    label: "Conjurar Magia",
    subtitle: "Requer: Ação",
    requires: "action",
    color: "#6C5CE7",
  },
  {
    id: "dash",
    icon: Footprints,
    label: "Dash",
    subtitle: "Requer: Ação",
    requires: "action",
    color: "#00B894",
  },
  {
    id: "dodge",
    icon: Shield,
    label: "Esquivar",
    subtitle: "Requer: Ação",
    requires: "action",
    color: "#4FC3F7",
  },
  {
    id: "help",
    icon: HandHelping,
    label: "Ajudar",
    subtitle: "Requer: Ação",
    requires: "action",
    color: "#FDCB6E",
  },
  {
    id: "use-item",
    icon: Package,
    label: "Usar Item",
    subtitle: "Requer: Ação",
    requires: "action",
    color: "#A29BFE",
  },
  {
    id: "disengage",
    icon: ArrowDownLeft,
    label: "Disengage",
    subtitle: "Requer: Ação",
    requires: "action",
    color: "#74B9FF",
  },
];

// ─── Component ───────────────────────────────────────────

interface QuickActionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  combatantId: string;
}

function QuickActionPanelInner({
  isOpen,
  onClose,
  combatantId,
}: QuickActionPanelProps) {
  const sheetRef = useRef<BottomSheet>(null);

  const combatant = useCombatStore((s) =>
    s.combatants.find((c) => c.id === combatantId),
  );
  const round = useCombatStore((s) => s.round);
  const storeUseAction = useCombatStore((s) => s.useAction);
  const storeUseBonusAction = useCombatStore((s) => s.useBonusAction);
  const storeUseReaction = useCombatStore((s) => s.useReaction);
  const storeToggleDash = useCombatStore((s) => s.toggleDash);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.3}
      />
    ),
    [],
  );

  const handleSelect = useCallback(
    (action: ActionDef) => {
      if (!combatant) return;

      const ae = combatant.resources.actionEconomy;

      // Check if the required resource is available
      if (action.requires === "action" && ae.action) return;
      if (action.requires === "bonusAction" && ae.bonusAction) return;
      if (action.requires === "reaction" && ae.reaction) return;

      // Mark the resource as used
      if (action.requires === "action") {
        storeUseAction(combatantId);
      } else if (action.requires === "bonusAction") {
        storeUseBonusAction(combatantId);
      } else if (action.requires === "reaction") {
        storeUseReaction(combatantId);
      }

      // Special: Dash also toggles isDashing
      if (action.id === "dash") {
        storeToggleDash(combatantId);
      }

      onClose();
    },
    [
      combatant,
      combatantId,
      storeUseAction,
      storeUseBonusAction,
      storeUseReaction,
      storeToggleDash,
      onClose,
    ],
  );

  if (!combatant) return null;

  const ae = combatant.resources.actionEconomy;
  const r = combatant.resources;
  const isIncapacitated = r.conditions.some((c) =>
    INCAPACITATING_CONDITIONS.includes(c as Condition),
  );
  const available = ae.isDashing
    ? ae.movementMax * 2 - ae.movementUsed
    : ae.movementMax - ae.movementUsed;

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={["45%"]}
      index={-1}
      enablePanDownToClose
      enableContentPanningGesture={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      onChange={(i) => {
        if (i === -1) onClose();
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom={12}>
          <YStack>
            <Text fontSize={14} fontWeight="700" color="#E8E8ED">
              Suas Ações
            </Text>
            <Text fontSize={11} color="#5A5A6E">
              Rodada {round}
            </Text>
          </YStack>
          <Text fontSize={11} color="#9090A0">
            Movimento: {available} quadrados
          </Text>
        </XStack>

        {/* Action grid */}
        <XStack flexWrap="wrap" gap={8}>
          {QUICK_ACTIONS.map((action) => {
            const isUsed =
              (action.requires === "action" && ae.action) ||
              (action.requires === "bonusAction" && ae.bonusAction) ||
              (action.requires === "reaction" && ae.reaction);
            const disabled = isUsed || isIncapacitated;
            const Icon = action.icon;

            return (
              <Stack
                key={action.id}
                width="47%"
                paddingHorizontal={12}
                paddingVertical={10}
                borderRadius={8}
                backgroundColor={disabled ? "#1C1C24" : "rgba(108, 92, 231, 0.08)"}
                borderWidth={1}
                borderColor={disabled ? "#2A2A35" : "rgba(108, 92, 231, 0.2)"}
                opacity={disabled ? 0.4 : 1}
                pressStyle={disabled ? undefined : { opacity: 0.7 }}
                onPress={() => {
                  if (!disabled) handleSelect(action);
                }}
              >
                <XStack alignItems="center" gap={8}>
                  <Icon size={16} color={disabled ? "#5A5A6E" : action.color} />
                  <YStack>
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={disabled ? "#5A5A6E" : "#E8E8ED"}
                    >
                      {action.label}
                    </Text>
                    <Text fontSize={9} color="#5A5A6E">
                      {action.subtitle}
                    </Text>
                  </YStack>
                </XStack>
              </Stack>
            );
          })}
        </XStack>

        {/* Resources status */}
        <YStack marginTop={16} gap={6}>
          <Text fontSize={11} fontWeight="600" color="#5A5A6E">
            Recursos disponíveis:
          </Text>
          <XStack gap={8}>
            <ResourceDot label="Ação" used={ae.action} disabled={isIncapacitated} />
            <ResourceDot label="Bônus" used={ae.bonusAction} disabled={isIncapacitated} />
            <ResourceDot label="Reação" used={ae.reaction} disabled={isIncapacitated} />
          </XStack>
        </YStack>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function ResourceDot({
  label,
  used,
  disabled,
}: {
  label: string;
  used: boolean;
  disabled: boolean;
}) {
  return (
    <XStack alignItems="center" gap={4}>
      <Stack
        width={10}
        height={10}
        borderRadius={5}
        backgroundColor={
          disabled
            ? "#FF6B6B"
            : used
              ? "#5A5A6E"
              : "#6C5CE7"
        }
      />
      <Text fontSize={10} color={used ? "#5A5A6E" : "#E8E8ED"}>
        {label}
      </Text>
    </XStack>
  );
}

export const QuickActionPanel = memo(QuickActionPanelInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#16161C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A2A35",
  },
  handle: {
    backgroundColor: "#5A5A6E",
    width: 40,
    height: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
