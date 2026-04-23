import { Redirect } from "expo-router";

// This screen is never shown — the Create tab press is intercepted
// by the custom tab bar to open the action sheet instead.
export default function CreateScreen() {
  return <Redirect href="/(app)/(tabs)/explore" />;
}
