import { Stack } from "expo-router";

export default function SessionGameplayLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0A0F" },
        animation: "fade",
      }}
    />
  );
}
