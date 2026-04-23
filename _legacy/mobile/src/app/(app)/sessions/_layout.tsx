import { Stack } from "expo-router";

export default function SessionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0F0F12" },
      }}
    />
  );
}
