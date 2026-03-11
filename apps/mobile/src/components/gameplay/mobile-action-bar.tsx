import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Heart,
  MessageSquare,
  ScrollText,
  Settings,
  Shield,
  Sword,
  Swords,
  Target,
  Zap,
} from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

interface MobileActionBarProps {
  onActionPress?: () => void;
  onBonusPress?: () => void;
  onSpellPress?: () => void;
}

function MobileActionBarInner({ onActionPress, onBonusPress, onSpellPress }: MobileActionBarProps) {
  const insets = useSafeAreaInsets();
  const combatActive = useGameplayStore((s) => s.combatActive);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const participants = useGameplayStore((s) => s.combatParticipants);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const activePanel = useGameplayStore((s) => s.activePanel);
  const nextTurn = useGameplayStore((s) => s.nextTurn);
  const openSettingsModal = useGameplayStore((s) => s.openSettingsModal);

  const isGM = useGameplayStore((s) => s.isGM);
  const openGMToolView = useGameplayStore((s) => s.openGMToolView);

  const currentParticipant = participants[currentTurnIndex];
  const isMyTurn = combatActive && currentParticipant?.tokenId === myTokenId;

  const togglePanel = (panel: "chat" | "dice" | "sheet") => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };

  // ── Not in combat ──
  if (!combatActive) {
    return (
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="rgba(10, 10, 15, 0.92)"
        borderTopWidth={StyleSheet.hairlineWidth}
        borderTopColor="rgba(255,255,255,0.08)"
        paddingBottom={insets.bottom || 8}
        zIndex={50}
      >
        <XStack height={52} alignItems="center" justifyContent="space-around" paddingHorizontal={8}>
          {isGM && (
            <ActionButton
              icon={<Swords size={20} color="#FF6B6B" />}
              label="Combate"
              onPress={() => openGMToolView("combat-manager")}
            />
          )}
          <ActionButton
            icon={<MessageSquare size={20} color={activePanel === "chat" ? "#6C5CE7" : "#9090A0"} />}
            label="Chat"
            active={activePanel === "chat"}
            onPress={() => togglePanel("chat")}
          />
          <ActionButton
            icon={<ScrollText size={20} color={activePanel === "sheet" ? "#6C5CE7" : "#9090A0"} />}
            label="Ficha"
            active={activePanel === "sheet"}
            onPress={() => togglePanel("sheet")}
          />
          <ActionButton
            icon={<Settings size={20} color="#9090A0" />}
            label="Config"
            onPress={openSettingsModal}
          />
        </XStack>
      </YStack>
    );
  }

  // ── Combat: My turn ──
  if (isMyTurn) {
    return (
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="rgba(10, 10, 15, 0.92)"
        borderTopWidth={StyleSheet.hairlineWidth}
        borderTopColor="rgba(108, 92, 231, 0.3)"
        paddingBottom={insets.bottom || 8}
        zIndex={50}
      >
        {/* Action buttons row */}
        <XStack height={52} alignItems="center" justifyContent="space-around" paddingHorizontal={4}>
          <ActionButton
            icon={<Sword size={20} color="#FF6B6B" />}
            label="Ação"
            accent
            onPress={onActionPress}
          />
          <ActionButton
            icon={<Zap size={20} color="#FDCB6E" />}
            label="Bônus"
            onPress={onBonusPress}
          />
          <ActionButton
            icon={<Shield size={20} color="#4FC3F7" />}
            label="Reação"
          />
          <ActionButton
            icon={<MessageSquare size={20} color={activePanel === "chat" ? "#6C5CE7" : "#9090A0"} />}
            label="Chat"
            active={activePanel === "chat"}
            onPress={() => togglePanel("chat")}
          />
        </XStack>

        {/* Status bar */}
        <XStack
          height={36}
          alignItems="center"
          paddingHorizontal={12}
          gap={8}
        >
          {/* HP */}
          <XStack alignItems="center" gap={4} backgroundColor="rgba(255, 107, 107, 0.1)" paddingHorizontal={8} paddingVertical={4} borderRadius={6}>
            <Heart size={12} color="#FF6B6B" fill="#FF6B6B" />
            <Text fontSize={12} fontWeight="700" color="#FF6B6B">
              25/32
            </Text>
          </XStack>

          {/* AC */}
          <XStack alignItems="center" gap={4} backgroundColor="rgba(79, 195, 247, 0.1)" paddingHorizontal={8} paddingVertical={4} borderRadius={6}>
            <Shield size={12} color="#4FC3F7" />
            <Text fontSize={12} fontWeight="700" color="#4FC3F7">
              15
            </Text>
          </XStack>

          {/* Speed */}
          <Text fontSize={11} color="#5A5A6E">
            30ft
          </Text>

          <XStack flex={1} />

          {/* End turn button */}
          <Stack
            height={28}
            paddingHorizontal={12}
            borderRadius={6}
            backgroundColor="rgba(255, 68, 68, 0.15)"
            borderWidth={1}
            borderColor="rgba(255, 68, 68, 0.3)"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            pressStyle={{ opacity: 0.7 }}
            onPress={nextTurn}
          >
            <XStack alignItems="center" gap={4}>
              <Target size={12} color="#FF6B6B" />
              <Text fontSize={11} fontWeight="700" color="#FF6B6B">
                Fim
              </Text>
            </XStack>
          </Stack>
        </XStack>
      </YStack>
    );
  }

  // ── Combat: Not my turn ──
  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="rgba(10, 10, 15, 0.92)"
      borderTopWidth={StyleSheet.hairlineWidth}
      borderTopColor="rgba(255,255,255,0.08)"
      paddingBottom={insets.bottom || 8}
      zIndex={50}
    >
      <XStack height={52} alignItems="center" justifyContent="space-around" paddingHorizontal={8}>
        <ActionButton
          icon={<Shield size={20} color="#4FC3F7" />}
          label="Reação"
        />
        <ActionButton
          icon={<MessageSquare size={20} color={activePanel === "chat" ? "#6C5CE7" : "#9090A0"} />}
          label="Chat"
          active={activePanel === "chat"}
          onPress={() => togglePanel("chat")}
        />
        <ActionButton
          icon={<ScrollText size={20} color={activePanel === "sheet" ? "#6C5CE7" : "#9090A0"} />}
          label="Ficha"
          active={activePanel === "sheet"}
          onPress={() => togglePanel("sheet")}
        />
      </XStack>

      <XStack height={28} alignItems="center" paddingHorizontal={12}>
        <XStack alignItems="center" gap={4} backgroundColor="rgba(255, 107, 107, 0.1)" paddingHorizontal={8} paddingVertical={3} borderRadius={6}>
          <Heart size={11} color="#FF6B6B" fill="#FF6B6B" />
          <Text fontSize={11} fontWeight="700" color="#FF6B6B">
            25/32
          </Text>
        </XStack>
        <XStack flex={1} />
        <Text fontSize={11} color="#5A5A6E">
          Turno de: {currentParticipant?.name ?? "..."}
        </Text>
      </XStack>
    </YStack>
  );
}

// ── Action Button ──

function ActionButton({
  icon,
  label,
  active,
  accent,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  accent?: boolean;
  onPress?: () => void;
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={12}
      paddingVertical={4}
      borderRadius={8}
      backgroundColor={active ? "rgba(108, 92, 231, 0.12)" : "transparent"}
      cursor="pointer"
      pressStyle={{ opacity: 0.6 }}
      onPress={onPress}
    >
      {icon}
      <Text
        fontSize={10}
        fontWeight="600"
        color={active ? "#6C5CE7" : accent ? "#FF6B6B" : "#5A5A6E"}
        marginTop={2}
      >
        {label}
      </Text>
    </Stack>
  );
}

export const MobileActionBar = memo(MobileActionBarInner) as React.MemoExoticComponent<React.FC<MobileActionBarProps>>;
