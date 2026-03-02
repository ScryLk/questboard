import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Button } from "../../components";

const inputStyle = {
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#2A2A35",
  backgroundColor: "transparent",
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: "#E8E8ED",
  fontSize: 16,
} as const;

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  async function handleSignUp() {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: displayName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(app)/dashboard");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Código inválido");
    } finally {
      setLoading(false);
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }}>
        <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal={24}>
          {/* Check icon */}
          <YStack
            marginBottom={24}
            height={64}
            width={64}
            alignItems="center"
            justifyContent="center"
            borderRadius={9999}
            backgroundColor="$accentMuted"
          >
            <Text fontSize={24} color="$accent">
              ✓
            </Text>
          </YStack>

          <Text fontSize={24} fontWeight="700" color="$textPrimary">
            Verificar email
          </Text>
          <Text
            marginTop={8}
            textAlign="center"
            fontSize={16}
            color="$textSecondary"
          >
            Enviamos um código para{"\n"}
            <Text color="$textPrimary">{email}</Text>
          </Text>

          <YStack marginTop={32} width="100%" gap={16}>
            <YStack>
              <Text marginBottom={6} fontSize={14} color="$textSecondary">
                Código de verificação
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor="#5A5A6E"
                keyboardType="number-pad"
                style={{
                  ...inputStyle,
                  textAlign: "center",
                  fontSize: 24,
                  letterSpacing: 6,
                }}
              />
            </YStack>

            {error ? (
              <Text textAlign="center" fontSize={14} color="$danger">
                {error}
              </Text>
            ) : null}

            <Button
              variant="primary"
              size="lg"
              onPress={handleVerify}
              loading={loading}
              disabled={!code}
            >
              Verificar
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Stack onPress={() => router.back()} paddingVertical={12}>
            <Text fontSize={18} color="$textSecondary">
              ←
            </Text>
          </Stack>

          {/* Header */}
          <Text fontSize={24} fontWeight="700" color="$textPrimary">
            Criar conta
          </Text>
          <Text marginTop={4} fontSize={16} color="$textSecondary">
            Comece sua aventura em poucos passos
          </Text>

          {/* Divider */}
          <XStack marginVertical={24} alignItems="center">
            <Stack flex={1} height={1} backgroundColor="$border" />
            <Text marginHorizontal={16} fontSize={12} color="$textMuted">
              cadastre com email
            </Text>
            <Stack flex={1} height={1} backgroundColor="$border" />
          </XStack>

          {/* Form */}
          <YStack gap={16}>
            <YStack>
              <Text marginBottom={6} fontSize={14} color="$textSecondary">
                Nome de exibição
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Como seus jogadores te conhecem"
                placeholderTextColor="#5A5A6E"
                style={inputStyle}
              />
            </YStack>

            <YStack>
              <Text marginBottom={6} fontSize={14} color="$textSecondary">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#5A5A6E"
                autoCapitalize="none"
                keyboardType="email-address"
                style={inputStyle}
              />
            </YStack>

            <YStack>
              <Text marginBottom={6} fontSize={14} color="$textSecondary">
                Senha
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#5A5A6E"
                secureTextEntry
                style={inputStyle}
              />
              {password.length > 0 && (
                <Stack
                  marginTop={8}
                  height={4}
                  borderRadius={9999}
                  backgroundColor="$border"
                  overflow="hidden"
                >
                  <Stack
                    height={4}
                    borderRadius={9999}
                    width={
                      password.length >= 8
                        ? "100%"
                        : password.length >= 4
                          ? "66%"
                          : "33%"
                    }
                    backgroundColor={
                      password.length >= 8
                        ? "$success"
                        : password.length >= 4
                          ? "$warning"
                          : "$danger"
                    }
                  />
                </Stack>
              )}
            </YStack>

            {error ? (
              <Text textAlign="center" fontSize={14} color="$danger">
                {error}
              </Text>
            ) : null}

            <Button
              variant="primary"
              size="lg"
              onPress={handleSignUp}
              loading={loading}
              disabled={!email || !password || !displayName}
            >
              Criar conta
            </Button>
          </YStack>

          {/* Footer */}
          <Stack
            onPress={() => router.push("/(auth)/sign-in")}
            marginTop={24}
            alignSelf="center"
            paddingBottom={32}
          >
            <Text fontSize={14} color="$textSecondary">
              Já tem conta?{" "}
              <Text color="$accent" fontWeight="500">
                Entrar
              </Text>
            </Text>
          </Stack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
