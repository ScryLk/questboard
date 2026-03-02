import { memo, useCallback, useRef, useState } from "react";
import {
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, Lock, Crown } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { useGameplayStore } from "../../lib/gameplay-store";
import type { ChatMessage, ChatChannel } from "../../lib/gameplay-store";

// ─── Channel Selector ────────────────────────────────────

const CHANNELS: { key: ChatChannel; label: string }[] = [
  { key: "GENERAL", label: "Geral" },
  { key: "IN_CHARACTER", label: "IC" },
  { key: "WHISPER", label: "Sussurro" },
  { key: "GM_ONLY", label: "GM" },
];

// ─── Message Bubble ──────────────────────────────────────

const MessageBubble = memo(function MessageBubble({
  message,
}: {
  message: ChatMessage;
}) {
  if (message.type === "system") {
    return (
      <XStack
        paddingVertical={6}
        paddingHorizontal={12}
        alignItems="center"
        justifyContent="center"
        gap={6}
      >
        <Text fontSize={11} color="#5A5A6E" textAlign="center">
          {message.content}
        </Text>
      </XStack>
    );
  }

  if (message.type === "narrative") {
    return (
      <YStack
        backgroundColor="rgba(108, 92, 231, 0.08)"
        paddingVertical={10}
        paddingHorizontal={16}
        marginVertical={2}
      >
        <Text
          fontSize={13}
          color="#9090A0"
          fontStyle="italic"
          lineHeight={20}
          textAlign="center"
        >
          {message.content}
        </Text>
      </YStack>
    );
  }

  if (message.type === "dice_roll" && message.diceResult) {
    return (
      <YStack
        backgroundColor="#16161C"
        borderRadius={10}
        borderWidth={1}
        borderColor="#2A2A35"
        padding={12}
        marginHorizontal={12}
        marginVertical={4}
        gap={4}
      >
        <XStack alignItems="center" gap={6}>
          <Text fontSize={16}>{message.senderEmoji}</Text>
          <Text fontSize={12} fontWeight="600" color="#E8E8ED">
            {message.senderName}
          </Text>
          <Text fontSize={10} color="#5A5A6E">
            {message.timestamp}
          </Text>
        </XStack>
        {message.diceResult.label && (
          <Text fontSize={11} color="#9090A0">
            {message.diceResult.label}
          </Text>
        )}
        <XStack alignItems="baseline" gap={8}>
          <Text fontSize={28} fontWeight="800" color="#6C5CE7">
            {message.diceResult.total}
          </Text>
          <Text fontSize={12} color="#5A5A6E">
            {message.diceResult.formula} [{message.diceResult.rolls.join(", ")}]
          </Text>
        </XStack>
      </YStack>
    );
  }

  const isWhisper = message.type === "whisper";
  const isIC = message.type === "in_character";
  const isGMOnly = message.type === "gm_only";

  return (
    <XStack
      paddingHorizontal={12}
      paddingVertical={4}
      gap={8}
      backgroundColor={
        isWhisper
          ? "rgba(108, 92, 231, 0.06)"
          : isGMOnly
            ? "rgba(253, 203, 110, 0.06)"
            : "transparent"
      }
    >
      <Text fontSize={18} marginTop={2}>
        {message.senderEmoji}
      </Text>
      <YStack flex={1} gap={2}>
        <XStack alignItems="center" gap={6}>
          <Text fontSize={12} fontWeight="600" color="#E8E8ED">
            {message.senderName}
          </Text>
          {isIC && message.characterName && (
            <Text fontSize={11} color="#6C5CE7" fontStyle="italic">
              como {message.characterName}
            </Text>
          )}
          {isWhisper && <Lock size={10} color="#6C5CE7" />}
          {isGMOnly && <Crown size={10} color="#FDCB6E" />}
          <Text fontSize={10} color="#5A5A6E">
            {message.timestamp}
          </Text>
        </XStack>
        <Text
          fontSize={13}
          color={isIC ? "#B8B8C8" : "#E8E8ED"}
          fontStyle={isIC ? "italic" : "normal"}
          lineHeight={18}
        >
          {message.content}
        </Text>
        {isWhisper && message.targetName && (
          <Text fontSize={10} color="#5A5A6E">
            Para {message.targetName}
          </Text>
        )}
      </YStack>
    </XStack>
  );
});

// ─── Chat Panel ──────────────────────────────────────────

function ChatPanelInner() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const [inputText, setInputText] = useState("");

  const messages = useGameplayStore((s) => s.messages);
  const activeChannel = useGameplayStore((s) => s.activeChannel);
  const setActiveChannel = useGameplayStore((s) => s.setActiveChannel);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const setActivePanel = useGameplayStore((s) => s.setActivePanel);
  const clearUnread = useGameplayStore((s) => s.clearUnread);

  // Filter messages by channel (SYSTEM shows everywhere)
  const filtered = messages.filter(
    (m) => m.channel === activeChannel || m.channel === "SYSTEM",
  );

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channel: activeChannel,
      type: activeChannel === "IN_CHARACTER" ? "in_character" : "text",
      content: inputText.trim(),
      senderName: "Você",
      senderEmoji: "👤",
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    addMessage(msg);
    setInputText("");
  }, [inputText, activeChannel, addMessage]);

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

  const renderHeader = useCallback(
    () => (
      <XStack paddingHorizontal={12} gap={6} marginBottom={8}>
        {CHANNELS.map((ch) => {
          const isActive = activeChannel === ch.key;
          return (
            <Stack
              key={ch.key}
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius={8}
              backgroundColor={isActive ? "#6C5CE7" : "#1A1A24"}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => {
                setActiveChannel(ch.key);
                clearUnread();
              }}
            >
              <Text
                fontSize={12}
                fontWeight="600"
                color={isActive ? "white" : "#5A5A6E"}
              >
                {ch.label}
              </Text>
            </Stack>
          );
        })}
      </XStack>
    ),
    [activeChannel, setActiveChannel, clearUnread],
  );

  const renderFooter = useCallback(
    () => (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <XStack
          paddingHorizontal={12}
          paddingVertical={8}
          gap={8}
          borderTopWidth={StyleSheet.hairlineWidth}
          borderTopColor="#2A2A35"
          alignItems="center"
        >
          <Stack
            flex={1}
            backgroundColor="#12121A"
            borderRadius={10}
            borderWidth={1}
            borderColor="#2A2A35"
            paddingHorizontal={12}
            paddingVertical={8}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Enviar mensagem..."
              placeholderTextColor="#5A5A6E"
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </Stack>
          <Stack
            width={38}
            height={38}
            borderRadius={19}
            backgroundColor={inputText.trim() ? "#6C5CE7" : "#1A1A24"}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={handleSend}
          >
            <Send size={16} color={inputText.trim() ? "white" : "#5A5A6E"} />
          </Stack>
        </XStack>
      </KeyboardAvoidingView>
    ),
    [inputText, handleSend],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={["35%", "60%", "88%"]}
      index={0}
      bottomInset={56 + insets.bottom}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableHandlePanningGesture={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      overDragResistanceFactor={2.5}
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.sheetContent}>
        {renderHeader()}
        <BottomSheetFlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ paddingBottom: 80 }}
          style={{ flex: 1 }}
          nestedScrollEnabled={true}
        />
        {renderFooter()}
      </View>
    </BottomSheet>
  );
}

export const ChatPanel = memo(ChatPanelInner);

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
  sheetContent: {
    flex: 1,
    paddingTop: 4,
  },
  input: {
    color: "#E8E8ED",
    fontSize: 14,
    padding: 0,
  },
});
