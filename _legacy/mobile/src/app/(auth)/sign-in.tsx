import { useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
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

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(app)/dashboard");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <YStack flex={1} paddingHorizontal={24}>
          {/* Back */}
          <Stack onPress={() => router.back()} paddingVertical={12}>
            <Text fontSize={18} color="$textSecondary">
              ←
            </Text>
          </Stack>

          <YStack flex={1} justifyContent="center">
            {/* Header */}
            <Text fontSize={24} fontWeight="700" color="$textPrimary">
              Bem-vindo de volta
            </Text>
            <Text marginTop={4} fontSize={16} color="$textSecondary">
              Entre para continuar sua aventura
            </Text>

            {/* Divider */}
            <XStack marginVertical={24} alignItems="center">
              <Stack flex={1} height={1} backgroundColor="$border" />
              <Text marginHorizontal={16} fontSize={12} color="$textMuted">
                entre com email
              </Text>
              <Stack flex={1} height={1} backgroundColor="$border" />
            </XStack>

            {/* Form */}
            <YStack gap={16}>
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
              </YStack>

              <Stack alignSelf="flex-end">
                <Text fontSize={14} color="$textMuted">
                  Esqueceu a senha?
                </Text>
              </Stack>

              {error ? (
                <Text textAlign="center" fontSize={14} color="$danger">
                  {error}
                </Text>
              ) : null}

              <Button
                variant="primary"
                size="lg"
                onPress={handleSignIn}
                loading={loading}
                disabled={!email || !password}
              >
                Entrar
              </Button>
            </YStack>

            {/* Footer */}
            <Stack
              onPress={() => router.push("/(auth)/sign-up")}
              marginTop={24}
              alignSelf="center"
            >
              <Text fontSize={14} color="$textSecondary">
                Não tem conta?{" "}
                <Text color="$accent" fontWeight="500">
                  Criar conta
                </Text>
              </Text>
            </Stack>
          </YStack>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
