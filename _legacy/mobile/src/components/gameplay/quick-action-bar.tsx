import { memo } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MessageSquare,
  Dices,
  BookOpen,
  ScrollText,
  Sword,
  MoreHorizontal,
} from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import type { PanelType } from "../../lib/gameplay-store";

interface ActionItem {
  key: PanelType;
  label: string;
  Icon: typeof MessageSquare;
  badgeKey?: "chatUnreadCount";
  showTurnBadge?: boolean;
}

const GM_ACTIONS: ActionItem[] = [
  { key: "chat", label: "Chat", Icon: MessageSquare, badgeKey: "chatUnreadCount" },
  { key: "dice", label: "Dados", Icon: Dices },
  { key: "sheet", label: "Ficha", Icon: BookOpen },
  { key: "gmtools", label: "Mais", Icon: MoreHorizontal },
];

const PLAYER_ACTIONS: ActionItem[] = [
  { key: "chat", label: "Chat", Icon: MessageSquare, badgeKey: "chatUnreadCount" },
  { key: "dice", label: "Dados", Icon: Dices },
  { key: "sheet", label: "Ficha", Icon: ScrollText },
  { key: "actions", label: "Ações", Icon: Sword, showTurnBadge: true },
  { key: "more", label: "Mais", Icon: MoreHorizontal },
];

function QuickActionBarInner() {
  const insets = useSafeAreaInsets();
  const activePanel = useGameplayStore((s) => s.activePanel);
  const chatUnreadCount = useGameplayStore((s) => s.chatUnreadCount);
  const combatActive = useGameplayStore((s) => s.combatActive);
  const currentTurnIndex = useGameplayStore((s) => s.currentTurnIndex);
  const participants = useGameplayStore((s) => s.combatParticipants);
  const myTokenId = useGameplayStore((s) => s.myTokenId);
  const isGM = useGameplayStore((s) => s.isGM);
  const togglePanel = useGameplayStore((s) => s.togglePanel);

  const isMyTurn =
    combatActive &&
    participants.length > 0 &&
    participants[currentTurnIndex]?.tokenId === myTokenId;

  const actions = isGM ? GM_ACTIONS : PLAYER_ACTIONS;

  return (
    <XStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      height={56 + insets.bottom}
      paddingBottom={insets.bottom}
      paddingHorizontal={16}
      backgroundColor={activePanel ? "rgba(10, 10, 15, 0.5)" : "rgba(10, 10, 15, 0.9)"}
      alignItems="flex-start"
      justifyContent="space-around"
      paddingTop={8}
      zIndex={50}
      borderTopWidth={StyleSheet.hairlineWidth}
      borderTopColor="rgba(255,255,255,0.06)"
    >
      {actions.map((action) => {
        const isActive = activePanel === action.key;
        const badge =
          action.badgeKey === "chatUnreadCount" ? chatUnreadCount : 0;
        const iconColor = isActive ? "#6C5CE7" : "#5A5A6E";

        return (
          <Stack
            key={action.key}
            width={56}
            height={44}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.6, scale: 0.95 }}
            onPress={() => togglePanel(action.key)}
          >
            <Stack position="relative">
              <action.Icon size={22} color={iconColor} />
              {/* Unread badge */}
              {badge > 0 && (
                <Stack
                  position="absolute"
                  top={-4}
                  right={-6}
                  minWidth={14}
                  height={14}
                  borderRadius={7}
                  backgroundColor="#FF3B30"
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal={3}
                >
                  <Text fontSize={9} fontWeight="700" color="white">
                    {badge > 9 ? "9+" : badge}
                  </Text>
                </Stack>
              )}
              {/* Turn badge on Actions button */}
              {action.showTurnBadge && isMyTurn && (
                <Stack
                  position="absolute"
                  top={-3}
                  right={-5}
                  width={8}
                  height={8}
                  borderRadius={4}
                  backgroundColor="#FF6B6B"
                />
              )}
            </Stack>
            <Text
              fontSize={10}
              color={isActive ? "#6C5CE7" : "#5A5A6E"}
              marginTop={2}
            >
              {action.label}
            </Text>
          </Stack>
        );
      })}
    </XStack>
  );
}

export const QuickActionBar = memo(QuickActionBarInner);
