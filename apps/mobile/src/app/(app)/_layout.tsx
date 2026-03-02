import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Slot } from "expo-router";
import { ApiProvider } from "../../lib/api-context";
import { LoadingSpinner } from "../../components";

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Redirect href="/" />;

  return (
    <ApiProvider>
      <Slot />
    </ApiProvider>
  );
}
