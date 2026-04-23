// ─────────────────────────────────────────────────────────────────────
// Root layout.
//
// Comportamento condicional:
//  - Se EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY está presente → usa ClerkProvider
//    + todos os providers de auth (comportamento de produção).
//  - Se ausente → modo dev: renderiza apenas Tamagui + Gesture + Toast +
//    Slot. Rotas que dependem de auth (index, (app)/*) não vão ser
//    alcançadas; rotas `/dev/*` bypassam a árvore de auth.
//
// Isso permite abrir a gameplay mock via Expo Web sem backend ou config:
//    http://localhost:8081/dev/gameplay/demo
//
// Pra restaurar o fluxo de produção, basta criar apps/mobile/.env com a
// chave Clerk. Nenhum código muda.
// ─────────────────────────────────────────────────────────────────────

import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TamaguiProvider, Theme } from "tamagui";
import config from "../../tamagui.config";
import { ErrorBoundary } from "../components/error-boundary";
import { ToastProvider } from "../lib/toast-context";

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const HAS_BACKEND = !!CLERK_KEY;

// Lazy-require dos providers de auth pra não puxar Clerk quando não tem key.
// Decisão feita em module scope (não em runtime React), o que mantém a
// integridade das rules-of-hooks nos consumidores.
let AuthTree: React.ComponentType<{ children: React.ReactNode }> | null = null;
if (HAS_BACKEND) {
  const { ClerkProvider, ClerkLoaded } = require("@clerk/clerk-expo");
  const { tokenCache } = require("../lib/clerk-token-cache");
  const { AuthSheetProvider } = require("../lib/auth-sheet-context");
  const { CreateSheetProvider } = require("../lib/create-sheet-context");
  const { LoginTransitionProvider } = require("../lib/login-transition-context");
  const { AuthSheet } = require("../components/auth-sheet");
  const { CreateActionSheet } = require("../components/create-action-sheet");
  const { WelcomeOverlay } = require("../components/welcome-overlay");
  const { ProfileModal } = require("../components/profile/profile-modal");

  AuthTree = function AuthTreeImpl({ children }) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <LoginTransitionProvider>
            <AuthSheetProvider>
              <CreateSheetProvider>
                {children}
                <AuthSheet />
                <CreateActionSheet />
                <WelcomeOverlay />
                <ProfileModal />
              </CreateSheetProvider>
            </AuthSheetProvider>
          </LoginTransitionProvider>
        </ClerkLoaded>
      </ClerkProvider>
    );
  };
}

export default function RootLayout() {
  const content = (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config}>
        <Theme name="dark">
          <ErrorBoundary>
            <ToastProvider>
              {AuthTree ? <AuthTree>{content}</AuthTree> : content}
            </ToastProvider>
          </ErrorBoundary>
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
