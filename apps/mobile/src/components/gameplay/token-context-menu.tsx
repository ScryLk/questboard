import { memo, useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import {
  Heart,
  Eye,
  EyeOff,
  Trash2,
  Dices,
  Crosshair,
} from "lucide-react-native";
import { Stack, Text, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";

interface MenuItem {
  label: string;
  Icon: typeof Heart;
  color: string;
  action: () => void;
}

function TokenContextMenuInner() {
  const tokenId = useGameplayStore((s) => s.contextMenuTokenId);
  const position = useGameplayStore((s) => s.contextMenuPosition);
  const tokens = useGameplayStore((s) => s.tokens);
  const isGM = useGameplayStore((s) => s.isGM);
  const hideContextMenu = useGameplayStore((s) => s.hideContextMenu);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const removeToken = useGameplayStore((s) => s.removeToken);
  const showDiceResult = useGameplayStore((s) => s.showDiceResult);
  const addMessage = useGameplayStore((s) => s.addMessage);

  const handleRollInitiative = useCallback(() => {
    if (!tokenId) return;
    const token = tokens[tokenId];
    if (!token) return;

    const roll = Math.floor(Math.random() * 20) + 1;
    showDiceResult({
      rollerName: token.name,
      rollerEmoji: token.emoji,
      label: "Iniciativa",
      formula: "1d20",
      rolls: [roll],
      total: roll,
      isNat20: roll === 20,
      isNat1: roll === 1,
    });

    addMessage({
      id: `msg-${Date.now()}`,
      channel: "GENERAL",
      type: "dice_roll",
      content: "Iniciativa",
      senderName: token.name,
      senderEmoji: token.emoji,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      diceResult: {
        formula: "1d20",
        rolls: [roll],
        total: roll,
        label: "Iniciativa",
      },
    });

    hideContextMenu();
  }, [tokenId, tokens, showDiceResult, addMessage, hideContextMenu]);

  const handleHeal = useCallback(() => {
    if (tokenId) updateTokenHp(tokenId, 5);
    hideContextMenu();
  }, [tokenId, updateTokenHp, hideContextMenu]);

  const handleDamage = useCallback(() => {
    if (tokenId) updateTokenHp(tokenId, -5);
    hideContextMenu();
  }, [tokenId, updateTokenHp, hideContextMenu]);

  const handleRemove = useCallback(() => {
    if (tokenId) removeToken(tokenId);
    hideContextMenu();
  }, [tokenId, removeToken, hideContextMenu]);

  if (!tokenId || !position) return null;

  const token = tokens[tokenId];
  if (!token) return null;

  const items: MenuItem[] = [
    {
      label: "Rolar Iniciativa",
      Icon: Dices,
      color: "#6C5CE7",
      action: handleRollInitiative,
    },
    {
      label: "Curar (+5 PV)",
      Icon: Heart,
      color: "#00B894",
      action: handleHeal,
    },
    {
      label: "Dano (-5 PV)",
      Icon: Crosshair,
      color: "#FF6B6B",
      action: handleDamage,
    },
  ];

  if (isGM) {
    items.push({
      label: "Remover",
      Icon: Trash2,
      color: "#FF6B6B",
      action: handleRemove,
    });
  }

  return (
    <Pressable style={styles.backdrop} onPress={hideContextMenu}>
      <YStack
        position="absolute"
        left={Math.min(position.x, 220)}
        top={Math.min(position.y, 500)}
        backgroundColor="#16161C"
        borderRadius={12}
        borderWidth={1}
        borderColor="#2A2A35"
        padding={4}
        minWidth={180}
        zIndex={150}
      >
        {/* Token header */}
        <Stack
          paddingHorizontal={12}
          paddingVertical={8}
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderBottomColor="#2A2A35"
        >
          <Text fontSize={13} fontWeight="700" color="#E8E8ED">
            {token.emoji} {token.name}
          </Text>
          {token.hp && (
            <Text fontSize={11} color="#5A5A6E">
              PV: {token.hp.current}/{token.hp.max}
            </Text>
          )}
        </Stack>

        {/* Menu items */}
        {items.map((item) => (
          <Stack
            key={item.label}
            paddingHorizontal={12}
            paddingVertical={10}
            borderRadius={8}
            pressStyle={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            onPress={item.action}
          >
            <Stack flexDirection="row" alignItems="center" gap={10}>
              <item.Icon size={16} color={item.color} />
              <Text fontSize={13} color="#E8E8ED">
                {item.label}
              </Text>
            </Stack>
          </Stack>
        ))}
      </YStack>
    </Pressable>
  );
}

export const TokenContextMenu = memo(TokenContextMenuInner);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 149,
  },
});
