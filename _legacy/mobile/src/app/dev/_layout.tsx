// Layout do grupo `/dev/*`: Stack sem header, background escuro.
// Sem auth, sem ApiProvider — bypass explícito do fluxo de produção.

import { Stack } from "expo-router";

export default function DevLayout() {
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
