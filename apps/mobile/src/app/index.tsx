import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";

export default function SplashScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (ready) {
    // TODO: check auth state — redirect to /(auth) or /(tabs)
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View className="flex-1 bg-base items-center justify-center">
      <Text className="text-5xl font-bold text-accent tracking-tight">QB</Text>
      <Text className="text-text-muted text-sm mt-4">Sua mesa de RPG, online</Text>
      <ActivityIndicator color="#6C5CE7" size="large" style={{ marginTop: 32 }} />
    </View>
  );
}
