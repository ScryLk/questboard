import { useState, useCallback, useRef } from "react";
import { TextInput, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Keyboard as KeyboardIcon, LogIn, QrCode } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Button } from "../../components/button";
import { QRScanner } from "../../components/qr/qr-scanner";
import { useCampaignStore } from "../../lib/campaign-store";
import {
  normalizeCode,
  detectCodeType,
  formatDisplayCode,
  isCodeComplete,
} from "../../lib/join-utils";
import { useToast } from "../../lib/toast-context";

type JoinTab = "code" | "scan";

export default function JoinScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const resolveCode = useCampaignStore((s) => s.resolveCode);
  const joinLoading = useCampaignStore((s) => s.joinLoading);
  const joinError = useCampaignStore((s) => s.joinError);
  const clearJoinError = useCampaignStore((s) => s.clearJoinError);

  const [activeTab, setActiveTab] = useState<JoinTab>("code");
  const [rawCode, setRawCode] = useState("");
  const inputRef = useRef<TextInput>(null);

  const normalized = normalizeCode(rawCode);
  const codeType = detectCodeType(normalized);
  const displayCode = formatDisplayCode(rawCode);
  const isComplete = isCodeComplete(rawCode);

  const handleChangeText = useCallback(
    (text: string) => {
      clearJoinError();
      setRawCode(text);
    },
    [clearJoinError],
  );

  const submitCode = useCallback(
    async (code: string) => {
      Keyboard.dismiss();
      const result = await resolveCode(code);
      if (!result) return;

      if (result.type === "campaign") {
        router.push({
          pathname: "/(app)/join-preview",
          params: { campaignId: result.id },
        });
      } else if (result.type === "session") {
        if (result.status === "LIVE" || result.status === "LOBBY") {
          router.push(`/(app)/sessions/${result.id}/select-character`);
        } else if (result.status === "SCHEDULED") {
          showToast("info", "Sessao agendada. Voce sera notificado quando comecar.");
          router.back();
        } else if (result.status === "COMPLETED") {
          useCampaignStore.setState({
            joinError: "Esta sessao ja foi encerrada",
          });
        } else {
          router.push(`/(app)/sessions/${result.id}/select-character`);
        }
      }
    },
    [resolveCode, router, showToast],
  );

  const handleSubmit = useCallback(async () => {
    if (!isComplete) return;
    const formatted = formatDisplayCode(rawCode);
    await submitCode(formatted);
  }, [isComplete, rawCode, submitCode]);

  const handleQRScanned = useCallback(
    async (code: string) => {
      // Auto-format if needed
      const formatted = formatDisplayCode(code);
      await submitCode(formatted);
    },
    [submitCode],
  );

  const hintText =
    codeType === "campaign"
      ? "Campanha detectada"
      : codeType === "session"
        ? "Sessao detectada"
        : null;

  const hintColor =
    codeType === "campaign" ? "#6C5CE7" : codeType === "session" ? "#00CEC9" : "#5A5A6E";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      {/* Header */}
      <XStack alignItems="center" paddingHorizontal={16} height={56}>
        <Stack
          onPress={() => router.back()}
          hitSlop={12}
          padding={8}
          borderRadius={12}
          pressStyle={{ backgroundColor: "$border" }}
        >
          <ArrowLeft size={22} color="#E8E8ED" />
        </Stack>
        <Text flex={1} textAlign="center" fontSize={18} fontWeight="600" color="$textPrimary">
          Entrar
        </Text>
        <Stack width={38} />
      </XStack>

      {/* Tab toggle */}
      <XStack
        marginHorizontal={16}
        marginBottom={16}
        borderRadius={12}
        backgroundColor="rgba(255,255,255,0.06)"
        padding={3}
      >
        <Stack
          flex={1}
          paddingVertical={10}
          borderRadius={10}
          backgroundColor={activeTab === "code" ? "rgba(108, 92, 231, 0.2)" : "transparent"}
          alignItems="center"
          onPress={() => setActiveTab("code")}
          pressStyle={{ opacity: 0.7 }}
        >
          <XStack alignItems="center" gap={6}>
            <KeyboardIcon size={16} color={activeTab === "code" ? "#6C5CE7" : "#5A5A6E"} />
            <Text
              fontSize={14}
              fontWeight="600"
              color={activeTab === "code" ? "$accent" : "$textMuted"}
            >
              Digitar Codigo
            </Text>
          </XStack>
        </Stack>
        <Stack
          flex={1}
          paddingVertical={10}
          borderRadius={10}
          backgroundColor={activeTab === "scan" ? "rgba(108, 92, 231, 0.2)" : "transparent"}
          alignItems="center"
          onPress={() => setActiveTab("scan")}
          pressStyle={{ opacity: 0.7 }}
        >
          <XStack alignItems="center" gap={6}>
            <QrCode size={16} color={activeTab === "scan" ? "#6C5CE7" : "#5A5A6E"} />
            <Text
              fontSize={14}
              fontWeight="600"
              color={activeTab === "scan" ? "$accent" : "$textMuted"}
            >
              Escanear QR
            </Text>
          </XStack>
        </Stack>
      </XStack>

      {activeTab === "code" ? (
        /* Manual code entry */
        <YStack flex={1} paddingHorizontal={24} paddingTop={24} alignItems="center">
          {/* Icon */}
          <YStack
            height={80}
            width={80}
            borderRadius={24}
            backgroundColor="rgba(0, 206, 201, 0.1)"
            alignItems="center"
            justifyContent="center"
            marginBottom={24}
          >
            <LogIn size={40} color="#00CEC9" />
          </YStack>

          {/* Title */}
          <Text fontSize={22} fontWeight="700" color="$textPrimary" textAlign="center">
            Entrar numa Campanha ou Sessao
          </Text>
          <Text
            fontSize={14}
            color="$textSecondary"
            textAlign="center"
            marginTop={8}
            marginBottom={32}
          >
            Digite o codigo que o mestre compartilhou
          </Text>

          {/* Code Input */}
          <YStack width="100%" alignItems="center">
            <TextInput
              ref={inputRef}
              value={displayCode}
              onChangeText={handleChangeText}
              placeholder="QB-XXXX ou XXXXXX"
              placeholderTextColor="#3A3A4E"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              maxLength={7}
              style={{
                width: "100%",
                height: 64,
                backgroundColor: "#1C1C24",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: joinError ? "#FF6B6B" : isComplete ? hintColor : "#2A2A35",
                color: "#E8E8ED",
                fontSize: 24,
                fontWeight: "700",
                textAlign: "center",
                letterSpacing: 6,
                fontFamily: "monospace",
                paddingHorizontal: 16,
              }}
            />

            {/* Hint / Error */}
            <YStack height={28} justifyContent="center" marginTop={8}>
              {joinError ? (
                <Text fontSize={13} color="#FF6B6B" textAlign="center">
                  {joinError}
                </Text>
              ) : hintText ? (
                <XStack alignItems="center" gap={6}>
                  <Stack
                    height={6}
                    width={6}
                    borderRadius={9999}
                    backgroundColor={hintColor}
                  />
                  <Text fontSize={13} color={hintColor}>
                    {hintText}
                  </Text>
                </XStack>
              ) : null}
            </YStack>
          </YStack>

          {/* Submit Button */}
          <YStack width="100%" marginTop={24}>
            <Button
              variant="primary"
              size="lg"
              disabled={!isComplete || joinLoading}
              loading={joinLoading}
              onPress={handleSubmit}
            >
              Entrar
            </Button>
          </YStack>

          {/* Help text */}
          <Text
            fontSize={12}
            color="$textMuted"
            textAlign="center"
            marginTop={24}
            lineHeight={18}
          >
            Aceita codigo de campanha (QB-XXXX){"\n"}ou codigo de sessao (XXXXXX)
          </Text>
        </YStack>
      ) : (
        /* QR Scanner */
        <YStack flex={1}>
          <QRScanner onCodeScanned={handleQRScanned} />
        </YStack>
      )}
    </SafeAreaView>
  );
}
