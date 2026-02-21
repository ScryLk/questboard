import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1A1A2E" },
          headerTintColor: "#E94560",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#1A1A2E" },
        }}
      />
    </>
  );
}
