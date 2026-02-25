import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#16161C" },
          headerTintColor: "#E8E8ED",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#0F0F12" },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="characters/create"
          options={{ title: "Criar Personagem", presentation: "modal" }}
        />
        <Stack.Screen
          name="characters/[id]"
          options={{ title: "Personagem" }}
        />
        <Stack.Screen
          name="sessions/[id]"
          options={{ title: "Sessão" }}
        />
        <Stack.Screen
          name="sessions/create"
          options={{ title: "Nova Sessão", presentation: "modal" }}
        />
      </Stack>
    </>
  );
}
