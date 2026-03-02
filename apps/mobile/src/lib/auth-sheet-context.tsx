import { createContext, useContext, useState, type ReactNode } from "react";

type AuthSheetMode = "sign-in" | "sign-up" | null;

interface AuthSheetContextType {
  mode: AuthSheetMode;
  openSignIn: () => void;
  openSignUp: () => void;
  close: () => void;
}

const AuthSheetContext = createContext<AuthSheetContextType | null>(null);

export function AuthSheetProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthSheetMode>(null);

  return (
    <AuthSheetContext.Provider
      value={{
        mode,
        openSignIn: () => setMode("sign-in"),
        openSignUp: () => setMode("sign-up"),
        close: () => setMode(null),
      }}
    >
      {children}
    </AuthSheetContext.Provider>
  );
}

export function useAuthSheet() {
  const ctx = useContext(AuthSheetContext);
  if (!ctx)
    throw new Error("useAuthSheet must be used within AuthSheetProvider");
  return ctx;
}
