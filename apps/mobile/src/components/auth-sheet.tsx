import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Stack, Text, YStack } from "tamagui";
import { Button } from "./button";
import { ToastContainer } from "./toast";
import { useAuthSheet } from "../lib/auth-sheet-context";
import { useLoginTransition } from "../lib/login-transition-context";
import { useToast } from "../lib/toast-context";

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

const inputErrorStyle = {
  ...inputStyle,
  borderColor: "#FF6B6B",
} as const;

export function AuthSheet() {
  const { mode, close, openSignIn, openSignUp } = useAuthSheet();
  const { toasts, dismissToast } = useToast();

  return (
    <Modal
      visible={mode !== null}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <YStack flex={1} justifyContent="flex-end">
        <Stack
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(0,0,0,0.6)"
          onPress={close}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ maxHeight: "85%" }}
        >
          <YStack
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            borderTopWidth={1}
            borderTopColor="$border"
            backgroundColor="$bgCard"
          >
            {/* Handle */}
            <YStack alignItems="center" paddingVertical={12}>
              <Stack
                height={4}
                width={40}
                borderRadius={9999}
                backgroundColor="$border"
              />
            </YStack>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {mode === "sign-in" ? (
                <SignInForm onSwitchToSignUp={openSignUp} />
              ) : (
                <SignUpForm onSwitchToSignIn={openSignIn} />
              )}
            </ScrollView>
          </YStack>
        </KeyboardAvoidingView>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </YStack>
    </Modal>
  );
}

function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { close } = useAuthSheet();
  const { triggerWelcome } = useLoginTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        close();
        triggerWelcome(email.split("@")[0]);
        router.replace("/(app)/(tabs)/explore");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const msg = clerkError.errors?.[0]?.message ?? "Erro ao entrar";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <YStack paddingHorizontal={24}>
      <Text fontSize={24} fontWeight="700" color="$textPrimary">
        Bem-vindo de volta
      </Text>
      <Text marginTop={4} fontSize={14} color="$textSecondary">
        Entre para continuar sua aventura
      </Text>

      <YStack marginTop={24} gap={16}>
        <YStack>
          <Text marginBottom={6} fontSize={14} color="$textSecondary">
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError("");
            }}
            placeholder="seu@email.com"
            placeholderTextColor="#5A5A6E"
            autoCapitalize="none"
            keyboardType="email-address"
            style={error ? inputErrorStyle : inputStyle}
          />
        </YStack>

        <YStack>
          <Text marginBottom={6} fontSize={14} color="$textSecondary">
            Senha
          </Text>
          <TextInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError("");
            }}
            placeholder="••••••••"
            placeholderTextColor="#5A5A6E"
            secureTextEntry
            style={error ? inputErrorStyle : inputStyle}
          />
        </YStack>

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

      <Stack
        onPress={onSwitchToSignUp}
        alignSelf="center"
        marginTop={16}
        paddingBottom={16}
      >
        <Text fontSize={14} color="$textSecondary">
          Não tem conta?{" "}
          <Text fontWeight="500" color="$accent">
            Criar conta
          </Text>
        </Text>
      </Stack>
    </YStack>
  );
}

function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { close } = useAuthSheet();
  const { triggerWelcome } = useLoginTransition();
  const router = useRouter();
  const { showToast } = useToast();

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
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setPendingVerification(true);
      showToast("success", "Código de verificação enviado!");
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const msg = clerkError.errors?.[0]?.message ?? "Erro ao criar conta";
      setError(msg);
      showToast("error", msg);
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
        close();
        triggerWelcome(displayName || email.split("@")[0]);
        router.replace("/(app)/(tabs)/explore");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const msg = clerkError.errors?.[0]?.message ?? "Código inválido";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  if (pendingVerification) {
    return (
      <YStack paddingHorizontal={24}>
        <YStack
          marginBottom={16}
          height={48}
          width={48}
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
          borderRadius={9999}
          backgroundColor="$accentMuted"
        >
          <Text fontSize={20} color="$accent">
            ✓
          </Text>
        </YStack>
        <Text
          textAlign="center"
          fontSize={20}
          fontWeight="700"
          color="$textPrimary"
        >
          Verificar email
        </Text>
        <Text
          marginTop={4}
          textAlign="center"
          fontSize={14}
          color="$textSecondary"
        >
          Código enviado para {email}
        </Text>

        <YStack marginTop={24} gap={16}>
          <TextInput
            value={code}
            onChangeText={(t) => {
              setCode(t);
              setError("");
            }}
            placeholder="123456"
            placeholderTextColor="#5A5A6E"
            keyboardType="number-pad"
            style={{
              ...(error ? inputErrorStyle : inputStyle),
              textAlign: "center",
              fontSize: 24,
              letterSpacing: 6,
            }}
          />

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
    );
  }

  return (
    <YStack paddingHorizontal={24}>
      <Text fontSize={24} fontWeight="700" color="$textPrimary">
        Criar conta
      </Text>
      <Text marginTop={4} fontSize={14} color="$textSecondary">
        Comece sua aventura em poucos passos
      </Text>

      <YStack marginTop={24} gap={16}>
        <YStack>
          <Text marginBottom={6} fontSize={14} color="$textSecondary">
            Nome de exibição
          </Text>
          <TextInput
            value={displayName}
            onChangeText={(t) => {
              setDisplayName(t);
              setError("");
            }}
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
            onChangeText={(t) => {
              setEmail(t);
              setError("");
            }}
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
            onChangeText={(t) => {
              setPassword(t);
              setError("");
            }}
            placeholder="••••••••"
            placeholderTextColor="#5A5A6E"
            secureTextEntry
            style={inputStyle}
          />
          {password.length > 0 && (
            <Stack
              marginTop={8}
              height={4}
              overflow="hidden"
              borderRadius={9999}
              backgroundColor="$border"
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

      <Stack
        onPress={onSwitchToSignIn}
        alignSelf="center"
        marginTop={16}
        paddingBottom={16}
      >
        <Text fontSize={14} color="$textSecondary">
          Já tem conta?{" "}
          <Text fontWeight="500" color="$accent">
            Entrar
          </Text>
        </Text>
      </Stack>
    </YStack>
  );
}
