import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TamaguiProvider, Theme } from "tamagui";
import config from "../../tamagui.config";
import { tokenCache } from "../lib/clerk-token-cache";
import { AuthSheetProvider } from "../lib/auth-sheet-context";
import { CreateSheetProvider } from "../lib/create-sheet-context";
import { LoginTransitionProvider } from "../lib/login-transition-context";
import { AuthSheet } from "../components/auth-sheet";
import { CreateActionSheet } from "../components/create-action-sheet";
import { WelcomeOverlay } from "../components/welcome-overlay";
import { ProfileModal } from "../components/profile/profile-modal";
import { ErrorBoundary } from "../components/error-boundary";
import { ToastProvider } from "../lib/toast-context";

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config}>
        <Theme name="dark">
          <ErrorBoundary>
            <ToastProvider>
              <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
                <ClerkLoaded>
                  <LoginTransitionProvider>
                    <AuthSheetProvider>
                      <CreateSheetProvider>
                        <StatusBar style="light" />
                        <Slot />
                        <AuthSheet />
                        <CreateActionSheet />
                        <WelcomeOverlay />
                        <ProfileModal />
                      </CreateSheetProvider>
                    </AuthSheetProvider>
                  </LoginTransitionProvider>
                </ClerkLoaded>
              </ClerkProvider>
            </ToastProvider>
          </ErrorBoundary>
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
