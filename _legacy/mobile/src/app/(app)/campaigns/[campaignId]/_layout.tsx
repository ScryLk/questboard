import { Stack } from "expo-router";

export default function CampaignDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0F0F12" },
        animation: "slide_from_right",
      }}
    />
  );
}
